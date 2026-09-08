"use client";
import { PrivacySettings } from "./privacy-settings";
import Link from "@/components/site-link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  Menu,
  X,
  Heart,
  Compass,
  MapPin,
  LayoutDashboard,
} from "lucide-react";
import { useApp } from "./providers";
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="Ceylon home"
    >
      <span className="brand-symbol">
        <Compass size={29} strokeWidth={1.6} />
      </span>
      <span>
        ceylon<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
export function Header() {
  const path = usePathname();
  const { user, saved } = useApp();
  const [open, setOpen] = useState(false);
  if (path.startsWith("/admin") || path.startsWith("/dashboard")) return null;
  return (
    <>
      <div className="announcement">
        <span>A little island. Endless possibilities.</span>
        <Link href="/explore">
          Find your somewhere <ArrowUpRight size={13} />
        </Link>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav
            className={`main-nav ${open ? "nav-open" : ""}`}
            aria-label="Main navigation"
          >
            <Link
              onClick={() => setOpen(false)}
              className={path === "/" || path === "/explore" ? "active" : ""}
              href="/explore"
            >
              Explore places
            </Link>
            <Link onClick={() => setOpen(false)} href="/explore?purpose=Stay">
              Stays & getaways
            </Link>
            <Link onClick={() => setOpen(false)} href="/explore?purpose=Rent">
              Find a home
            </Link>
            <Link onClick={() => setOpen(false)} href="/boarding-houses">
              Boarding
            </Link>
            <Link onClick={() => setOpen(false)} href="/guides">
              The local edit <span className="new-dot" />
            </Link>
          </nav>
          <div className="header-actions">
            <Link
              className="icon-button saved-nav"
              href="/dashboard?tab=saved"
              aria-label={`Saved places (${saved.length})`}
            >
              <Heart size={20} />
              {saved.length > 0 && (
                <span className="count-dot">{saved.length}</span>
              )}
            </Link>
            <span className="header-divider" />
            <Link className="sign-in" href={user ? "/dashboard" : "/login"}>
              {user ? (
                <>
                  <LayoutDashboard size={17} /> My dashboard
                </>
              ) : (
                "Log in"
              )}
            </Link>
            <Link href="/submit" className="button button-dark header-list">
              <Plus size={17} /> List your place
            </Link>
            <button
              className="mobile-menu icon-button"
              aria-expanded={open}
              aria-label="Toggle navigation"
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
export function Footer() {
  const path = usePathname();
  if (path.startsWith("/admin") || path.startsWith("/dashboard")) return null;
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Brand />
          <p>
            Good places. New possibilities.
            <br />
            Your next chapter starts here.
          </p>
          <span className="made-in">
            <MapPin size={14} /> Made for Sri Lanka, with love.
          </span>
        </div>
        <div>
          <h4>Find your place</h4>
          <Link href="/explore?purpose=Stay">Stays & getaways</Link>
          <Link href="/houses-for-rent">Homes for rent</Link>
          <Link href="/boarding-houses">Boarding houses</Link>
          <Link href="/explore?purpose=Buy">Properties for sale</Link>
          <Link href="/explore?purpose=Day+out">Day-out experiences</Link>
        </div>
        <div>
          <h4>Discover Ceylon</h4>
          <Link href="/about">Our story</Link>
          <Link href="/guides">The local edit</Link>
          <Link href="/submit">List your place</Link>
          <Link href="/contact">Get in touch</Link>
        </div>
        <div>
          <h4>A little peace of mind</h4>
          <Link href="/policies/moderation">Our review process</Link>
          <Link href="/policies/safety">Staying safe</Link>
          <Link href="/policies/terms">Terms & conditions</Link>
          <Link href="/policies/privacy">Privacy & cookies</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <PrivacySettings />
        <span>
          © {new Date().getFullYear()} Ceylon. A place for every possibility.
        </span>
        <span>
          Sri Lanka <span className="tiny-dot" /> English{" "}
          <span className="tiny-dot" /> LKR
        </span>
        <Link href="/admin">
          Admin workspace <ArrowUpRight size={13} />
        </Link>
      </div>
    </footer>
  );
}
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  href,
  linkText = "Explore all",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  href?: string;
  linkText?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {href && (
        <Link className="text-link" href={href}>
          {linkText}
          <ArrowRight size={17} />
        </Link>
      )}
    </div>
  );
}
