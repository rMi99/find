"use client";
import { useState } from "react";
import Link, { useFullNavigation } from "@/components/site-link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  ChevronDown,
  ArrowRight,
  House,
  Palmtree,
  Building2,
  TentTree,
  Hotel,
  BedDouble,
  Sun,
  LandPlot,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import { locations } from "@/lib/catalog";
import type { PublicListing } from "@/lib/types";
import { ListingCard } from "./listing-card";
const categories = [
  { label: "All places", icon: Sparkles, value: "" },
  { label: "Villas", icon: Palmtree, value: "Villa" },
  { label: "Apartments", icon: Building2, value: "Apartment" },
  { label: "Houses", icon: House, value: "House" },
  { label: "Cabanas", icon: TentTree, value: "Cabana" },
  { label: "Hotels", icon: Hotel, value: "Hotel" },
  { label: "Rooms & annexes", icon: BedDouble, value: "Room" },
  { label: "Day outs", icon: Sun, value: "Day out" },
  { label: "Land & more", icon: LandPlot, value: "Land" },
];
export function HeroSearch() {
  const fullNavigation = useFullNavigation();
  const [purpose, setPurpose] = useState("Stay");
  const router = useRouter();
  return (
    <div className="hero-search">
      <div className="search-tabs" role="tablist" aria-label="Listing purpose">
        {["Stay", "Rent", "Buy", "Day out"].map((p) => (
          <button
            role="tab"
            aria-selected={purpose === p}
            key={p}
            className={purpose === p ? "selected" : ""}
            onClick={() => setPurpose(p)}
          >
            {p === "Stay" ? (
              <Palmtree size={16} />
            ) : p === "Day out" ? (
              <Sun size={16} />
            ) : (
              <House size={16} />
            )}
            {p === "Stay"
              ? "Find a stay"
              : p === "Rent"
                ? "Rent a home"
                : p === "Buy"
                  ? "Buy a property"
                  : "Plan a day out"}
          </button>
        ))}
      </div>
      <form
        className="search-bar"
        action="/explore"
        onSubmit={(e) => {
          // Native form navigation clears the ad runtime before search results.
          if (fullNavigation) return;
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const params = new URLSearchParams({ purpose });
          for (const [key, value] of form)
            if (value) params.set(key, String(value));
          router.push(`/explore?${params}`);
        }}
      >
        <input type="hidden" name="purpose" value={purpose} />
        <label className="search-field">
          <MapPin size={21} />
          <span>
            <strong>Where to?</strong>
            <select name="city" aria-label="Choose a location">
              <option value="">Explore Sri Lanka</option>
              {locations.map((l) => (
                <option key={l.city}>{l.city}</option>
              ))}
            </select>
          </span>
          <ChevronDown size={14} />
        </label>
        <label className="search-field">
          <House size={21} />
          <span>
            <strong>Your kind of place</strong>
            <select name="category" aria-label="Property type">
              <option value="">All property types</option>
              {[
                "Villa",
                "Apartment",
                "House",
                "Cabana",
                "Hotel",
                "Room",
                "Annex",
                "Day out",
                "Land",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </span>
          <ChevronDown size={14} />
        </label>
        <label className="search-field search-budget">
          <CalendarDays size={21} />
          <span>
            <strong>
              {purpose === "Stay" || purpose === "Day out"
                ? "When?"
                : "Your budget"}
            </strong>
            {purpose === "Stay" || purpose === "Day out" ? (
              <input
                name="date"
                aria-label="Visit date"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
              />
            ) : (
              <input
                name="max"
                aria-label="Maximum price in rupees"
                type="number"
                min="0"
                placeholder="Any price · LKR"
              />
            )}
          </span>
        </label>
        <button className="button button-orange search-submit" type="submit">
          <Search size={19} /> Search places
        </button>
      </form>
    </div>
  );
}
export function FeaturedPlaces({ listings }: { listings: PublicListing[] }) {
  const [category, setCategory] = useState("");
  const filtered = category
    ? listings.filter((l) =>
        category === "Room"
          ? ["Room", "Annex"].includes(l.category)
          : l.category === category,
      )
    : listings.slice(0, 4);
  return (
    <>
      <div className="category-strip">
        {categories.map((c) => (
          <button
            key={c.label}
            className={`category-item ${category === c.value ? "selected" : ""}`}
            onClick={() => setCategory(c.value)}
          >
            <c.icon size={27} strokeWidth={1.45} />
            <span>{c.label}</span>
          </button>
        ))}
      </div>
      <section className="featured-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              <span className="tiny-star">✦</span> GOOD PLACES, PICKED FOR YOU
            </span>
            <h2>A little out of the ordinary.</h2>
            <p>Spaces with character. Places you’ll want to call your own.</p>
          </div>
          <Link
            href={`/explore${category ? `?category=${encodeURIComponent(category)}` : ""}`}
            className="text-link"
          >
            View all places <ArrowRight size={17} />
          </Link>
        </div>
        <div className="listing-grid">
          {filtered.slice(0, 4).map((l) => (
            <ListingCard key={l._id} listing={l} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="empty-state">
            <LandPlot size={36} />
            <h3>A new possibility is on its way.</h3>
            <p>
              There are no {category.toLowerCase()} listings here yet. Be the
              first to share a place.
            </p>
            <Link href="/submit" className="button button-dark">
              List your place <ArrowRight size={16} />
            </Link>
          </div>
        )}
        <div className="collection-note">
          <span className="green-dot" />{" "}
          {listings.some((l) => l.demo)
            ? "You’re exploring our preview collection. Sample places are for inspiration."
            : "Thoughtfully reviewed. Ready for you to explore."}
          <Link href="/policies/moderation">
            How we review places <ArrowUpRightFallback />
          </Link>
        </div>
      </section>
    </>
  );
}
function ArrowUpRightFallback() {
  return <ArrowRight size={13} />;
}
