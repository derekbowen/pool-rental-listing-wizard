import type { ListingDraft } from "./types";

interface SharetribeCreatePayload {
  authorId: string;
  title: string;
  description: string;
  price: { amount: number; currency: string };
  publicData: Record<string, unknown>;
  privateData?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

function mapDraftToSharetribe(
  draft: ListingDraft,
  authorId: string,
): SharetribeCreatePayload {
  const pd = draft.publicData;

  return {
    authorId,
    title: draft.title,
    description: draft.description,
    price: {
      amount: draft.pricing.basePrice,
      currency: "USD",
    },
    publicData: {
      // Listing type
      listingType: draft.listingType,
      categoryLevel1: draft.category,
      categoryLevel2: draft.subcategory,

      // Space & features (preserve production keys verbatim)
      space: pd.space,
      safety: pd.safety,
      outdoor_kitchen: pd.outdoor_kitchen,
      pool_depth: pd.pool_depth,
      water_type: pd.water_type,
      guestallowed: pd.guestallowed,
      squarefootage: pd.squarefootage,
      checkingin: pd.checkingin,
      privatespace: pd.privatespace,
      parking_size: pd.parking_size,
      restroompool: pd.restroompool,
      shower: pd.shower,
      shower_room: pd.shower_room,
      wifi: pd.wifi,
      disabilities: pd.disabilities,
      accessibility: pd.accessibility,
      rooms: pd.rooms,
      what_to_bring: pd.what_to_bring,
      poolcleanring: pd.poolcleanring,

      // Policies
      alcohol: pd.alcohol,
      smoking: pd.smoking,
      loud_music: pd.loud_music,
      nudity: pd.nudity,
      third_party_vendors: pd.third_party_vendors,
      security_camera: pd.security_camera,
      guestRequirement: pd.guestRequirement,
      cancellation_policy: pd.cancellation_policy,
      additional_notes: pd.additional_notes,
      other_perks: pd.other_perks,

      // Pricing
      priceVariationsEnabled: draft.pricing.variations.length > 0,
      priceVariants: draft.pricing.variations.map((v) => ({
        name: v.name,
        pricePerHour: v.pricePerHour,
      })),
      isInstantBooking: draft.pricing.instantBooking,
      deposit: draft.pricing.deposit,
      amenities: draft.pricing.upgrades.map((u) => ({
        amenity: u.amenity,
        price: u.price,
        description: u.description,
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
  authorId: string,
): Promise<{ success: boolean; listingId?: string; error?: string }> {
  const payload = mapDraftToSharetribe(draft, authorId);

  const res = await fetch("/api/sharetribe/create-listing", {
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

  return {
    success: true,
    listingId: data.data?.id?.uuid,
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

  const res = await fetch("/api/sharetribe/update-listing", {
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
