// ============================================================
// Pool Rental Near Me — Listing Wizard Constants
// All IDs map directly to Sharetribe listing field system
// ============================================================

export const LISTING_TYPES = [
  {
    id: "hourly-pool" as const,
    label: "Hourly Rental",
    description: "Guests book by the hour",
    icon: "Waves",
  },
  {
    id: "rentms" as const,
    label: "Shared Space",
    description: "Multiple groups at once",
    icon: "Users",
  },
  {
    id: "rentalslots" as const,
    label: "Set Time Slots",
    description: "You pick the windows",
    icon: "CalendarDays",
  },
] as const;

export type ListingTypeId = (typeof LISTING_TYPES)[number]["id"];

export const CATEGORIES = [
  { id: "pool", label: "Private Pool", icon: "Waves" },
  { id: "eventvenus", label: "Event Venue", icon: "PartyPopper" },
  { id: "backyards", label: "Backyard", icon: "Home" },
  { id: "privatehomes", label: "Private Home", icon: "Building" },
  { id: "sportciourt", label: "Sports Court", icon: "Trophy" },
  { id: "experiences", label: "Experience", icon: "Sparkles" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const SUBCATEGORIES: Record<string, string[]> = {
  pool: [
    "Private Pool",
    "Indoor Pools",
    "Heated Pools",
    "Hot Tubs",
    "Cold Plunge Pools",
    "Public Pool",
    "Family Friendly Pools",
    "Dog Friendly",
    "Night Swimming Pools",
    "Pool for Swim Lessons",
  ],
  eventvenus: [
    "Anniversary Parties",
    "Baby Showers",
    "Bachelorette Parties",
    "Bar/Bat Mitzvahs",
    "Corporate Parties",
    "Graduation Parties",
    "Photoshoots",
    "Video Shoots",
  ],
  sportciourt: [
    "Pickleball Courts",
    "Tennis Courts",
    "Basketball Courts",
    "Golf Course",
  ],
  experiences: [
    "Food & Drink",
    "Adventure",
    "Art & Culture",
    "Nature & Wildlife",
    "Music & Entertainment",
    "Wellness",
    "Sports",
    "Unique Experiences",
    "Everything Else",
  ],
  backyards: [],
  privatehomes: [],
};

// Step 3 — Feature chips (multi-select, AI pre-fills these)
export const SPACE_FEATURES = [
  "Heated Pool",
  "Diving Board",
  "Night Lighting",
  "Waterfall",
  "Kiddie Area",
  "Water Slide",
  "Gazebo",
  "Outdoor Firepit",
  "Shallow Area",
  "Fire Pit",
  "Trampoline",
  "Bluetooth Speaker",
  "Tiki Hut",
  "Private Beach",
];

export const SAFETY_FEATURES = [
  "Lifeguard Chairs",
  "Life Vests & Flotation Devices",
  "First Aid Kit",
  "CPR Instructions",
  "Non-Slip Surfaces",
  "Security Cameras",
  "Supervision Policy",
  "Pool Depth Markers",
  "Emergency Contact Info",
];

export const OUTDOOR_KITCHEN_OPTIONS = [
  "No Outdoor Kitchen or Bar",
  "Fully Equipped Outdoor Kitchen",
  "Outdoor Bar Area",
  "Outdoor Built-In Grill/BBQ",
  "Outdoor Refrigerator for Drinks & Snacks",
  "Beverage/Keg Station for Hosting",
  "Pizza Oven for Entertaining",
  "Outdoor BBQ/Hibachi or Charcoal",
  "Poolside/Patio Lounge w/Bar",
  "Outdoor Ice Maker",
  "Bar/Picnic or Lounge Seating",
  "Outdoor Dining Table",
];

// Step 3 — Quick select options
export const POOL_DEPTHS = ["3ft", "4ft", "5ft", "6ft", "7ft", "8ft", "9ft", "10ft+"];
export const WATER_TYPES = ["Chlorine", "Saltwater", "Natural/Freshwater", "Other"];
export const CHECKIN_STYLES = ["Self check-in", "Host greets you"];
export const SPACE_TYPES = ["Fully private", "Semi-private", "Shared"];
export const PARKING_OPTIONS = ["Street parking", "Driveway (1-3 cars)", "Large lot (4+)"];
export const RESTROOM_OPTIONS = [
  "Guest bathroom with shower",
  "Guest bathroom without shower",
  "Outdoor restroom only",
  "No restroom available",
];
export const YES_NO = ["Yes", "No"];
export const ADA_OPTIONS = ["Yes", "Partial", "No"];

// Step 3 — Policies
export const POLICIES = [
  {
    id: "alcohol",
    label: "Alcohol",
    icon: "Wine",
    options: ["Allowed", "BYOB only", "No glass", "Not allowed"],
    default: "BYOB only",
  },
  {
    id: "smoking",
    label: "Smoking",
    icon: "Cigarette",
    options: ["Allowed in designated area", "Vaping only", "Not allowed"],
    default: "Not allowed",
  },
  {
    id: "loud_music",
    label: "Music",
    icon: "Music",
    options: ["Allowed", "Quiet hours after 9pm", "Bluetooth speaker available", "No loud music"],
    default: "Quiet hours after 9pm",
  },
  {
    id: "nudity",
    label: "Nudity",
    icon: "ShieldAlert",
    options: ["Clothing optional", "Swimwear required"],
    default: "Swimwear required",
  },
  {
    id: "third_party_vendors",
    label: "Outside Vendors",
    icon: "Truck",
    options: ["Allowed", "Pre-approval required", "Not allowed"],
    default: "Pre-approval required",
  },
  {
    id: "security_camera",
    label: "Security Cameras",
    icon: "Camera",
    options: ["Yes — exterior only", "Yes — pool area", "None"],
    default: "None",
  },
] as const;

// Step 4 — Price variation templates
export const VARIATION_TEMPLATES = [
  { id: "weekend", label: "Weekend Premium", example: "Sat-Sun at higher rate", icon: "Sun" },
  { id: "evening", label: "Evening Rate", example: "After 6pm pricing", icon: "Moon" },
  { id: "party", label: "Party Rate", example: "10+ guests pricing", icon: "PartyPopper" },
  { id: "custom", label: "Custom", example: "Name your own", icon: "Pencil" },
];

// Step 4 — Upgrade suggestions (30 options)
export const UPGRADE_SUGGESTIONS = [
  { name: "Heated Pool", suggestedPrice: 1500, icon: "Flame" },
  { name: "BBQ/Grill Access", suggestedPrice: 1000, icon: "UtensilsCrossed" },
  { name: "Bluetooth Speaker", suggestedPrice: 500, icon: "Music" },
  { name: "Pool Floats & Toys", suggestedPrice: 500, icon: "LifeBuoy" },
  { name: "Pizza Oven", suggestedPrice: 2000, icon: "Pizza" },
  { name: "Hot Tub Access", suggestedPrice: 2000, icon: "Droplets" },
  { name: "Sports Equipment", suggestedPrice: 500, icon: "Dumbbell" },
  { name: "Projector/Screen", suggestedPrice: 1500, icon: "Monitor" },
  { name: "Dog-Friendly Add-on", suggestedPrice: 1000, icon: "PawPrint" },
  { name: "Fire Pit", suggestedPrice: 1000, icon: "FlameKindling" },
  { name: "Cabana/Shade", suggestedPrice: 1500, icon: "Umbrella" },
  { name: "Karaoke Machine", suggestedPrice: 1500, icon: "Mic" },
  { name: "Outdoor Shower", suggestedPrice: 500, icon: "ShowerHead" },
  { name: "Towels Provided", suggestedPrice: 500, icon: "Shirt" },
  { name: "Changing Room", suggestedPrice: 500, icon: "DoorOpen" },
  { name: "Lawn Games", suggestedPrice: 500, icon: "Gamepad2" },
  { name: "Fishing Gear", suggestedPrice: 1000, icon: "Fish" },
  { name: "Kayak/Paddleboard", suggestedPrice: 2000, icon: "Sailboat" },
  { name: "Trampoline", suggestedPrice: 1000, icon: "ArrowUpFromLine" },
  { name: "Hammocks", suggestedPrice: 500, icon: "TreePalm" },
  { name: "Outdoor Bar", suggestedPrice: 1500, icon: "Wine" },
  { name: "Ice Machine", suggestedPrice: 500, icon: "Snowflake" },
  { name: "Mini Fridge", suggestedPrice: 500, icon: "Refrigerator" },
  { name: "Photo Booth", suggestedPrice: 2000, icon: "Camera" },
  { name: "DJ Equipment", suggestedPrice: 2500, icon: "Disc3" },
  { name: "Water Slide", suggestedPrice: 2000, icon: "Waves" },
  { name: "Night Lighting", suggestedPrice: 1000, icon: "Lightbulb" },
  { name: "Volleyball Net", suggestedPrice: 500, icon: "Trophy" },
  { name: "Tiki Torches", suggestedPrice: 500, icon: "Sparkles" },
  { name: "Picnic Setup", suggestedPrice: 1500, icon: "Tent" },
];
