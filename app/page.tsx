import { AutoAds } from "@/components/auto-ads";
import { canIndexDiscovery } from "@/lib/seo";
import { pageMetadata } from "@/lib/metadata";
import Image from "next/image";
import Link from "@/components/site-link";
import {
  ArrowUpRight,
  ShieldCheck,
  HeartHandshake,
  Compass,
  Plus,
  MapPin,
  MoveUpRight,
} from "lucide-react";
import { HeroSearch, FeaturedPlaces } from "@/components/home-client";
import { SectionHeading } from "@/components/shell";
import { searchListings } from "@/lib/listings";
import { locations } from "@/lib/catalog";
import { slugify } from "@/lib/types";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Homes, boarding houses & stays in Sri Lanka",
  "Find homes to rent, boarding rooms for women, men and couples, holiday stays and day-out places across Sri Lanka. Compare prices and contact owners.",
  "/",
);
export default async function Home() {
  const data = await searchListings();
  const adEligible = !data.preview && (await canIndexDiscovery({}));
  return (
    <main>
      <AutoAds eligible={adEligible} />
      <div className="container">
        <section className="hero">
          <Image
            className="hero-photo"
            src="/images/mirissa-hero.webp"
            alt="Palm-fringed tropical coastline and the turquoise Indian Ocean"
            fill
            preload
            sizes="100vw"
          />
          <div className="hero-shade" />
          <div className="hero-content">
            <span className="hero-eyebrow">
              <span /> YOUR ISLAND. YOUR POSSIBILITIES.
            </span>
            <h1>
              Find your
              <br />
              kind of <em>somewhere.</em>
            </h1>
            <p>
              From a place to call home to a little escape.
              <br />
              Discover spaces, stays and experiences across Sri Lanka.
            </p>
            <div className="hero-bottom-note">
              <span className="mini-compass">
                <Compass size={21} />
              </span>
              <span>One island. So many ways to belong.</span>
            </div>
          </div>
          <Link href="/city/mirissa" className="hero-location">
            <MapPin size={15} />
            <span>A little inspiration from the coast</span>
            <ArrowUpRight size={16} />
          </Link>
          <div className="hero-coordinate">7.8731° N &nbsp; 80.7718° E</div>
          <HeroSearch />
        </section>
        <FeaturedPlaces listings={data.listings} />
        <section className="destinations-section">
          <SectionHeading
            eyebrow="FOLLOW YOUR CURIOSITY"
            title="Where will your next chapter be?"
            subtitle="Coastlines, city lights or somewhere a little quieter."
            href="/explore"
            linkText="Explore the island"
          />
          <div className="destination-grid">
            {locations.slice(0, 4).map((l, i) => (
              <Link
                className="destination-card"
                key={l.city}
                href={`/city/${slugify(l.city)}`}
              >
                <Image
                  src={l.image}
                  alt={`Landscape inspiration for ${l.city}`}
                  fill
                  sizes="(max-width: 600px) 45vw, 25vw"
                />
                <div className="destination-shade" />
                <span className="destination-number">0{i + 1}</span>
                <div>
                  <h3>{l.city}</h3>
                  <p>{l.subtitle}</p>
                </div>
                <span className="destination-arrow">
                  <ArrowUpRight size={20} />
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section className="escape-banner">
          <div className="escape-copy">
            <span className="eyebrow">LESS SCROLLING. MORE LIVING.</span>
            <h2>
              A change of place.
              <br />
              <em>A change of pace.</em>
            </h2>
            <p>
              A poolside afternoon. A cabin in the hills.
              <br />
              Your next favorite memory could be closer than you think.
            </p>
            <Link
              className="button button-cream"
              href="/explore?purpose=Day+out"
            >
              Find your little escape <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="escape-photo">
            <Image
              src="/images/villa.webp"
              alt="Sunlit tropical villa with a swimming pool"
              fill
              sizes="(max-width: 700px) 100vw, 50vw"
            />
            <span className="photo-note">
              OUT OF OFFICE. INTO THE MOMENT. <MoveUpRight size={17} />
            </span>
          </div>
        </section>
        <section className="trust-section">
          <div>
            <span className="trust-icon">
              <ShieldCheck size={27} strokeWidth={1.5} />
            </span>
            <h3>A little more peace of mind</h3>
            <p>
              Every submitted place goes through our review process before it
              reaches you.
            </p>
          </div>
          <div>
            <span className="trust-icon">
              <HeartHandshake size={27} strokeWidth={1.5} />
            </span>
            <h3>Real connections, made simple</h3>
            <p>
              Connect directly with hosts and owners. Ask questions. Find your
              right fit.
            </p>
          </div>
          <div>
            <span className="trust-icon">
              <Compass size={27} strokeWidth={1.5} />
            </span>
            <h3>Local at heart</h3>
            <p>
              Built around the places, people and possibilities that make Sri
              Lanka special.
            </p>
          </div>
        </section>
        <section className="host-banner">
          <span className="host-illustration">
            <HouseOutline />
          </span>
          <div>
            <span className="eyebrow">GOT A PLACE WITH POTENTIAL?</span>
            <h2>Your space. Someone’s next chapter.</h2>
            <p>
              From a spare room to a dream villa, help the right people find
              you.
            </p>
          </div>
          <Link className="button button-dark" href="/submit">
            <Plus size={18} /> List your place for free{" "}
            <ArrowUpRight size={17} />
          </Link>
        </section>
        <section className="popular-searches">
          <h3>A few good places to start</h3>
          <div>
            {[
              ["Villas in Galle", "/villas-for-rent/galle"],
              ["Rooms in Ja-Ela", "/rooms-for-rent/ja-ela"],
              ["Cabanas in Ella", "/cabanas/ella"],
              ["Hotels in Kandy", "/hotels/kandy"],
              ["Family day outs in Galle", "/family-day-out/galle"],
              [
                "Apartments in Colombo",
                "/explore?category=Apartment&city=Colombo",
              ],
            ].map(([label, href]) => (
              <Link key={href} href={href}>
                {label}
                <ArrowUpRight size={13} />
              </Link>
            ))}
          </div>
        </section>
      </div>
      <section className="container discovery-editorial">
        <span className="eyebrow">A PLACE FOR YOUR EVERYDAY</span>
        <h2>Find a boarding room that fits your life.</h2>
        <p>
          On your own, with a friend or as a couple. Explore private and shared
          bodim rooms, compare monthly prices and find the number of spaces you
          need.
        </p>
        <div className="discovery-links">
          <Link href="/boarding-houses">All boarding houses</Link>
          <Link href="/boarding-for-women">For women</Link>
          <Link href="/boarding-for-men">For men</Link>
          <Link href="/boarding-for-couples">For couples</Link>
          <Link href="/guides/boarding-house-checklist">
            Your boarding checklist
          </Link>
        </div>
      </section>
    </main>
  );
}
function HouseOutline() {
  return (
    <svg
      width="76"
      height="76"
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M13 38 40 16l27 22M20 33v32h40V33M33 65V46h14v19"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 66h64M59 12v13M53 18h12M15 13v10M10 18h10"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
