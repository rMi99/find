import { AutoAds } from "@/components/auto-ads";
import { StructuredData, breadcrumbData } from "@/components/structured-data";
import { listingPriceUnit } from "@/lib/types";
import { BoardingSummary } from "@/components/boarding-fields";
import Link from "@/components/site-link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ChevronRight,
  MapPin,
  BedDouble,
  Bath,
  Users,
  Check,
  ExternalLink,
  BadgeCheck,
  ShieldCheck,
} from "lucide-react";
import { getListing, searchListings, canIndex } from "@/lib/listings";
import { publicListing, priceLabel, slugify } from "@/lib/types";
import {
  Gallery,
  DetailActions,
  InquiryForm,
  ReportListing,
} from "@/components/detail-client";
import { ListingCard } from "@/components/listing-card";
import { SectionHeading } from "@/components/shell";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const l = await getListing((await params).slug);
  if (!l) notFound();
  const title = l.seo?.title || `${l.title} · ${l.category} in ${l.city}`;
  const description = l.seo?.description || l.description.slice(0, 155);
  return {
    title,
    description,
    alternates: { canonical: `/places/${l.slug}` },
    openGraph: {
      title,
      description,
      url: `/places/${l.slug}`,
      images: l.images.slice(0, 1),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: l.images.slice(0, 1),
    },
    robots: { index: canIndex(l), follow: true },
  };
}
export default async function ListingDetail({ params }: Props) {
  const raw = await getListing((await params).slug);
  if (!raw) notFound();
  const l = publicListing(raw);
  const similar = (await searchListings({ category: l.category })).listings
    .filter((p) => p._id !== l._id)
    .slice(0, 4);
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: l.title,
    description: l.description,
    image: l.images.map((src) => `${base}${src}`),
    url: `${base}/places/${l.slug}`,
    offers: {
      "@type": "Offer",
      price: l.price,
      priceCurrency: "LKR",
      availability: l.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      description: `Price per ${listingPriceUnit(l)}`,
    },
  };
  return (
    <main className="container">
      <AutoAds eligible={canIndex(raw)} />
      {canIndex(raw) && (
        <StructuredData
          value={breadcrumbData(base, [
            { name: "Home", path: "/" },
            {
              name: `${l.category} in Sri Lanka`,
              path: `/category/${slugify(l.category)}`,
            },
            { name: l.title, path: `/places/${l.slug}` },
          ])}
        />
      )}
      {canIndex(raw) && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <div className="page-top">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight size={12} />
          <Link href="/explore">Explore</Link>
          <ChevronRight size={12} />
          <Link href={`/city/${slugify(l.city)}`}>{l.city}</Link>
          <ChevronRight size={12} />
          <span>{l.title}</span>
        </div>
        <div className="detail-title-row">
          <div>
            <span className="eyebrow">
              {l.category.toUpperCase()} · {l.purpose.toUpperCase()}
            </span>
            <h1>{l.title}</h1>
            <p style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <MapPin size={14} />
              {l.area ? `${l.area}, ` : ""}
              {l.city}, {l.district}, {l.province} Province{" "}
              {l.verified && <BadgeCheck size={17} />}
            </p>
          </div>
          <DetailActions listing={l} />
        </div>
      </div>
      <Gallery listing={l} />
      {l.demo && (
        <div className="preview-notice">
          <ShieldCheck size={17} /> You’re viewing a sample listing. Photos,
          price and facilities are illustrative. No accommodation or property is
          being offered.
        </div>
      )}
      <div className="detail-layout">
        <div>
          <section className="detail-section">
            <h2>A little room for your next chapter.</h2>
            <div className="detail-facts">
              <span>
                <BedDouble size={19} />
                {l.bedrooms} bedrooms
              </span>
              <span>
                <Bath size={19} />
                {l.bathrooms} bathrooms
              </span>
              <span>
                <Users size={19} />
                {l.boarding
                  ? `${l.boarding.capacity} people per room`
                  : `Up to ${l.guests} guests`}
              </span>
            </div>
          </section>
          {l.boarding && <BoardingSummary value={l.boarding} />}
          <section className="detail-section">
            <h2>Get to know the place</h2>
            <p>{l.description}</p>
          </section>
          <section className="detail-section">
            <h2>The little things that make it home</h2>
            <div className="amenity-grid">
              {l.amenities.map((a) => (
                <span key={a}>
                  <Check size={16} />
                  {a}
                </span>
              ))}
            </div>
          </section>
          <section className="detail-section">
            <h2>A good place to be</h2>
            <div className="map-card">
              <div>
                <h3>{l.city}, Sri Lanka</h3>
                <p>
                  {l.area ||
                    "Ask the owner for the exact address before visiting."}
                </p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${l.city} Sri Lanka`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-outline button-small"
              >
                Explore the area <ExternalLink size={12} />
              </a>
            </div>
          </section>
          <section className="detail-section">
            <h2>Make yourself at home, thoughtfully.</h2>
            <p>
              Confirm your dates, the total price and any house rules directly
              with the owner. Visit properties before paying a long-term rental
              deposit. Ceylon connects people with places and does not process
              bookings or payments.
            </p>
            <Link
              className="text-link"
              href="/policies/safety"
              style={{ marginTop: 15 }}
            >
              A few tips for a safe search <ChevronRight size={13} />
            </Link>
          </section>
          <ReportListing listing={l} />
        </div>
        <aside className="contact-card">
          <div className="detail-price">
            Rs. {priceLabel(l.price)} <span>/ {listingPriceUnit(l)}</span>
          </div>
          <span
            className={`availability-tag ${!l.available ? "unavailable" : ""}`}
          >
            <span className="green-dot" />
            {l.available
              ? l.availableFrom
                ? `Available from ${l.availableFrom}`
                : "Available · confirm dates with the owner"
              : "Currently unavailable"}
          </span>
          {l.blockedDates.length > 0 && (
            <p>Unavailable dates: {l.blockedDates.join(", ")}</p>
          )}
          <h3>Say hello to {l.contactName}</h3>
          <InquiryForm listing={l} />
        </aside>
      </div>
      {similar.length > 0 && (
        <section style={{ marginBottom: 60 }}>
          <SectionHeading
            title="A few more places you might love."
            href={`/category/${slugify(l.category)}`}
          />
          <div className="listing-grid">
            {similar.map((p) => (
              <ListingCard key={p._id} listing={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
