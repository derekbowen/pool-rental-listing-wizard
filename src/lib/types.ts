import type { ListingTypeId } from "./constants";

export interface PriceVariation {
  id: string;
  name: string;
  pricePerHour: number; // cents
}

export interface Upgrade {
  id: string;
  amenity: string;
  price: number; // cents
  description: string;
  icon?: string; // lucide icon name for custom upgrades
}

export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export interface DaySchedule {
  enabled: boolean;
  startTime: string; // "09:00"
  endTime: string;   // "21:00"
}

export interface PricingTier {
  id: string;
  label: string;
  minGuests: number;
  maxGuests: number | null; // null = unlimited
  pricePerHour: number; // cents
}

export interface DurationDiscount {
  id: string;
  minHours: number;
  discountPercent: number;
}

export interface ListingDraft {
  // Step 1
  listingType: ListingTypeId;
  category: string;
  subcategory: string[];
  title: string;

  // Step 2
  images: { id: string; file: File; preview: string }[];
  videoUrl: string;

  // Step 3
  description: string;
  publicData: {
    space: string[];
    safety: string[];
    outdoor_kitchen: string[];
    pool_depth: string;
    water_type: string;
    guestallowed: number;
    squarefootage: number;
    checkingin: string;
    privatespace: string;
    parking_size: string;
    restroompool: string[];
    shower: string;
    shower_room: string;
    wifi: string;
    disabilities: string;
    alcohol: string;
    smoking: string;
    loud_music: string;
    nudity: string;
    third_party_vendors: string;
    security_camera: string;
    guestRequirement: string;
    cancellation_policy: string;
    additional_notes: string;
    other_perks: string;
    poolcleanring: string;
    rooms: number;
    accessibility: string[];
    what_to_bring: string;
  };
  location: {
    address: string;
    building: string;
  };

  // Step 4
  pricing: {
    basePrice: number; // cents
    variations: PriceVariation[];
    deposit: number | null; // cents
    instantBooking: boolean;
    upgrades: Upgrade[];
    tiers: PricingTier[];
    durationDiscounts: DurationDiscount[];
  };

  // Step 5
  availability: {
    schedule: Record<DayOfWeek, DaySchedule>;
    blockedDates: string[]; // ISO date strings "2026-03-15"
    minHours: number;
    maxHours: number;
    bufferMinutes: number;
    advanceNoticeDays: number;
  };
}

export const DEFAULT_DRAFT: ListingDraft = {
  listingType: "hourly-pool",
  category: "",
  subcategory: [],
  title: "",
  images: [],
  videoUrl: "",
  description: "",
  publicData: {
    space: [],
    safety: [],
    outdoor_kitchen: [],
    pool_depth: "",
    water_type: "",
    guestallowed: 10,
    squarefootage: 500,
    checkingin: "",
    privatespace: "",
    parking_size: "",
    restroompool: [],
    shower: "",
    shower_room: "",
    wifi: "",
    disabilities: "",
    alcohol: "BYOB only",
    smoking: "Not allowed",
    loud_music: "Quiet hours after 9pm",
    nudity: "Swimwear required",
    third_party_vendors: "Pre-approval required",
    security_camera: "None",
    guestRequirement: "",
    cancellation_policy: "",
    additional_notes: "",
    other_perks: "",
    poolcleanring: "",
    rooms: 0,
    accessibility: [],
    what_to_bring: "",
  },
  location: { address: "", building: "" },
  pricing: {
    basePrice: 4500, // $45.00
    variations: [],
    deposit: null,
    instantBooking: false,
    upgrades: [],
    tiers: [],
    durationDiscounts: [],
  },
  availability: {
    schedule: {
      monday: { enabled: true, startTime: "09:00", endTime: "21:00" },
      tuesday: { enabled: true, startTime: "09:00", endTime: "21:00" },
      wednesday: { enabled: true, startTime: "09:00", endTime: "21:00" },
      thursday: { enabled: true, startTime: "09:00", endTime: "21:00" },
      friday: { enabled: true, startTime: "09:00", endTime: "21:00" },
      saturday: { enabled: true, startTime: "09:00", endTime: "21:00" },
      sunday: { enabled: true, startTime: "09:00", endTime: "21:00" },
    },
    blockedDates: [],
    minHours: 2,
    maxHours: 8,
    bufferMinutes: 30,
    advanceNoticeDays: 1,
  },
};
