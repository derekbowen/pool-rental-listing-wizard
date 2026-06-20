import { useState, useEffect } from "react";
import { useListing } from "@/contexts/ListingContext";
import { getCurrentUser, authPopup } from "@/lib/auth";
import ProgressBar from "./ProgressBar";
import StepTypeSelection from "./StepTypeSelection";
import StepPhotos from "./StepPhotos";
import StepDetails from "./StepDetails";
import StepPricing from "./StepPricing";
import StepAvailability from "./StepAvailability";
import StepReview from "./StepReview";

export default function ListingWizard() {
  const { step } = useListing();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then((u) => setName(u ? u.name : null));
  }, []);

  const firstName = name ? name.split(" ")[0] : null;

  const handleSignIn = async () => {
    await authPopup("login");
    const u = await getCurrentUser();
    setName(u ? u.name : null);
  };

  const handleSaveExit = () => {
    // Progress auto-saves to localStorage on this device/browser.
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
            <button
              onClick={handleSaveExit}
              className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
            >
              Save &amp; Exit
            </button>
          </div>
        </div>
        <div className="max-w-2xl mx-auto">
          <ProgressBar />
        </div>
      </header>

      {/* Step content */}
      <main className="max-w-2xl mx-auto px-4 pb-8">
        <div className="transition-all duration-300 ease-in-out">
          {step === 1 && <StepTypeSelection />}
          {step === 2 && <StepPhotos />}
          {step === 3 && <StepDetails />}
          {step === 4 && <StepPricing />}
          {step === 5 && <StepAvailability />}
          {step === 6 && <StepReview />}
        </div>
      </main>
    </div>
  );
}
