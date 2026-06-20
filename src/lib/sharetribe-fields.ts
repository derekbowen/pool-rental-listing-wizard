// ============================================================
// AUTHORITATIVE Sharetribe listing-field vocabulary.
// Grounded 2026-06-20 from the PRODUCTION hosted config asset
// (cdn.st-api.com/.../listings/listing-fields.json + listing-categories.json)
// and verified against live listings. These are the EXACT option codes the
// marketplace search index + listing page + booking flow expect.
//
// Each option is { code, label }: `code` is what we write to publicData
// (what search filters on); `label` is what the host sees in the wizard.
// DO NOT "tidy" the codes — typos like `celbrai`/`coldplundge` are the real
// production codes; changing them breaks search.
// ============================================================

export interface FieldOption {
  code: string;
  label: string;
}

// categoryLevel1
export const CATEGORY_L1: FieldOption[] = [
  { code: "pool", label: "Pool" },
  { code: "backyards", label: "Backyards" },
];

// categoryLevel2, keyed by categoryLevel1 code
export const CATEGORY_L2: Record<string, FieldOption[]> = {
  pool: [
    { code: "privatepool", label: "Private Pool" },
    { code: "indoorpools", label: "Indoor Pool" },
    { code: "heatedpools", label: "Heated Pool" },
    { code: "hottubs", label: "Hot Tub" },
    { code: "coldplundge", label: "Cold Plunge Pool" },
    { code: "public", label: "Public Pool" },
    { code: "familyfriendly", label: "Family Friendly" },
    { code: "dogfriendly", label: "Dog Friendly" },
    { code: "nightswimming", label: "Night Swimming" },
    { code: "swimlessons", label: "Pool for Swim Lessons" },
  ],
  backyards: [],
};

// space (multi-enum) — "What's it good for?" ACTIVITIES, not physical features.
export const SPACE_ACTIVITIES: FieldOption[] = [
  { code: "parties", label: "Parties" },
  { code: "hangouts", label: "Friend hangouts" },
  { code: "gathers", label: "Family gatherings" },
  { code: "photo-video-shoots", label: "Photo & video shoots" },
  { code: "celbrai", label: "Celebrations" },
  { code: "corporate", label: "Corporate events" },
  { code: "birthdayparties", label: "Birthday parties" },
  { code: "childbday", label: "Kids' birthday parties" },
  { code: "adultparties", label: "Adult birthday parties" },
  { code: "quiet", label: "Peace & quiet" },
  { code: "Weddings", label: "Weddings & receptions" },
  { code: "teambuild", label: "Team building" },
  { code: "fitness", label: "Fitness classes" },
  { code: "swimlesson", label: "Swim lessons" },
  { code: "bbqcookout", label: "Barbecues & cookouts" },
  { code: "bbq", label: "Bachelor/bachelorette parties" },
  { code: "babys", label: "Baby showers" },
  { code: "fundraiser", label: "Fundraisers & charity" },
  { code: "events", label: "Community events" },
];

// poolAmenities (multi-enum) — physical amenities. Search filter "Amenities".
export const POOL_AMENITIES: FieldOption[] = [
  { code: "heated", label: "Heated" },
  { code: "hot_tub", label: "Hot tub" },
  { code: "deep_end", label: "Deep end (5ft+)" },
  { code: "slide", label: "Slide" },
  { code: "diving_board", label: "Diving board" },
  { code: "bbq", label: "BBQ / grill" },
  { code: "covered_seating", label: "Covered seating" },
  { code: "sound_system", label: "Sound system" },
  { code: "restroom", label: "Restroom access" },
  { code: "changing_area", label: "Changing area" },
  { code: "wifi", label: "Wi-Fi" },
  { code: "parking", label: "On-site parking" },
  { code: "evening_lights", label: "Evening lights" },
  { code: "fenced", label: "Fenced / private" },
  { code: "pet_friendly", label: "Pet-friendly" },
  { code: "ada", label: "ADA-accessible" },
  { code: "saltwater", label: "Saltwater" },
  { code: "indoor", label: "Indoor pool" },
  { code: "cameras", label: "Surveillance cameras" },
];

