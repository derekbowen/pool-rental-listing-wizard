import { useState } from "react";
import { useListing } from "@/contexts/ListingContext";
import { VARIATION_TEMPLATES, UPGRADE_SUGGESTIONS } from "@/lib/constants";
import type { PriceVariation, Upgrade, PricingTier, DurationDiscount } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Sun,
  Moon,
  PartyPopper,
  Pencil,
  Zap,
  TrendingUp,
  Shield,
  Flame,
  FlameKindling,
  UtensilsCrossed,
  Music,
  LifeBuoy,
  Pizza,
  Droplets,
  Dumbbell,
  Monitor,
  PawPrint,
  Plus,
  X,
  Check,
  Sparkles,
  Umbrella,
  Camera,
  Gamepad2,
  Tent,
  Wine,
  Coffee,
  Bike,
  Heart,
  Star,
  Gift,
  Mic,
  ShowerHead,
  Shirt,
  DoorOpen,
  Fish,
  Sailboat,
  ArrowUpFromLine,
  TreePalm,
  Snowflake,
  Refrigerator,
  Disc3,
  Waves,
  Lightbulb,
  Trophy,
  Users,
  Clock,
  Percent,
  Trash2,
} from "lucide-react";

const VARIATION_ICONS: Record<string, React.ElementType> = {
  Sun,
  Moon,
  PartyPopper,
  Pencil,
};

// All upgrade icons — maps icon name strings to components
const UPGRADE_ICONS: Record<string, React.ElementType> = {
  Flame,
  FlameKindling,
  UtensilsCrossed,
  Music,
  LifeBuoy,
  Pizza,
  Droplets,
  Dumbbell,
  Monitor,
  PawPrint,
  Plus,
  Umbrella,
  Mic,
  ShowerHead,
  Shirt,
  DoorOpen,
  Gamepad2,
  Fish,
  Sailboat,
  ArrowUpFromLine,
  TreePalm,
  Wine,
  Snowflake,
  Refrigerator,
  Camera,
  Disc3,
  Waves,
  Lightbulb,
  Trophy,
  Sparkles,
  Tent,
};

// Icons available for custom upgrade icon picker
const CUSTOM_ICON_OPTIONS: { name: string; icon: React.ElementType }[] = [
  { name: "Flame", icon: Flame },
  { name: "UtensilsCrossed", icon: UtensilsCrossed },
  { name: "Music", icon: Music },
  { name: "LifeBuoy", icon: LifeBuoy },
  { name: "Pizza", icon: Pizza },
  { name: "Droplets", icon: Droplets },
  { name: "Dumbbell", icon: Dumbbell },
  { name: "Monitor", icon: Monitor },
  { name: "PawPrint", icon: PawPrint },
  { name: "Sparkles", icon: Sparkles },
  { name: "Umbrella", icon: Umbrella },
  { name: "Camera", icon: Camera },
  { name: "Gamepad2", icon: Gamepad2 },
  { name: "Tent", icon: Tent },
  { name: "Wine", icon: Wine },
  { name: "Coffee", icon: Coffee },
  { name: "Bike", icon: Bike },
  { name: "Heart", icon: Heart },
  { name: "Star", icon: Star },
  { name: "Gift", icon: Gift },
  { name: "Sun", icon: Sun },
  { name: "Shield", icon: Shield },
  { name: "PartyPopper", icon: PartyPopper },
  { name: "Zap", icon: Zap },
  { name: "Mic", icon: Mic },
  { name: "Fish", icon: Fish },
  { name: "TreePalm", icon: TreePalm },
  { name: "Snowflake", icon: Snowflake },
  { name: "Trophy", icon: Trophy },
  { name: "Lightbulb", icon: Lightbulb },
];

// Lookup helper for all icon names (used for rendering custom upgrade icons)
const ALL_ICONS: Record<string, React.ElementType> = {
  ...UPGRADE_ICONS,
  Coffee, Bike, Heart, Star, Gift, Sun, Shield, PartyPopper, Zap,
};

