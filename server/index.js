import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3099;

const SHARETRIBE_BASE = "https://flex-integ-api.sharetribe.com";
const MP_BASE = "https://flex-api.sharetribe.com"; // Marketplace API (verify host session)

// Verify a marketplace access token (from the shared session cookie) -> the host.
async function userFromToken(req) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  try {
    const r = await fetch(`${MP_BASE}/v1/api/current_user/show`, { headers: { Authorization: "Bearer " + token } });
    if (!r.ok) return null;
    const j = await r.json().catch(() => ({}));
    const id = j.data && (j.data.id?.uuid || j.data.id);
    if (!id) return null;
    const name = (j.data.attributes && j.data.attributes.profile && (j.data.attributes.profile.displayName || j.data.attributes.profile.firstName)) || "";
    return { sub: id, name };
  } catch {
    return null;
  }
}

async function getToken() {
  const clientId = process.env.SHARETRIBE_CLI_API_KEY;
  const clientSecret = process.env.SHARETRIBE_CLI_API_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("SHARETRIBE_CLI_API_KEY and SHARETRIBE_CLI_API_SECRET must be set");
  }
  const res = await fetch(`${SHARETRIBE_BASE}/v1/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "integ",
    }),
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

async function proxyToSharetribe(endpoint, body) {
  const token = await getToken();
  const res = await fetch(`${SHARETRIBE_BASE}/v1/integration_api/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

app.use(express.json({ limit: "80mb" }));

// --- Verify the shared marketplace session, return the host's display name ---
app.get("/wizard/api/auth/me", async (req, res) => {
  const u = await userFromToken(req);
  if (!u) return res.status(401).json({ ok: false });
  res.json({ ok: true, name: u.name });
});

app.post("/wizard/api/sharetribe/create-listing", async (req, res) => {
  const u = await userFromToken(req);
  if (!u) return res.status(401).json({ error: "Please sign in to publish your listing." });
  try {
    // Author is the verified host from the marketplace session — never trust a client-supplied authorId.
    const body = { ...req.body, authorId: u.sub };
    const result = await proxyToSharetribe("listings/create", body);
    res.status(result.status).json(result.data);
  } catch (err) {
    console.error("[create-listing]", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/wizard/api/sharetribe/update-listing", async (req, res) => {
  if (!(await userFromToken(req))) return res.status(401).json({ error: "Please sign in." });
  try {
    const result = await proxyToSharetribe("listings/update", req.body);
    res.status(result.status).json(result.data);
  } catch (err) {
    console.error("[update-listing]", err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- URL import: Swimply / Peerspace / Giggster -> draft via OpenRouter ---
const IMPORT_ALLOW = /^https?:\/\/([a-z0-9-]+\.)*(swimply\.com|peerspace\.com|giggster\.com)\//i;
const IMPORT_SYSTEM = `You extract a pool-rental listing from a source page (Swimply/Peerspace/Giggster) into STRICT JSON for "Pool Rental Near Me". Use ONLY information present in the input; if a field is unknown use null (NEVER guess). Do NOT invent the exact street address (these sites hide it; city/state is OK). Return ONLY this JSON:
{"title":string|null,"description":string|null,"space":string[]|null,"water_type":string|null,"guestallowed":number|null,"pool_depth":string|null,"parking_size":string|null,"cancellation_policy":string|null,"basePriceCents":number|null,"amenities":[{"amenity":string,"price":number,"description":string}]|null,"poolAmenities":string[]|null,"photos":string[]|null,"city":string|null,"state":string|null}
Rules: basePriceCents = hourly price in CENTS ($60/hr -> 6000). amenities = PRICED add-ons (price in cents). poolAmenities = FREE amenity labels. photos = absolute image URLs found on the page.`;

function harvestImages(html) {
  const re = /https?:\/\/[^"'\s\\)]+?\.(?:jpe?g|png|webp)(?:\?[^"'\s\\)]*)?/gi;
  const junk = /(logo|icon|favicon|sprite|avatar|placeholder|blank|loading|pixel|badge|emoji|spinner|map|static\.|tile)/i;
  const seen = new Set();
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null && out.length < 40) {
    const u = m[0].replace(/\\u002[fF]/g, "/").replace(/\\\//g, "/");
    if (junk.test(u) || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

app.post("/wizard/api/import-listing", async (req, res) => {
  const url = ((req.body && req.body.url) || "").trim();
  if (!IMPORT_ALLOW.test(url)) return res.status(400).json({ error: "Please paste a Swimply, Peerspace, or Giggster listing URL." });
  try {
    const pageRes = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36", "Accept-Language": "en-US,en;q=0.9" } });
    if (!pageRes.ok) return res.status(502).json({ error: "Couldn't fetch that page (HTTP " + pageRes.status + ")." });
    const html = await pageRes.text();
    const jsonld = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join("\n").slice(0, 14000);
    const nextData = ((html.match(/id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i) || [])[1] || "").slice(0, 14000);
    const og = (k) => (html.match(new RegExp('og:' + k + '["\'][^>]+content=["\']([^"\']*)', "i")) || [])[1] || "";
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").slice(0, 9000);
    const corpus = `URL: ${url}\nOG_TITLE: ${og("title")}\nOG_DESC: ${og("description")}\nJSON_LD:\n${jsonld}\nNEXT_DATA:\n${nextData}\nVISIBLE_TEXT:\n${text}`;
    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.OPENROUTER_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", temperature: 0, response_format: { type: "json_object" }, messages: [{ role: "system", content: IMPORT_SYSTEM }, { role: "user", content: corpus }] }),
    });
    const aiJson = await aiRes.json();
    if (!aiRes.ok) return res.status(502).json({ error: "AI extraction failed", detail: aiJson });
    let draft;
    try { draft = JSON.parse(aiJson.choices[0].message.content); } catch (e) { return res.status(502).json({ error: "AI returned non-JSON output" }); }
    // Harvest gallery images directly from the page (more reliable than the LLM for photos)
    const merged = [];
    const seenImg = new Set();
    for (const u of [...harvestImages(html), ...(Array.isArray(draft.photos) ? draft.photos : [])]) {
      if (typeof u === "string" && u.startsWith("http") && !seenImg.has(u)) { seenImg.add(u); merged.push(u); }
    }
    draft.photos = merged.slice(0, 20);
    res.json({ ok: true, source: url, draft });
  } catch (e) {
    console.error("[import-listing]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// --- Upload images to Sharetribe: remote URLs (imported) and/or base64 data URLs (host files) ---
async function uploadBufferToSharetribe(token, buf, ct) {
  const ext = ct.includes("png") ? "png" : ct.includes("webp") ? "webp" : "jpg";
  const fd = new FormData();
  fd.append("image", new Blob([buf], { type: ct }), `photo.${ext}`);
  const up = await fetch(`${SHARETRIBE_BASE}/v1/integration_api/images/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const uj = await up.json().catch(() => ({}));
  if (!up.ok) return null;
  return (uj.data && (uj.data.id?.uuid || uj.data.id)) || null;
}

app.post("/wizard/api/sharetribe/upload-images", async (req, res) => {
  if (!(await userFromToken(req))) return res.status(401).json({ error: "Please sign in." });
  const urls = (req.body && req.body.urls) || [];
  const files = (req.body && req.body.files) || []; // array of base64 data URLs
  if ((!Array.isArray(urls) || urls.length === 0) && (!Array.isArray(files) || files.length === 0)) {
    return res.status(400).json({ error: "No images provided." });
  }
  try {
    const token = await getToken();
    const imageIds = [];
    // Host-uploaded files first (so the cover photo stays first in the listing)
    for (const dataUrl of files.slice(0, 20)) {
      try {
        const m = /^data:(image\/[a-z+.-]+);base64,(.+)$/i.exec(dataUrl || "");
        if (!m) continue;
        const buf = Buffer.from(m[2], "base64");
        if (buf.length === 0 || buf.length > 20 * 1024 * 1024) continue;
        const id = await uploadBufferToSharetribe(token, buf, m[1]);
        if (id) imageIds.push(id);
      } catch {
        // skip
      }
    }
    // Then imported photos by URL
    for (const url of urls.slice(0, 20)) {
      try {
        const imgRes = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36" } });
        if (!imgRes.ok) continue;
        const ct = imgRes.headers.get("content-type") || "image/jpeg";
        if (!ct.startsWith("image/")) continue;
        const buf = Buffer.from(await imgRes.arrayBuffer());
        if (buf.length === 0 || buf.length > 20 * 1024 * 1024) continue;
        const id = await uploadBufferToSharetribe(token, buf, ct);
        if (id) imageIds.push(id);
      } catch {
        // skip
      }
    }
    res.json({ ok: true, imageIds });
  } catch (err) {
    console.error("[upload-images]", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Serve static wizard files
app.use("/wizard", express.static(path.join(__dirname, "../dist")));
app.get("/wizard/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Wizard server running on port ${PORT}`);
});
