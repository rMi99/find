import { Suspense } from "react";
import { Workspace } from "@/components/workspace";
export const metadata = {
  title: "Your personal space",
  robots: { index: false, follow: false },
};
export default function Dashboard() {
  return (
    <Suspense
      fallback={<div className="loading-shell">Getting your corner ready…</div>}
    >
      <Workspace />
    </Suspense>
  );
}
