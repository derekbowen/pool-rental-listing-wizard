import { useState, useEffect, useCallback } from "react";
import { useListing } from "@/contexts/ListingContext";
import { getCurrentUser, authPopup } from "@/lib/auth";
import ProgressBar from "./ProgressBar";
import StepTypeSelection from "./StepTypeSelection";
import StepPhotos from "./StepPhotos";
import StepDetails from "./StepDetails";
import StepPricing from "./StepPricing";
import StepAvailability from "./StepAvailability";
import StepReview from "./StepReview";
import { Waves, LogIn } from "lucide-react";

type AuthState = "checking" | "authed" | "anon";

export default function ListingWizard() {
  const { step } = useListing();
  const [name, setName] = useState<string | null>(null);
  const [auth, setAuth] = useState<AuthState>("checking");
  const [signingIn, setSigningIn] = useState(false);

  // Resolve the shared marketplace session. This is the SAME check publish uses,
  // so if the token is anonymous/expired we find out at ENTRY, not after the host
  // has spent 10 minutes building (the old failure mode).
  const refresh = useCallback(async () => {
    const u = await getCurrentUser();
    setName(u ? u.name : null);
    setAuth(u ? "authed" : "anon");
    return !!u;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const firstName = name ? name.split(" ")[0] : null;

  const handleSignIn = useCallback(async () => {
    setSigningIn(true);
    // Re-mint through the marketplace's OWN login (popup keeps this page + the
    // in-progress draft alive). A host with a live session is recognized almost
    // instantly; a logged-out host signs in / creates an account here.
    await authPopup("login");
    await refresh();
    setSigningIn(false);
  }, [refresh]);

  const handleSaveExit = () => {
    alert(
      "✓ Saved on this device. Close this anytime — when you come back on this same phone or browser, your progress will be right here.",
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <a href="https://www.poolrentalnearme.com" className="flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Pool Rental Near Me" className="h-8 w-auto" />
            <span className="text-base font-bold text-sky-900 hidden sm:inline">Pool Rental Near Me</span>
          </a>
          <div className="flex items-center gap-3">
            {firstName ? (
              <span className="text-sm text-slate-600">Hi, {firstName}</span>
            ) : (
              <button
                onClick={handleSignIn}
                className="text-sm text-sky-600 hover:text-sky-700 font-semibold transition-colors"
              >
                Sign in
              </button>
            )}
            {auth === "authed" && (
              <button
                onClick={handleSaveExit}
                className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
              >
                Save &amp; Exit
              </button>
            )}
          </div>
        </div>
        {auth === "authed" && (
          <div className="max-w-2xl mx-auto">
            <ProgressBar />
          </div>
        )}
      </header>

      {/* Body */}
      <main className="max-w-2xl mx-auto px-4 pb-8">
        {auth === "checking" && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="w-10 h-10 rounded-full border-2 border-sky-200 border-t-sky-500 animate-spin" />
            <p className="mt-4 text-sm">Loading…</p>
          </div>
        )}

        {auth === "anon" && (
          <div className="py-12 flex justify-center">
            <div className="w-full max-w-md text-center bg-white rounded-2xl border-2 border-sky-100 shadow-sm p-8">
              <div className="mx-auto w-14 h-14 rounded-full bg-sky-50 flex items-center justify-center">
                <Waves className="w-7 h-7 text-sky-500" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-sky-900">Sign in to list your pool</h1>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Your listing is saved to your Pool Rental Near Me account so guests can book it and
                you get paid. Sign in or create a free account to begin — it only takes a few seconds.
              </p>
              <button
                onClick={handleSignIn}
                disabled={signingIn}
                className={`mt-6 w-full py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                  signingIn
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-sky-500 text-white hover:bg-sky-600 active:scale-[0.98] shadow-lg shadow-sky-200"
                }`}
              >
                <LogIn className="w-5 h-5" />
                {signingIn ? "Waiting for sign-in…" : "Sign in / Create account"}
              </button>
              <p className="mt-4 text-xs text-slate-400">
                Already started? Your progress is saved on this device — signing in brings you right
                back to it, nothing lost.
              </p>
            </div>
          </div>
        )}

        {auth === "authed" && (
          <div className="transition-all duration-300 ease-in-out">
            {step === 1 && <StepTypeSelection />}
            {step === 2 && <StepPhotos />}
            {step === 3 && <StepDetails />}
            {step === 4 && <StepPricing />}
            {step === 5 && <StepAvailability />}
            {step === 6 && <StepReview />}
          </div>
        )}
      </main>
    </div>
  );
}
