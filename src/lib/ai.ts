import {
  SPACE_FEATURES,
  SAFETY_FEATURES,
  OUTDOOR_KITCHEN_OPTIONS,
  POOL_DEPTHS,
  WATER_TYPES,
  CHECKIN_STYLES,
  SPACE_TYPES,
  PARKING_OPTIONS,
  RESTROOM_OPTIONS,
  POLICIES,
} from "./constants";

export interface AIListingResult {
  description: string;
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
}

const SYSTEM_PROMPT = `You are an AI assistant for Pool Rental Near Me (poolrentalnearme.com), a marketplace for hourly pool and backyard rentals. Analyze the provided photos of a listing and return a JSON object with the following fields. Be specific and accurate based on what you see.

IMPORTANT: Only use values from the allowed options listed below. If you can't determine something from the photos, use a sensible default.

Allowed values:
- space: ${JSON.stringify(SPACE_FEATURES)}
- safety: ${JSON.stringify(SAFETY_FEATURES)}
- outdoor_kitchen: ${JSON.stringify(OUTDOOR_KITCHEN_OPTIONS)}
- pool_depth: ${JSON.stringify(POOL_DEPTHS)}
- water_type: ${JSON.stringify(WATER_TYPES)}
- checkingin: ${JSON.stringify(CHECKIN_STYLES)}
- privatespace: ${JSON.stringify(SPACE_TYPES)}
- parking_size: ${JSON.stringify(PARKING_OPTIONS)}
- restroompool: ${JSON.stringify(RESTROOM_OPTIONS)}
- shower / shower_room / wifi / disabilities: "Yes" or "No"
- alcohol: ${JSON.stringify(POLICIES.find((p) => p.id === "alcohol")!.options)}
- smoking: ${JSON.stringify(POLICIES.find((p) => p.id === "smoking")!.options)}
- loud_music: ${JSON.stringify(POLICIES.find((p) => p.id === "loud_music")!.options)}
- nudity: ${JSON.stringify(POLICIES.find((p) => p.id === "nudity")!.options)}
- third_party_vendors: ${JSON.stringify(POLICIES.find((p) => p.id === "third_party_vendors")!.options)}
- security_camera: ${JSON.stringify(POLICIES.find((p) => p.id === "security_camera")!.options)}

Return ONLY a valid JSON object matching this schema:
{
  "description": "3-paragraph listing description (warm, inviting, specific to photos)",
  "space": ["array of detected space features"],
  "safety": ["array of detected safety features"],
  "outdoor_kitchen": ["array of detected kitchen/bar features"],
  "pool_depth": "estimated depth",
  "water_type": "detected water type",
  "guestallowed": 15,
  "squarefootage": 800,
  "checkingin": "check-in style",
  "privatespace": "privacy level",
  "parking_size": "parking option",
  "restroompool": ["restroom options"],
  "shower": "Yes or No",
  "shower_room": "Yes or No",
  "wifi": "Yes or No",
  "disabilities": "Yes or No",
  "alcohol": "policy",
  "smoking": "policy",
  "loud_music": "policy",
  "nudity": "policy",
  "third_party_vendors": "policy",
  "security_camera": "policy"
}`;

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
      text: `Analyze these ${photosToSend.length} photos of a "${title || "pool rental"}" listing (category: ${category || "pool"}). Return the JSON object described in the system prompt. Be specific about what you actually see in the photos.`,
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
        { role: "system", content: SYSTEM_PROMPT },
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
