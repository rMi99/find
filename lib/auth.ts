import {
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { db, configured } from "./db";
import { type SafeUser, type User, isAdmin } from "./types";
const scrypt = promisify(scryptCb);
export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const token = () => randomBytes(32).toString("hex");
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}
export async function checkPassword(password: string, hash: string) {
  const [salt, key] = hash.split(":");
  if (!salt || !key) return false;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(key, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export function safeUser(user: User): SafeUser {
  const { passwordHash, googleSub, ...safe } = user;
  void passwordHash;
  void googleSub;
  return safe;
}
export async function currentUser(): Promise<SafeUser | null> {
  const raw = (await cookies()).get("ceylon_session")?.value;
  if (!raw || !configured()) return null;
  const database = await db();
  const session = await database
    .collection<{ _id: string; userId: string; expiresAt: Date }>("sessions")
    .findOne({ _id: digest(raw), expiresAt: { $gt: new Date() } });
  if (!session) return null;
  const user = await database
    .collection<User>("users")
    .findOne({ _id: session.userId });
  return user ? safeUser(user) : null;
}
export async function requireUser(admin = false) {
  const user = await currentUser();
  if (!user) throw new ApiError("Please sign in to continue.", 401);
  if (admin && !isAdmin(user.role))
    throw new ApiError("Administrator access is required.", 403);
  return user;
}
export async function startSession(userId: string) {
  const raw = token();
  const expiresAt = new Date(Date.now() + 7 * 86400000);
  await (
    await db()
  )
    .collection<{ _id: string; userId: string; expiresAt: Date }>("sessions")
    .insertOne({ _id: digest(raw), userId, expiresAt });
  (await cookies()).set("ceylon_session", raw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}
export async function endSession() {
  const jar = await cookies();
  const raw = jar.get("ceylon_session")?.value;
  if (raw && configured())
    await (
      await db()
    )
      .collection<{ _id: string }>("sessions")
      .deleteOne({ _id: digest(raw) });
  jar.delete("ceylon_session");
}
export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function guard(request: Request, bucket: string, max = 30) {
  const origin = request.headers.get("origin");
  const expected = new URL(process.env.NEXT_PUBLIC_SITE_URL || request.url)
    .origin;
  if (origin !== expected)
    throw new ApiError("Request origin is not allowed.", 403);
  if (!configured())
    throw new ApiError(
      "The database is not connected yet. Follow the local setup in README.md to enable accounts and submissions.",
      503,
    );
  const identity =
    process.env.TRUST_PROXY === "true"
      ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "unknown"
      : "shared";
  const window = Math.floor(Date.now() / 600000);
  const _id = digest(`${bucket}:${identity}:${window}`);
  const record = await (
    await db()
  )
    .collection<{ _id: string; count: number; expiresAt: Date }>("rateLimits")
    .findOneAndUpdate(
      { _id },
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt: new Date(Date.now() + 1200000) },
      },
      { upsert: true, returnDocument: "after" },
    );
  if (record && record.count > max)
    throw new ApiError(
      "Too many attempts. Please try again in 10 minutes.",
      429,
    );
}
export async function jsonBody(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 64000)
    throw new ApiError("Request is too large.", 413);
  const text = await request.text();
  if (text.length > 64000) throw new ApiError("Request is too large.", 413);
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError("Invalid JSON request.");
  }
}
