import type { ListingDraft } from "./types";
import { readMarketplaceToken } from "./auth";
import {
  CATEGORY_L2,
  SPACE_ACTIVITIES,
  POOL_AMENITIES,
  WATER_TYPE_OPTIONS,
  CHECKIN_OPTIONS,
  PARKING_SIZE_OPTIONS,
  ACCESSIBILITY_OPTIONS,
  HOUSE_RULES_OPTIONS,
  toCode,
  toCodes,
} from "./sharetribe-fields";

interface SharetribeCreatePayload {
  authorId: string;
  state: string;
  title: string;
  description: string;
  price: { amount: number; currency: string };
  geolocation?: { lat: number; lng: number };
  availabilityPlan?: {
    type: string;
    timezone: string;
    entries: { dayOfWeek: string; seats: number; startTime: string; endTime: string }[];
  };
  images?: string[];
  publicData: Record<string, unknown>;
  privateData?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

function mapDraftToSharetribe(
  draft: ListingDraft,
  authorId: string,
): SharetribeCreatePayload {
  const pd = draft.publicData;

  // Build the real Sharetribe availability plan (top-level) — this is what makes
  // the listing actually bookable. Day codes: sun/mon/tue/wed/thu/fri/sat.
  const DAY_CODES: Record<string, string> = {
    monday: "mon", tuesday: "tue", wednesday: "wed", thursday: "thu",
    friday: "fri", saturday: "sat", sunday: "sun",
  };
  const availabilityPlan = {
    type: "availability-plan/time",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Los_Angeles",
    entries: Object.entries(draft.availability.schedule)
      .filter(([, v]) => v.enabled)
      .map(([day, v]) => ({ dayOfWeek: DAY_CODES[day], seats: 1, startTime: v.startTime, endTime: v.endTime })),
  };

  // Price variants in the real format: a base "Per hour" rate plus any extras.
  const priceVariants = [
    { name: "Per hour", priceInSubunits: draft.pricing.basePrice },
    ...draft.pricing.variations.map((v) => ({ name: v.name, priceInSubunits: v.pricePerHour })),
  ];

  return {
    authorId,
    // Sharetribe requires `state` on create — publish straight to live.
    state: "published",
    title: draft.title,
    description: draft.description,
    price: {
      amount: draft.pricing.basePrice,
      currency: "USD",
    },
    // Top-level geolocation (required for map/location search) — only when set.
    ...(draft.location.lat != null && draft.location.lng != null
      ? { geolocation: { lat: draft.location.lat, lng: draft.location.lng } }
      : {}),
    availabilityPlan,
    publicData: {
      // Listing type + categories (production CODES, single categoryLevel2)
      listingType: draft.listingType,
      categoryLevel1: draft.category,
      categoryLevel2: toCode(CATEGORY_L2[draft.category] || [], draft.subcategory),

      // Searchable enum fields — normalized to production codes so search filters match.
      space: toCodes(SPACE_ACTIVITIES, pd.space),
      poolAmenities: toCodes(POOL_AMENITIES, pd.poolAmenities),
      water_type: toCode(WATER_TYPE_OPTIONS, pd.water_type),
      checkingin: toCode(CHECKIN_OPTIONS, pd.checkingin),
      parking_size: toCode(PARKING_SIZE_OPTIONS, pd.parking_size),
      accessibility: toCodes(ACCESSIBILITY_OPTIONS, pd.accessibility),
      houseRules: toCodes(HOUSE_RULES_OPTIONS, pd.houseRules),
      guestallowed: pd.guestallowed,
      squarefootage: pd.squarefootage,

      // Free-text production keys (typo `poolcleanring` preserved verbatim).
      transportation: pd.transportation,
      cancellation_policy: pd.cancellation_policy,
      poolcleanring: pd.poolcleanring,
      additional_notes: pd.additional_notes,

      // Booking wiring — required for the listing to be bookable.
      transactionProcessAlias: "default-booking/release-1",
      unitType: "hour",

      // Pricing
      priceVariationsEnabled: true,
      priceVariants,
      isInstantBooking: draft.pricing.instantBooking,
      ...(draft.pricing.deposit != null ? { refundableDeposit: draft.pricing.deposit } : {}),
      // Priced add-ons in the REAL production shape: { id, name, description, price:{amount,currency} }
      amenities: draft.pricing.upgrades.map((u) => ({
        id: u.id,
        name: u.amenity,
        description: u.description,
        price: { amount: u.price, currency: "USD" },
      })),
      pricingTiers: draft.pricing.tiers,
      durationDiscounts: draft.pricing.durationDiscounts,

      // Availability
      availability: {
        schedule: draft.availability.schedule,
        blockedDates: draft.availability.blockedDates,
        dateOverrides: draft.availability.dateOverrides,
        minHours: draft.availability.minHours,
        maxHours: draft.availability.maxHours,
        bufferMinutes: draft.availability.bufferMinutes,
        advanceNoticeDays: draft.availability.advanceNoticeDays,
      },

      // Location
      location: draft.location,
    },
  };
}

export async function createListing(
  draft: ListingDraft,
): Promise<{ success: boolean; listingId?: string; error?: string }> {
  const token = readMarketplaceToken() || "";
  // authorId is set server-side from the verified marketplace session — not trusted from here.
  const payload = mapDraftToSharetribe(draft, "");

  // Upload photos to Sharetribe: host-uploaded files (as base64) + selected imported
  // photos (as URLs). Non-fatal: publish without them on failure.
  const fileDataUrls = await Promise.all(
    (draft.images || []).map(
      (img) =>
        new Promise<string>((resolve) => {
          const r = new FileReader();
          r.onload = () => resolve(typeof r.result === "string" ? r.result : "");
          r.onerror = () => resolve("");
          r.readAsDataURL(img.file);
        }),
    ),
  );
  const hostFiles = fileDataUrls.filter(Boolean);
  const importedUrls = (draft.importedPhotos || []).filter((p) => p.selected).map((p) => p.url);
  if (hostFiles.length > 0 || importedUrls.length > 0) {
    try {
      const up = await fetch("/wizard/api/sharetribe/upload-images", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ files: hostFiles, urls: importedUrls }),
      });
      const uj = await up.json();
      if (up.ok && Array.isArray(uj.imageIds) && uj.imageIds.length > 0) {
        payload.images = uj.imageIds;
      }
    } catch {
      // ignore — listing still publishes, host can add photos later
    }
  }

  const res = await fetch("/wizard/api/sharetribe/create-listing", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      success: false,
      error: data.errors?.[0]?.title || data.error || `HTTP ${res.status}`,
    };
  }

  return {
    success: true,
    listingId: typeof data.data?.id === "string" ? data.data.id : data.data?.id?.uuid,
  };
}

export async function updateListing(
  listingId: string,
  draft: ListingDraft,
): Promise<{ success: boolean; error?: string }> {
  const payload = {
    id: listingId,
    title: draft.title,
    description: draft.description,
    price: { amount: draft.pricing.basePrice, currency: "USD" },
    publicData: mapDraftToSharetribe(draft, "").publicData,
  };

  const res = await fetch("/wizard/api/sharetribe/update-listing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      success: false,
      error: data.errors?.[0]?.title || data.error || `HTTP ${res.status}`,
    };
  }

  return { success: true };
}
