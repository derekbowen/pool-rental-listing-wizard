import { useListing } from "@/contexts/ListingContext";
import { cn } from "@/lib/utils";

const STEPS = ["Type", "Photos", "Details", "Pricing", "Availability", "Publish"];

export default function ProgressBar() {
  const { step } = useListing();

  return (
    <div className="w-full px-4 py-3">
      {/* Step labels */}
      <div className="flex justify-between mb-2">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={cn(
              "text-xs font-medium transition-colors duration-300",
              i + 1 <= step ? "text-cyan-600" : "text-slate-400",
            )}
          >
            {label}
          </span>
        ))}
      </div>
      {/* Progress track */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}
