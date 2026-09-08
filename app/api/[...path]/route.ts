import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { Binary, MongoServerError } from "mongodb";
import { z, ZodError } from "zod";
import sharp from "sharp";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { db, configured } from "@/lib/db";
import {
  ApiError,
  currentUser,
  requireUser,
  guard,
  jsonBody,
  hashPassword,
  checkPassword,
  safeUser,
  startSession,
  endSession,
  digest,
  token,
} from "@/lib/auth";
import {
  registerSchema,
  loginSchema,
  listingSchema,
  boardingSchema,
  contactSchema,
} from "@/lib/validation";
import { verificationEmail } from "@/lib/mail";
import { searchListings } from "@/lib/listings";
import {
  type Listing,
  type User,
  isAdmin,
  publicListing,
  slugify,
} from "@/lib/types";
export const runtime = "nodejs";
const googleKeys = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);
const id = () => randomBytes(16).toString("hex");
const now = () => new Date().toISOString();
const success = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
type Context = { params: Promise<{ path: string[] }> };
async function handle(request: Request, context: Context) {
  const path = (await context.params).path;
  const route = path.join("/");
  const method = request.method;
  try {
    if (method === "GET" && route === "auth/me")
      return success({
        user: await currentUser(),
        googleEnabled: Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID),
      });
    if (method === "GET" && route === "listings")
      return success(
        await searchListings(
          Object.fromEntries(new URL(request.url).searchParams),
        ),
      );
    if (method === "GET" && route === "saved-places") {
      const ids = (new URL(request.url).searchParams.get("ids") || "")
        .split(",")
        .filter((v) => /^[a-f0-9]{32}$/.test(v))
        .slice(0, 100);
      if (!configured() || !ids.length) return success({ listings: [] });
      const listings = await (
        await db()
      )
        .collection<Listing>("listings")
        .find({ _id: { $in: ids }, status: "approved" })
        .limit(100)
        .toArray();
      return success({ listings: listings.map(publicListing) });
    }
    if (
      method === "GET" &&
      path[0] === "images" &&
      /^[a-f0-9]{32}$/.test(path[1] || "")
    ) {
      if (!configured()) throw new ApiError("Image not found.", 404);
      const database = await db();
      const user = await currentUser();
      const uploadSession = (await cookies()).get("ceylon_upload")?.value;
      const record = await database
        .collection<{
          _id: string;
          data: Binary;
          uploadSession: string;
          userId?: string;
        }>("images")
        .findOne({ _id: path[1] });
      if (!record) throw new ApiError("Image not found.", 404);
      const published = await database
        .collection<Listing>("listings")
        .findOne(
          { images: `/api/images/${path[1]}`, status: "approved" },
          { projection: { _id: 1 } },
        );
      if (
        !published &&
        !(user && record.userId === user._id) &&
        !(uploadSession && record.uploadSession === uploadSession) &&
        !isAdmin(user?.role)
      )
        throw new ApiError("Image not found.", 404);
      return new Response(new Uint8Array(record.data.buffer), {
        headers: {
          "Content-Type": "image/webp",
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": published
            ? "public, max-age=3600"
            : "private, no-store",
          "X-Robots-Tag": published ? "index" : "noindex",
        },
      });
    }
    if (method === "GET" && route === "workspace") {
      const user = await requireUser();
      const database = await db();
      const [listings, favorites, inquiries, notifications] = await Promise.all(
        [
          database
            .collection<Listing>("listings")
            .find({ ownerId: user._id, status: { $ne: "deleted" } })
            .sort({ updatedAt: -1 })
            .limit(100)
            .toArray(),
          database
            .collection("favorites")
            .find({ userId: user._id })
            .limit(100)
            .toArray(),
          database
            .collection("inquiries")
            .find({ ownerId: user._id })
            .sort({ createdAt: -1 })
            .limit(100)
            .toArray(),
          database
            .collection("notifications")
            .find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(50)
            .toArray(),
        ],
      );
      const saved = await database
        .collection<Listing>("listings")
        .find({
          _id: { $in: favorites.map((f) => String(f.listingId)) },
          status: "approved",
        })
        .toArray();
      return success({
        user,
        listings,
        saved: saved.map(publicListing),
        inquiries,
        notifications,
      });
    }
    if (method === "GET" && route === "admin") {
      const user = await requireUser(true);
      const database = await db();
      const [listings, users, reports, settings, messages] = await Promise.all([
        database
          .collection<Listing>("listings")
          .find({ status: { $ne: "deleted" } })
          .sort({ updatedAt: -1 })
          .limit(100)
          .toArray(),
        database
          .collection<User>("users")
          .find()
          .sort({ createdAt: -1 })
          .limit(100)
          .toArray(),
        database
          .collection("reports")
          .find()
          .sort({ createdAt: -1 })
          .limit(100)
          .toArray(),
        database
          .collection<{
            _id: string;
            contactEmail?: string;
            submissionsOpen?: boolean;
          }>("siteSettings")
          .findOne({ _id: "general" }),
        database
          .collection("messages")
          .find()
          .sort({ createdAt: -1 })
          .limit(100)
          .toArray(),
      ]);
      return success({
        user,
        listings,
        users: users.map(safeUser),
        reports,
        settings,
        messages,
      });
    }
    if (method === "GET" && route === "favorites") {
      const user = await requireUser();
      return success({
        favorites: await (
          await db()
        )
          .collection("favorites")
          .find({ userId: user._id })
          .limit(100)
          .toArray(),
      });
    }
    if (method === "GET") throw new ApiError("Not found.", 404);
    await guard(
      request,
      route.startsWith("auth/") ? route : path[0],
      route.startsWith("auth/") ? 15 : 60,
    );
    const database = await db();
    if (method === "POST" && route === "auth/register") {
      const data = registerSchema.parse(await jsonBody(request));
      if (
        await database.collection<User>("users").findOne({ email: data.email })
      )
        throw new ApiError(
          "An account with this email already exists. Please sign in.",
          409,
        );
      if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === "production")
        throw new ApiError(
          "Email verification has not been configured by the site operator.",
          503,
        );
      const user: User = {
        _id: id(),
        email: data.email,
        name: data.name,
        passwordHash: await hashPassword(data.password),
        role: "user",
        verified: false,
        createdAt: now(),
      };
      await database.collection<User>("users").insertOne(user);
      const verificationUrl = await verificationEmail(
        user.email,
        undefined,
        user._id,
      );
      await startSession(user._id);
      return success({ user: safeUser(user), verificationUrl }, 201);
    }
    if (method === "POST" && route === "auth/login") {
      const data = loginSchema.parse(await jsonBody(request));
      const user = await database
        .collection<User>("users")
        .findOne({ email: data.email });
      // Perform an expensive hash even for missing accounts to reduce timing differences.
      const valid = user?.passwordHash
        ? await checkPassword(data.password, user.passwordHash)
        : (await hashPassword(data.password), false);
      if (!valid || !user)
        throw new ApiError("The email or password is incorrect.", 401);
      await startSession(user._id);
      return success({ user: safeUser(user) });
    }
    if (method === "POST" && route === "auth/logout") {
      await endSession();
      return success({ ok: true });
    }
    if (method === "POST" && route === "auth/google") {
      if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)
        throw new ApiError("Google sign-in is not configured.", 503);
      const { credential } = z
        .object({ credential: z.string().min(20).max(8000) })
        .parse(await jsonBody(request));
      let payload;
      try {
        payload = (
          await jwtVerify(credential, googleKeys, {
            issuer: ["https://accounts.google.com", "accounts.google.com"],
            audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          })
        ).payload;
      } catch {
        throw new ApiError("Google sign-in could not be verified.", 401);
      }
      if (
        !payload.sub ||
        !payload.email_verified ||
        typeof payload.email !== "string"
      )
        throw new ApiError("A verified Google email is required.", 401);
      const email = payload.email.toLowerCase();
      let user = await database
        .collection<User>("users")
        .findOne({ googleSub: payload.sub });
      if (!user) {
        const existing = await database
          .collection<User>("users")
          .findOne({ email });
        if (existing)
          throw new ApiError(
            "This email already has an account. Please use email sign-in.",
            409,
          );
        user = {
          _id: id(),
          email,
          name: String(payload.name || email.split("@")[0]).slice(0, 80),
          googleSub: payload.sub,
          role: "user",
          verified: true,
          createdAt: now(),
        };
        await database.collection<User>("users").insertOne(user);
      }
      await startSession(user._id);
      return success({ user: safeUser(user) });
    }
    if (method === "POST" && route === "auth/resend") {
      const user = await requireUser();
      if (user.verified) return success({ ok: true });
      return success({
        verificationUrl: await verificationEmail(
          user.email,
          undefined,
          user._id,
        ),
      });
    }
    if (method === "POST" && route === "verify") {
      const data = z
        .object({ token: z.string().regex(/^[a-f0-9]{64}$/) })
        .parse(await jsonBody(request));
      const record = await database
        .collection<{
          _id: string;
          email: string;
          listingId?: string;
          userId?: string;
          expiresAt: Date;
        }>("verificationTokens")
        .findOneAndDelete({
          _id: digest(data.token),
          expiresAt: { $gt: new Date() },
        });
      if (!record)
        throw new ApiError("This verification link is invalid or has expired.");
      if (record.userId) {
        await database
          .collection<User>("users")
          .updateOne({ _id: record.userId }, { $set: { verified: true } });
        await database
          .collection<Listing>("listings")
          .updateMany(
            { ownerId: record.userId, contactEmail: record.email },
            { $set: { contactVerified: true } },
          );
      }
      if (record.listingId)
        await database.collection<Listing>("listings").updateOne(
          { _id: record.listingId, contactEmail: record.email },
          {
            $set: { contactVerified: true },
            $push: {
              history: {
                action: "contact_verified",
                actor: "email-verification",
                at: now(),
              },
            },
          },
        );
      return success({ ok: true });
    }
    if (method === "POST" && route === "uploads") {
      if (Number(request.headers.get("content-length") || 0) > 9 * 1024 * 1024)
        throw new ApiError("Photos must be smaller than 8 MB.", 413);
      const reader = request.body?.getReader();
      if (!reader) throw new ApiError("Choose a photo to upload.");
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        size += part.value.length;
        if (size > 9 * 1024 * 1024) {
          await reader.cancel();
          throw new ApiError("Photos must be smaller than 8 MB.", 413);
        }
        chunks.push(part.value);
      }
      const form = await new Response(Buffer.concat(chunks), {
        headers: { "Content-Type": request.headers.get("content-type") || "" },
      }).formData();
      const file = form.get("file");
      if (
        !(file instanceof File) ||
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 8 * 1024 * 1024
      )
        throw new ApiError("Choose a JPEG, PNG or WebP photo up to 8 MB.");
      const raw = Buffer.from(await file.arrayBuffer());
      let bytes: Buffer;
      try {
        const image = sharp(raw, { limitInputPixels: 40000000 });
        const info = await image.metadata();
        if (
          !info.width ||
          !info.height ||
          info.width < 600 ||
          info.height < 400
        )
          throw new Error("dimensions");
        bytes = await image
          .rotate()
          .resize({ width: 1920, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();
      } catch {
        throw new ApiError(
          "Use a valid image at least 600 × 400 pixels and under 40 megapixels.",
        );
      }
      const jar = await cookies();
      let uploadSession = jar.get("ceylon_upload")?.value;
      if (!uploadSession) {
        uploadSession = token();
        jar.set("ceylon_upload", uploadSession, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 86400,
        });
      }
      const user = await currentUser();
      const hash = digest(raw.toString("base64"));
      const existing = await database
        .collection<{ _id: string }>("images")
        .findOne({ digest: hash, uploadSession });
      if (existing)
        return success({ url: `/api/images/${existing._id}`, duplicate: true });
      const imageId = id();
      await database
        .collection<{
          _id: string;
          digest: string;
          uploadSession: string;
          userId?: string;
          data: Binary;
          createdAt: string;
        }>("images")
        .insertOne({
          _id: imageId,
          digest: hash,
          uploadSession,
          ...(user ? { userId: user._id } : {}),
          data: new Binary(bytes),
          createdAt: now(),
        });
      return success({ url: `/api/images/${imageId}` }, 201);
    }
    if (method === "POST" && route === "listings") {
      const settings = await database
        .collection<{ _id: string; submissionsOpen?: boolean }>("siteSettings")
        .findOne({ _id: "general" });
      if (settings?.submissionsOpen === false)
        throw new ApiError("New submissions are temporarily paused.", 503);
      const data = listingSchema.parse(await jsonBody(request));
      const user = await currentUser();
      const uploadSession = (await cookies()).get("ceylon_upload")?.value;
      for (const url of data.images) {
        const image = await database
          .collection("images")
          .findOne({ _id: url.split("/").at(-1) as never });
        if (
          !image ||
          !(
            (image.uploadSession === uploadSession && uploadSession) ||
            (user && image.userId === user._id)
          )
        )
          throw new ApiError("Upload your own listing photos.");
      }
      if (
        !user?.verified &&
        !process.env.RESEND_API_KEY &&
        process.env.NODE_ENV === "production"
      )
        throw new ApiError(
          "Email verification is not configured. Submissions cannot be accepted yet.",
          503,
        );
      const listingId = id();
      const { website, ...fields } = data;
      void website;
      const listing: Listing = {
        ...fields,
        ...(fields.boarding ? { guests: fields.boarding.capacity } : {}),
        _id: listingId,
        slug: `${slugify(data.title)}-${slugify(data.city)}-${listingId.slice(0, 6)}`,
        ...(user ? { ownerId: user._id } : {}),
        contactEmail: user?.email || data.contactEmail,
        contactVerified: Boolean(user?.verified),
        status: "pending",
        featured: false,
        verified: false,
        views: 0,
        createdAt: now(),
        updatedAt: now(),
        history: [
          { action: "submitted", actor: user?._id || "guest", at: now() },
        ],
      };
      await database.collection<Listing>("listings").insertOne(listing);
      const verificationUrl = !listing.contactVerified
        ? await verificationEmail(listing.contactEmail, listingId)
        : undefined;
      return success(
        {
          id: listingId,
          status: "pending",
          verificationUrl,
          message: listing.contactVerified
            ? "Your listing is in the review queue."
            : "Verify your email using the link sent to you. Your listing will then be ready for administrator review.",
        },
        201,
      );
    }
    if (method === "PATCH" && path[0] === "listings" && path[1]) {
      const user = await requireUser();
      const listing = await database.collection<Listing>("listings").findOne({
        _id: path[1],
        ownerId: user._id,
        status: { $nin: ["deleted", "suspended"] },
      });
      if (!listing) throw new ApiError("Listing not found.", 404);
      const raw = await jsonBody(request);
      if (raw.action === "availability") {
        const data = z
          .object({
            vacancies: z.coerce.number().int().min(0).max(30).optional(),
            available: z.boolean(),
            availableFrom: z
              .string()
              .regex(/^$|^\d{4}-\d{2}-\d{2}$/)
              .optional(),
            blockedDates: z
              .array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
              .max(366)
              .optional(),
          })
          .parse(raw);
        const { vacancies, ...availability } = data;
        if (vacancies !== undefined && !listing.boarding)
          throw new ApiError("This listing has no boarding room details.", 400);
        const spaces = vacancies ?? listing.boarding?.vacancies;
        if (listing.boarding && spaces! > listing.boarding.capacity)
          throw new ApiError(
            "Available spaces cannot exceed room capacity.",
            400,
          );
        if (listing.boarding && data.available && spaces === 0)
          throw new ApiError(
            "A full boarding room must be marked unavailable.",
            400,
          );
        const updated = await database
          .collection<Listing>("listings")
          .updateOne(
            {
              _id: listing._id,
              ownerId: user._id,
              updatedAt: listing.updatedAt,
            },
            {
              $set: {
                ...availability,
                ...(vacancies !== undefined
                  ? { "boarding.vacancies": vacancies }
                  : {}),
                updatedAt: now(),
              },
              $push: {
                history: {
                  action: "availability_updated",
                  actor: user._id,
                  at: now(),
                },
              },
            },
          );
        if (!updated.matchedCount)
          throw new ApiError(
            "This listing changed. Refresh and try again.",
            409,
          );
      } else {
        const data = z
          .object({
            boarding: boardingSchema.optional(),
            title: z
              .string()
              .trim()
              .min(10)
              .max(100)
              .regex(/^[^<>]+$/),
            description: z
              .string()
              .trim()
              .min(100)
              .max(5000)
              .regex(/^[^<>]+$/),
            price: z.coerce.number().finite().positive().max(100000000000),
          })
          .parse(raw);
        if (listing.category === "Boarding" && !data.boarding)
          throw new ApiError("Boarding room details are required.", 400);
        if (listing.category !== "Boarding" && data.boarding)
          throw new ApiError(
            "Boarding details apply only to boarding listings.",
            400,
          );
        const updated = await database
          .collection<Listing>("listings")
          .updateOne(
            {
              _id: listing._id,
              ownerId: user._id,
              updatedAt: listing.updatedAt,
            },
            {
              $set: {
                ...data,
                ...(data.boarding
                  ? {
                      guests: data.boarding.capacity,
                      ...(data.boarding.vacancies === 0
                        ? { available: false }
                        : {}),
                    }
                  : {}),
                status: "pending",
                verified: false,
                updatedAt: now(),
              },
              $push: {
                history: {
                  action: "edited_and_resubmitted",
                  actor: user._id,
                  at: now(),
                },
              },
            },
          );
        if (!updated.matchedCount)
          throw new ApiError(
            "This listing changed. Refresh and try again.",
            409,
          );
      }
      return success({ ok: true });
    }
    if (
      method === "POST" &&
      path[0] === "admin" &&
      path[1] === "listings" &&
      path[2]
    ) {
      const user = await requireUser(true);
      const data = z
        .object({
          action: z.enum([
            "approve",
            "reject",
            "request_changes",
            "suspend",
            "delete",
            "feature",
            "verify",
            "seo",
          ]),
          note: z.string().trim().max(1000).optional(),
          version: z.string().optional(),
          title: z.string().trim().min(10).max(100).optional(),
          description: z.string().trim().min(50).max(200).optional(),
          noindex: z.boolean().optional(),
        })
        .parse(await jsonBody(request));
      if (data.action === "delete" && user.role === "moderator")
        throw new ApiError("An admin is required for deletion.", 403);
      const listing = await database
        .collection<Listing>("listings")
        .findOne({ _id: path[2] });
      if (!listing) throw new ApiError("Listing not found.", 404);
      if (data.version && data.version !== listing.updatedAt)
        throw new ApiError(
          "This listing changed since you opened it. Refresh and review the latest version.",
          409,
        );
      if (
        data.action === "approve" &&
        listing.category === "Boarding" &&
        (!boardingSchema.safeParse(listing.boarding).success ||
          listing.purpose !== "Rent" ||
          listing.unit !== "month" ||
          (listing.available && !listing.boarding?.vacancies))
      )
        throw new ApiError(
          "Complete the boarding details and availability before approval.",
          400,
        );
      if (
        data.action === "approve" &&
        (!listing.contactVerified ||
          listing.description.length < 100 ||
          !listing.images.length)
      )
        throw new ApiError(
          "Approval requires verified contact details, a complete description and a photo.",
        );
      if (
        ["reject", "request_changes", "suspend", "delete"].includes(
          data.action,
        ) &&
        (!data.note || data.note.length < 5)
      )
        throw new ApiError(
          "Add a reason of at least 5 characters for this decision.",
        );
      const changes: Partial<Listing> = { updatedAt: now() };
      const statusMap = {
        approve: "approved",
        reject: "rejected",
        request_changes: "changes_requested",
        suspend: "suspended",
        delete: "deleted",
      } as const;
      if (data.action in statusMap)
        changes.status = statusMap[data.action as keyof typeof statusMap];
      if (data.action === "feature") {
        if (listing.status !== "approved")
          throw new ApiError("Approve a listing before featuring it.");
        changes.featured = !listing.featured;
      }
      if (data.action === "verify") {
        if (!listing.contactVerified || !data.note)
          throw new ApiError(
            "Record verification evidence before adding a badge.",
          );
        changes.verified = !listing.verified;
      }
      if (data.action === "seo")
        changes.seo = {
          title: data.title,
          description: data.description,
          noindex: data.noindex,
        };
      const decision = await database.collection<Listing>("listings").updateOne(
        { _id: listing._id, updatedAt: listing.updatedAt },
        {
          $set: changes,
          $push: {
            history: {
              action: data.action,
              actor: user._id,
              at: now(),
              note: data.note,
            },
          },
        },
      );
      if (!decision.matchedCount)
        throw new ApiError(
          "The listing changed while you reviewed it. Refresh to review the latest version.",
          409,
        );
      if (listing.ownerId)
        await database.collection("notifications").insertOne({
          userId: listing.ownerId,
          title: `Listing update: ${listing.title}`,
          message:
            data.note || `Your listing status was updated: ${data.action}.`,
          createdAt: now(),
        });
      return success({ ok: true });
    }
    if (method === "POST" && route === "favorites") {
      const user = await requireUser();
      const data = z
        .object({ listingId: z.string().max(80), saved: z.boolean() })
        .parse(await jsonBody(request));
      const listing = await database
        .collection<Listing>("listings")
        .findOne({ _id: data.listingId, status: "approved" });
      if (!listing)
        throw new ApiError("This listing is no longer available.", 404);
      if (data.saved)
        await database
          .collection("favorites")
          .updateOne(
            { userId: user._id, listingId: data.listingId },
            { $setOnInsert: { createdAt: now() } },
            { upsert: true },
          );
      else
        await database
          .collection("favorites")
          .deleteOne({ userId: user._id, listingId: data.listingId });
      return success({ saved: data.saved });
    }
    if (method === "POST" && route === "inquiries") {
      const raw = await jsonBody(request);
      const data = contactSchema
        .extend({ listingId: z.string().max(80) })
        .parse(raw);
      const listing = await database
        .collection<Listing>("listings")
        .findOne({ _id: data.listingId, status: "approved" });
      if (!listing || listing.demo)
        throw new ApiError("Inquiries are unavailable for this listing.", 404);
      if (!listing.ownerId)
        throw new ApiError(
          "This owner has not enabled online inquiries yet.",
          409,
        );
      const user = await currentUser();
      await database.collection("inquiries").insertOne({
        listingId: listing._id,
        listingTitle: listing.title,
        ownerId: listing.ownerId,
        senderId: user?._id,
        name: data.name,
        email: data.email,
        message: data.message,
        createdAt: now(),
        status: "new",
      });
      return success({ ok: true }, 201);
    }
    if (method === "POST" && route === "reports") {
      const data = z
        .object({
          listingId: z.string().max(80),
          reason: z.enum([
            "Scam",
            "Incorrect information",
            "Duplicate",
            "Wrong location",
            "Inappropriate content",
            "No longer available",
          ]),
          details: z.string().trim().max(1000).optional(),
        })
        .parse(await jsonBody(request));
      if (
        !(await database.collection<Listing>("listings").findOne({
          _id: data.listingId,
          status: "approved",
          demo: { $ne: true },
        }))
      )
        throw new ApiError("Listing not found.", 404);
      await database
        .collection("reports")
        .insertOne({ ...data, status: "open", createdAt: now() });
      return success({ ok: true }, 201);
    }
    if (method === "POST" && route === "contact") {
      const data = contactSchema.parse(await jsonBody(request));
      await database.collection("messages").insertOne({
        name: data.name,
        email: data.email,
        message: data.message,
        createdAt: now(),
      });
      return success({ ok: true }, 201);
    }
    if (method === "PATCH" && route === "profile") {
      const user = await requireUser();
      const data = z
        .object({
          name: z
            .string()
            .trim()
            .min(2)
            .max(80)
            .regex(/^[^<>]+$/),
        })
        .parse(await jsonBody(request));
      await database
        .collection<User>("users")
        .updateOne({ _id: user._id }, { $set: data });
      return success({ ok: true });
    }
    if (method === "POST" && route === "admin/settings") {
      const user = await requireUser(true);
      if (user.role === "moderator")
        throw new ApiError("Admin access is required.", 403);
      const data = z
        .object({
          submissionsOpen: z.boolean(),
          contactEmail: z.union([z.email(), z.literal("")]),
        })
        .parse(await jsonBody(request));
      await database
        .collection<{
          _id: string;
          submissionsOpen: boolean;
          contactEmail: string;
          updatedBy?: string;
        }>("siteSettings")
        .updateOne(
          { _id: "general" },
          { $set: { ...data, updatedBy: user._id } },
          { upsert: true },
        );
      return success({ ok: true });
    }
    if (
      method === "POST" &&
      path[0] === "admin" &&
      path[1] === "reports" &&
      path[2]
    ) {
      await requireUser(true);
      const { ObjectId } = await import("mongodb");
      if (!ObjectId.isValid(path[2])) throw new ApiError("Invalid report.");
      await database
        .collection("reports")
        .updateOne(
          { _id: new ObjectId(path[2]) },
          { $set: { status: "resolved", resolvedAt: now() } },
        );
      return success({ ok: true });
    }
    throw new ApiError("Not found.", 404);
  } catch (error) {
    if (error instanceof ApiError)
      return success({ error: error.message }, error.status);
    if (error instanceof ZodError)
      return success(
        {
          error: error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join(" "),
        },
        400,
      );
    if (error instanceof MongoServerError && error.code === 11000)
      return success(
        { error: "This record already exists. Please refresh and try again." },
        409,
      );
    console.error(
      "API request failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return success(
      { error: "Something went wrong. Please try again shortly." },
      500,
    );
  }
}
export const GET = handle;
export const POST = handle;
export const PATCH = handle;
