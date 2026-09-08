import { AutoAds } from "./auto-ads";
import { canIndexDiscovery } from "@/lib/seo";
import { DiscoveryEditorial } from "./discovery-editorial";
import { boardingAudiences } from "@/lib/types";
import Link from "@/components/site-link";
import {
  ArrowRight,
  ChevronRight,
  Search,
  SlidersHorizontal,
  MapPin,
  Compass,
} from "lucide-react";
import { ListingCard } from "./listing-card";
import { searchListings } from "@/lib/listings";
import {
  type SearchFilters,
  categoryNames,
  purposes,
  amenities,
} from "@/lib/types";
import { locations } from "@/lib/catalog";
export async function Browse({
  filters,
  title = "Find your kind of somewhere.",
  description = "A place to settle in. A reason to get away. Explore the possibilities.",
  locked = false,
}: {
  filters: SearchFilters;
  title?: string;
  description?: string;
  locked?: boolean;
}) {
  const result = await searchListings(filters);
  const adEligible =
    locked &&
    !result.preview &&
    (await canIndexDiscovery(
      Object.fromEntries(
        Object.entries(filters).filter(([, v]) => typeof v === "string"),
      ) as Record<string, string>,
    ));
  function pageLink(page: number) {
    return `/explore?${new URLSearchParams({ ...filters, page: String(page) })}`;
  }
  return (
    <main className="container">
      <AutoAds eligible={adEligible} />
      <div className="page-top">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight size={12} />
          <span>Explore places</span>
        </div>
        <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="browse-layout">
        <aside className="filters">
          <div className="filters-head">
            <h2>
              <SlidersHorizontal size={16} /> Refine your search
            </h2>
            <Link href="/explore">Reset</Link>
          </div>
          <form action="/explore">
            <label className="field">
              A little more specific?
              <input
                name="q"
                placeholder="Name, keyword, location…"
                defaultValue={filters.q}
                maxLength={120}
              />
            </label>
            <label className="field">
              Looking to
              <select name="purpose" defaultValue={filters.purpose || ""}>
                <option value="">Explore everything</option>
                {purposes.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Your kind of place
              <select name="category" defaultValue={filters.category || ""}>
                <option value="">All property types</option>
                {categoryNames.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <details
              className="boarding-search-disclosure"
              open={
                filters.category === "Boarding" ||
                Boolean(
                  filters.audience ||
                  filters.capacity ||
                  filters.vacancies ||
                  filters.roomType ||
                  filters.priceBasis,
                )
              }
            >
              <summary>Boarding room preferences</summary>
              <fieldset className="boarding-filter">
                <legend>Boarding preferences</legend>
                <label className="field">
                  Suitable for
                  <select name="audience" defaultValue={filters.audience || ""}>
                    <option value="">Any preference</option>
                    {Object.entries(boardingAudiences).map(([v, label]) => (
                      <option key={v} value={v}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  Room arrangement
                  <select name="roomType" defaultValue={filters.roomType || ""}>
                    <option value="">Private or shared</option>
                    <option value="private">Private room</option>
                    <option value="shared">Shared room</option>
                  </select>
                </label>
                <div className="field-row">
                  <label className="field">
                    People per room
                    <input
                      name="capacity"
                      type="number"
                      min="1"
                      max="30"
                      placeholder="Any"
                      defaultValue={filters.capacity}
                    />
                  </label>
                  <label className="field">
                    Available spaces needed
                    <input
                      name="vacancies"
                      type="number"
                      min="1"
                      max="30"
                      placeholder="Any"
                      defaultValue={filters.vacancies}
                    />
                  </label>
                </div>
                <label className="field">
                  Compare monthly prices per
                  <select
                    name="priceBasis"
                    defaultValue={filters.priceBasis || ""}
                  >
                    <option value="">Person or room</option>
                    <option value="person">Person</option>
                    <option value="room">Entire room</option>
                  </select>
                </label>
                <small>
                  These filters apply to boarding rooms. Choose 2 spaces for a
                  couple or two friends.
                </small>
              </fieldset>
            </details>
            <label className="field">
              Where?
              <select name="city" defaultValue={filters.city || ""}>
                <option value="">Anywhere in Sri Lanka</option>
                {locations.map((l) => (
                  <option key={l.city}>{l.city}</option>
                ))}
                {filters.city &&
                  !locations.some((l) => l.city === filters.city) && (
                    <option>{filters.city}</option>
                  )}
              </select>
            </label>
            <div className="field-row">
              <label className="field">
                Min. price (LKR)
                <input
                  type="number"
                  name="min"
                  min="0"
                  defaultValue={filters.min}
                  placeholder="0"
                />
              </label>
              <label className="field">
                Max. price
                <input
                  type="number"
                  name="max"
                  min="0"
                  defaultValue={filters.max}
                  placeholder="Any"
                />
              </label>
            </div>
            <div className="field-row">
              <label className="field">
                Bedrooms
                <select name="bedrooms" defaultValue={filters.bedrooms || ""}>
                  <option value="">Any</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option value={n} key={n}>
                      {n}+
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Guests
                <input
                  name="guests"
                  type="number"
                  min="1"
                  max="10000"
                  defaultValue={filters.guests}
                  placeholder="Any"
                />
              </label>
            </div>
            <label className="field">
              A must-have
              <select name="amenity" defaultValue={filters.amenity || ""}>
                <option value="">Any facility</option>
                {amenities.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Available on
              <input type="date" name="date" defaultValue={filters.date} />
            </label>
            <label className="field">
              Sort by
              <select name="sort" defaultValue={filters.sort || "recommended"}>
                <option value="recommended">Recommended</option>
                <option value="newest">Recently added</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>
            <label className="check-field">
              <input
                type="checkbox"
                name="available"
                value="true"
                defaultChecked={filters.available === "true"}
              />{" "}
              Available places only
            </label>
            <label className="check-field">
              <input
                type="checkbox"
                name="verified"
                value="true"
                defaultChecked={filters.verified === "true"}
              />{" "}
              Verified listings only
            </label>
            <button className="button button-dark full-width" type="submit">
              <Search size={15} /> Find my place
            </button>
          </form>
        </aside>
        <section>
          <div className="results-header">
            <span>
              <strong>{result.total}</strong> places to discover
              {filters.city ? ` in ${filters.city}` : ""}
            </span>
            <span style={{ color: "var(--muted)", fontSize: 10 }}>
              Prices shown per listing’s unit
            </span>
          </div>
          {result.preview && (
            <div className="preview-notice" style={{ marginTop: 0 }}>
              <Compass size={16} /> Preview collection · These sample properties
              illustrate the marketplace. They cannot be booked or contacted.
            </div>
          )}
          <div className="listing-grid results-grid">
            {result.listings.map((l) => (
              <ListingCard key={l._id} listing={l} />
            ))}
            {result.listings.length === 0 && (
              <div className="empty-state">
                <MapPin size={35} />
                <h3>Your place is still out there.</h3>
                <p>
                  Try a nearby location or a different price range. New places
                  start with people like you.
                </p>
                <Link href="/explore" className="button button-dark">
                  Explore all places <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
          {result.pages > 1 && (
            <nav className="pagination" aria-label="Search pages">
              {result.page > 1 && (
                <Link
                  className="button button-outline"
                  href={pageLink(result.page - 1)}
                >
                  Previous
                </Link>
              )}
              <span>
                Page {result.page} of {result.pages}
              </span>
              {result.page < result.pages && (
                <Link
                  className="button button-dark"
                  href={pageLink(result.page + 1)}
                >
                  Next <ArrowRight size={14} />
                </Link>
              )}
            </nav>
          )}
          {locked && <DiscoveryEditorial filters={filters} />}
        </section>
      </div>
    </main>
  );
}
