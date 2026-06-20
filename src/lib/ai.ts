import {
  CATEGORY_L2,
  SPACE_ACTIVITIES,
  POOL_AMENITIES,
  WATER_TYPE_OPTIONS,
  CHECKIN_OPTIONS,
  PARKING_SIZE_OPTIONS,
  ACCESSIBILITY_OPTIONS,
  HOUSE_RULES_OPTIONS,
  type FieldOption,
} from "./sharetribe-fields";

// AI returns PRODUCTION CODES (see sharetribe-fields.ts), not display labels.
export interface AIListingResult {
  description: string;
  categoryLevel2: string;     // code from CATEGORY_L2[category]
  space: string[];            // activity codes
  poolAmenities: string[];    // amenity codes
  water_type: string;         // code
  checkingin: string;         // code
  parking_size: string;       // code
  accessibility: string[];    // codes
  houseRules: string[];       // codes
  guestallowed: number;
  squarefootage: number;
}

// Render an option list as "code = Label" lines so the model returns CODES.
const optLines = (opts: FieldOption[]) =>
  opts.map((o) => `    ${o.code} = ${o.label}`).join("\n");

function buildSystemPrompt(categoryL1: string): string {
  const subcats = CATEGORY_L2[categoryL1] || CATEGORY_L2.pool;
  return `You are an AI assistant for Pool Rental Near Me (poolrentalnearme.com), a marketplace for hourly pool & backyard rentals. Analyze the provided photos and return a JSON object describing the listing.

CRITICAL: For every coded field, return ONLY the exact CODE (left of the "=") from the allowed lists below — never the human label, never your own words. Use [] for multi-select fields when nothing applies. Pick what the photos actually show.

categoryLevel2 (pick ONE code):
${optLines(subcats)}

space — what the place is good for (multi-select, pick all that fit):
${optLines(SPACE_ACTIVITIES)}

poolAmenities — physical amenities visible (multi-select):
${optLines(POOL_AMENITIES)}

water_type (pick ONE):
${optLines(WATER_TYPE_OPTIONS)}

checkingin (pick ONE):
${optLines(CHECKIN_OPTIONS)}

parking_size (pick ONE):
${optLines(PARKING_SIZE_OPTIONS)}

accessibility (multi-select, only if clearly supported):
${optLines(ACCESSIBILITY_OPTIONS)}

houseRules (multi-select — sensible defaults for a pool rental are fine):
${optLines(HOUSE_RULES_OPTIONS)}

Return ONLY a valid JSON object with this exact schema (codes only):
{
  "description": "3-paragraph listing description (warm, inviting, specific to the photos)",
  "categoryLevel2": "one code",
  "space": ["activity codes"],
  "poolAmenities": ["amenity codes"],
  "water_type": "one code",
  "checkingin": "one code",
  "parking_size": "one code",
  "accessibility": ["codes"],
  "houseRules": ["codes"],
  "guestallowed": 15,
  "squarefootage": 800
}`;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function analyzeListingPhotos(
  images: { file: File }[],
  title: string,
  category: string,
): Promise<AIListingResult> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("VITE_OPENROUTER_API_KEY not set");

  const photosToSend = images.slice(0, 5);
  const imageContents = await Promise.all(
    photosToSend.map(async (img) => {
      const dataUrl = await fileToDataUrl(img.file);
      return {
        type: "image_url" as const,
        image_url: { url: dataUrl },
      };
    }),
  );

  const userContent = [
    ...imageContents,
    {
      type: "text" as const,
      text: `Analyze these ${photosToSend.length} photos of a "${title || "pool rental"}" listing (category: ${category || "pool"}). Return the JSON object described in the system prompt, using ONLY the allowed codes.`,
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
        { role: "system", content: buildSystemPrompt(category || "pool") },
        { role: "user", content: userContent },
      ],
      max_tokens: 2000,
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

  return JSON.parse(jsonMatch[0]) as AIListingResult;
}
