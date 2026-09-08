export const provinces: Record<string, string[]> = {
  Western: ["Colombo", "Gampaha", "Kalutara"],
  Southern: ["Galle", "Matara", "Hambantota"],
  Central: ["Kandy", "Matale", "Nuwara Eliya"],
  Northern: ["Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya"],
  Eastern: ["Ampara", "Batticaloa", "Trincomalee"],
  "North Western": ["Kurunegala", "Puttalam"],
  "North Central": ["Anuradhapura", "Polonnaruwa"],
  Uva: ["Badulla", "Monaragala"],
  Sabaragamuwa: ["Kegalle", "Ratnapura"],
};
export const locations = [
  {
    city: "Galle",
    district: "Galle",
    province: "Southern",
    image: "/images/galle.webp",
    subtitle: "Coastal charm & slow living",
    description:
      "Explore stays around Galle, from homes near the historic fort to quiet coastal villas. Compare the location, facilities and host details before planning your visit.",
  },
  {
    city: "Ella",
    district: "Badulla",
    province: "Uva",
    image: "/images/ella-bridge.webp",
    subtitle: "A breath of fresh mountain air",
    description:
      "Discover cabins, guest houses and hillside escapes around Ella. Check road access and the distance to town, and ask your host about transport before you travel.",
  },
  {
    city: "Colombo",
    district: "Colombo",
    province: "Western",
    image: "/images/colombo-skyline.webp",
    subtitle: "City energy, your own space",
    description:
      "Find apartments, homes and places to gather in Colombo. Compare neighborhoods, parking, transport links and rental terms to find a space that fits everyday life.",
  },
  {
    city: "Kandy",
    district: "Kandy",
    province: "Central",
    image: "/images/kandy-lake.webp",
    subtitle: "Culture meets the hills",
    description:
      "Browse homes and hillside stays around Kandy. Consider the route into the city, elevation and access when choosing between a central location and a quieter escape.",
  },
  {
    city: "Mirissa",
    district: "Matara",
    province: "Southern",
    image: "/images/mirissa-coast.webp",
    subtitle: "Salt in the air, sand at your feet",
    description:
      "Explore beachside stays around Mirissa. Ask about beach access, seasonal swimming conditions and nearby restaurants before choosing your coastal base.",
  },
  {
    city: "Ja-Ela",
    district: "Gampaha",
    province: "Western",
    image: "/images/house.webp",
    subtitle: "A little closer to home",
    description:
      "Discover rooms, annexes and homes around Ja-Ela. Compare monthly costs, utility arrangements, commute times and furnishing before contacting an owner.",
  },
];
export const collections: Record<
  string,
  { category: string; purpose: string; label: string; audience?: string }
> = {
  "boarding-houses": {
    category: "Boarding",
    purpose: "Rent",
    label: "Boarding houses",
  },
  "boarding-for-women": {
    category: "Boarding",
    purpose: "Rent",
    audience: "women",
    label: "Boarding houses for women",
  },
  "boarding-for-men": {
    category: "Boarding",
    purpose: "Rent",
    audience: "men",
    label: "Boarding houses for men",
  },
  "boarding-for-couples": {
    category: "Boarding",
    purpose: "Rent",
    audience: "couples",
    label: "Boarding houses for couples",
  },
  "annex-for-rent": {
    category: "Annex",
    purpose: "Rent",
    label: "Annexes for rent",
  },
  "rooms-for-rent": {
    category: "Room",
    purpose: "Rent",
    label: "Rooms for rent",
  },
  "houses-for-rent": {
    category: "House",
    purpose: "Rent",
    label: "Houses for rent",
  },
  "houses-for-sale": {
    category: "House",
    purpose: "Buy",
    label: "Houses for sale",
  },
  "villas-for-rent": {
    category: "Villa",
    purpose: "Stay",
    label: "Villas for rent",
  },
  hotels: { category: "Hotel", purpose: "Stay", label: "Hotels" },
  cabanas: { category: "Cabana", purpose: "Stay", label: "Cabanas" },
  "holiday-homes": {
    category: "Holiday home",
    purpose: "Stay",
    label: "Holiday homes",
  },
  "family-day-out": {
    category: "Day out",
    purpose: "Day out",
    label: "Family day-out locations",
  },
  "couple-day-out": {
    category: "Day out",
    purpose: "Day out",
    label: "Couple day-out locations",
  },
  "office-day-out": {
    category: "Day out",
    purpose: "Day out",
    label: "Corporate day-out locations",
  },
};

export function collectionFilters(
  c: (typeof collections)[string],
  city?: string,
) {
  return {
    category: c.category,
    purpose: c.purpose,
    ...(c.audience ? { audience: c.audience } : {}),
    ...(city ? { city } : {}),
  };
}
