import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
export const metadata = {
  title: "Welcome back",
  robots: { index: false, follow: false },
};
export default function Login() {
  return (
    <Suspense
      fallback={<div className="loading-shell">Getting your corner ready…</div>}
    >
      <AuthForm />
    </Suspense>
  );
}
