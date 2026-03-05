import { useState, useEffect } from "react";
import { useListing } from "@/contexts/ListingContext";
import { LISTING_TYPES, CATEGORIES, SUBCATEGORIES } from "@/lib/constants";
import type { ListingTypeId, CategoryId } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Waves,
  Users,
  CalendarDays,
  PartyPopper,
  Home,
  Building,
  Trophy,
  Sparkles,
} from "lucide-react";

const TYPE_ICONS: Record<string, React.ElementType> = {
  Waves,
  Users,
  CalendarDays,
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Waves,
  PartyPopper,
  Home,
  Building,
  Trophy,
  Sparkles,
};

const PLACEHOLDER_NAMES = [
  "Sunset Oasis",
  "The Backyard Resort",
  "Palm Paradise Pool",
  "Blue Lagoon Retreat",
  "Tropical Hideaway",
];

export default function StepTypeSelection() {
  const { draft, updateDraft, next } = useListing();
  const [showCategory, setShowCategory] = useState(!!draft.listingType || !!draft.category);
  const [showSubcategory, setShowSubcategory] = useState(draft.subcategory.length > 0);
  const [showName, setShowName] = useState(!!draft.title);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  // Rotate placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDER_NAMES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleTypeSelect = (id: ListingTypeId) => {
    updateDraft({ listingType: id });
    setShowCategory(true);
  };

  const handleCategorySelect = (id: string) => {
    updateDraft({ category: id, subcategory: [] });
    const subs = SUBCATEGORIES[id] || [];
    if (subs.length > 0) {
      setShowSubcategory(true);
    } else {
      setShowSubcategory(false);
      setShowName(true);
    }
  };

  const toggleSubcategory = (sub: string) => {
    const current = draft.subcategory;
    const next = current.includes(sub)
      ? current.filter((s) => s !== sub)
      : [...current, sub];
    updateDraft({ subcategory: next });
    if (next.length > 0) setShowName(true);
  };

  const canContinue = draft.listingType && draft.category && draft.title.trim().length > 0;

  return (
    <div className="py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-cyan-900">Let's list your space</h1>
        <p className="mt-2 text-slate-500">Tell us what you're sharing — tap to select</p>
      </div>

      {/* 1A: Listing Type */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
          Listing Type
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {LISTING_TYPES.map((type) => {
            const Icon = TYPE_ICONS[type.icon];
            const selected = draft.listingType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => handleTypeSelect(type.id)}
                className={cn(
                  "relative flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all duration-200",
                  "hover:shadow-lg active:scale-[0.97]",
                  selected
                    ? "border-cyan-500 bg-cyan-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300",
                )}
              >
                {selected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <Icon className={cn("w-8 h-8", selected ? "text-cyan-600" : "text-slate-400")} />
                <span className={cn("font-semibold text-sm", selected ? "text-cyan-900" : "text-slate-700")}>
                  {type.label}
                </span>
                <span className="text-xs text-slate-400">{type.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 1B: Category */}
      {showCategory && (
        <section className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
            Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.icon];
              const selected = draft.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                    "hover:shadow-lg active:scale-[0.97]",
                    selected
                      ? "border-cyan-500 bg-cyan-50 shadow-md"
                      : "border-slate-200 bg-white hover:border-slate-300",
                  )}
                >
                  <Icon className={cn("w-7 h-7", selected ? "text-cyan-600" : "text-slate-400")} />
                  <span className={cn("font-semibold text-sm", selected ? "text-cyan-900" : "text-slate-700")}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 1C: Subcategory chips */}
      {showSubcategory && draft.category && (SUBCATEGORIES[draft.category]?.length ?? 0) > 0 && (
        <section className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
            What kind? <span className="font-normal">(select all that apply)</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {SUBCATEGORIES[draft.category]!.map((sub) => {
              const active = draft.subcategory.includes(sub);
              return (
                <button
                  key={sub}
                  onClick={() => toggleSubcategory(sub)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    "active:scale-95",
                    active
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                  )}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 1D: Name */}
      {showName && (
        <section className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
            Name Your Space
          </h2>
          <input
            type="text"
            maxLength={60}
            value={draft.title}
            onChange={(e) => updateDraft({ title: e.target.value })}
            placeholder={PLACEHOLDER_NAMES[placeholderIdx]}
            className="w-full px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Great names are short, memorable, and describe the vibe</span>
            <span>{draft.title.length}/60</span>
          </div>
        </section>
      )}

      {/* CTA */}
      <button
        onClick={next}
        disabled={!canContinue}
        className={cn(
          "w-full py-4 rounded-xl text-lg font-semibold transition-all duration-200",
          canContinue
            ? "bg-cyan-500 text-white hover:bg-cyan-600 active:scale-[0.98] shadow-lg shadow-cyan-200"
            : "bg-slate-200 text-slate-400 cursor-not-allowed",
        )}
      >
        Next: Add Photos →
      </button>
    </div>
  );
}
