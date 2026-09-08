import { Suspense } from "react";
import { VerificationForm } from "@/components/auth-form";
export const metadata = {
  title: "Verify your email",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default function Verify() {
  return (
    <Suspense fallback={<div className="loading-shell">Loading…</div>}>
      <VerificationForm />
    </Suspense>
  );
}
