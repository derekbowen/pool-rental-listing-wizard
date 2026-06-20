// ============================================================
// Freelance Service listing template (default-purchase vertical)
// ------------------------------------------------------------
// NET-NEW + ADDITIVE. This module does NOT touch the existing
// pool/space flow (constants.ts / types.ts / ai.ts / sharetribe.ts).
// It defines a "Freelance Service" listing: the type, the field
// schema, the AI generator, and the Sharetribe write mapping for
// pool-side service providers (swim instructors, lifeguards, pool
// cleaners, photographers, party planners, etc.).
//
// SYNC NOTE (see src/config/README.md in the marketplace app): a
// listing created from this template only goes LIVE once the Console
// has a matching `freelance-service` listing type wired to the
// default-purchase process. The wizard is one half; the Console is
// the other. Build/test against the TEST Sharetribe env first.
// ============================================================

export const SERVICE_LISTING_TYPE = {
  id: "freelance-service" as const,
  label: "Freelance Service",
  description: "Offer a pool-side service",
  icon: "Briefcase", // lucide
  // Contract with the marketplace env + Console (keep in sync):
  transactionProcessAlias: "default-purchase/release-1",
  unitType: "item",
} as const;

export type ServiceListingTypeId = typeof SERVICE_LISTING_TYPE.id;

// Service categories map to publicData.categoryLevel1 (NOT pool categories).
export const SERVICE_CATEGORIES = [
  { id: "swim_instruction", label: "Swim Instruction", icon: "Waves" },
  { id: "lifeguarding", label: "Lifeguarding", icon: "ShieldCheck" },
  { id: "pool_cleaning", label: "Pool Cleaning & Maintenance", icon: "Droplets" },
  { id: "photography", label: "Photography & Video", icon: "Camera" },
  { id: "event_planning", label: "Party & Event Planning", icon: "PartyPopper" },
  { id: "catering_bartending", label: "Catering & Bartending", icon: "Wine" },
  { id: "other", label: "Other Service", icon: "Sparkles" },
] as const;

export type ServiceCategoryId = (typeof SERVICE_CATEGORIES)[number]["id"];

// How the provider charges. Maps to publicData.rateUnit (display only —
// Sharetribe pricing unit stays `item`; one "item" = one booked session/job).
export const RATE_UNITS = [
  { id: "per_hour", label: "Per hour" },
  { id: "per_session", label: "Per session" },
  { id: "per_job", label: "Per job (flat)" },
] as const;

export type RateUnitId = (typeof RATE_UNITS)[number]["id"];

// Trust signals shown as multi-select chips (AI pre-fills from the provider's text).
export const SERVICE_QUALIFICATIONS = [
  "CPR / First Aid certified",
  "Lifeguard certified (Red Cross / Ellis)",
  "Licensed",
  "Insured",
  "Background-checked",
  "References available",
  "10+ years experience",
] as const;

export const SERVICE_LANGUAGES = ["English", "Spanish", "Mandarin", "Vietnamese", "Tagalog", "Other"] as const;

export interface ServicePublicData {
  listingType: ServiceListingTypeId;
  categoryLevel1: ServiceCategoryId | string;
  serviceArea: string; // free text: cities / radius the provider covers
  rateUnit: RateUnitId | string;
  yearsExperience: number;
  qualifications: string[];
  languages: string[];
  whatIncluded: string;
  cancellation_policy: string;
}

export interface ServiceDraft {
  listingType: ServiceListingTypeId;
  category: ServiceCategoryId | string;
  title: string;
  description: string;
  images: { id: string; file: File; preview: string }[]; // work samples / credentials (optional)
  rateCents: number; // base price (the rate, in cents)
  stock: number; // default-purchase requires stock; treated as # of bookable slots
  publicData: ServicePublicData;
  location: { city: string; state: string; lat: number | null; lng: number | null };
}

export const DEFAULT_SERVICE_DRAFT: ServiceDraft = {
  listingType: "freelance-service",
  category: "",
  title: "",
  description: "",
  images: [],
  rateCents: 5000, // $50
  stock: 100, // bookable slots; tune per provider availability
  publicData: {
    listingType: "freelance-service",
    categoryLevel1: "",
    serviceArea: "",
    rateUnit: "per_hour",
    yearsExperience: 0,
    qualifications: [],
    languages: ["English"],
    whatIncluded: "",
    cancellation_policy: "",
  },
  location: { city: "", state: "", lat: null, lng: null },
};

