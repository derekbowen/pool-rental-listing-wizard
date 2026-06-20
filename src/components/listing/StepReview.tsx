import { useState, useCallback } from "react";
import { useListing } from "@/contexts/ListingContext";
import { cn } from "@/lib/utils";
import { createListing } from "@/lib/sharetribe";
import { getCurrentUser, authPopup } from "@/lib/auth";
import {
  CATEGORY_L1,
  CATEGORY_L2,
  SPACE_ACTIVITIES,
  POOL_AMENITIES,
  WATER_TYPE_OPTIONS,
  CHECKIN_OPTIONS,
  PARKING_SIZE_OPTIONS,
  HOUSE_RULES_OPTIONS,
  labelFor,
} from "@/lib/sharetribe-fields";
import {
  Star,
  MapPin,
  Camera as CameraIcon,
  ChevronDown,
  ChevronUp,
  Pencil,
  CalendarDays,
  Rocket,
  FileText,
  ExternalLink,
  Copy,
  X,
  PartyPopper,
  Check,
} from "lucide-react";

// ---------- Celebration Modal ----------
function CelebrationModal({ onClose, listingId }: { onClose: () => void; listingId?: string | null }) {
  const [copied, setCopied] = useState(false);
  const listingUrl = listingId
    ? `https://www.poolrentalnearme.com/l/${listingId}`
    : "https://www.poolrentalnearme.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(listingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Confetti placeholder — in production use canvas-confetti */}
        <div className="text-6xl">🎉</div>

        <h2 className="text-2xl font-bold text-sky-900">Your listing is live!</h2>
        <p className="text-slate-500">Guests can now find and book your space</p>

        {/* Share link */}
        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
          <input
            type="text"
            readOnly
            value={listingUrl.replace("https://", "")}
            className="flex-1 text-sm text-slate-600 bg-transparent outline-none"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 bg-sky-500 text-white text-xs rounded-lg hover:bg-sky-600 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" /> Copy
              </>
            )}
          </button>
        </div>

        <div className="space-y-2">
          <a
            href={listingUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View your listing →
          </a>
          <button
            onClick={onClose}
            className="w-full py-3 text-slate-500 hover:text-sky-600 font-medium transition-colors"
          >
            List another space →
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Accordion Section ----------
function AccordionSection({
  title,
  icon: Icon,
  children,
  onEdit,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  onEdit?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-xs text-sky-600 hover:text-sky-700 font-medium"
            >
              Edit
            </span>
          )}
          {open ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function StepReview() {
  const { draft, setStep, back, setPage } = useListing();
  const [showCelebration, setShowCelebration] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [listingId, setListingId] = useState<string | null>(null);
  const { pricing } = draft;

  const doPublish = useCallback(async () => {
    setPublishing(true);
    setPublishError(null);
    try {
      const result = await createListing(draft);
      if (result.success) {
        setListingId(result.listingId ?? null);
        setShowCelebration(true);
      } else {
        setPublishError(result.error ?? "Unknown error");
      }
    } catch (err: any) {
      setPublishError(err.message);
    } finally {
      setPublishing(false);
    }
  }, [draft]);

  // Require a geocoded address, then a marketplace sign-in (so the listing is
  // owned by the host's account), then publish.
  const handlePublish = useCallback(async () => {
    if (!(draft.location.address && draft.location.lat != null && draft.location.lng != null)) {
      setPublishError("Please add your pool's address (pick it from the dropdown) before publishing.");
      setStep(3);
      return;
    }
    let user = await getCurrentUser();
    if (!user) {
      await authPopup("login");
      user = await getCurrentUser();
      if (!user) {
        setPublishError("Please sign in to publish your listing.");
        return;
      }
    }
    doPublish();
  }, [doPublish, draft.location, setStep]);

  const handleSaveDraft = () => {
    // Auto-saved to localStorage on this device/browser.
    alert(
      "✓ Saved on this device. Come back on this same phone or browser to finish — or hit Publish to make it live.",
    );
  };

  const coverPhoto = draft.images[0]?.preview;

  return (
    <div className="py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-sky-900">
          You're all set! Here's your listing preview.
        </h1>
      </div>

      {/* Listing Preview Card */}
      <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-100">
        {/* Cover image */}
        <div className="relative aspect-[16/10] bg-slate-200">
          {coverPhoto ? (
            <img
              src={coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              No photos
            </div>
          )}
          {/* Photo count badge */}
          {draft.images.length > 0 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 rounded-full">
              <CameraIcon className="w-3 h-3 text-white" />
              <span className="text-xs text-white font-medium">
                {draft.images.length} photos
              </span>
            </div>
          )}
        </div>

        {/* Card content */}
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-bold text-slate-800">
              {draft.title || "Untitled Listing"}
            </h3>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-medium text-slate-600">New</span>
            </div>
          </div>

          {draft.location.address && (
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <MapPin className="w-3 h-3" />
              {draft.location.address}
            </div>
          )}

          <p className="text-lg font-bold text-sky-700">
            ${(pricing.basePrice / 100).toFixed(0)}/hr
          </p>

          {/* Category badges */}
          <div className="flex flex-wrap gap-1">
            {draft.category && (
              <span className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full text-xs font-medium">
                {labelFor(CATEGORY_L1, draft.category)}
              </span>
            )}
            {draft.subcategory && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                {labelFor(CATEGORY_L2[draft.category] || [], draft.subcategory)}
              </span>
            )}
          </div>

          {/* Truncated description */}
          <p className="text-sm text-slate-500 line-clamp-2">
            {draft.description || "No description yet"}
          </p>
        </div>
      </div>

      {/* Quick Edit Accordions */}
      <div className="space-y-2">
        {/* Photos */}
        <AccordionSection
          title="Photos"
          icon={CameraIcon}
          onEdit={() => setStep(2)}
        >
          <div className="flex gap-2 overflow-x-auto pb-2">
            {draft.images.map((img, idx) => (
              <div
                key={img.id}
                className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden"
              >
                <img
                  src={img.preview}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {idx === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-sky-600 text-white text-[10px] text-center py-0.5">
                    Cover
                  </div>
                )}
              </div>
            ))}
          </div>
        </AccordionSection>

        {/* Details */}
        <AccordionSection
          title="Details"
          icon={FileText}
          onEdit={() => setStep(3)}
        >
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1">
              {draft.publicData.space.map((feat) => (
                <span
                  key={feat}
                  className="px-2 py-1 bg-sky-100 text-sky-700 rounded-full text-xs"
                >
                  {labelFor(SPACE_ACTIVITIES, feat)}
                </span>
              ))}
              {draft.publicData.poolAmenities.map((feat) => (
                <span
                  key={feat}
                  className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs"
                >
                  {labelFor(POOL_AMENITIES, feat)}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div>Water: <strong>{draft.publicData.water_type ? labelFor(WATER_TYPE_OPTIONS, draft.publicData.water_type) : "—"}</strong></div>
              <div>Max Guests: <strong>{draft.publicData.guestallowed}</strong></div>
              <div>Sq Ft: <strong>{draft.publicData.squarefootage}</strong></div>
              <div>Check-in: <strong>{draft.publicData.checkingin ? labelFor(CHECKIN_OPTIONS, draft.publicData.checkingin) : "—"}</strong></div>
              <div>Parking: <strong>{draft.publicData.parking_size ? labelFor(PARKING_SIZE_OPTIONS, draft.publicData.parking_size) : "—"}</strong></div>
            </div>
          </div>
        </AccordionSection>

        {/* Pricing */}
        <AccordionSection
          title="Pricing"
          icon={({ className }: { className?: string }) => (
            <span className={cn("text-sm", className)}>💰</span>
          )}
          onEdit={() => setStep(4)}
        >
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Base rate</span>
              <span className="font-semibold">
                ${(pricing.basePrice / 100).toFixed(0)}/hr
              </span>
            </div>
            {pricing.variations.map((v) => (
              <div key={v.id} className="flex justify-between">
                <span className="text-slate-600">{v.name}</span>
                <span className="font-semibold">
                  ${(v.pricePerHour / 100).toFixed(0)}/hr
                </span>
              </div>
            ))}
            {pricing.deposit && (
              <div className="flex justify-between">
                <span className="text-slate-600">Deposit</span>
                <span className="font-semibold">
                  ${(pricing.deposit / 100).toFixed(0)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600">Instant Booking</span>
              <span
                className={cn(
                  "font-semibold",
                  pricing.instantBooking ? "text-sky-600" : "text-slate-400",
                )}
              >
                {pricing.instantBooking ? "On" : "Off"}
              </span>
            </div>
            {pricing.upgrades.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-1">Add-ons:</p>
                {pricing.upgrades.map((u) => (
                  <div key={u.id} className="flex justify-between text-xs">
                    <span>{u.amenity}</span>
                    <span>${(u.price / 100).toFixed(0)}/hr</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AccordionSection>

        {/* Location */}
        <AccordionSection
          title="Location"
          icon={MapPin}
          onEdit={() => setStep(3)}
        >
          <p className="text-sm text-slate-600">
            {draft.location.address || "No address set"}
            {draft.location.building ? `, ${draft.location.building}` : ""}
          </p>
        </AccordionSection>

        {/* House rules */}
        <AccordionSection
          title="House rules"
          icon={FileText}
          onEdit={() => setStep(3)}
        >
          {draft.publicData.houseRules.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {draft.publicData.houseRules.map((r) => (
                <span key={r} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                  {labelFor(HOUSE_RULES_OPTIONS, r)}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No house rules set</p>
          )}
        </AccordionSection>
      </div>

      {/* Availability */}
      <AccordionSection
        title="Availability"
        icon={CalendarDays}
        onEdit={() => setStep(5)}
      >
        <div className="space-y-2 text-sm">
          <div className="flex flex-wrap gap-1">
            {(Object.entries(draft.availability.schedule) as [string, { enabled: boolean; startTime: string; endTime: string }][]).map(([day, sched]) => (
              <span
                key={day}
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium capitalize",
                  sched.enabled
                    ? "bg-sky-100 text-sky-700"
                    : "bg-slate-100 text-slate-400 line-through",
                )}
              >
                {day.slice(0, 3)}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div>Min booking: <strong>{draft.availability.minHours}h</strong></div>
            <div>Max booking: <strong>{draft.availability.maxHours}h</strong></div>
            <div>Buffer: <strong>{draft.availability.bufferMinutes}min</strong></div>
            <div>Blocked dates: <strong>{draft.availability.blockedDates.length}</strong></div>
          </div>
        </div>
      </AccordionSection>

      {/* Preview buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setPage("product")}
          className="flex-1 py-3 rounded-xl border-2 border-sky-200 text-sky-700 font-semibold hover:bg-sky-50 transition-all flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Preview as Guest
        </button>
        <button
          onClick={() => setPage("cards")}
          className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          <Star className="w-4 h-4" />
          Search Results View
        </button>
      </div>

      {/* Publish Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSaveDraft}
          className="flex-1 py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Save Draft
        </button>
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="flex-1 py-4 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 active:scale-[0.98] shadow-lg shadow-sky-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {publishing ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              Publish to Sharetribe
            </>
          )}
        </button>
      </div>

      {publishError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <strong>Publish failed:</strong> {publishError}
        </div>
      )}

      <p className="text-center text-xs text-slate-400">
        You can edit your listing anytime after publishing
      </p>

      {/* Back button */}
      <div className="text-center">
        <button
          onClick={back}
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          ← Back to Availability
        </button>
      </div>

      {/* Celebration Modal */}
      {showCelebration && (
        <CelebrationModal onClose={() => setShowCelebration(false)} listingId={listingId} />
      )}
    </div>
  );
}
