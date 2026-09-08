import { pageMetadata } from "@/lib/metadata";
import Link from "@/components/site-link";
import { ArrowRight, Compass } from "lucide-react";
export const metadata = pageMetadata(
  "About Ceylon: Sri Lanka property & stay discovery",
  "Learn how Ceylon connects people with homes, boarding houses, holiday stays and day-out places in Sri Lanka, with contact verification and listing review.",
  "/about",
);
export default function About() {
  return (
    <main className="container">
      <div className="page-top">
        <span className="eyebrow">LOCAL AT HEART</span>
        <h1>One island. So many ways to belong.</h1>
        <p>
          A home, a hideaway, a place to gather. We’re making room for the next
          chapter.
        </p>
      </div>
      <div
        className="escape-banner"
        style={{ marginTop: 10, gridTemplateColumns: "1fr" }}
      >
        <div className="escape-copy">
          <Compass size={35} strokeWidth={1.4} />
          <h2>
            Good places bring
            <br />
            <em>good possibilities.</em>
          </h2>
          <p>
            Ceylon brings property, accommodation and day-out discovery into one
            thoughtful space.
            <br />
            Find a place that fits your life, or help someone discover the place
            you have to share.
          </p>
          <Link href="/explore" className="button button-cream">
            Find your somewhere <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      <div className="prose">
        <h2>A useful place to start</h2>
        <p>
          Search by location, property type and purpose. Compare prices and
          facilities. Save the places that catch your eye, then start a
          conversation with an owner when you are ready.
        </p>
        <h2>Thoughtful by design</h2>
        <p>
          Every submitted listing stays private until the contact email is
          verified and an administrator approves it. Owners can update
          availability, and important changes return to review. We believe
          useful details and clear expectations make better connections.
        </p>
        <h2>A new chapter, still taking shape</h2>
        <p>
          This is the development edition of Ceylon. Sample properties are
          marked, cannot receive inquiries and are excluded from search
          indexing. The live operator details, service providers and launch
          policies must be finalized before public launch.
        </p>
        <Link href="/contact">Get in touch with the team</Link>
      </div>
    </main>
  );
}
