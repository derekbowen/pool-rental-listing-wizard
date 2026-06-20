import { useState, useEffect, useCallback } from "react";
import { useListing } from "@/contexts/ListingContext";
import { MOCK_AI_RESULTS } from "@/lib/mockData";
import { analyzeListingPhotos, type AIListingResult } from "@/lib/ai";
import AddressAutocomplete, { LocationMapPreview } from "./AddressAutocomplete";
import {
  SPACE_ACTIVITIES,
  POOL_AMENITIES,
  WATER_TYPE_OPTIONS,
  CHECKIN_OPTIONS,
  PARKING_SIZE_OPTIONS,
  ACCESSIBILITY_OPTIONS,
  HOUSE_RULES_OPTIONS,
  type FieldOption,
} from "@/lib/sharetribe-fields";
import { cn } from "@/lib/utils";
import {
  Check,
  Pencil,
  RefreshCw,
  MapPin,
  Wine,
  Cigarette,
  Music,
  ShieldAlert,
  Truck,
  Camera,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
} from "lucide-react";

const POLICY_ICONS: Record<string, React.ElementType> = {
  Wine,
  Cigarette,
  Music,
  ShieldAlert,
  Truck,
  Camera,
};

// ---------- AI Loading Animation ----------
const AI_PROGRESS_MESSAGES = [
  { text: "Uploading your photos...", icon: "📸" },
  { text: "Analyzing pool features...", icon: "🏊" },
  { text: "Detecting amenities...", icon: "🔍" },
  { text: "Estimating pool dimensions...", icon: "📐" },
  { text: "Identifying safety features...", icon: "🛟" },
  { text: "Checking water quality clues...", icon: "💧" },
  { text: "Writing your description...", icon: "✍️" },
  { text: "Polishing the details...", icon: "✨" },
  { text: "Almost there...", icon: "🎯" },
  { text: "Just a few more seconds...", icon: "⏳" },
  { text: "Wrapping things up...", icon: "🎁" },
];

