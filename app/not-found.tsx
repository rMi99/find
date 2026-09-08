import Link from "@/components/site-link";
import { Compass, ArrowRight } from "lucide-react";
export default function NotFound() {
  return (
    <main className="container" style={{ padding: "70px 0 100px" }}>
      <div className="empty-state">
        <Compass size={50} strokeWidth={1.2} />
        <span className="eyebrow">A LITTLE OFF THE BEATEN PATH · 404</span>
        <h1 className="page-title">This place isn’t here.</h1>
        <p>
          It may have moved, become unavailable, or still be waiting for review.
          There are plenty of other possibilities.
        </p>
        <Link className="button button-dark" href="/explore">
          Find a new direction <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}
