import { useState, useEffect, useCallback } from "react";
import { useListing } from "@/contexts/ListingContext";
import { AI_LOADING_STEPS } from "@/lib/mockData";
import { MOCK_AI_RESULTS } from "@/lib/mockData";
import { analyzeListingPhotos, type AIListingResult } from "@/lib/ai";
import {
  SPACE_FEATURES,
  SAFETY_FEATURES,
  OUTDOOR_KITCHEN_OPTIONS,
  POOL_DEPTHS,
  WATER_TYPES,
  CHECKIN_STYLES,
  SPACE_TYPES,
  PARKING_OPTIONS,
  RESTROOM_OPTIONS,
  YES_NO,
  ADA_OPTIONS,
  POLICIES,
} from "@/lib/constants";
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
function AILoadingState({ onComplete }: { onComplete: () => void }) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    AI_LOADING_STEPS.forEach((_, idx) => {
      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, idx]);
        if (idx === AI_LOADING_STEPS.length - 1) {
          setTimeout(onComplete, 600);
        }
      }, (idx + 1) * 800);
    });
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center py-16 space-y-8">
      {/* Water ripple animation */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full bg-cyan-100 animate-ping opacity-20" />
        <div
          className="absolute inset-3 rounded-full bg-cyan-200 animate-ping opacity-30"
          style={{ animationDelay: "0.3s" }}
        />
        <div
          className="absolute inset-6 rounded-full bg-cyan-300 animate-ping opacity-40"
          style={{ animationDelay: "0.6s" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl">🏊</span>
        </div>
      </div>

      <div className="space-y-3 w-full max-w-sm">
        {AI_LOADING_STEPS.map((step, idx) => (
          <div
            key={step}
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300",
              completedSteps.includes(idx)
                ? "bg-emerald-50 text-emerald-700"
                : "text-slate-400",
            )}
          >
            <div
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300",
                completedSteps.includes(idx)
                  ? "bg-emerald-500"
                  : "border-2 border-slate-200",
              )}
            >
              {completedSteps.includes(idx) && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            <span className="text-sm font-medium">{step}</span>
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
          ? "bg-cyan-500 text-white shadow-sm"
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
  options: string[];
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
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-95",
              value === opt
                ? "bg-cyan-500 text-white"
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
          className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center hover:border-cyan-500 transition-colors"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="text-lg font-semibold w-10 text-center">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center hover:border-cyan-500 transition-colors"
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
                ? "bg-cyan-500 text-white"
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
    updateDraft({ description: results.description });
    updatePublicData({
      space: results.space,
      safety: results.safety,
      outdoor_kitchen: results.outdoor_kitchen,
      pool_depth: results.pool_depth,
      water_type: results.water_type,
      guestallowed: results.guestallowed,
      squarefootage: results.squarefootage,
      checkingin: results.checkingin,
      privatespace: results.privatespace,
      parking_size: results.parking_size,
      restroompool: results.restroompool,
      shower: results.shower,
      shower_room: results.shower_room,
      wifi: results.wifi,
      disabilities: results.disabilities,
      alcohol: results.alcohol,
      smoking: results.smoking,
      loud_music: results.loud_music,
      nudity: results.nudity,
      third_party_vendors: results.third_party_vendors,
      security_camera: results.security_camera,
    });
    setAiCompleted(true);
  }, [updateDraft, updatePublicData, setAiCompleted]);

  const runAiAnalysis = useCallback(async () => {
    setAiError(null);
    if (draft.images.length === 0) {
      applyResults(MOCK_AI_RESULTS as AIListingResult);
      return;
    }
    try {
      const results = await analyzeListingPhotos(
        draft.images,
        draft.title,
        draft.category,
      );
      applyResults(results);
    } catch (err: any) {
      console.error("AI analysis failed, using mock data:", err);
      setAiError(err.message ?? "AI analysis failed");
      applyResults(MOCK_AI_RESULTS as AIListingResult);
    }
  }, [draft.images, draft.title, draft.category, applyResults]);

  if (!aiCompleted) {
    return (
      <div className="py-8">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-cyan-900">
            Sit back — we're building your listing
          </h1>
          <p className="mt-2 text-slate-500">
            Our AI is analyzing your photos to fill in the details
          </p>
        </div>
        <AILoadingState onComplete={runAiAnalysis} />
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
        <h1 className="text-3xl font-bold text-cyan-900">Looking great!</h1>
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
              className="flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700"
            >
              <Pencil className="w-3 h-3" />
              {editingDescription ? "Done" : "Edit"}
            </button>
            <button
              onClick={() => {
                setAiCompleted(false);
              }}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
            >
              <RefreshCw className="w-3 h-3" /> Regenerate
            </button>
          </div>
        </div>
        {editingDescription ? (
          <textarea
            value={draft.description}
            onChange={(e) => updateDraft({ description: e.target.value })}
            rows={6}
            className="w-full px-4 py-3 border-2 border-cyan-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all text-sm leading-relaxed"
          />
        ) : (
          <div className="px-4 py-3 bg-slate-50 rounded-xl text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {draft.description}
          </div>
        )}
      </section>

      {/* Feature chips — Space */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
          Space Features & Amenities
        </h2>
        <div className="flex flex-wrap gap-2">
          {SPACE_FEATURES.map((feat) => (
            <ChipToggle
              key={feat}
              label={feat}
              active={draft.publicData.space.includes(feat)}
              onClick={() => toggleArrayField("space", feat)}
            />
          ))}
        </div>
      </section>

      {/* Feature chips — Safety */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
          Safety Features
        </h2>
        <div className="flex flex-wrap gap-2">
          {SAFETY_FEATURES.map((feat) => (
            <ChipToggle
              key={feat}
              label={feat}
              active={draft.publicData.safety.includes(feat)}
              onClick={() => toggleArrayField("safety", feat)}
            />
          ))}
        </div>
      </section>

      {/* Feature chips — Outdoor Kitchen */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
          Outdoor Kitchen & Bar
        </h2>
        <div className="flex flex-wrap gap-2">
          {OUTDOOR_KITCHEN_OPTIONS.map((feat) => (
            <ChipToggle
              key={feat}
              label={feat}
              active={draft.publicData.outdoor_kitchen.includes(feat)}
              onClick={() => toggleArrayField("outdoor_kitchen", feat)}
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
          label="Pool Depth"
          options={POOL_DEPTHS}
          value={draft.publicData.pool_depth}
          onChange={(v) => updatePublicData({ pool_depth: v })}
        />
        <SegmentedSelect
          label="Water Type"
          options={WATER_TYPES}
          value={draft.publicData.water_type}
          onChange={(v) => updatePublicData({ water_type: v })}
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
        <SegmentedSelect
          label="Check-in Style"
          options={CHECKIN_STYLES}
          value={draft.publicData.checkingin}
          onChange={(v) => updatePublicData({ checkingin: v })}
        />
        <SegmentedSelect
          label="Space Type"
          options={SPACE_TYPES}
          value={draft.publicData.privatespace}
          onChange={(v) => updatePublicData({ privatespace: v })}
        />
        <SegmentedSelect
          label="Parking"
          options={PARKING_OPTIONS}
          value={draft.publicData.parking_size}
          onChange={(v) => updatePublicData({ parking_size: v })}
        />
        <MultiSegmentedSelect
          label="Restrooms"
          options={RESTROOM_OPTIONS}
          value={draft.publicData.restroompool}
          onChange={(v) => updatePublicData({ restroompool: v })}
        />
        <SegmentedSelect
          label="Shower"
          options={YES_NO}
          value={draft.publicData.shower}
          onChange={(v) => updatePublicData({ shower: v })}
        />
        <SegmentedSelect
          label="Changing Rooms"
          options={YES_NO}
          value={draft.publicData.shower_room}
          onChange={(v) => updatePublicData({ shower_room: v })}
        />
        <SegmentedSelect
          label="WiFi"
          options={YES_NO}
          value={draft.publicData.wifi}
          onChange={(v) => updatePublicData({ wifi: v })}
        />
        <SegmentedSelect
          label="ADA Accessible"
          options={ADA_OPTIONS}
          value={draft.publicData.disabilities}
          onChange={(v) => updatePublicData({ disabilities: v })}
        />
      </section>

      {/* Policies (collapsible) */}
      <section className="space-y-3">
        <button
          onClick={() => setShowPolicies(!showPolicies)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-cyan-700 transition-colors"
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
          <div className="space-y-1 pl-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {POLICIES.map((policy) => {
              const Icon = POLICY_ICONS[policy.icon];
              return (
                <div
                  key={policy.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b border-slate-100"
                >
                  <div className="flex items-center gap-2 sm:w-36 flex-shrink-0">
                    {Icon && <Icon className="w-4 h-4 text-slate-400" />}
                    <span className="text-sm font-medium text-slate-700">
                      {policy.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {policy.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() =>
                          updatePublicData({
                            [policy.id]: opt,
                          } as any)
                        }
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-95",
                          (draft.publicData as any)[policy.id] === opt
                            ? "bg-cyan-500 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Location */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
          Location
        </h2>
        <div className="flex items-center gap-2 px-4 py-3 bg-cyan-50 rounded-xl">
          <MapPin className="w-5 h-5 text-cyan-600 flex-shrink-0" />
          <span className="text-sm text-cyan-900 font-medium">
            {draft.location.address
              ? `We detected your location as: ${draft.location.address}`
              : "Enter your address below"}
          </span>
        </div>
        <input
          type="text"
          value={draft.location.address}
          onChange={(e) => updateLocation({ address: e.target.value })}
          placeholder="Confirm or update your address"
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all text-sm"
        />
        <input
          type="text"
          value={draft.location.building}
          onChange={(e) => updateLocation({ building: e.target.value })}
          placeholder="Apt, suite, building # (optional)"
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all text-sm"
        />
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
          className="flex-1 py-4 rounded-xl text-lg font-semibold bg-cyan-500 text-white hover:bg-cyan-600 active:scale-[0.98] shadow-lg shadow-cyan-200 transition-all duration-200"
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
          className="text-sm text-slate-400 hover:text-cyan-600 transition-colors"
        >
          Looks good, skip to publish →
        </button>
      </div>
    </div>
  );
}
