import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
export const metadata = {
  title: "Join Ceylon",
  robots: { index: false, follow: false },
};
export default function Register() {
  return (
    <Suspense
      fallback={<div className="loading-shell">Getting your corner ready…</div>}
    >
      <AuthForm register />
    </Suspense>
  );
}
