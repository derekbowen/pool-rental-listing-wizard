// ============================================================
// Mock AI analysis results — replace with real API call
// ============================================================

// Fallback when AI is unavailable — uses PRODUCTION CODES (see sharetribe-fields.ts).
export const MOCK_AI_RESULTS = {
  description:
    "Welcome to a stunning private backyard oasis featuring a sparkling heated pool surrounded by lush tropical landscaping. This beautifully maintained space offers the perfect setting for relaxation, family fun, or memorable gatherings with friends.\n\nThe pool area includes comfortable lounge seating, ambient night lighting for evening swims, and a fully equipped outdoor grill station. With a shallow end perfect for kids and a deep end for diving, there's something for everyone.\n\nYour privacy is our priority — this is a fully fenced, gated property with no shared access. Towels, pool floats, and a Bluetooth speaker are provided for your enjoyment.",
  categoryLevel2: "privatepool",
  space: ["parties", "hangouts", "gathers", "birthdayparties", "bbqcookout"],
  poolAmenities: ["heated", "evening_lights", "deep_end", "sound_system", "fenced", "bbq", "parking"],
  water_type: "chlorine",
  checkingin: "self",
  parking_size: "medium",
  accessibility: [],
  houseRules: ["no_glass", "music_curfew", "supervised_minors"],
  guestallowed: 15,
  squarefootage: 800,
};

// Simulated loading steps for the AI analysis animation
export const AI_LOADING_STEPS = [
  "Analyzing pool features...",
  "Detecting amenities...",
  "Estimating pool dimensions...",
  "Identifying safety features...",
  "Writing your description...",
  "Done!",
];
