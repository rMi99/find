"use client";
import Link from "@/components/site-link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="container" style={{ padding: "70px 0" }}>
      <div className="empty-state">
        <h1 className="page-title">A little pause along the way.</h1>
        <p>We couldn’t load this page. Please try again in a moment.</p>
        <button className="button button-dark" onClick={reset}>
          Try again
        </button>
        <Link href="/">Head back home</Link>
      </div>
    </main>
  );
}
