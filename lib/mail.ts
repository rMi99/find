import { db } from "./db";
import { digest, token, ApiError } from "./auth";
export async function verificationEmail(
  email: string,
  listingId?: string,
  userId?: string,
) {
  if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === "production")
    throw new ApiError(
      "Email verification is not configured. Please contact the site operator.",
      503,
    );
  const raw = token();
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/verify?token=${raw}`;
  await (
    await db()
  )
    .collection<{
      _id: string;
      email: string;
      listingId?: string;
      userId?: string;
      expiresAt: Date;
    }>("verificationTokens")
    .insertOne({
      _id: digest(raw),
      email,
      ...(listingId ? { listingId } : {}),
      ...(userId ? { userId } : {}),
      expiresAt: new Date(Date.now() + 86400000),
    });
  if (process.env.RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [email],
        subject: "Verify your email · Ceylon",
        text: `Verify your email to continue on Ceylon:\n\n${url}\n\nThis link expires in 24 hours. Listings still require administrator approval.`,
      }),
    });
    if (!response.ok)
      throw new ApiError(
        "Your submission was saved, but the verification email could not be delivered. Please contact support.",
        503,
      );
  }
  return !process.env.RESEND_API_KEY && process.env.NODE_ENV !== "production"
    ? url
    : undefined;
}