// water_type (enum)
export const WATER_TYPE_OPTIONS: FieldOption[] = [
  { code: "chlorine", label: "Chlorine" },
  { code: "saltwater", label: "Saltwater" },
  { code: "mineral", label: "Mineral" },
  { code: "magnesium", label: "Magnesium" },
  { code: "other", label: "Other" },
];

// checkingin (enum)
export const CHECKIN_OPTIONS: FieldOption[] = [
  { code: "self", label: "Self check-in" },
  { code: "checkn2", label: "Check in with host" },
];

// parking_size (enum)
export const PARKING_SIZE_OPTIONS: FieldOption[] = [
  { code: "no-parking-space", label: "No parking available" },
  { code: "small", label: "1 car" },
  { code: "medium", label: "2 cars" },
  { code: "large", label: "3 cars" },
  { code: "4", label: "4 cars" },
  { code: "5", label: "5 cars" },
  { code: "6", label: "6 cars" },
  { code: "7", label: "7 cars" },
  { code: "8", label: "8 cars" },
  { code: "9", label: "9 cars" },
  { code: "10", label: "10+ cars" },
  { code: "rob", label: "RV or bus space" },
  { code: "Truck-and-Trailer-Parking", label: "Truck & trailer parking" },
];

// accessibility (multi-enum)
export const ACCESSIBILITY_OPTIONS: FieldOption[] = [
  { code: "wheelchair", label: "Wheelchair-accessible" },
  { code: "animals", label: "Service animals welcome" },
  { code: "audio", label: "Audio assistance" },
  { code: "visual", label: "Visual accessibility" },
  { code: "sensory", label: "Sensory-friendly" },
  { code: "dietary", label: "Dietary accommodations" },
  { code: "personal-assistance", label: "Personal assistance" },
  { code: "transportation", label: "Transportation" },
  { code: "other", label: "Other" },
];

// houseRules (multi-enum)
export const HOUSE_RULES_OPTIONS: FieldOption[] = [
  { code: "no_glass", label: "No glass containers" },
  { code: "no_alcohol", label: "No alcohol" },
  { code: "no_smoking", label: "No smoking" },
  { code: "no_djs", label: "No outside DJs" },
  { code: "music_curfew", label: "Music ends by 10pm" },
  { code: "no_nudity", label: "No nudity" },
  { code: "no_pets", label: "No pets" },
  { code: "supervised_minors", label: "Adult supervision for minors" },
  { code: "no_night_swim", label: "No after-dark swimming" },
  { code: "host_present", label: "Host present" },
  { code: "cameras_disclosed", label: "Surveillance cameras on premises" },
  { code: "vendors_approved", label: "Pre-approved vendors only" },
];

// ---- helpers ----
const codeSet = (opts: FieldOption[]) => new Set(opts.map((o) => o.code));
const labelMap = (opts: FieldOption[]) => {
  const m = new Map<string, string>();
  for (const o of opts) m.set(o.label.toLowerCase(), o.code);
  return m;
};

/** Normalize a single value to a valid code: pass codes through, map labels → codes, else drop (""). */
export function toCode(opts: FieldOption[], value: string | undefined | null): string {
  if (!value) return "";
  const v = String(value).trim();
  if (codeSet(opts).has(v)) return v;
  const byLabel = labelMap(opts).get(v.toLowerCase());
  return byLabel ?? "";
}

/** Normalize an array of values to valid codes (drops anything unrecognized). */
export function toCodes(opts: FieldOption[], values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const out: string[] = [];
  for (const v of values) {
    const c = toCode(opts, String(v));
    if (c && !out.includes(c)) out.push(c);
  }
  return out;
}

export const labelFor = (opts: FieldOption[], code: string): string =>
  opts.find((o) => o.code === code)?.label ?? code;
