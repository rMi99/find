"use client";
import { useFullNavigation } from "./site-link";
import { useState } from "react";
export function PrivacySettings() {
  const [message, setMessage] = useState("");
  const enabled = useFullNavigation();
  if (!enabled) return null;
  return (
    <>
      <button
        type="button"
        className="text-link"
        onClick={() => {
          const w = window as Window & {
            googlefc?: { showRevocationMessage?: () => void };
          };
          if (w.googlefc?.showRevocationMessage) {
            w.googlefc.showRevocationMessage();
            setMessage("");
          } else
            setMessage(
              "Advertising preferences are available on pages where Google privacy messages apply. No preference control is available on this page.",
            );
        }}
      >
        Advertising privacy settings
      </button>
      {message && <p role="status">{message}</p>}
    </>
  );
}
