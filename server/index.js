import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3099;

const SHARETRIBE_BASE = "https://flex-integ-api.sharetribe.com";

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

app.use(express.json());

app.post("/api/sharetribe/create-listing", async (req, res) => {
  try {
    const result = await proxyToSharetribe("listings/create", req.body);
    res.status(result.status).json(result.data);
  } catch (err) {
    console.error("[create-listing]", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/sharetribe/update-listing", async (req, res) => {
  try {
    const result = await proxyToSharetribe("listings/update", req.body);
    res.status(result.status).json(result.data);
  } catch (err) {
    console.error("[update-listing]", err.message);
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
