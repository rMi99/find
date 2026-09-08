"use client";
import { useState } from "react";
import Image from "next/image";
import {
  Heart,
  Share2,
  Flag,
  Send,
  CheckCircle2,
  X,
  Images,
} from "lucide-react";
import { useApp, api } from "./providers";
import type { PublicListing } from "@/lib/types";
export function DetailActions({ listing }: { listing: PublicListing }) {
  const { saved, toggleSave, notify } = useApp();
  return (
    <div className="detail-actions">
      <button
        className="button button-outline"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(window.location.href);
            notify("Link copied. Share a little inspiration.");
          } catch {
            notify("Copy the address from your browser to share this place.");
          }
        }}
      >
        <Share2 size={15} /> Share
      </button>
      <button
        className="button button-outline"
        onClick={() => toggleSave(listing._id, listing.demo)}
      >
        <Heart
          size={15}
          fill={saved.includes(listing._id) ? "currentColor" : "none"}
        />
        {saved.includes(listing._id) ? "Saved" : "Save place"}
      </button>
    </div>
  );
}
export function Gallery({ listing }: { listing: PublicListing }) {
  const [index, setIndex] = useState(0);
  return (
    <>
      <div className="detail-gallery">
        <Image
          src={listing.images[index]}
          alt={`${listing.title} – photo ${index + 1}`}
          fill
          preload
          sizes="(max-width: 600px) 100vw, 90vw"
          unoptimized={listing.images[index].startsWith("/api/")}
        />
        <button
          className="button button-cream gallery-count"
          onClick={() => setIndex((index + 1) % listing.images.length)}
          aria-label="View next photo"
        >
          <Images size={16} /> {index + 1} / {listing.images.length}
        </button>
      </div>
      {listing.images.length > 1 && (
        <div className="gallery-thumbs">
          {listing.images.map((src, i) => (
            <button
              key={src}
              className={index === i ? "selected" : ""}
              onClick={() => setIndex(i)}
              aria-label={`View photo ${i + 1}`}
            >
              <Image
                src={src}
                alt={`Thumbnail ${i + 1}`}
                fill
                sizes="88px"
                unoptimized={src.startsWith("/api/")}
              />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
export function InquiryForm({ listing }: { listing: PublicListing }) {
  const { user } = useApp();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  if (listing.demo)
    return (
      <div className="preview-notice">
        This is a sample property. Inquiries will be available on real, approved
        listings.
      </div>
    );
  if (listing.inquiryEnabled === false)
    return (
      <div className="preview-notice">
        This owner hasn’t enabled online inquiries yet. Please explore other
        available places.
      </div>
    );
  if (sent)
    return (
      <div className="form-success">
        <CheckCircle2 size={20} />
        <strong>Your message is on its way.</strong>
        <p>
          The owner can see your inquiry in their dashboard and reply to your
          email.
        </p>
      </div>
    );
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          await api("inquiries", {
            ...Object.fromEntries(new FormData(e.currentTarget)),
            listingId: listing._id,
          });
          setSent(true);
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <label className="field">
        Your name
        <input
          name="name"
          required
          minLength={2}
          maxLength={80}
          defaultValue={user?.name}
          placeholder="How should we call you?"
        />
      </label>
      <label className="field">
        Email address
        <input
          name="email"
          type="email"
          required
          defaultValue={user?.email}
          placeholder="you@example.com"
        />
      </label>
      <label className="field">
        Say hello
        <textarea
          name="message"
          required
          minLength={20}
          maxLength={2000}
          placeholder="Tell the owner a little about what you’re looking for…"
        />
      </label>
      <label className="honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <button className="button button-dark full-width" disabled={busy}>
        <Send size={15} />
        {busy ? "Sending…" : "Send an inquiry"}
      </button>
      <p
        style={{
          fontSize: 9,
          color: "var(--muted)",
          textAlign: "center",
          marginTop: 12,
        }}
      >
        No payment needed. Just a conversation to get started.
      </p>
    </form>
  );
}
export function ReportListing({ listing }: { listing: PublicListing }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { notify } = useApp();
  return (
    <>
      <button
        className="text-link"
        style={{ fontSize: 10, color: "var(--muted)" }}
        onClick={() =>
          listing.demo
            ? notify(
                "This is an illustrative sample. Reports are enabled for real listings.",
              )
            : setOpen(true)
        }
      >
        <Flag size={13} /> Something not quite right? Report this place
      </button>
      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-heading">
              <h2 id="report-title">Help keep Ceylon safe.</h2>
              <button
                autoFocus
                className="icon-button"
                aria-label="Close report"
                onClick={() => setOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                  await api("reports", {
                    ...Object.fromEntries(new FormData(e.currentTarget)),
                    listingId: listing._id,
                  });
                  setOpen(false);
                  notify("Thank you. Your report is with our moderation team.");
                } catch (e) {
                  notify((e as Error).message, true);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label className="field">
                What’s the problem?
                <select name="reason">
                  {[
                    "Scam",
                    "Incorrect information",
                    "Duplicate",
                    "Wrong location",
                    "Inappropriate content",
                    "No longer available",
                  ].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Anything else we should know?
                <textarea name="details" maxLength={1000} />
              </label>
              <button className="button button-dark" disabled={busy}>
                {busy ? "Submitting…" : "Submit report"}
              </button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
