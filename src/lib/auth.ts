// Marketplace SSO: Merlin shares the Sharetribe marketplace login session.
// Same domain (www.poolrentalnearme.com) + same client id => the session cookie
// `st-<clientId>-token` (Path=/, not HttpOnly) is readable here. So if a host is
// logged into the marketplace, Merlin already knows them; otherwise we send them
// to the marketplace's real signup/login (Google/Apple/email) in a popup.
const MP_CLIENT_ID = "f812b9fc-645b-4363-86ae-404da7f6fac8"; // prod marketplace
const MP_ORIGIN = "https://www.poolrentalnearme.com";
const COOKIE = `st-${MP_CLIENT_ID}-token`;

export function readMarketplaceToken(): string | null {
  const c = document.cookie.split("; ").find((x) => x.startsWith(COOKIE + "="));
  if (!c) return null;
  try {
    const obj = JSON.parse(decodeURIComponent(c.substring(COOKIE.length + 1)));
    return obj && obj.access_token ? obj.access_token : null;
  } catch {
    return null;
  }
}

export interface WizardUser {
  name: string;
}

// Verify the shared token server-side and get the host's display name.
export async function getCurrentUser(): Promise<WizardUser | null> {
  const token = readMarketplaceToken();
  if (!token) return null;
  try {
    const res = await fetch("/wizard/api/auth/me", { headers: { Authorization: "Bearer " + token } });
    if (!res.ok) return null;
    const j = await res.json();
    return j.ok ? { name: j.name || "there" } : null;
  } catch {
    return null;
  }
}

// Open the marketplace's real signup/login in a popup; resolve once the shared
// session cookie appears (same-origin, so we can read it). Falls back to a full
// redirect if the popup is blocked.
export function authPopup(kind: "login" | "signup"): Promise<boolean> {
  const w = window.open(`${MP_ORIGIN}/${kind}`, "prnm_auth", "width=480,height=780");
  if (!w) {
    window.location.href = `${MP_ORIGIN}/${kind}`;
    return Promise.resolve(false);
  }
  return new Promise((resolve) => {
    let settled = false;
    const finish = (v: boolean) => {
      if (settled) return;
      settled = true;
      resolve(v);
    };
    // Poll for a REAL login (verified user), not just any token — anonymous
    // visitors also get a token, so we must confirm via /me.
    const check = async () => {
      if (settled) return;
      const u = await getCurrentUser();
      if (u) {
        try { w.close(); } catch { /* ignore */ }
        return finish(true);
      }
      if (w.closed) return finish(false);
      setTimeout(check, 1500);
    };
    setTimeout(check, 1500);
  });
}
