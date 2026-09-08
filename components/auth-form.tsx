"use client";
import Image from "next/image";
import Link from "@/components/site-link";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowRight, Compass, Mail, ShieldCheck } from "lucide-react";
import { api, useApp } from "./providers";
import type { SafeUser } from "@/lib/types";
import { isAdmin } from "@/lib/types";
type GoogleWindow = Window & {
  google?: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string;
          callback: (data: { credential: string }) => void;
        }) => void;
        renderButton: (
          el: HTMLElement,
          options: { theme: string; size: string; width: number },
        ) => void;
        prompt: () => void;
      };
    };
  };
};
export function AuthForm({ register = false }: { register?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const { refreshUser, notify } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(false);
  const [verification, setVerification] = useState("");
  const googleRef = useRef<HTMLDivElement>(null);
  async function finish(user: SafeUser) {
    await refreshUser();
    const next = params.get("next");
    router.push(
      next && next.startsWith("/") && !next.startsWith("//")
        ? next
        : isAdmin(user.role)
          ? "/admin"
          : "/dashboard",
    );
    router.refresh();
  }
  async function googleLogin(credential: string) {
    setBusy(true);
    try {
      const result = await api<{ user: SafeUser }>("auth/google", {
        credential,
      });
      await finish(result.user);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="container">
      <div className="auth-layout">
        <div className="auth-visual">
          <Image
            src="/images/mirissa-hero.webp"
            alt="A tropical coastline, your next place to explore"
            fill
            sizes="50vw"
          />
          <div>
            <Compass size={31} strokeWidth={1.3} style={{ marginBottom: 24 }} />
            <h2>
              Good places.
              <br />
              <em>New possibilities.</em>
            </h2>
            <p>
              A home. A hideaway. A day to remember.
              <br />
              Your next chapter is waiting for you.
            </p>
          </div>
        </div>
        <div className="auth-form">
          <span className="eyebrow">YOUR LITTLE CORNER OF CEYLON</span>
          <h1>
            {created
              ? "You’re right at home."
              : register
                ? "Make yourself at home."
                : "Lovely to see you again."}
          </h1>
          <p>
            {created
              ? "One small step before sharing your place."
              : register
                ? "Create an account. Find a place. Start something good."
                : "Log in to pick up where you left off."}
          </p>
          {created ? (
            <>
              <div className="form-success">
                <Mail size={21} />
                <p>
                  Verify your email before an administrator can approve your
                  listings.
                </p>
                {verification ? (
                  <>
                    <p>Local development: email delivery is disabled.</p>
                    <Link href={verification}>Open your verification link</Link>
                  </>
                ) : (
                  <p>Check your inbox for your verification link.</p>
                )}
              </div>
              <Link
                href="/dashboard"
                className="button button-dark full-width"
                style={{ marginTop: 20 }}
              >
                Go to your dashboard <ArrowRight size={15} />
              </Link>
            </>
          ) : (
            <>
              {error && (
                <div className="form-error" role="alert">
                  {error}
                </div>
              )}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  setError("");
                  try {
                    const data = await api<{
                      user: SafeUser;
                      verificationUrl?: string;
                    }>(
                      `auth/${register ? "register" : "login"}`,
                      Object.fromEntries(new FormData(e.currentTarget)),
                    );
                    if (register) {
                      await refreshUser();
                      setCreated(true);
                      setVerification(data.verificationUrl || "");
                    } else await finish(data.user);
                  } catch (e) {
                    setError((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {register && (
                  <label className="field">
                    Your name
                    <input
                      name="name"
                      autoComplete="name"
                      placeholder="Your first and last name"
                      required
                      minLength={2}
                      maxLength={80}
                    />
                  </label>
                )}
                <label className="field">
                  Email address
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                  />
                </label>
                <label className="field">
                  Password
                  <input
                    name="password"
                    type="password"
                    autoComplete={
                      register ? "new-password" : "current-password"
                    }
                    placeholder={
                      register ? "At least 10 characters" : "Your password"
                    }
                    required
                    minLength={register ? 10 : 1}
                    maxLength={128}
                  />
                  {register && (
                    <small>
                      Use a unique password with at least 10 characters.
                    </small>
                  )}
                </label>
                <label className="honeypot" aria-hidden="true">
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
                {register && (
                  <label className="check-field consent">
                    <input type="checkbox" required />
                    <span>
                      I agree to Ceylon’s{" "}
                      <Link href="/policies/terms">terms</Link> and{" "}
                      <Link href="/policies/privacy">privacy policy</Link>.
                    </span>
                  </label>
                )}
                <button
                  className="button button-dark full-width"
                  disabled={busy}
                  style={{ marginTop: 8 }}
                >
                  {busy
                    ? "One moment…"
                    : register
                      ? "Create my account"
                      : "Welcome back"}
                  <ArrowRight size={16} />
                </button>
              </form>
              {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                <>
                  <div className="auth-divider">or, keep it simple</div>
                  <div ref={googleRef} />
                  <Script
                    src="https://accounts.google.com/gsi/client"
                    onReady={() => {
                      const google = (window as GoogleWindow).google;
                      if (!google || !googleRef.current) return;
                      google.accounts.id.initialize({
                        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
                        callback: (response) =>
                          void googleLogin(response.credential),
                      });
                      google.accounts.id.renderButton(googleRef.current, {
                        theme: "outline",
                        size: "large",
                        width: 320,
                      });
                      google.accounts.id.prompt();
                    }}
                    onError={() =>
                      notify(
                        "Google sign-in could not load. Please use email sign-in.",
                        true,
                      )
                    }
                  />
                </>
              )}
              <p className="auth-switch">
                {register
                  ? "Already found your corner?"
                  : "New to the neighborhood?"}{" "}
                <Link href={register ? "/login" : "/register"}>
                  {register ? "Log in" : "Join Ceylon"}
                </Link>
              </p>
              <p className="auth-note">
                Just looking to share a place?
                <br />
                <Link href="/submit">You can submit a listing as a guest.</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export function VerificationForm() {
  const params = useSearchParams();
  const { refreshUser } = useApp();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  return (
    <div
      className="container"
      style={{ maxWidth: 600, padding: "55px 0 80px" }}
    >
      <div className="form-panel">
        <ShieldCheck size={35} style={{ marginBottom: 20 }} />
        <h1 className="page-title" style={{ fontSize: 29 }}>
          {done ? "A little more peace of mind." : "Let’s verify your email."}
        </h1>
        <p style={{ marginTop: 15 }}>
          {done
            ? "Your email is verified. Submitted listings still need approval before they become public."
            : "Confirm your email to prepare your listing for review."}
        </p>
        {error && <div className="form-error">{error}</div>}
        {done ? (
          <Link href="/dashboard" className="button button-dark">
            Go to dashboard <ArrowRight size={15} />
          </Link>
        ) : (
          <button
            className="button button-dark"
            disabled={busy || !params.get("token")}
            onClick={async () => {
              setBusy(true);
              try {
                await api("verify", { token: params.get("token") });
                await refreshUser();
                setDone(true);
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Verifying…" : "Verify my email"}
            <ArrowRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
