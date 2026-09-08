"use client";
import Link from "@/components/site-link";
import Image from "next/image";
import { useState, useRef, useSyncExternalStore } from "react";
import {
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  X,
  ShieldCheck,
  CheckCircle2,
  Mail,
  ChevronRight,
} from "lucide-react";
import { BoardingFields, BoardingSummary } from "./boarding-fields";
import {
  defaultBoarding,
  type Boarding,
  categoryNames,
  purposes,
  amenities,
} from "@/lib/types";
import { provinces } from "@/lib/catalog";
import { useApp, api } from "./providers";
type Draft = {
  boarding: Boarding;
  title: string;
  description: string;
  purpose: string;
  category: string;
  city: string;
  area: string;
  province: string;
  district: string;
  price: string;
  unit: string;
  bedrooms: string;
  bathrooms: string;
  guests: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  available: boolean;
  availableFrom: string;
  amenities: string[];
  images: string[];
};
const initial: Draft = {
  boarding: defaultBoarding,
  title: "",
  description: "",
  purpose: "Stay",
  category: "Villa",
  city: "",
  area: "",
  province: "Southern",
  district: "Galle",
  price: "",
  unit: "night",
  bedrooms: "1",
  bathrooms: "1",
  guests: "2",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  available: true,
  availableFrom: "",
  amenities: [],
  images: [],
};
const subscribe = () => () => {};
export function SubmissionForm() {
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return ready ? (
    <SubmissionClient />
  ) : (
    <div className="loading-shell">Getting your listing form ready…</div>
  );
}
function SubmissionClient() {
  const { user, notify } = useApp();
  const [draft, setDraft] = useState<Draft>(() => {
    try {
      const raw = sessionStorage.getItem("ceylon_draft");
      return raw ? { ...initial, ...JSON.parse(raw) } : initial;
    } catch {
      return initial;
    }
  });
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    message: string;
    verificationUrl?: string;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  function change<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((previous) => ({ ...previous, [key]: value }));
  }
  function saveDraft() {
    sessionStorage.setItem("ceylon_draft", JSON.stringify(draft));
    notify("Draft saved in this browser tab. You can come back to it.");
  }
  async function upload(files: FileList | File[]) {
    if (uploading) return;
    const selected = Array.from(files);
    if (selected.length + draft.images.length > 10) {
      setError("You can add up to 10 photos.");
      return;
    }
    setError("");
    setUploading(true);
    let added = [...draft.images];
    try {
      for (const [index, file] of selected.entries()) {
        if (
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size > 8 * 1024 * 1024
        )
          throw new Error("Use JPEG, PNG or WebP photos smaller than 8 MB.");
        const body = new FormData();
        body.append("file", file);
        const data = await new Promise<{ url: string }>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/uploads");
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable)
              setProgress(
                Math.round(
                  ((index + e.loaded / e.total) / selected.length) * 100,
                ),
              );
          };
          xhr.onload = () => {
            try {
              const result = JSON.parse(xhr.responseText);
              if (xhr.status >= 200 && xhr.status < 300) resolve(result);
              else reject(new Error(result.error || "Upload failed."));
            } catch {
              reject(new Error("Upload failed. Please try again."));
            }
          };
          xhr.onerror = () =>
            reject(new Error("Connection interrupted. Please try again."));
          xhr.send(body);
        });
        if (!added.includes(data.url)) added = [...added, data.url];
        change("images", added);
      }
      notify("Photos uploaded and optimized. Looking good!");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }
  function next() {
    if (!formRef.current?.reportValidity()) return;
    if (step === 1 && !draft.images.length) {
      setError("Add at least one photo so people can get to know your place.");
      return;
    }
    setError("");
    setStep(step + 1);
    window.scrollTo({ top: 120, behavior: "smooth" });
  }
  if (result)
    return (
      <div
        className="container"
        style={{ maxWidth: 740, padding: "50px 0 80px" }}
      >
        <div className="form-panel">
          <CheckCircle2
            size={42}
            style={{ color: "var(--green)", marginBottom: 25 }}
          />
          <span className="eyebrow">A GOOD PLACE STARTS WITH YOU</span>
          <h1 className="page-title">You’ve opened a new door.</h1>
          <p style={{ marginTop: 15 }}>{result.message}</p>
          <div className="form-success">
            <strong>
              Submitted → Email verified → Admin review → Published
            </strong>
            <p>Your listing is private until an administrator approves it.</p>
            {result.verificationUrl && (
              <>
                <p>Local development: email delivery is disabled.</p>
                <Link href={result.verificationUrl}>
                  Open your email verification link
                </Link>
              </>
            )}
          </div>
          <Link
            href={user ? "/dashboard" : "/explore"}
            className="button button-dark"
            style={{ marginTop: 25 }}
          >
            {user ? "Go to my dashboard" : "Keep exploring"}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  return (
    <main className="container">
      <div className="page-top">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight size={12} />
          <span>List your place</span>
        </div>
        <span className="eyebrow">YOUR SPACE. SOMEONE’S NEXT CHAPTER.</span>
        <h1>A good place deserves to be found.</h1>
        <p>
          Tell us a little about your space. We’ll help the right people find
          it.
        </p>
      </div>
      <div className="submit-layout">
        <div className="form-panel">
          <div className="steps">
            {["The basics", "Make it yours", "Ready for review"].map(
              (label, i) => (
                <div
                  key={label}
                  className={`step ${step >= i ? "active" : ""}`}
                >
                  <span>{step > i ? <CheckCircle2 size={13} /> : i + 1}</span>
                  {label}
                  {i < 2 && <ChevronRight size={11} />}
                </div>
              ),
            )}
          </div>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <form
            ref={formRef}
            onSubmit={async (e) => {
              e.preventDefault();
              if (step < 2) {
                next();
                return;
              }
              setBusy(true);
              setError("");
              try {
                const data = await api<{
                  message: string;
                  verificationUrl?: string;
                }>("listings", {
                  ...draft,
                  boarding:
                    draft.category === "Boarding" ? draft.boarding : undefined,
                  guests:
                    draft.category === "Boarding"
                      ? draft.boarding.capacity
                      : draft.guests,
                  contactName: draft.contactName || user?.name,
                  contactEmail: user?.email || draft.contactEmail,
                  blockedDates: [],
                  website: "",
                });
                setResult(data);
                sessionStorage.removeItem("ceylon_draft");
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {step === 0 && (
              <>
                <h2>Every place has a story.</h2>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginBottom: 20,
                  }}
                >
                  Let’s start with the essentials.
                </p>
                <label className="field">What’s your place for?</label>
                <div className="choice-group">
                  {purposes.map((p) => (
                    <button
                      type="button"
                      key={p}
                      className={draft.purpose === p ? "selected" : ""}
                      onClick={() => {
                        if (draft.category === "Boarding" && p !== "Rent")
                          change("category", "Room");
                        change("purpose", p);
                        change(
                          "unit",
                          p === "Rent"
                            ? "month"
                            : p === "Buy"
                              ? "total"
                              : p === "Day out"
                                ? "person"
                                : "night",
                        );
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <div className="field-row">
                  <label className="field">
                    Property or venue type
                    <select
                      value={draft.category}
                      onChange={(e) => {
                        change("category", e.target.value);
                        if (e.target.value === "Boarding") {
                          change("purpose", "Rent");
                          change("unit", "month");
                        }
                      }}
                    >
                      {categoryNames.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    Listing title
                    <input
                      required
                      minLength={10}
                      maxLength={100}
                      value={draft.title}
                      onChange={(e) => change("title", e.target.value)}
                      placeholder="A little name. A little character."
                    />
                  </label>
                </div>
                <label className="field">
                  Tell its story
                  <textarea
                    required
                    minLength={100}
                    maxLength={5000}
                    value={draft.description}
                    onChange={(e) => change("description", e.target.value)}
                    placeholder="What makes your place special? Share the details, nearby highlights and anything visitors should know."
                  />
                  <small>
                    {draft.description.length} / 5000 characters · At least 100
                    characters
                  </small>
                </label>
                <div className="form-section">
                  <h3>A good place to be</h3>
                  <div className="field-row">
                    <label className="field">
                      Province
                      <select
                        value={draft.province}
                        onChange={(e) => {
                          change("province", e.target.value);
                          change("district", provinces[e.target.value][0]);
                        }}
                      >
                        {Object.keys(provinces).map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      District
                      <select
                        value={draft.district}
                        onChange={(e) => change("district", e.target.value)}
                      >
                        {provinces[draft.province].map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="field-row">
                    <label className="field">
                      City or town
                      <input
                        required
                        minLength={2}
                        maxLength={80}
                        value={draft.city}
                        onChange={(e) => change("city", e.target.value)}
                        placeholder="e.g. Galle"
                      />
                    </label>
                    <label className="field">
                      Area or nearby landmark
                      <input
                        maxLength={120}
                        value={draft.area}
                        onChange={(e) => change("area", e.target.value)}
                        placeholder="A little more specific (optional)"
                      />
                    </label>
                  </div>
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <h2>The details make the difference.</h2>
                <div className="field-row" style={{ marginTop: 25 }}>
                  <label className="field">
                    Price (LKR)
                    <input
                      type="number"
                      required
                      min="1"
                      max="100000000000"
                      value={draft.price}
                      onChange={(e) => change("price", e.target.value)}
                      placeholder="Your price in rupees"
                    />
                  </label>
                  <label className="field">
                    Pricing period
                    <select
                      disabled={draft.category === "Boarding"}
                      value={draft.unit}
                      onChange={(e) => change("unit", e.target.value)}
                    >
                      {["night", "month", "person", "day", "total"].map((u) => (
                        <option key={u}>{u}</option>
                      ))}
                    </select>
                  </label>
                </div>
                {draft.category === "Boarding" && (
                  <BoardingFields
                    value={draft.boarding}
                    onChange={(value) => {
                      change("boarding", value);
                      if (value.vacancies === 0) change("available", false);
                    }}
                  />
                )}
                <div className="field-row three">
                  {![
                    "Land",
                    "Commercial",
                    "Day out",
                    "Event venue",
                    "Restaurant",
                    "Service",
                  ].includes(draft.category) && (
                    <>
                      <label className="field">
                        Bedrooms
                        <input
                          type="number"
                          min="0"
                          max="100"
                          required
                          value={draft.bedrooms}
                          onChange={(e) => change("bedrooms", e.target.value)}
                        />
                      </label>
                      <label className="field">
                        Bathrooms
                        <input
                          type="number"
                          min="0"
                          max="100"
                          required
                          value={draft.bathrooms}
                          onChange={(e) => change("bathrooms", e.target.value)}
                        />
                      </label>
                    </>
                  )}
                  <label className="field">
                    {draft.category === "Day out"
                      ? "Group capacity"
                      : "Guest capacity"}
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      required
                      disabled={draft.category === "Boarding"}
                      value={
                        draft.category === "Boarding"
                          ? draft.boarding.capacity
                          : draft.guests
                      }
                      onChange={(e) => change("guests", e.target.value)}
                    />
                  </label>
                </div>
                <label className="field">The little extras</label>
                <div className="choice-group">
                  {amenities.map((a) => (
                    <button
                      type="button"
                      key={a}
                      aria-pressed={draft.amenities.includes(a)}
                      className={draft.amenities.includes(a) ? "selected" : ""}
                      onClick={() =>
                        change(
                          "amenities",
                          draft.amenities.includes(a)
                            ? draft.amenities.filter((v) => v !== a)
                            : [...draft.amenities, a],
                        )
                      }
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <label className="check-field">
                  <input
                    type="checkbox"
                    checked={draft.available}
                    onChange={(e) => change("available", e.target.checked)}
                  />{" "}
                  Currently available
                </label>
                <label className="field">
                  Available from (optional)
                  <input
                    type="date"
                    value={draft.availableFrom}
                    onChange={(e) => change("availableFrom", e.target.value)}
                  />
                </label>
                <div className="form-section">
                  <h3>A picture opens the door.</h3>
                  <div
                    className={`uploader ${dragging ? "is-dragging" : ""}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        fileRef.current?.click();
                      }
                    }}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragging(false);
                      void upload(e.dataTransfer.files);
                    }}
                  >
                    <UploadCloud size={29} />
                    <strong>
                      {uploading
                        ? "Making your photos look their best…"
                        : "Drop your photos here, or browse"}
                    </strong>
                    <p>
                      Up to 10 photos · JPEG, PNG or WebP · 8 MB each
                      <br />
                      At least 600 × 400 pixels. Your first photo is the cover.
                    </p>
                    {uploading && (
                      <div className="upload-progress">
                        <div style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    hidden
                    disabled={uploading}
                    onChange={(e) => {
                      if (e.target.files) void upload(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <div className="upload-previews">
                    {draft.images.map((src, i) => (
                      <div className="upload-preview" key={src}>
                        <Image
                          src={src}
                          alt={`Your property photo ${i + 1}`}
                          fill
                          unoptimized
                        />
                        <button
                          type="button"
                          className="remove-image"
                          aria-label={`Remove photo ${i + 1}`}
                          onClick={() =>
                            change(
                              "images",
                              draft.images.filter((s) => s !== src),
                            )
                          }
                        >
                          <X size={13} />
                        </button>
                        <button
                          type="button"
                          className="primary-image"
                          onClick={() =>
                            change("images", [
                              src,
                              ...draft.images.filter((s) => s !== src),
                            ])
                          }
                        >
                          {i === 0 ? "Cover photo" : "Make cover"}
                        </button>
                        {i > 0 && (
                          <button
                            type="button"
                            className="reorder-image"
                            aria-label={`Move photo ${i + 1} left`}
                            onClick={() => {
                              const values = [...draft.images];
                              [values[i - 1], values[i]] = [
                                values[i],
                                values[i - 1],
                              ];
                              change("images", values);
                            }}
                          >
                            ←
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            {step === 2 && draft.category === "Boarding" && (
              <BoardingSummary value={draft.boarding} />
            )}
            {step === 2 && (
              <>
                <h2>Nearly ready for its next chapter.</h2>
                <div className="review-data">
                  <div>
                    <span>Your place</span>
                    {draft.title}
                  </div>
                  <div>
                    <span>Location</span>
                    {draft.city}, {draft.district}
                  </div>
                  <div>
                    <span>Purpose</span>
                    {draft.purpose} · {draft.category}
                  </div>
                  <div>
                    <span>Price</span>Rs. {Number(draft.price).toLocaleString()}{" "}
                    /{" "}
                    {draft.category === "Boarding"
                      ? `${draft.boarding.priceBasis} / month`
                      : draft.unit}
                  </div>
                  <div>
                    <span>Photos</span>
                    {draft.images.length} uploaded
                  </div>
                  <div>
                    <span>Publication</span>After admin approval
                  </div>
                </div>
                {!user && (
                  <div className="preview-notice">
                    <Mail size={17} />
                    <span>
                      You’re listing as a guest. We’ll send an email
                      verification link.{" "}
                      <Link
                        href="/login"
                        onClick={saveDraft}
                        style={{ textDecoration: "underline" }}
                      >
                        Sign in
                      </Link>{" "}
                      to manage your listings later.
                    </span>
                  </div>
                )}
                <label className="field">
                  Your name
                  <input
                    required
                    minLength={2}
                    maxLength={80}
                    value={draft.contactName || user?.name || ""}
                    onChange={(e) => change("contactName", e.target.value)}
                    placeholder="Who should we say hello to?"
                  />
                </label>
                <div className="field-row">
                  <label className="field">
                    Email address
                    <input
                      type="email"
                      required
                      value={user?.email || draft.contactEmail}
                      readOnly={Boolean(user)}
                      onChange={(e) => change("contactEmail", e.target.value)}
                      placeholder="you@example.com"
                    />
                  </label>
                  <label className="field">
                    Phone number
                    <input
                      type="tel"
                      required
                      pattern="[+0-9 ()-]{9,20}"
                      value={draft.contactPhone}
                      onChange={(e) => change("contactPhone", e.target.value)}
                      placeholder="+94 77 123 4567"
                    />
                  </label>
                </div>
                <label className="check-field consent">
                  <input type="checkbox" required />
                  <span>
                    I have permission to list this property, my information is
                    accurate, and I agree to the{" "}
                    <Link href="/policies/terms">terms</Link> and{" "}
                    <Link href="/policies/moderation">listing policy</Link>.
                  </span>
                </label>
              </>
            )}
            <div className="form-navigation">
              {step > 0 ? (
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => {
                    setStep(step - 1);
                    setError("");
                  }}
                >
                  <ArrowLeft size={15} /> Back
                </button>
              ) : (
                <button
                  type="button"
                  className="button button-outline"
                  onClick={saveDraft}
                >
                  Save draft
                </button>
              )}
              <button
                className="button button-dark"
                disabled={busy || uploading}
              >
                {busy
                  ? "Submitting for review…"
                  : step === 2
                    ? "Submit for review"
                    : "Keep going"}
                <ArrowRight size={15} />
              </button>
            </div>
          </form>
        </div>
        <aside className="submit-aside">
          <ShieldCheck size={29} strokeWidth={1.4} />
          <h3>Good places. Good people.</h3>
          <p>
            We review every submission to help make Ceylon a thoughtful, useful
            place to discover.
          </p>
          <ul>
            <li>Use your own, recent photos</li>
            <li>Keep your description accurate</li>
            <li>Be clear about the total price</li>
            <li>Confirm availability regularly</li>
          </ul>
          <p>
            Your listing stays private until your contact email is verified and
            our team approves it.
          </p>
          <Link
            href="/policies/moderation"
            className="text-link"
            style={{ fontSize: 10, marginTop: 20 }}
          >
            A look at our review process <ArrowRight size={13} />
          </Link>
        </aside>
      </div>
    </main>
  );
}