function AILoadingState({ status }: { status: "loading" | "done" | "error" }) {
  const [elapsed, setElapsed] = useState(0);
  const [messageIdx, setMessageIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx((i) => {
        const next = i + 1;
        setCompletedSteps((prev) => [...prev, i]);
        return next < AI_PROGRESS_MESSAGES.length ? next : i;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeStr = minutes > 0
    ? `${minutes}:${seconds.toString().padStart(2, "0")}`
    : `${seconds}s`;

  const current = AI_PROGRESS_MESSAGES[messageIdx];
  const progressPct = status === "done"
    ? 100
    : Math.min(95, (messageIdx / AI_PROGRESS_MESSAGES.length) * 100 + (elapsed % 3) * 2);

  return (
    <div className="flex flex-col items-center py-12 space-y-6">
      {/* Animated pool ring */}
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#e0f2fe" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="52" fill="none"
            stroke="#0891b2" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${progressPct * 3.27} 327`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl" key={messageIdx}>
            {status === "done" ? "✅" : current.icon}
          </span>
        </div>
      </div>

      {/* Timer */}
      <div className="text-center">
        <div className="text-4xl font-mono font-bold text-sky-700 tabular-nums">
          {timeStr}
        </div>
        <p className="mt-1 text-sm text-slate-400">
          {status === "done" ? "Complete!" : "This usually takes 15–30 seconds"}
        </p>
      </div>

      {/* Current step message */}
      <div className="bg-slate-50 rounded-xl px-6 py-3 min-w-[280px] text-center">
        <p className="text-sm font-medium text-slate-600 animate-pulse">
          {status === "done" ? "Done! Applying results..." : current.text}
        </p>
      </div>

      {/* Completed steps */}
      <div className="space-y-2 w-full max-w-sm">
        {AI_PROGRESS_MESSAGES.slice(0, messageIdx).map((step, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 px-4 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 transition-all duration-300"
          >
            <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-xs font-medium">{step.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Chip toggle ----------
function ChipToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-95",
        active
          ? "bg-sky-500 text-white shadow-sm"
          : "bg-slate-100 text-slate-500 hover:bg-slate-200",
      )}
    >
      {label}
    </button>
  );
}

// ---------- Segmented select ----------
function SegmentedSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FieldOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b border-slate-100">
      <span className="text-sm font-medium text-slate-700 sm:w-36 flex-shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.code}
            onClick={() => onChange(opt.code)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-95",
              value === opt.code
                ? "bg-sky-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Number stepper ----------
function NumberStepper({
  label,
  value,
  onChange,
  min = 1,
  max = 100,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center hover:border-sky-500 transition-colors"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="text-lg font-semibold w-10 text-center">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center hover:border-sky-500 transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ---------- Multi-select chip for restrooms ----------
function MultiSegmentedSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    onChange(
      value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt],
    );
  };
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b border-slate-100">
      <span className="text-sm font-medium text-slate-700 sm:w-36 flex-shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-95",
              value.includes(opt)
                ? "bg-sky-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function StepDetails() {
  const { draft, updateDraft, updatePublicData, updateLocation, next, back, aiCompleted, setAiCompleted } =
    useListing();
  const [showPolicies, setShowPolicies] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const applyResults = useCallback((results: AIListingResult) => {
    updateDraft({
      description: results.description,
      ...(results.categoryLevel2 ? { subcategory: results.categoryLevel2 } : {}),
    });
    updatePublicData({
      space: results.space ?? [],
      poolAmenities: results.poolAmenities ?? [],
      water_type: results.water_type ?? "",
      checkingin: results.checkingin ?? "",
      parking_size: results.parking_size ?? "",
      accessibility: results.accessibility ?? [],
      houseRules: results.houseRules ?? [],
      guestallowed: results.guestallowed,
      squarefootage: results.squarefootage,
    });
    setAiCompleted(true);
  }, [updateDraft, updatePublicData, setAiCompleted]);

  const [aiStatus, setAiStatus] = useState<"loading" | "done" | "error">("loading");
  const [aiStarted, setAiStarted] = useState(false);

  const runAiAnalysis = useCallback(async () => {
    setAiError(null);
    setAiStatus("loading");
    const minDelay = new Promise((r) => setTimeout(r, 2500));

    if (draft.images.length === 0) {
      await minDelay;
      setAiStatus("done");
      setTimeout(() => applyResults(MOCK_AI_RESULTS as AIListingResult), 600);
      return;
    }
    try {
      const [results] = await Promise.all([
        analyzeListingPhotos(draft.images, draft.title, draft.category),
        minDelay,
      ]);
      setAiStatus("done");
      setTimeout(() => applyResults(results), 600);
    } catch (err: any) {
      console.error("AI analysis failed, using mock data:", err);
      setAiError(err.message ?? "AI analysis failed");
      setAiStatus("error");
      setTimeout(() => applyResults(MOCK_AI_RESULTS as AIListingResult), 600);
    }
  }, [draft.images, draft.title, draft.category, applyResults]);

  useEffect(() => {
    if (!aiCompleted && !aiStarted) {
      setAiStarted(true);
      runAiAnalysis();
    }
  }, [aiCompleted, aiStarted, runAiAnalysis]);

  if (!aiCompleted) {
    return (
      <div className="py-8">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-sky-900">
            Sit back — we're building your listing
          </h1>
          <p className="mt-2 text-slate-500">
            Our AI is analyzing your photos to fill in the details
          </p>
        </div>
        <AILoadingState status={aiStatus} />
      </div>
    );
  }

  const toggleArrayField = (
    field: keyof typeof draft.publicData,
    value: string,
  ) => {
    const current = draft.publicData[field];
    if (Array.isArray(current)) {
      const next = current.includes(value)
        ? current.filter((v: string) => v !== value)
        : [...current, value];
      updatePublicData({ [field]: next });
    }
  };

  return (
    <div className="py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-sky-900">Looking great!</h1>
        <p className="mt-2 text-slate-500">
          Review what our AI detected — tap chips to adjust
        </p>
      </div>

      {aiError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <span className="font-medium">AI fallback:</span> {aiError} — showing sample data instead. Edit below or tap Regenerate.
        </div>
      )}

      {/* Description */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
            Description
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingDescription(!editingDescription)}
              className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700"
            >
              <Pencil className="w-3 h-3" />
              {editingDescription ? "Done" : "Edit"}
            </button>
            {draft.images.length > 0 && (
              <button
                onClick={() => {
                  setAiStarted(false);
                  setAiCompleted(false);
                }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
              >
                <RefreshCw className="w-3 h-3" /> Regenerate from photos
              </button>
            )}
          </div>
        </div>
        {editingDescription ? (
          <textarea
            value={draft.description}
            onChange={(e) => updateDraft({ description: e.target.value })}
            rows={6}
            className="w-full px-4 py-3 border-2 border-sky-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all text-sm leading-relaxed"
          />
        ) : (
          <div className="px-4 py-3 bg-slate-50 rounded-xl text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {draft.description}
          </div>
        )}
      </section>

      {/* What's it good for? (space = activities) */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
          What's it good for?
        </h2>
        <div className="flex flex-wrap gap-2">
          {SPACE_ACTIVITIES.map((o) => (
            <ChipToggle
              key={o.code}
              label={o.label}
              active={draft.publicData.space.includes(o.code)}
              onClick={() => toggleArrayField("space", o.code)}
            />
          ))}
        </div>
      </section>

      {/* Amenities (poolAmenities) */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
          Amenities
        </h2>
        <div className="flex flex-wrap gap-2">
          {POOL_AMENITIES.map((o) => (
            <ChipToggle
              key={o.code}
              label={o.label}
              active={draft.publicData.poolAmenities.includes(o.code)}
              onClick={() => toggleArrayField("poolAmenities", o.code)}
            />
          ))}
        </div>
      </section>

      {/* Accessibility */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
          Accessibility
        </h2>
        <div className="flex flex-wrap gap-2">
          {ACCESSIBILITY_OPTIONS.map((o) => (
            <ChipToggle
              key={o.code}
              label={o.label}
              active={draft.publicData.accessibility.includes(o.code)}
              onClick={() => toggleArrayField("accessibility", o.code)}
            />
          ))}
        </div>
      </section>

      {/* Quick selects */}
      <section className="space-y-1">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Pool Details
        </h2>
        <SegmentedSelect
          label="Water Type"
          options={WATER_TYPE_OPTIONS}
          value={draft.publicData.water_type}
          onChange={(v) => updatePublicData({ water_type: v })}
        />
        <SegmentedSelect
          label="Check-in"
          options={CHECKIN_OPTIONS}
          value={draft.publicData.checkingin}
          onChange={(v) => updatePublicData({ checkingin: v })}
        />
        <SegmentedSelect
          label="Parking"
          options={PARKING_SIZE_OPTIONS}
          value={draft.publicData.parking_size}
          onChange={(v) => updatePublicData({ parking_size: v })}
        />
        <NumberStepper
          label="Max Guests"
          value={draft.publicData.guestallowed}
          onChange={(v) => updatePublicData({ guestallowed: v })}
          min={1}
          max={50}
        />
        <NumberStepper
          label="Square Footage"
          value={draft.publicData.squarefootage}
          onChange={(v) => updatePublicData({ squarefootage: v })}
          min={100}
          max={10000}
        />
      </section>

      {/* Policies (collapsible) */}
      <section className="space-y-3">
        <button
          onClick={() => setShowPolicies(!showPolicies)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-sky-700 transition-colors"
        >
          {showPolicies ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          Set your house rules
          <span className="text-xs font-normal text-slate-400">(defaults applied)</span>
        </button>
        {showPolicies && (
          <div className="flex flex-wrap gap-2 pl-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {HOUSE_RULES_OPTIONS.map((o) => (
              <ChipToggle
                key={o.code}
                label={o.label}
                active={draft.publicData.houseRules.includes(o.code)}
                onClick={() => toggleArrayField("houseRules", o.code)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Location */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
          Location
        </h2>
        <AddressAutocomplete
          value={draft.location.address}
          onRawChange={(v) => updateLocation({ address: v })}
          onChange={(result) =>
            updateLocation({
              address: result.address,
              city: result.city,
              state: result.state,
              zip: result.zip,
              lat: result.lat,
              lng: result.lng,
            })
          }
        />
        <input
          type="text"
          value={draft.location.building}
          onChange={(e) => updateLocation({ building: e.target.value })}
          placeholder="Apt, suite, building # (optional)"
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all text-sm"
        />
        {draft.location.lat && (
          <LocationMapPreview
            lat={draft.location.lat}
            lng={draft.location.lng}
            city={draft.location.city}
            state={draft.location.state}
          />
        )}
        {!(draft.location.lat != null && draft.location.lng != null) && (
          <p className="text-xs text-amber-600">
            Pick your address from the dropdown so it's pinned on the map — required to publish.
          </p>
        )}
      </section>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={back}
          className="px-6 py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
        >
          Back
        </button>
        <button
          onClick={next}
          disabled={!(draft.location.address && draft.location.lat != null && draft.location.lng != null)}
          className={`flex-1 py-4 rounded-xl text-lg font-semibold transition-all duration-200 ${
            draft.location.address && draft.location.lat != null && draft.location.lng != null
              ? "bg-sky-500 text-white hover:bg-sky-600 active:scale-[0.98] shadow-lg shadow-sky-200"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          Next: Set Your Pricing →
        </button>
      </div>

      {/* Skip link */}
      <div className="text-center">
        <button
          onClick={() => {
            // Jump to step 5
            next();
            setTimeout(() => next(), 0);
          }}
          className="text-sm text-slate-400 hover:text-sky-600 transition-colors"
        >
          Looks good, skip to publish →
        </button>
      </div>
    </div>
  );
}
