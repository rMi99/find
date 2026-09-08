import { Suspense } from "react";
import { Workspace } from "@/components/workspace";
export const metadata = {
  title: "Admin workspace",
  robots: { index: false, follow: false },
};
export default function Admin() {
  return (
    <Suspense
      fallback={
        <div className="loading-shell">Getting your workspace ready…</div>
      }
    >
      <Workspace admin />
    </Suspense>
  );
}