export default function StepPricing() {
  const { draft, updatePricing, next, back } = useListing();
  const { pricing } = draft;

  const [showVariations, setShowVariations] = useState(pricing.variations.length > 0);
  const [showDeposit, setShowDeposit] = useState(pricing.deposit !== null);
  const [showCustomUpgrade, setShowCustomUpgrade] = useState(false);
  const [customUpgrade, setCustomUpgrade] = useState({ name: "", price: 0, description: "", icon: "Sparkles" });

  // ---- Price helpers ----
  const baseDollars = (pricing.basePrice / 100).toFixed(0);
  const setBasePrice = (dollars: number) => {
    updatePricing({ basePrice: Math.round(dollars * 100) });
  };

  // ---- Variations ----
  const addVariation = (template: (typeof VARIATION_TEMPLATES)[number]) => {
    const newVar: PriceVariation = {
      id: crypto.randomUUID(),
      name: template.id === "custom" ? "" : template.label,
      pricePerHour: pricing.basePrice + 1500, // suggest $15 more
    };
    updatePricing({ variations: [...pricing.variations, newVar] });
  };

  const updateVariation = (id: string, partial: Partial<PriceVariation>) => {
    updatePricing({
      variations: pricing.variations.map((v) =>
        v.id === id ? { ...v, ...partial } : v,
      ),
    });
  };

  const removeVariation = (id: string) => {
    updatePricing({
      variations: pricing.variations.filter((v) => v.id !== id),
    });
  };

  // ---- Upgrades ----
  const isUpgradeActive = (name: string) =>
    pricing.upgrades.some((u) => u.amenity === name);

  const toggleUpgrade = (suggestion: (typeof UPGRADE_SUGGESTIONS)[number]) => {
    if (isUpgradeActive(suggestion.name)) {
      updatePricing({
        upgrades: pricing.upgrades.filter((u) => u.amenity !== suggestion.name),
      });
    } else {
      const newUpgrade: Upgrade = {
        id: crypto.randomUUID(),
        amenity: suggestion.name,
        price: suggestion.suggestedPrice,
        description: "",
      };
      updatePricing({ upgrades: [...pricing.upgrades, newUpgrade] });
    }
  };

  const updateUpgrade = (id: string, partial: Partial<Upgrade>) => {
    updatePricing({
      upgrades: pricing.upgrades.map((u) =>
        u.id === id ? { ...u, ...partial } : u,
      ),
    });
  };

  const removeUpgrade = (id: string) => {
    updatePricing({ upgrades: pricing.upgrades.filter((u) => u.id !== id) });
  };

  // ---- Pricing Tiers ----
  const [showTiers, setShowTiers] = useState(pricing.tiers.length > 0);
  const [showDurationDiscounts, setShowDurationDiscounts] = useState(pricing.durationDiscounts.length > 0);

  const addTier = () => {
    const lastTier = pricing.tiers[pricing.tiers.length - 1];
    const minGuests = lastTier ? (lastTier.maxGuests ?? 0) + 1 : 1;
    const newTier: PricingTier = {
      id: crypto.randomUUID(),
      label: "",
      minGuests,
      maxGuests: minGuests + 9,
      pricePerHour: pricing.basePrice,
    };
    updatePricing({ tiers: [...pricing.tiers, newTier] });
  };

  const updateTier = (id: string, partial: Partial<PricingTier>) => {
    updatePricing({
      tiers: pricing.tiers.map((t) => (t.id === id ? { ...t, ...partial } : t)),
    });
  };

  const removeTier = (id: string) => {
    updatePricing({ tiers: pricing.tiers.filter((t) => t.id !== id) });
  };

  const addDurationDiscount = () => {
    const newDiscount: DurationDiscount = {
      id: crypto.randomUUID(),
      minHours: 3,
      discountPercent: 10,
    };
    updatePricing({ durationDiscounts: [...pricing.durationDiscounts, newDiscount] });
  };

  const updateDiscount = (id: string, partial: Partial<DurationDiscount>) => {
    updatePricing({
      durationDiscounts: pricing.durationDiscounts.map((d) =>
        d.id === id ? { ...d, ...partial } : d,
      ),
    });
  };

  const removeDiscount = (id: string) => {
    updatePricing({
      durationDiscounts: pricing.durationDiscounts.filter((d) => d.id !== id),
    });
  };

  const addCustomUpgrade = () => {
    if (!customUpgrade.name.trim()) return;
    const newUpgrade: Upgrade = {
      id: crypto.randomUUID(),
      amenity: customUpgrade.name,
      price: customUpgrade.price,
      description: customUpgrade.description,
      icon: customUpgrade.icon,
    };
    updatePricing({ upgrades: [...pricing.upgrades, newUpgrade] });
    setCustomUpgrade({ name: "", price: 0, description: "", icon: "Sparkles" });
    setShowCustomUpgrade(false);
  };

  return (
    <div className="py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-sky-900">Set your rates</h1>
        <p className="mt-2 text-slate-500">
          You're in control. Adjust anytime after publishing.
        </p>
      </div>

      {/* 4A: Base Price */}
      <section className="space-y-4">
        <div className="flex flex-col items-center gap-2 py-6">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl text-slate-400 font-medium">$</span>
            <input
              type="number"
              value={baseDollars}
              onChange={(e) => setBasePrice(Number(e.target.value) || 0)}
              min={0}
              max={999}
              className="text-5xl font-bold text-sky-900 w-32 text-center border-b-2 border-slate-200 focus:border-sky-500 outline-none transition-colors bg-transparent"
            />
            <span className="text-lg text-slate-400 font-medium">/ hour</span>
          </div>
          <p className="text-sm text-sky-600 font-medium">
            Suggested range: $35 - $75/hr
          </p>
          <p className="text-xs text-slate-400">Based on pools in your area</p>
        </div>

        {/* Slider */}
        <div className="px-2">
          <input
            type="range"
            min={15}
            max={200}
            value={Number(baseDollars)}
            onChange={(e) => setBasePrice(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-sky-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>$15</span>
            <span>$200</span>
          </div>
        </div>
      </section>

      {/* 4B: Price Variations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">
              Want to charge different rates for different times?
            </h2>
          </div>
          <button
            onClick={() => setShowVariations(!showVariations)}
            className={cn(
              "relative w-11 h-6 rounded-full transition-colors duration-200",
              showVariations ? "bg-sky-500" : "bg-slate-200",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                showVariations ? "translate-x-5.5 left-auto right-0.5" : "left-0.5",
              )}
              style={{
                transform: showVariations ? "translateX(0)" : "translateX(0)",
                left: showVariations ? "auto" : "2px",
                right: showVariations ? "2px" : "auto",
              }}
            />
          </button>
        </div>

        {showVariations && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Templates */}
            <div className="grid grid-cols-2 gap-2">
              {VARIATION_TEMPLATES.map((tmpl) => {
                const Icon = VARIATION_ICONS[tmpl.icon];
                const exists = pricing.variations.some(
                  (v) => v.name === tmpl.label,
                );
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => !exists && addVariation(tmpl)}
                    disabled={exists}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left",
                      exists
                        ? "border-sky-500 bg-sky-50 opacity-60"
                        : "border-slate-200 hover:border-sky-300 hover:shadow-sm active:scale-[0.97]",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 flex-shrink-0",
                        exists ? "text-sky-500" : "text-slate-400",
                      )}
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {tmpl.label}
                      </p>
                      <p className="text-xs text-slate-400">{tmpl.example}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active variations */}
            {pricing.variations.map((v) => (
              <div
                key={v.id}
                className="p-4 border border-slate-200 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) =>
                      updateVariation(v.id, { name: e.target.value })
                    }
                    placeholder="Variation name"
                    className="text-sm font-semibold border-b border-transparent hover:border-slate-200 focus:border-sky-500 outline-none transition-colors bg-transparent"
                  />
                  <button
                    onClick={() => removeVariation(v.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">$</span>
                  <input
                    type="number"
                    value={(v.pricePerHour / 100).toFixed(0)}
                    onChange={(e) =>
                      updateVariation(v.id, {
                        pricePerHour: Math.round(Number(e.target.value) * 100),
                      })
                    }
                    className="w-20 text-lg font-bold border-b border-slate-200 focus:border-sky-500 outline-none transition-colors bg-transparent"
                  />
                  <span className="text-slate-400 text-sm">/ hour</span>
                </div>
              </div>
            ))}

            <button
              onClick={() =>
                addVariation({
                  id: "custom",
                  label: "",
                  example: "",
                  icon: "Pencil",
                })
              }
              className="text-sm text-sky-600 hover:text-sky-700 font-medium"
            >
              + Add another rate
            </button>
          </div>
        )}
      </section>

      {/* 4C: Refundable Deposit */}
      <section className="p-4 border border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-semibold text-slate-700">
              Require a refundable damage deposit?
            </span>
          </div>
          <button
            onClick={() => {
              setShowDeposit(!showDeposit);
              if (showDeposit) updatePricing({ deposit: null });
              else updatePricing({ deposit: 5000 }); // default $50
            }}
            className={cn(
              "relative w-11 h-6 rounded-full transition-colors duration-200",
              showDeposit ? "bg-sky-500" : "bg-slate-200",
            )}
          >
            <span
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200"
              style={{
                left: showDeposit ? "auto" : "2px",
                right: showDeposit ? "2px" : "auto",
              }}
            />
          </button>
        </div>
        {showDeposit && (
          <div className="space-y-1 animate-in fade-in duration-200">
            <div className="flex items-center gap-1">
              <span className="text-slate-400">$</span>
              <input
                type="number"
                value={pricing.deposit ? (pricing.deposit / 100).toFixed(0) : ""}
                onChange={(e) =>
                  updatePricing({
                    deposit: Math.round(Number(e.target.value) * 100) || null,
                  })
                }
                placeholder="50"
                className="w-24 text-lg font-bold border-b border-slate-200 focus:border-sky-500 outline-none transition-colors bg-transparent"
              />
            </div>
            <p className="text-xs text-slate-400">
              Collected at booking, refunded if no damage reported
            </p>
          </div>
        )}
      </section>

      {/* 4D: Instant Booking */}
      <section
        className={cn(
          "p-5 rounded-xl border-2 transition-all duration-300",
          pricing.instantBooking
            ? "border-sky-500 bg-gradient-to-r from-sky-50 to-white"
            : "border-amber-200 bg-gradient-to-r from-amber-50/50 to-white",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap
                className={cn(
                  "w-5 h-5",
                  pricing.instantBooking ? "text-sky-600" : "text-amber-500",
                )}
              />
              <span className="text-lg font-bold text-slate-800">
                Instant Booking
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Guests can book immediately without waiting for your approval.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600">
                Instant Book listings get 3x more bookings on average
              </span>
            </div>
          </div>
          <button
            onClick={() =>
              updatePricing({ instantBooking: !pricing.instantBooking })
            }
            className={cn(
              "relative w-14 h-8 rounded-full transition-colors duration-200 flex-shrink-0",
              pricing.instantBooking ? "bg-sky-500" : "bg-slate-200",
            )}
          >
            <span
              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-200"
              style={{
                left: pricing.instantBooking ? "auto" : "4px",
                right: pricing.instantBooking ? "4px" : "auto",
              }}
            />
          </button>
        </div>
      </section>

      {/* 4E: Guest Pricing Tiers */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <div>
              <h2 className="text-sm font-semibold text-slate-700">
                Charge different rates by group size?
              </h2>
              <p className="text-xs text-slate-400">e.g. 1-5 guests = $45, 6-10 = $55</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowTiers(!showTiers);
              if (!showTiers && pricing.tiers.length === 0) {
                // Auto-add two starter tiers
                updatePricing({
                  tiers: [
                    { id: crypto.randomUUID(), label: "Small group", minGuests: 1, maxGuests: 5, pricePerHour: pricing.basePrice },
                    { id: crypto.randomUUID(), label: "Large group", minGuests: 6, maxGuests: 15, pricePerHour: pricing.basePrice + 1500 },
                  ],
                });
              }
              if (showTiers) updatePricing({ tiers: [] });
            }}
            className={cn(
              "relative w-11 h-6 rounded-full transition-colors duration-200",
              showTiers ? "bg-sky-500" : "bg-slate-200",
            )}
          >
            <span
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200"
              style={{
                left: showTiers ? "auto" : "2px",
                right: showTiers ? "2px" : "auto",
              }}
            />
          </button>
        </div>

        {showTiers && pricing.tiers.length > 0 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {pricing.tiers.map((tier) => (
              <div
                key={tier.id}
                className="p-3 border border-slate-200 rounded-xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={tier.label}
                    onChange={(e) => updateTier(tier.id, { label: e.target.value })}
                    placeholder="Tier name (e.g. Small group)"
                    className="text-sm font-semibold border-b border-transparent hover:border-slate-200 focus:border-sky-500 outline-none transition-colors bg-transparent"
                  />
                  <button
                    onClick={() => removeTier(tier.id)}
                    className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="number"
                    value={tier.minGuests}
                    onChange={(e) => updateTier(tier.id, { minGuests: Number(e.target.value) || 1 })}
                    className="w-12 text-center border border-slate-200 rounded-lg py-1 focus:border-sky-500 outline-none bg-transparent"
                    min={1}
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="number"
                    value={tier.maxGuests ?? ""}
                    onChange={(e) => updateTier(tier.id, { maxGuests: Number(e.target.value) || null })}
                    placeholder="∞"
                    className="w-12 text-center border border-slate-200 rounded-lg py-1 focus:border-sky-500 outline-none bg-transparent"
                    min={1}
                  />
                  <span className="text-slate-400">guests →</span>
                  <span className="text-slate-400">$</span>
                  <input
                    type="number"
                    value={(tier.pricePerHour / 100).toFixed(0)}
                    onChange={(e) => updateTier(tier.id, { pricePerHour: Math.round(Number(e.target.value) * 100) })}
                    className="w-16 text-sm font-bold border-b border-slate-200 focus:border-sky-500 outline-none transition-colors bg-transparent"
                  />
                  <span className="text-xs text-slate-400">/hr</span>
                </div>
              </div>
            ))}
            <button
              onClick={addTier}
              className="text-sm text-sky-600 hover:text-sky-700 font-medium"
            >
              + Add another tier
            </button>
          </div>
        )}
      </section>

      {/* 4F: Duration Discounts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-emerald-500" />
            <div>
              <h2 className="text-sm font-semibold text-slate-700">
                Offer discounts for longer bookings?
              </h2>
              <p className="text-xs text-slate-400">e.g. 3+ hours = 10% off</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowDurationDiscounts(!showDurationDiscounts);
              if (!showDurationDiscounts && pricing.durationDiscounts.length === 0) {
                updatePricing({
                  durationDiscounts: [
                    { id: crypto.randomUUID(), minHours: 3, discountPercent: 10 },
                    { id: crypto.randomUUID(), minHours: 5, discountPercent: 20 },
                  ],
                });
              }
              if (showDurationDiscounts) updatePricing({ durationDiscounts: [] });
            }}
            className={cn(
              "relative w-11 h-6 rounded-full transition-colors duration-200",
              showDurationDiscounts ? "bg-sky-500" : "bg-slate-200",
            )}
          >
            <span
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200"
              style={{
                left: showDurationDiscounts ? "auto" : "2px",
                right: showDurationDiscounts ? "2px" : "auto",
              }}
            />
          </button>
        </div>

        {showDurationDiscounts && pricing.durationDiscounts.length > 0 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {pricing.durationDiscounts.map((disc) => (
              <div
                key={disc.id}
                className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl"
              >
                <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div className="flex items-center gap-2 flex-1 text-sm">
                  <input
                    type="number"
                    value={disc.minHours}
                    onChange={(e) => updateDiscount(disc.id, { minHours: Number(e.target.value) || 1 })}
                    className="w-12 text-center border border-slate-200 rounded-lg py-1 focus:border-sky-500 outline-none bg-transparent"
                    min={2}
                  />
                  <span className="text-slate-400">+ hours →</span>
                  <input
                    type="number"
                    value={disc.discountPercent}
                    onChange={(e) => updateDiscount(disc.id, { discountPercent: Math.min(50, Number(e.target.value) || 0) })}
                    className="w-12 text-center border border-slate-200 rounded-lg py-1 focus:border-sky-500 outline-none bg-transparent"
                    min={1}
                    max={50}
                  />
                  <span className="text-slate-400">% off</span>
                </div>
                <button
                  onClick={() => removeDiscount(disc.id)}
                  className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addDurationDiscount}
              className="text-sm text-sky-600 hover:text-sky-700 font-medium"
            >
              + Add another discount
            </button>
          </div>
        )}
      </section>

      {/* 4G: Upgrades & Enhancements */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Boost your earnings with add-ons
          </h2>
          <p className="text-sm text-slate-500">
            Guests love extras. List amenities they can add to their booking.
          </p>
        </div>

        {/* Upgrade suggestion grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {UPGRADE_SUGGESTIONS.map((sug) => {
            const Icon = UPGRADE_ICONS[sug.icon] || Plus;
            const active = isUpgradeActive(sug.name);
            return (
              <button
                key={sug.name}
                onClick={() => toggleUpgrade(sug)}
                className={cn(
                  "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                  "active:scale-[0.97]",
                  active
                    ? "border-sky-500 bg-sky-50"
                    : "border-slate-200 hover:border-slate-300",
                )}
              >
                {active && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <Icon
                  className={cn(
                    "w-6 h-6",
                    active ? "text-sky-600" : "text-slate-400",
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-semibold text-center",
                    active ? "text-sky-900" : "text-slate-600",
                  )}
                >
                  {sug.name}
                </span>
                <span className="text-xs text-slate-400">
                  ${(sug.suggestedPrice / 100).toFixed(0)}/hr
                </span>
              </button>
            );
          })}
        </div>

        {/* Active upgrade cards — editable */}
        {pricing.upgrades.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
              Your add-ons
            </h3>
            {pricing.upgrades.map((u) => {
              const CustomIcon = u.icon ? ALL_ICONS[u.icon] : null;
              return (
              <div
                key={u.id}
                className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl"
              >
                {CustomIcon && (
                  <div className="flex items-center justify-center w-9 h-9 bg-sky-50 rounded-lg flex-shrink-0 mt-0.5">
                    <CustomIcon className="w-5 h-5 text-sky-600" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={u.amenity}
                    onChange={(e) =>
                      updateUpgrade(u.id, { amenity: e.target.value })
                    }
                    className="text-sm font-semibold w-full border-b border-transparent hover:border-slate-200 focus:border-sky-500 outline-none transition-colors bg-transparent"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400">$</span>
                    <input
                      type="number"
                      value={(u.price / 100).toFixed(0)}
                      onChange={(e) =>
                        updateUpgrade(u.id, {
                          price: Math.round(Number(e.target.value) * 100),
                        })
                      }
                      className="w-16 text-sm font-bold border-b border-slate-200 focus:border-sky-500 outline-none transition-colors bg-transparent"
                    />
                    <span className="text-xs text-slate-400">/hr</span>
                  </div>
                  <input
                    type="text"
                    value={u.description}
                    onChange={(e) =>
                      updateUpgrade(u.id, { description: e.target.value })
                    }
                    placeholder="Brief description for guests"
                    className="w-full text-xs text-slate-500 border-b border-transparent hover:border-slate-200 focus:border-sky-500 outline-none transition-colors bg-transparent"
                  />
                </div>
                <button
                  onClick={() => removeUpgrade(u.id)}
                  className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              );
            })}
          </div>
        )}

        {/* Custom add-on */}
        {showCustomUpgrade ? (
          <div className="p-4 border-2 border-dashed border-sky-300 rounded-xl space-y-4">
            {/* Icon picker */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Choose an icon
              </span>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
                {CUSTOM_ICON_OPTIONS.map((opt) => {
                  const IconComp = opt.icon;
                  const selected = customUpgrade.icon === opt.name;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setCustomUpgrade({ ...customUpgrade, icon: opt.name })}
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-150 active:scale-90",
                        selected
                          ? "bg-sky-500 text-white shadow-md ring-2 ring-sky-300"
                          : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600",
                      )}
                    >
                      <IconComp className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            <input
              type="text"
              value={customUpgrade.name}
              onChange={(e) =>
                setCustomUpgrade({ ...customUpgrade, name: e.target.value })
              }
              placeholder="Upgrade name"
              className="w-full text-sm font-semibold border-b border-slate-200 focus:border-sky-500 outline-none transition-colors bg-transparent pb-1"
            />
            <div className="flex items-center gap-1">
              <span className="text-slate-400">$</span>
              <input
                type="number"
                value={
                  customUpgrade.price
                    ? (customUpgrade.price / 100).toFixed(0)
                    : ""
                }
                onChange={(e) =>
                  setCustomUpgrade({
                    ...customUpgrade,
                    price: Math.round(Number(e.target.value) * 100),
                  })
                }
                placeholder="0"
                className="w-16 text-sm font-bold border-b border-slate-200 focus:border-sky-500 outline-none transition-colors bg-transparent"
              />
              <span className="text-xs text-slate-400">/hr</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addCustomUpgrade}
                className="px-4 py-2 bg-sky-500 text-white text-sm rounded-lg hover:bg-sky-600 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowCustomUpgrade(false)}
                className="px-4 py-2 text-slate-400 text-sm hover:text-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCustomUpgrade(true)}
            className="text-sm text-sky-600 hover:text-sky-700 font-medium"
          >
            + Add custom upgrade
          </button>
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
          className="flex-1 py-4 rounded-xl text-lg font-semibold bg-sky-500 text-white hover:bg-sky-600 active:scale-[0.98] shadow-lg shadow-sky-200 transition-all duration-200"
        >
          Set Availability →
        </button>
      </div>
    </div>
  );
}
