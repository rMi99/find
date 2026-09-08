"use client";
import { listingPriceUnit, boardingAudiences } from "@/lib/types";
import Image from "next/image";
import Link from "@/components/site-link";
import {
  Heart,
  MapPin,
  BedDouble,
  Bath,
  Users,
  BadgeCheck,
  ArrowUpRight,
} from "lucide-react";
import { type PublicListing, priceLabel } from "@/lib/types";
import { useApp } from "./providers";
export function ListingCard({ listing: l }: { listing: PublicListing }) {
  const { saved, toggleSave } = useApp();
  return (
    <article className="listing-card">
      <div className="card-image">
        <Link href={`/places/${l.slug}`} tabIndex={-1} aria-hidden="true">
          <Image
            src={l.images[0]}
            alt={`${l.title}, ${l.category.toLowerCase()} in ${l.city}`}
            fill
            sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 25vw"
            unoptimized={l.images[0]?.startsWith("/api/")}
          />
        </Link>
        <span className={`card-badge ${l.featured ? "badge-featured" : ""}`}>
          {l.featured ? (
            <>
              <span>✦</span> Handpicked
            </>
          ) : (
            l.category
          )}
        </span>
        <button
          className={`save-button ${saved.includes(l._id) ? "is-saved" : ""}`}
          onClick={() => toggleSave(l._id, l.demo)}
          aria-label={`${saved.includes(l._id) ? "Unsave" : "Save"} ${l.title}`}
          aria-pressed={saved.includes(l._id)}
        >
          <Heart
            size={18}
            fill={saved.includes(l._id) ? "currentColor" : "none"}
          />
        </button>
        <span className="image-purpose">
          {l.purpose === "Buy"
            ? "FOR SALE"
            : l.purpose === "Rent"
              ? "FOR RENT"
              : l.category.toUpperCase()}
        </span>
      </div>
      <div className="card-info">
        <div className="card-location">
          <MapPin size={13} /> {l.city}, {l.province} Province{" "}
          {l.verified && <BadgeCheck size={17} className="verified-icon" />}
        </div>
        <Link href={`/places/${l.slug}`} className="card-title">
          {l.title}
          <ArrowUpRight size={17} />
        </Link>
        {l.boarding && (
          <p className="boarding-card-note">
            {boardingAudiences[l.boarding.audience]} · {l.boarding.roomType}{" "}
            room · {l.boarding.vacancies}/{l.boarding.capacity} spaces free
          </p>
        )}
        <div className="card-facts">
          {l.bedrooms > 0 && (
            <span>
              <BedDouble size={14} /> {l.bedrooms} beds
            </span>
          )}
          {l.bathrooms > 0 && (
            <span>
              <Bath size={14} /> {l.bathrooms} baths
            </span>
          )}
          <span>
            <Users size={14} />{" "}
            {l.boarding
              ? `${l.boarding.capacity} people per room`
              : `${l.guests} guests`}
          </span>
        </div>
        <div className="card-price">
          <span>
            <small>Rs.</small> {priceLabel(l.price)}{" "}
            <em>/ {listingPriceUnit(l)}</em>
          </span>
          {l.demo ? (
            <span className="sample-label">Sample</span>
          ) : (
            <span
              className={`availability-dot ${!l.available ? "unavailable" : ""}`}
              title={l.available ? "Available" : "Unavailable"}
            />
          )}
        </div>
      </div>
    </article>
  );
}
