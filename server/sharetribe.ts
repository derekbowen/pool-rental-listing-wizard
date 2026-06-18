import type { Connect } from "vite";

const SHARETRIBE_BASE = "https://flex-integ-api.sharetribe.com";

async function getToken(clientId: string, clientSecret: string): Promise<string> {
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
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sharetribe auth failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  return data.access_token;
}

export function sharetribeMiddleware(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    if (!req.url?.startsWith("/api/sharetribe")) return next();

    const clientId = process.env.SHARETRIBE_CLI_API_KEY;
    const clientSecret = process.env.SHARETRIBE_CLI_API_SECRET;

    if (!clientId || !clientSecret) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "SHARETRIBE_CLI_API_KEY and SHARETRIBE_CLI_API_SECRET must be set in .env" }));
      return;
    }

    // Parse body
    let body = "";
    for await (const chunk of req) body += chunk;
    let payload: any;
    try {
      payload = JSON.parse(body);
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON body" }));
      return;
    }

    try {
      const token = await getToken(clientId, clientSecret);

      // POST /api/sharetribe/create-listing
      if (req.url === "/api/sharetribe/create-listing" && req.method === "POST") {
        const stRes = await fetch(`${SHARETRIBE_BASE}/v1/integration_api/listings/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const stData = await stRes.json();
        res.writeHead(stRes.status, { "Content-Type": "application/json" });
        res.end(JSON.stringify(stData));
        return;
      }

      // POST /api/sharetribe/update-listing
      if (req.url === "/api/sharetribe/update-listing" && req.method === "POST") {
        const stRes = await fetch(`${SHARETRIBE_BASE}/v1/integration_api/listings/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const stData = await stRes.json();
        res.writeHead(stRes.status, { "Content-Type": "application/json" });
        res.end(JSON.stringify(stData));
        return;
      }

      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unknown endpoint" }));
    } catch (err: any) {
      console.error("[sharetribe]", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  };
}