// ------------------------------------------------------------
// AI generator for freelance-service listings.
// Mirrors src/lib/ai.ts conventions (OpenRouter, claude-sonnet-4-6,
// JSON-object output). Services are mostly TEXT-described by the
// provider; photos (credentials / work samples) are optional.
// ------------------------------------------------------------
export interface AIServiceResult {
  description: string;
  categoryLevel1: ServiceCategoryId;
  serviceArea: string;
  rateUnit: RateUnitId;
  suggestedRateCents: number;
  yearsExperience: number;
  qualifications: string[];
  languages: string[];
  whatIncluded: string;
}

const SERVICE_SYSTEM_PROMPT = `You are an AI assistant for Pool Rental Near Me (poolrentalnearme.com), helping a pool-side FREELANCE SERVICE provider write their listing. The provider sells a service (swim instruction, lifeguarding, pool cleaning, photography, party/event planning, catering/bartending, etc.), not a physical product and not a pool.

From the provider's description (and any optional photos of their work or credentials), return a JSON object. Only use values from the allowed options. If something is unclear, use a sensible default and never invent certifications.

Allowed values:
- categoryLevel1: ${JSON.stringify(SERVICE_CATEGORIES.map((c) => c.id))}
- rateUnit: ${JSON.stringify(RATE_UNITS.map((r) => r.id))}
- qualifications: ${JSON.stringify(SERVICE_QUALIFICATIONS)}
- languages: ${JSON.stringify(SERVICE_LANGUAGES)}

Return ONLY a valid JSON object matching this schema:
{
  "description": "2-3 paragraph listing description, warm and trustworthy, written in first person",
  "categoryLevel1": "one of the allowed category ids",
  "serviceArea": "cities or radius the provider covers, e.g. 'Phoenix + 25 miles'",
  "rateUnit": "one of the allowed rate units",
  "suggestedRateCents": 5000,
  "yearsExperience": 5,
  "qualifications": ["only those clearly stated or shown — do NOT fabricate certifications"],
  "languages": ["from the allowed list"],
  "whatIncluded": "one or two sentences on what a booking includes"
}`;

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function analyzeServiceListing(input: {
  text: string;
  title?: string;
  category?: string;
  images?: { file: File }[];
}): Promise<AIServiceResult> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("VITE_OPENROUTER_API_KEY not set");

  const imageContents = await Promise.all(
    (input.images ?? []).slice(0, 5).map(async (img) => ({
      type: "image_url" as const,
      image_url: { url: await fileToDataUrl(img.file) },
    })),
  );

  const userContent = [
    ...imageContents,
    {
      type: "text" as const,
      text: `Provider's service: "${input.title || "freelance pool service"}"${
        input.category ? ` (category hint: ${input.category})` : ""
      }.\n\nWhat they wrote about their service:\n"""${input.text}"""\n\nReturn the JSON object from the system prompt. Do not fabricate certifications or experience that isn't stated.`,
    },
  ];

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://poolrentalnearme.com",
      "X-Title": "PRNM Listing Wizard",
    },
    body: JSON.stringify({
      model: "anthropic/claude-sonnet-4-6",
      messages: [
        { role: "system", content: SERVICE_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      max_tokens: 1500,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter API error: ${res.status} — ${err}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI did not return valid JSON");
  return JSON.parse(jsonMatch[0]) as AIServiceResult;
}

// ------------------------------------------------------------
// Sharetribe write mapping for a freelance-service listing.
// Mirrors mapDraftToSharetribe() in src/lib/sharetribe.ts (same
// /api/sharetribe/create-listing payload shape) but writes the
// default-purchase contract (listingType + transactionProcessAlias
// + unitType) and SERVICE publicData — never pool fields.
// ------------------------------------------------------------
export function mapServiceToSharetribe(draft: ServiceDraft, authorId: string) {
  const pd = draft.publicData;
  return {
    authorId,
    title: draft.title,
    description: draft.description,
    price: { amount: draft.rateCents, currency: "USD" },
    // default-purchase listings carry stock; the create endpoint should set
    // currentStock from this (mirrors Sharetribe's stockUpdate on create).
    stock: draft.stock,
    publicData: {
      // default-purchase contract — must match the Console listing type + env process.
      listingType: SERVICE_LISTING_TYPE.id,
      transactionProcessAlias: SERVICE_LISTING_TYPE.transactionProcessAlias,
      unitType: SERVICE_LISTING_TYPE.unitType,
      categoryLevel1: draft.category,

      // Service fields.
      serviceArea: pd.serviceArea,
      rateUnit: pd.rateUnit,
      yearsExperience: pd.yearsExperience,
      qualifications: pd.qualifications,
      languages: pd.languages,
      whatIncluded: pd.whatIncluded,
      cancellation_policy: pd.cancellation_policy,

      // Location (for proximity search).
      location: draft.location,
    },
  };
}
