export const purposes = [
  "Stay",
  "Rent",
  "Buy",
  "Day out",
  "Event",
  "Service",
  "Wanted",
] as const;
export const categoryNames = [
  "Villa",
  "Apartment",
  "House",
  "Cabana",
  "Hotel",
  "Room",
  "Annex",
  "Day out",
  "Land",
  "Commercial",
  "Guest house",
  "Holiday home",
  "Resort",
  "Boarding",
  "Restaurant",
  "Event venue",
  "Service",
] as const;
export type Role = "user" | "verified" | "moderator" | "admin" | "superadmin";
export type Status =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "changes_requested"
  | "suspended"
  | "deleted";
export interface AuditEntry {
  action: string;
  actor: string;
  at: string;
  note?: string;
}
export const boardingAudiences = {
  women: "Women",
  men: "Men",
  couples: "Couples",
  any: "Any adults",
} as const;
export interface Boarding {
  audience: keyof typeof boardingAudiences;
  roomType: "private" | "shared";
  capacity: number;
  vacancies: number;
  priceBasis: "person" | "room";
  tenantType: "students" | "professionals" | "any";
}
export const defaultBoarding: Boarding = {
  audience: "women",
  roomType: "shared",
  capacity: 3,
  vacancies: 3,
  priceBasis: "person",
  tenantType: "any",
};
export function listingPriceUnit(l: Pick<Listing, "unit" | "boarding">) {
  return l.boarding ? `${l.boarding.priceBasis} / month` : l.unit;
}
export interface Listing {
  _id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  purpose: string;
  city: string;
  district: string;
  province: string;
  area: string;
  price: number;
  unit: string;
  boarding?: Boarding;
  bedrooms: number;
  bathrooms: number;
  guests: number;
  amenities: string[];
  images: string[];
  status: Status;
  featured: boolean;
  verified: boolean;
  available: boolean;
  availableFrom?: string;
  blockedDates: string[];
  ownerId?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactVerified: boolean;
  createdAt: string;
  updatedAt: string;
  history: AuditEntry[];
  demo?: boolean;
  seo?: { title?: string; description?: string; noindex?: boolean };
  views: number;
}
export type PublicListing = Omit<
  Listing,
  "contactEmail" | "contactPhone" | "ownerId" | "history" | "contactVerified"
> & { inquiryEnabled?: boolean };
export interface User {
  _id: string;
  name: string;
  email: string;
  passwordHash?: string;
  googleSub?: string;
  role: Role;
  verified: boolean;
  createdAt: string;
}
export type SafeUser = Omit<User, "passwordHash" | "googleSub">;
export interface SearchFilters {
  audience?: string;
  roomType?: string;
  capacity?: string;
  vacancies?: string;
  priceBasis?: string;
  q?: string;
  purpose?: string;
  category?: string;
  city?: string;
  province?: string;
  district?: string;
  min?: string;
  max?: string;
  bedrooms?: string;
  guests?: string;
  amenity?: string;
  available?: string;
  date?: string;
  verified?: string;
  featured?: string;
  sort?: string;
  page?: string;
}
export const amenities = [
  "Wi-Fi",
  "Pool",
  "Air conditioning",
  "Kitchen",
  "Parking",
  "Garden",
  "Beach access",
  "BBQ",
  "Pet friendly",
  "Furnished",
  "Water",
  "Electricity",
  "Meals included",
];
export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
export function priceLabel(value: number) {
  return new Intl.NumberFormat("en-LK").format(value);
}
export function publicListing(l: Listing): PublicListing {
  const {
    contactEmail,
    contactPhone,
    ownerId,
    history,
    contactVerified,
    ...safe
  } = l;
  void contactEmail;
  void contactPhone;
  void ownerId;
  void history;
  void contactVerified;
  return { ...safe, inquiryEnabled: Boolean(ownerId) && !l.demo };
}
export const isAdmin = (role?: Role) =>
  ["moderator", "admin", "superadmin"].includes(role || "");
