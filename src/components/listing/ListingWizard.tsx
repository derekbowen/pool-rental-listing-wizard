import { useListing } from "@/contexts/ListingContext";
import ProgressBar from "./ProgressBar";
import StepTypeSelection from "./StepTypeSelection";
import StepPhotos from "./StepPhotos";
import StepDetails from "./StepDetails";
import StepPricing from "./StepPricing";
import StepAvailability from "./StepAvailability";
import StepReview from "./StepReview";

export default function ListingWizard() {
  const { step } = useListing();

  const handleSaveExit = () => {
    // Draft is already auto-saved to localStorage
    alert("Draft saved! You can resume anytime.");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <span className="text-lg font-bold text-cyan-900">
            Pool Rental Near Me
          </span>
          <button
            onClick={handleSaveExit}
            className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
          >
            Save & Exit
          </button>
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
