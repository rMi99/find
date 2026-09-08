import { z } from "zod";
import { categoryNames, purposes, amenities } from "./types";
import { provinces } from "./catalog";
const clean = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((v) => !/[<>]/.test(v), "Please use plain text without HTML.");
export const contactSchema = z.object({
  name: clean(80).min(2),
  email: z
    .email()
    .max(254)
    .transform((s) => s.toLowerCase()),
  message: clean(2000).min(20),
  website: z.string().max(0).optional(),
});
export const boardingSchema = z
  .object({
    audience: z.enum(["women", "men", "couples", "any"]),
    roomType: z.enum(["private", "shared"]),
    capacity: z.coerce.number().int().min(1).max(30),
    vacancies: z.coerce.number().int().min(0).max(30),
    priceBasis: z.enum(["person", "room"]),
    tenantType: z.enum(["students", "professionals", "any"]),
  })
  .superRefine((b, ctx) => {
    if (b.vacancies > b.capacity)
      ctx.addIssue({
        code: "custom",
        path: ["vacancies"],
        message: "Available spaces cannot exceed room capacity.",
      });
    if (b.audience === "couples" && b.capacity < 2)
      ctx.addIssue({
        code: "custom",
        path: ["capacity"],
        message: "A room for couples must accommodate at least two people.",
      });
  });
export const listingSchema = z
  .object({
    boarding: boardingSchema.optional(),
    title: clean(100).min(10),
    description: clean(5000).min(100),
    category: z.enum(categoryNames),
    purpose: z.enum(purposes),
    city: clean(80).min(2),
    district: clean(80).min(2),
    province: clean(80).min(2),
    area: clean(120).default(""),
    price: z.coerce.number().finite().min(1).max(100000000000),
    unit: z.enum(["night", "month", "person", "day", "total"]),
    bedrooms: z.coerce.number().int().min(0).max(100).default(0),
    bathrooms: z.coerce.number().int().min(0).max(100).default(0),
    guests: z.coerce.number().int().min(1).max(10000).default(2),
    amenities: z
      .array(z.enum(amenities as [string, ...string[]]))
      .max(20)
      .default([]),
    images: z
      .array(z.string().regex(/^\/api\/images\/[a-f0-9]{32}$/))
      .min(1, "Upload at least one photo.")
      .max(10),
    contactName: clean(80).min(2),
    contactEmail: z
      .email()
      .max(254)
      .transform((s) => s.toLowerCase()),
    contactPhone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s()-]{9,20}$/, "Enter a valid phone number."),
    available: z.boolean().default(true),
    availableFrom: z
      .string()
      .regex(/^$|^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    blockedDates: z
      .array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
      .max(366)
      .default([]),
    website: z.string().max(0).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.category === "Boarding") {
      if (!data.boarding)
        ctx.addIssue({
          code: "custom",
          path: ["boarding"],
          message:
            "Add the boarding audience, room capacity and available spaces.",
        });
      if (data.purpose !== "Rent" || data.unit !== "month")
        ctx.addIssue({
          code: "custom",
          path: ["unit"],
          message: "Boarding listings use Rent and monthly pricing.",
        });
      if (data.available && data.boarding?.vacancies === 0)
        ctx.addIssue({
          code: "custom",
          path: ["available"],
          message: "A full boarding room must be marked unavailable.",
        });
    } else if (data.boarding)
      ctx.addIssue({
        code: "custom",
        path: ["boarding"],
        message: "Boarding details apply only to boarding listings.",
      });
  })
  .refine((data) => provinces[data.province]?.includes(data.district), {
    message: "Choose a district in the selected province.",
    path: ["district"],
  });
export const registerSchema = z.object({
  name: clean(80).min(2),
  email: z
    .email()
    .max(254)
    .transform((s) => s.toLowerCase()),
  password: z.string().min(10).max(128),
  website: z.string().max(0).optional(),
});
export const loginSchema = z.object({
  email: z.email().transform((s) => s.toLowerCase()),
  password: z.string().min(1).max(128),
});
