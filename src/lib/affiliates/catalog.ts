export type AffiliateSeed = {
  name: string;
  category:
    | "GAMING_HARDWARE"
    | "GAMING_PLATFORMS"
    | "STREAMING_CONTENT"
    | "GAME_KEYS"
    | "GENERAL";
  commissionRate: string;
  cookieDuration: string;
  notes: string | null;
};

export const affiliateSeeds: AffiliateSeed[] = [
  {
    name: "Razer",
    category: "GAMING_HARDWARE",
    commissionRate: "1-3%",
    cookieDuration: "30 days",
    notes: "A top brand for gaming peripherals.",
  },
  {
    name: "Logitech",
    category: "GAMING_HARDWARE",
    commissionRate: "4-10%",
    cookieDuration: "30 days",
    notes: "Wide range of popular gaming and streaming gear.",
  },
  {
    name: "SteelSeries",
    category: "GAMING_HARDWARE",
    commissionRate: "5-10%",
    cookieDuration: "30 days",
    notes: "Known for high-quality headsets and mice.",
  },
  {
    name: "Corsair",
    category: "GAMING_HARDWARE",
    commissionRate: "5-15%",
    cookieDuration: "30 days",
    notes: "Popular for PC components, peripherals, and streaming gear.",
  },
  {
    name: "Turtle Beach",
    category: "GAMING_HARDWARE",
    commissionRate: "4%",
    cookieDuration: "30 days",
    notes: "A leader in console gaming headsets.",
  },
  {
    name: "Nvidia",
    category: "GAMING_HARDWARE",
    commissionRate: "2-5%",
    cookieDuration: "45 days",
    notes: "The go-to brand for graphics cards.",
  },
  {
    name: "Secret Lab",
    category: "GAMING_HARDWARE",
    commissionRate: "12%",
    cookieDuration: "7 days",
    notes: "A popular gaming chair brand.",
  },
  {
    name: "Twitch",
    category: "GAMING_PLATFORMS",
    commissionRate: "5-50%",
    cookieDuration: "N/A",
    notes: "Earn from subscriptions, bits, and game sales.",
  },
  {
    name: "Epic Games",
    category: "GAMING_PLATFORMS",
    commissionRate: "5%",
    cookieDuration: "14 days",
    notes: "Promote games from the Epic Games Store.",
  },
  {
    name: "Zygor Guides",
    category: "GAMING_PLATFORMS",
    commissionRate: "50%",
    cookieDuration: "60 days",
    notes: "High commission for World of Warcraft guides.",
  },
  {
    name: "Big Fish Games",
    category: "GAMING_PLATFORMS",
    commissionRate: "40.6%",
    cookieDuration: "365 days",
    notes: "Promote a wide variety of casual games.",
  },
  {
    name: "Ubisoft",
    category: "GAMING_PLATFORMS",
    commissionRate: "3%",
    cookieDuration: "30 days",
    notes: "Promote popular titles from the Ubisoft store.",
  },
  {
    name: "Nerd or Die",
    category: "STREAMING_CONTENT",
    commissionRate: "10-30%",
    cookieDuration: "Undisclosed",
    notes: "Overlays, alerts, and other stream assets.",
  },
  {
    name: "Into the AM",
    category: "STREAMING_CONTENT",
    commissionRate: "10%",
    cookieDuration: "30 days",
    notes: "Popular apparel for gamers and streamers.",
  },
  {
    name: "Loot Crate",
    category: "STREAMING_CONTENT",
    commissionRate: "$10 per sale",
    cookieDuration: "30 days",
    notes: "Monthly subscription box for gamers.",
  },
  {
    name: "CDKeys",
    category: "GAME_KEYS",
    commissionRate: "5%",
    cookieDuration: "30 days",
    notes: "Popular marketplace for discounted game keys.",
  },
  {
    name: "Kinguin",
    category: "GAME_KEYS",
    commissionRate: "Varies",
    cookieDuration: "30 days",
    notes: "Large marketplace for game keys and digital items.",
  },
  {
    name: "Fanatical",
    category: "GAME_KEYS",
    commissionRate: "Varies",
    cookieDuration: "30 days",
    notes: "Bundles and deals on PC games.",
  },
  {
    name: "Green Man Gaming",
    category: "GAME_KEYS",
    commissionRate: "Varies",
    cookieDuration: "30 days",
    notes: "Digital retailer for PC games.",
  },
  {
    name: "Amazon Associates",
    category: "GENERAL",
    commissionRate: "3-10%",
    cookieDuration: "24 hours",
    notes: "Promote any product on Amazon, including gaming gear.",
  },
  {
    name: "GamePal",
    category: "GENERAL",
    commissionRate: "25%",
    cookieDuration: "80 days",
    notes: "In-game currency and services.",
  },
  {
    name: "Final Mouse",
    category: "GENERAL",
    commissionRate: "25%",
    cookieDuration: "30 days",
    notes: "High-end, limited edition gaming mice.",
  },
  {
    name: "ModdedZone",
    category: "GENERAL",
    commissionRate: "10%",
    cookieDuration: "90 days",
    notes: "Custom modded controllers.",
  },
];
