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

export interface DateOverride {
  pricePerHour?: number; // cents — custom price for this date
  blocked?: boolean;
  blockedHours?: string[]; // e.g. ["09:00","09:30","10:00"] blocked time slots
  note?: string;
}

export interface ListingDraft {
  // Step 1
  listingType: ListingTypeId;
  category: string;       // categoryLevel1 code (e.g. "pool")
  subcategory: string;    // categoryLevel2 code (single, e.g. "privatepool")
  title: string;

  // Step 2
  images: { id: string; file: File; preview: string }[];
  videoUrl: string;
  importedPhotos: { url: string; selected: boolean }[];
  photoRightsConfirmed: boolean;

  // Step 3 — all values are PRODUCTION CODES (see sharetribe-fields.ts)
  description: string;
  publicData: {
    space: string[];          // activity codes (what it's good for)
    poolAmenities: string[];  // amenity codes
    water_type: string;       // code
    checkingin: string;       // code
    parking_size: string;     // code
    accessibility: string[];  // codes
    houseRules: string[];     // codes
    guestallowed: number;
    squarefootage: number;
    transportation: string;       // free text
    cancellation_policy: string;  // free text
    poolcleanring: string;        // free text (real prod key, typo preserved)
    additional_notes: string;     // free text
  };
  location: {
    address: string;
    building: string;
    city: string;
    state: string;
    zip: string;
    lat: number | null;
    lng: number | null;
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
    dateOverrides: Record<string, DateOverride>; // keyed by ISO date
    minHours: number;
    maxHours: number;
    bufferMinutes: number;
    advanceNoticeDays: number;
  };
}

export const DEFAULT_DRAFT: ListingDraft = {
  listingType: "hourly-pool",
  category: "pool",
  subcategory: "",
  title: "",
  images: [],
  videoUrl: "",
  importedPhotos: [],
  photoRightsConfirmed: false,
  description: "",
  publicData: {
    space: [],
    poolAmenities: [],
    water_type: "",
    checkingin: "",
    parking_size: "",
    accessibility: [],
    houseRules: [],
    guestallowed: 10,
    squarefootage: 500,
    transportation: "",
    cancellation_policy: "",
    poolcleanring: "",
    additional_notes: "",
  },
  location: { address: "", building: "", city: "", state: "", zip: "", lat: null, lng: null },
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
    dateOverrides: {},
    minHours: 2,
    maxHours: 8,
    bufferMinutes: 30,
    advanceNoticeDays: 1,
  },
};
