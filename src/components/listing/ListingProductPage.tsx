import { useState, useMemo } from "react";
import { useListing } from "@/contexts/ListingContext";
import { cn, to12h } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Clock,
  Users,
  Shield,
  Zap,
  Share2,
  Heart,
  Check,
  X,
  Waves,
  Droplets,
  Flame,
  Camera,
  CalendarDays,
  Minus,
  Plus,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ---- Photo Gallery (Swimply-style grid: 1 large + up to 4 small) ----
function PhotoGallery({
  images,
  pricePerHour,
  distance,
}: {
  images: { id: string; preview: string }[];
  pricePerHour?: number;
  distance?: string;
}) {
  const [showAll, setShowAll] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-[16/9] bg-slate-100 rounded-2xl flex items-center justify-center">
        <span className="text-slate-400 text-lg">No photos yet</span>
      </div>
    );
  }

  if (showAll) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <span className="text-white text-sm font-medium">
            {images.length} photos
          </span>
          <button
            onClick={() => setShowAll(false)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="max-w-4xl mx-auto px-4 pb-8 space-y-3">
          {images.map((img, i) => (
            <img
              key={img.id}
              src={img.preview}
              alt={`Photo ${i + 1}`}
              className="w-full rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  const sideImages = images.slice(1, 5);
  const hasGrid = sideImages.length > 0;

  return (
    <div className="relative">
      <div
        className={cn(
          "rounded-2xl overflow-hidden",
          hasGrid ? "grid grid-cols-1 sm:grid-cols-4 gap-1.5 sm:h-[400px]" : "",
        )}
      >
        {/* Main hero image — spans 2 cols on grid */}
        <div
          className={cn(
            "relative bg-slate-100 overflow-hidden",
            hasGrid
              ? "sm:col-span-2 sm:row-span-2 aspect-[4/3] sm:aspect-auto"
              : "aspect-[16/9] sm:aspect-[2/1]",
          )}
        >
          <img
            src={images[0].preview}
            alt="Cover photo"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />

          {/* Price badge — teal, on hero */}
          {pricePerHour !== undefined && (
            <div className="absolute bottom-3 left-3 px-4 py-2 bg-cyan-600 rounded-lg shadow-md">
              <span className="text-white font-bold text-lg">
                ${(pricePerHour / 100).toFixed(0)}
              </span>
              <span className="text-white/80 text-sm"> /hr</span>
            </div>
          )}

          {/* Distance badge — top left */}
          {distance && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-cyan-600" />
              <span className="text-sm font-semibold text-slate-700">{distance}</span>
            </div>
          )}
        </div>

        {/* Side images (up to 4) — only visible on sm+ */}
        {sideImages.map((img, i) => (
          <div
            key={img.id}
            className="relative hidden sm:block bg-slate-100 overflow-hidden"
          >
            <img
              src={img.preview}
              alt={`Photo ${i + 2}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
            {/* "All photos" button on last visible cell */}
            {i === sideImages.length - 1 && images.length > 5 && (
              <button
                onClick={() => setShowAll(true)}
                className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/50 transition-colors"
              >
                <span className="flex items-center gap-1.5 text-white text-sm font-semibold">
                  <Camera className="w-4 h-4" />
                  All {images.length} photos
                </span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: Show all button (grid not visible on mobile) */}
      {images.length > 1 && (
        <button
          onClick={() => setShowAll(true)}
          className="sm:hidden absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white shadow-sm transition-colors"
        >
          <Camera className="w-3.5 h-3.5" />
          All {images.length} photos
        </button>
      )}

      {/* Desktop: Show all button when 5 or fewer photos (no overlay on last cell) */}
      {images.length > 1 && images.length <= 5 && (
        <button
          onClick={() => setShowAll(true)}
          className="hidden sm:flex absolute bottom-3 right-3 items-center gap-1.5 px-3 py-1.5 bg-white/90 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white shadow-sm transition-colors"
        >
          <Camera className="w-3.5 h-3.5" />
          All {images.length} photos
        </button>
      )}
    </div>
  );
}

// ---- Booking Card (Sticky Sidebar) ----
function BookingCard({
  basePrice,
  instantBooking,
  minHours,
  maxHours,
}: {
  basePrice: number;
  instantBooking: boolean;
  minHours: number;
  maxHours: number;
}) {
  const [guests, setGuests] = useState(2);
  const [hours, setHours] = useState(minHours);
  const total = (basePrice / 100) * hours;
  const serviceFee = Math.round(total * 0.2);
  const grandTotal = total + serviceFee;

  return (
    <div className="border border-slate-200 rounded-2xl p-6 shadow-lg space-y-5 bg-white">
      {/* Price header */}
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-slate-900">
          ${(basePrice / 100).toFixed(0)}
        </span>
        <span className="text-slate-500">/ hour</span>
      </div>

      {/* Date picker placeholder */}
      <button className="w-full flex items-center gap-3 px-4 py-3 border-2 border-slate-200 rounded-xl hover:border-cyan-400 transition-colors text-left">
        <CalendarDays className="w-5 h-5 text-cyan-600" />
        <div>
          <p className="text-sm font-semibold text-slate-700">Select a date</p>
          <p className="text-xs text-slate-400">Choose when you'd like to swim</p>
        </div>
      </button>

      {/* Time placeholder */}
      <div className="grid grid-cols-2 gap-2">
        <div className="px-3 py-2.5 border border-slate-200 rounded-xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase">Start</p>
          <p className="text-sm font-medium text-slate-700">10:00 AM</p>
        </div>
        <div className="px-3 py-2.5 border border-slate-200 rounded-xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase">End</p>
          <p className="text-sm font-medium text-slate-700">
            {10 + hours > 12 ? `${10 + hours - 12}:00 PM` : `${10 + hours}:00 AM`}
          </p>
        </div>
      </div>

      {/* Duration */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Duration</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setHours((h) => Math.max(minHours, h - 1))}
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:border-cyan-500 transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-lg font-bold w-14 text-center">{hours} hr{hours > 1 ? "s" : ""}</span>
          <button
            onClick={() => setHours((h) => Math.min(maxHours, h + 1))}
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:border-cyan-500 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Guests */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Guests</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:border-cyan-500 transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-lg font-bold w-14 text-center">{guests}</span>
          <button
            onClick={() => setGuests((g) => Math.min(50, g + 1))}
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:border-cyan-500 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">
            ${(basePrice / 100).toFixed(0)} × {hours} hour{hours > 1 ? "s" : ""}
          </span>
          <span className="font-medium">${total.toFixed(0)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500 flex items-center gap-1">
            Service fee
            <Info className="w-3 h-3" />
          </span>
          <span className="font-medium">${serviceFee.toFixed(0)}</span>
        </div>
        <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-100">
          <span>Total</span>
          <span>${grandTotal.toFixed(0)}</span>
        </div>
      </div>

      {/* Book button */}
      <button className="w-full py-4 rounded-xl text-lg font-bold bg-cyan-500 text-white hover:bg-cyan-600 active:scale-[0.98] shadow-lg shadow-cyan-200 transition-all duration-200 flex items-center justify-center gap-2">
        {instantBooking && <Zap className="w-5 h-5" />}
        {instantBooking ? "Instant Book" : "Request to Book"}
      </button>

      {instantBooking && (
        <p className="text-xs text-center text-slate-400">
          You won't be charged yet — confirm on the next step
        </p>
      )}
    </div>
  );
}

// ---- Feature Pill ----
function FeaturePill({ label, icon: Icon }: { label: string; icon?: React.ElementType }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-sm text-slate-700">
      {Icon && <Icon className="w-3.5 h-3.5 text-cyan-600" />}
      {label}
    </span>
  );
}

// ---- Collapsible Section ----
function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 pb-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-2"
      >
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        {open ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>
      {open && (
        <div className="mt-3 animate-in fade-in duration-200">{children}</div>
      )}
    </div>
  );
}

// ==========================================
// MAIN LISTING PRODUCT PAGE
// ==========================================
export default function ListingProductPage({ onBack }: { onBack: () => void }) {
  const { draft } = useListing();
  const { pricing, availability } = draft;
  const [liked, setLiked] = useState(false);

  const enabledDays = useMemo(
    () =>
      Object.entries(availability.schedule)
        .filter(([, s]) => s.enabled)
        .map(([day, s]) => ({
          day: day.charAt(0).toUpperCase() + day.slice(1),
          start: s.startTime,
          end: s.endTime,
        })),
    [availability.schedule],
  );

  const policyEntries = useMemo(() => {
    const p = draft.publicData;
    return [
      { label: "Alcohol", value: p.alcohol },
      { label: "Smoking", value: p.smoking },
      { label: "Music", value: p.loud_music },
      { label: "Nudity", value: p.nudity },
      { label: "Outside Vendors", value: p.third_party_vendors },
      { label: "Security Cameras", value: p.security_camera },
    ].filter((e) => e.value);
  }, [draft.publicData]);

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-cyan-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to editor
          </button>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-sm text-slate-600 transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-sm text-slate-600 transition-colors"
            >
              <Heart
                className={cn("w-4 h-4 transition-colors", liked ? "fill-red-500 text-red-500" : "")}
              />
              Save
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Photo Gallery */}
        <PhotoGallery
          images={draft.images}
          pricePerHour={pricing.basePrice}
          distance="2.3 mi"
        />

        {/* Content + Sidebar layout */}
        <div className="mt-8 flex flex-col lg:flex-row gap-10">
          {/* Left: Details */}
          <div className="flex-1 space-y-6">
            {/* Title block */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {draft.title || "Untitled Listing"}
                </h1>
                <div className="flex items-center gap-1 flex-shrink-0 mt-1">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-slate-700">New</span>
                </div>
              </div>

              {draft.location.address && (
                <div className="flex items-center gap-1.5 mt-2 text-slate-500">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{draft.location.address}</span>
                </div>
              )}

              {/* Quick stats */}
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Users className="w-4 h-4 text-cyan-600" />
                  Up to {draft.publicData.guestallowed} guests
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-cyan-600" />
                  {availability.minHours}–{availability.maxHours} hours
                </span>
                {pricing.instantBooking && (
                  <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                    <Zap className="w-4 h-4" />
                    Instant Book
                  </span>
                )}
                {draft.publicData.privatespace && (
                  <span className="flex items-center gap-1.5 text-sm text-slate-600">
                    <Shield className="w-4 h-4 text-cyan-600" />
                    {draft.publicData.privatespace}
                  </span>
                )}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Description */}
            <Section title="About this space">
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {draft.description || "No description provided."}
              </p>
            </Section>

            {/* Space Features */}
            {draft.publicData.space.length > 0 && (
              <Section title="Space features">
                <div className="flex flex-wrap gap-2">
                  {draft.publicData.space.map((f) => (
                    <FeaturePill key={f} label={f} icon={Waves} />
                  ))}
                </div>
              </Section>
            )}

            {/* Safety */}
            {draft.publicData.safety.length > 0 && (
              <Section title="Safety features">
                <div className="flex flex-wrap gap-2">
                  {draft.publicData.safety.map((f) => (
                    <FeaturePill key={f} label={f} icon={Shield} />
                  ))}
                </div>
              </Section>
            )}

            {/* Outdoor Kitchen */}
            {draft.publicData.outdoor_kitchen.length > 0 &&
              !draft.publicData.outdoor_kitchen.includes("No Outdoor Kitchen or Bar") && (
                <Section title="Outdoor kitchen & bar">
                  <div className="flex flex-wrap gap-2">
                    {draft.publicData.outdoor_kitchen.map((f) => (
                      <FeaturePill key={f} label={f} icon={Flame} />
                    ))}
                  </div>
                </Section>
              )}

            {/* Pool Details */}
            <Section title="Pool details">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {draft.publicData.pool_depth && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Depth</span>
                    <span className="text-sm font-medium text-slate-700">{draft.publicData.pool_depth}</span>
                  </div>
                )}
                {draft.publicData.water_type && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Water</span>
                    <span className="text-sm font-medium text-slate-700">{draft.publicData.water_type}</span>
                  </div>
                )}
                {draft.publicData.squarefootage > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Area</span>
                    <span className="text-sm font-medium text-slate-700">{draft.publicData.squarefootage} sq ft</span>
                  </div>
                )}
                {draft.publicData.checkingin && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Check-in</span>
                    <span className="text-sm font-medium text-slate-700">{draft.publicData.checkingin}</span>
                  </div>
                )}
                {draft.publicData.parking_size && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Parking</span>
                    <span className="text-sm font-medium text-slate-700">{draft.publicData.parking_size}</span>
                  </div>
                )}
                {draft.publicData.wifi && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase">WiFi</span>
                    <span className="text-sm font-medium text-slate-700">{draft.publicData.wifi}</span>
                  </div>
                )}
                {draft.publicData.shower && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Shower</span>
                    <span className="text-sm font-medium text-slate-700">{draft.publicData.shower}</span>
                  </div>
                )}
                {draft.publicData.disabilities && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase">ADA Access</span>
                    <span className="text-sm font-medium text-slate-700">{draft.publicData.disabilities}</span>
                  </div>
                )}
              </div>
            </Section>

            {/* Upgrades / Add-ons */}
            {pricing.upgrades.length > 0 && (
              <Section title="Available add-ons">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pricing.upgrades.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{u.amenity}</p>
                        {u.description && (
                          <p className="text-xs text-slate-400 mt-0.5">{u.description}</p>
                        )}
                      </div>
                      <span className="text-sm font-bold text-cyan-600">
                        +${(u.price / 100).toFixed(0)}/hr
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Price Variations */}
            {pricing.variations.length > 0 && (
              <Section title="Pricing options">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Base rate</span>
                    <span className="font-bold">${(pricing.basePrice / 100).toFixed(0)}/hr</span>
                  </div>
                  {pricing.variations.map((v) => (
                    <div key={v.id} className="flex justify-between text-sm">
                      <span className="text-slate-600">{v.name}</span>
                      <span className="font-bold">${(v.pricePerHour / 100).toFixed(0)}/hr</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Availability */}
            <Section title="Availability">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {enabledDays.map((d) => (
                    <div
                      key={d.day}
                      className="px-3 py-2 bg-cyan-50 rounded-xl text-center"
                    >
                      <p className="text-xs font-bold text-cyan-700">{d.day.slice(0, 3)}</p>
                      <p className="text-[10px] text-cyan-600 mt-0.5">
                        {to12h(d.start)}–{to12h(d.end)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>Min: {availability.minHours}h</span>
                  <span>Max: {availability.maxHours}h</span>
                  {availability.bufferMinutes > 0 && (
                    <span>Buffer: {availability.bufferMinutes}min between bookings</span>
                  )}
                </div>
              </div>
            </Section>

            {/* House Rules */}
            {policyEntries.length > 0 && (
              <Section title="House rules" defaultOpen={false}>
                <div className="grid grid-cols-2 gap-3">
                  {policyEntries.map((p) => (
                    <div key={p.label} className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-slate-400 uppercase">
                        {p.label}
                      </span>
                      <span className="text-sm text-slate-700">{p.value}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Cancellation */}
            {draft.publicData.cancellation_policy && (
              <Section title="Cancellation policy" defaultOpen={false}>
                <p className="text-sm text-slate-600">
                  {draft.publicData.cancellation_policy}
                </p>
              </Section>
            )}

            {/* Map placeholder */}
            <Section title="Location">
              <div className="aspect-[2/1] bg-slate-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm text-slate-400 mt-2">
                    {draft.location.address || "Location not set"}
                  </p>
                  <p className="text-xs text-slate-300 mt-1">
                    Exact address shown after booking
                  </p>
                </div>
              </div>
            </Section>
          </div>

          {/* Right: Booking Sidebar */}
          <div className="lg:w-[380px] flex-shrink-0">
            <div className="lg:sticky lg:top-20">
              <BookingCard
                basePrice={pricing.basePrice}
                instantBooking={pricing.instantBooking}
                minHours={availability.minHours}
                maxHours={availability.maxHours}
              />

              {/* Trust signals */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Protected by PRNM Guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Check className="w-3.5 h-3.5" />
                  <span>Free cancellation up to 24 hours before</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky booking bar */}
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-slate-200 px-4 py-3 z-40">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-slate-900">
                ${(pricing.basePrice / 100).toFixed(0)}
              </span>
              <span className="text-slate-500 text-sm"> / hour</span>
            </div>
            <button className="px-6 py-3 rounded-xl text-sm font-bold bg-cyan-500 text-white hover:bg-cyan-600 active:scale-[0.98] shadow-lg shadow-cyan-200 transition-all duration-200 flex items-center gap-2">
              {pricing.instantBooking && <Zap className="w-4 h-4" />}
              {pricing.instantBooking ? "Instant Book" : "Request to Book"}
            </button>
          </div>
        </div>

        {/* Bottom spacing for mobile sticky bar */}
        <div className="h-20 lg:hidden" />
      </main>
    </div>
  );
}
