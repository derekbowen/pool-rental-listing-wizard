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
  const { draft, updateDraft, updatePublicData, updatePricing, updateLocation, next } = useListing();
  const [showCategory, setShowCategory] = useState(!!draft.listingType || !!draft.category);
  const [showSubcategory, setShowSubcategory] = useState(!!draft.subcategory);
  const [showName, setShowName] = useState(!!draft.title);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  // URL import (Swimply / Peerspace / Giggster)
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [importDone, setImportDone] = useState(false);

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
    updateDraft({ category: id, subcategory: "" });
    const subs = SUBCATEGORIES[id] || [];
    if (subs.length > 0) {
      setShowSubcategory(true);
    } else {
      setShowSubcategory(false);
      setShowName(true);
    }
  };

  const selectSubcategory = (code: string) => {
    updateDraft({ subcategory: draft.subcategory === code ? "" : code });
    setShowName(true);
  };

  const handleImport = async () => {
    const url = importUrl.trim();
    if (!url) return;
    setImportError("");
    setImportDone(false);
    setImporting(true);
    try {
      const res = await fetch("/wizard/api/import-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Couldn't import that link.");
      const d = data.draft || {};
      updateDraft({
        title: d.title || draft.title,
        description: d.description || draft.description,
        category: draft.category || "pool",
      });
      updatePublicData({
        guestallowed: typeof d.guestallowed === "number" ? d.guestallowed : draft.publicData.guestallowed,
        cancellation_policy: d.cancellation_policy || draft.publicData.cancellation_policy,
        // space/poolAmenities/water_type etc. are coded fields — left for the AI
        // step (and host review) to populate with valid production codes.
      });
      updatePricing({
        ...(typeof d.basePriceCents === "number" ? { basePrice: d.basePriceCents } : {}),
        upgrades: Array.isArray(d.amenities)
          ? d.amenities.map((a: { amenity?: string; price?: number; description?: string }, i: number) => ({
              id: `imp-${i}`,
              amenity: a.amenity || "Add-on",
              price: typeof a.price === "number" ? a.price : 0,
              description: a.description || "",
            }))
          : draft.pricing.upgrades,
      });
      if (d.city || d.state) updateLocation({ city: d.city || "", state: d.state || "" });
      if (Array.isArray(d.photos)) {
        updateDraft({
          importedPhotos: d.photos
            .filter((u: unknown): u is string => typeof u === "string" && u.startsWith("http"))
            .slice(0, 20)
            .map((url: string) => ({ url, selected: true })),
        });
      }
      setShowCategory(true);
      setShowName(true);
      setImportDone(true);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Couldn't import that link.");
    } finally {
      setImporting(false);
    }
  };

  const canContinue = draft.listingType && draft.category && draft.title.trim().length > 0;

  return (
    <div className="py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-sky-900">Let's list your space</h1>
        <p className="mt-2 text-slate-500">Tell us what you're sharing — tap to select</p>
      </div>

      {/* URL import */}
      <section className="rounded-2xl border-2 border-sky-100 bg-sky-50/60 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-500" />
          <h2 className="font-semibold text-sky-900">Already listed elsewhere? Import it in seconds</h2>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Paste your Swimply, Peerspace, or Giggster link and we'll pull in the details for you to review.
        </p>
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleImport()}
            placeholder="https://swimply.com/pooldetails/…"
            className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
          />
          <button
            onClick={handleImport}
            disabled={importing || !importUrl.trim()}
            className={cn(
              "px-6 py-3 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap",
              importing || !importUrl.trim()
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-sky-500 text-white hover:bg-sky-600 active:scale-[0.98] shadow-md shadow-sky-200",
            )}
          >
            {importing ? "Importing…" : "Import"}
          </button>
        </div>
        {importError && <p className="mt-2 text-sm text-red-500">{importError}</p>}
        {importDone && (
          <p className="mt-2 text-sm text-green-600 font-medium">
            ✓ Imported! We filled in what we could — review the details below and in the next steps.
          </p>
        )}
      </section>

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
                    ? "border-sky-500 bg-sky-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300",
                )}
              >
                {selected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <Icon className={cn("w-8 h-8", selected ? "text-sky-600" : "text-slate-400")} />
                <span className={cn("font-semibold text-sm", selected ? "text-sky-900" : "text-slate-700")}>
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
                      ? "border-sky-500 bg-sky-50 shadow-md"
                      : "border-slate-200 bg-white hover:border-slate-300",
                  )}
                >
                  <Icon className={cn("w-7 h-7", selected ? "text-sky-600" : "text-slate-400")} />
                  <span className={cn("font-semibold text-sm", selected ? "text-sky-900" : "text-slate-700")}>
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
            What kind? <span className="font-normal">(pick one)</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {SUBCATEGORIES[draft.category]!.map((sub) => {
              const active = draft.subcategory === sub.code;
              return (
                <button
                  key={sub.code}
                  onClick={() => selectSubcategory(sub.code)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    "active:scale-95",
                    active
                      ? "bg-sky-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                  )}
                >
                  {sub.label}
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
            className="w-full px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
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
            ? "bg-sky-500 text-white hover:bg-sky-600 active:scale-[0.98] shadow-lg shadow-sky-200"
            : "bg-slate-200 text-slate-400 cursor-not-allowed",
        )}
      >
        Next: Add Photos →
      </button>
    </div>
  );
}
