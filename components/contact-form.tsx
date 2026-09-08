"use client";
import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { api } from "./providers";
export function ContactForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  if (sent)
    return (
      <div className="form-success">
        <CheckCircle2 size={25} />
        <h2 style={{ marginTop: 15 }}>A conversation has begun.</h2>
        <p>
          Your message has been saved for the Ceylon team. Thank you for getting
          in touch.
        </p>
      </div>
    );
  return (
    <form
      className="form-panel"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          await api(
            "contact",
            Object.fromEntries(new FormData(e.currentTarget)),
          );
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
          placeholder="How should we call you?"
        />
      </label>
      <label className="field">
        Email address
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
        />
      </label>
      <label className="field">
        What’s on your mind?
        <textarea
          name="message"
          required
          minLength={20}
          maxLength={2000}
          placeholder="A question, a little feedback, or something we can help with…"
        />
      </label>
      <label className="honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <button className="button button-dark" disabled={busy}>
        {busy ? "Sending your note…" : "Send a little hello"}
        <ArrowRight size={15} />
      </button>
    </form>
  );
}
