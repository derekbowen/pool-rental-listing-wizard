// @ts-nocheck — dead code (imported nowhere); predates the marketplace-SSO auth migration.
import { useState } from "react";
import { login, signup } from "@/lib/auth";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (name: string) => void;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSignup = mode === "signup";
  const canSubmit = !!email && !!password && (!isSignup || !!name.trim());

  const submit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError("");
    const r = isSignup
      ? await signup(name, email, password)
      : await login(email.trim(), password);
    setLoading(false);
    if (r.ok) onSuccess(r.name || email);
    else setError(r.error || "Something went wrong.");
  };

  const switchMode = (m: "signin" | "signup") => {
    setMode(m);
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4 relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => switchMode("signin")}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
              !isSignup ? "bg-white text-sky-900 shadow-sm" : "text-slate-500",
            )}
          >
            Sign in
          </button>
          <button
            onClick={() => switchMode("signup")}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
              isSignup ? "bg-white text-sky-900 shadow-sm" : "text-slate-500",
            )}
          >
            Create account
          </button>
        </div>

        <p className="text-sm text-slate-500">
          {isSignup
            ? "New here? Create your account and your listing publishes right away."
            : "Sign in so this listing is published under your account."}
        </p>

        {isSignup && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={isSignup ? "Create a password (8+ characters)" : "Password"}
          autoComplete={isSignup ? "new-password" : "current-password"}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          onClick={submit}
          disabled={!canSubmit || loading}
          className="w-full py-3 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading
            ? isSignup
              ? "Creating account…"
              : "Signing in…"
            : isSignup
              ? "Create account & publish"
              : "Sign in & publish"}
        </button>

        {!isSignup && (
          <p className="text-center text-xs text-slate-400">
            Forgot your password? Reset it at{" "}
            <a href="https://www.poolrentalnearme.com/recover-password" target="_blank" rel="noreferrer" className="text-sky-600">
              poolrentalnearme.com
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
