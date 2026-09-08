"use client";
import { BoardingFields, BoardingSummary } from "./boarding-fields";
import { defaultBoarding } from "@/lib/types";
import Image from "next/image";
import Link from "@/components/site-link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  House,
  Heart,
  MessageSquare,
  CalendarDays,
  UserRound,
  Bell,
  Settings,
  ShieldCheck,
  Users,
  Flag,
  Search,
  Plus,
  ArrowUpRight,
  ArrowRight,
  LogOut,
  Menu,
  X,
  Clock3,
  CheckCircle2,
  Eye,
  MapPin,
  History,
  CircleHelp,
  Globe,
  Pencil,
  Check,
  Ban,
  Star,
} from "lucide-react";
import { Brand } from "./shell";
import { api, useApp } from "./providers";
import { ListingCard } from "./listing-card";
import {
  type Listing,
  type PublicListing,
  type SafeUser,
  priceLabel,
  isAdmin,
  categoryNames,
  slugify,
} from "@/lib/types";
import { demoListings } from "@/lib/demo";
import { provinces } from "@/lib/catalog";
type Message = {
  _id: string;
  name?: string;
  email?: string;
  message: string;
  listingTitle?: string;
  title?: string;
  createdAt: string;
};
type Report = {
  _id: string;
  listingId: string;
  reason: string;
  details?: string;
  status: string;
  createdAt: string;
};
type WorkspaceData = {
  listings: Listing[];
  users?: SafeUser[];
  inquiries?: Message[];
  saved?: PublicListing[];
  notifications?: Message[];
  reports?: Report[];
  settings?: { submissionsOpen?: boolean; contactEmail?: string };
  messages?: Message[];
};
const userNav = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "listings", label: "My listings", icon: House },
  { id: "saved", label: "Saved places", icon: Heart },
  { id: "inquiries", label: "Inquiries", icon: MessageSquare },
  { id: "availability", label: "Availability", icon: CalendarDays },
];
const adminNav = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "pending", label: "Review queue", icon: ShieldCheck },
  { id: "listings", label: "All listings", icon: House },
  { id: "users", label: "People & accounts", icon: Users },
  { id: "reports", label: "Reported listings", icon: Flag },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "seo", label: "Search & discovery", icon: Globe },
  { id: "locations", label: "Locations & categories", icon: MapPin },
  { id: "audit", label: "Activity log", icon: History },
];
export function Workspace({ admin = false }: { admin?: boolean }) {
  const { user, loading, saved, notify, refreshUser } = useApp();
  const params = useSearchParams();
  const router = useRouter();
  const tab = params.get("tab") || "overview";
  const [mobile, setMobile] = useState(false);
  const [data, setData] = useState<WorkspaceData>({ listings: [] });
  const [devicePlaces, setDevicePlaces] = useState<PublicListing[]>([]);
  const [fetching, setFetching] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Listing | null>(null);
  const authorized = Boolean(user && (!admin || isAdmin(user.role)));
  const preview = !authorized;
  const reload = useCallback(async () => {
    if (!authorized) return;
    setFetching(true);
    setLoadError("");
    try {
      setData(await api<WorkspaceData>(admin ? "admin" : "workspace"));
    } catch (e) {
      setLoadError((e as Error).message);
    } finally {
      setFetching(false);
    }
  }, [authorized, admin]);
  useEffect(() => {
    void reload();
  }, [reload]);
  function selectTab(value: string) {
    router.push(
      `${admin ? "/admin" : "/dashboard"}${value === "overview" ? "" : `?tab=${value}`}`,
    );
    setStatus("all");
    setQuery("");
    setMobile(false);
  }
  const listings = authorized ? data.listings : admin ? demoListings : [];
  const displayListings = listings.filter(
    (l) =>
      (tab !== "pending" || l.status === "pending") &&
      (status === "all" || l.status === status) &&
      `${l.title} ${l.city}`.toLowerCase().includes(query.toLowerCase()),
  );
  const savedIds = saved.filter((id) => !id.startsWith("demo-")).join(",");
  useEffect(() => {
    let active = true;
    api<{ listings: PublicListing[] }>(
      `saved-places?ids=${encodeURIComponent(savedIds)}`,
    )
      .then((r) => {
        if (active) setDevicePlaces(r.listings);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [savedIds]);
  const savedPlaces = [
    ...devicePlaces.filter((l) => saved.includes(l._id)),
    ...demoListings.filter((l) => saved.includes(l._id)),
  ];
  const history = authorized
    ? listings
        .flatMap((l) => l.history.map((h) => ({ ...h, title: l.title })))
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, 100)
    : [];
  const actual = authorized ? listings.filter((l) => !l.demo) : [];
  const stats = admin
    ? [
        {
          label: "Total listings",
          value: actual.length,
          icon: House,
          note: "Across the marketplace",
        },
        {
          label: "Awaiting review",
          value: actual.filter((l) => l.status === "pending").length,
          icon: Clock3,
          note: "A new chapter starts here",
        },
        {
          label: "Live & approved",
          value: actual.filter((l) => l.status === "approved").length,
          icon: ShieldCheck,
          note: "Ready to be discovered",
        },
        {
          label: "Community members",
          value: data.users?.length || 0,
          icon: Users,
          note: "People behind the places",
        },
      ]
    : [
        {
          label: "Your listings",
          value: actual.length,
          icon: House,
          note: "Places you’ve shared",
        },
        {
          label: "Live places",
          value: actual.filter((l) => l.status === "approved").length,
          icon: CheckCircle2,
          note: "Out there, getting discovered",
        },
        {
          label: "New inquiries",
          value: data.inquiries?.length || 0,
          icon: MessageSquare,
          note: "New conversations",
        },
        {
          label: "Saved places",
          value: savedPlaces.length,
          icon: Heart,
          note: "A little inspiration for later",
        },
      ];
  const nav = admin ? adminNav : userNav;
  const activeLabel =
    [
      ...nav,
      { id: "profile", label: "Your profile" },
      { id: "notifications", label: "Notifications" },
      { id: "settings", label: "Site settings" },
    ].find((n) => n.id === tab)?.label || "Overview";
  function table(rows: Listing[]) {
    return rows.length ? (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>PLACE</th>
              <th>STATUS</th>
              <th>PRICE</th>
              <th>{admin ? "CONTACT" : "AVAILABILITY"}</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l._id}>
                <td>
                  <div className="table-place">
                    <div className="table-place-image">
                      <Image
                        src={l.images[0]}
                        alt={l.title}
                        fill
                        sizes="54px"
                        unoptimized={l.images[0].startsWith("/api/")}
                      />
                    </div>
                    <div>
                      <strong>{l.title}</strong>
                      <small>
                        {l.category} · {l.city}
                        {l.demo ? " · Sample" : ""}
                      </small>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`status status-${l.status}`}>
                    {l.status.replace("_", " ")}
                  </span>
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  Rs. {priceLabel(l.price)}
                  <small
                    style={{
                      display: "block",
                      color: "var(--muted)",
                      marginTop: 5,
                    }}
                  >
                    per {l.unit}
                  </small>
                </td>
                <td>
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>
                    {admin
                      ? l.contactVerified
                        ? "Email verified"
                        : "Not verified"
                      : l.available
                        ? "Available"
                        : "Unavailable"}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button onClick={() => setSelected(l)}>
                      {admin ? <Eye size={12} /> : <Pencil size={12} />}
                      {admin ? "Review" : "Manage"}
                    </button>
                    {l.status === "approved" && (
                      <Link
                        href={`/places/${l.slug}`}
                        className="icon-button"
                        aria-label={`View ${l.title}`}
                      >
                        <ArrowUpRight size={14} />
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <Empty
        icon={House}
        title={
          tab === "pending"
            ? "A clear queue. A fresh start."
            : "Every chapter starts somewhere."
        }
        text={
          tab === "pending"
            ? "New submissions will appear here, ready for your review."
            : "Share your first place and give it a chance to become someone’s favorite."
        }
        href={admin ? undefined : "/submit"}
        linkText="List your first place"
      />
    );
  }
  return (
    <div className="workspace">
      {mobile && (
        <button
          className="backdrop-close"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`workspace-sidebar ${mobile ? "sidebar-open" : ""}`}>
        <Brand />
        <span className="workspace-label">
          {admin ? "THE ADMIN WORKSPACE" : "YOUR PERSONAL SPACE"}
        </span>
        <nav className="workspace-nav" aria-label="Workspace navigation">
          {nav.map((n) => (
            <button
              key={n.id}
              className={tab === n.id ? "active" : ""}
              onClick={() => selectTab(n.id)}
            >
              <n.icon size={17} strokeWidth={1.6} />
              {n.label}
              {n.id === "pending" &&
                actual.filter((l) => l.status === "pending").length > 0 && (
                  <span className="nav-count">
                    {actual.filter((l) => l.status === "pending").length}
                  </span>
                )}
            </button>
          ))}
        </nav>
        <span className="workspace-label">A LITTLE HOUSEKEEPING</span>
        <nav className="workspace-nav" aria-label="Account navigation">
          {(admin
            ? [{ id: "settings", label: "Site settings", icon: Settings }]
            : [
                { id: "profile", label: "My profile", icon: UserRound },
                { id: "notifications", label: "Notifications", icon: Bell },
              ]
          ).map((n) => (
            <button
              key={n.id}
              className={tab === n.id ? "active" : ""}
              onClick={() => selectTab(n.id)}
            >
              <n.icon size={17} strokeWidth={1.6} />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="workspace-bottom">
          <Link href="/contact">
            <CircleHelp size={17} /> A little help?
          </Link>
          <Link href="/explore">
            <ArrowUpRight size={17} /> Back to exploring
          </Link>
          <div className="workspace-person">
            <div className="avatar">
              {user
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                : "C"}
            </div>
            <div>
              <strong>{user?.name || "Welcome to Ceylon"}</strong>
              <small>
                {user
                  ? admin
                    ? "Admin workspace"
                    : "Your personal space"
                  : "Make yourself at home"}
              </small>
            </div>
            {user && (
              <button
                aria-label="Log out"
                onClick={async () => {
                  try {
                    await api("auth/logout", {});
                    await refreshUser();
                    setData({ listings: [] });
                    router.push("/");
                  } catch (e) {
                    notify((e as Error).message, true);
                  }
                }}
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="workspace-topbar">
          <button
            className="icon-button mobile-workspace-menu"
            aria-label="Open workspace navigation"
            onClick={() => setMobile(true)}
          >
            <Menu size={20} />
          </button>
          <span>
            {admin ? "Workspace" : "My dashboard"}{" "}
            <span style={{ margin: "0 10px", opacity: 0.4 }}>/</span>{" "}
            {activeLabel}
          </span>
          <div>
            <Link href="/" className="text-link">
              A look at the marketplace <ArrowUpRight size={14} />
            </Link>
            <button
              className="icon-button"
              aria-label={admin ? "Open reports" : "Open notifications"}
              onClick={() => selectTab(admin ? "reports" : "notifications")}
            >
              <Bell size={18} />
            </button>
            <div className="avatar">{user?.name.charAt(0) || "C"}</div>
          </div>
        </header>
        <main className="workspace-content">
          <div className="workspace-title">
            <div>
              <span className="eyebrow">
                {admin
                  ? "GOOD PLACES START WITH GOOD CARE"
                  : "YOUR PLACES. YOUR POSSIBILITIES."}
              </span>
              <h1>
                {tab === "overview"
                  ? admin
                    ? "A little oversight. A better Ceylon."
                    : `Make yourself at home${user ? `, ${user.name.split(" ")[0]}` : ""}.`
                  : activeLabel}
              </h1>
              <p>
                {tab === "overview"
                  ? admin
                    ? "Keep the community thriving, one thoughtful review at a time."
                    : "A little space to keep track of everything that matters."
                  : "Everything you need, right where you need it."}
              </p>
            </div>
            <Link
              href={admin ? "/admin?tab=pending" : "/submit"}
              className="button button-dark"
            >
              <Plus size={16} />
              {admin ? "Review submissions" : "List a new place"}
            </Link>
          </div>
          {preview && !loading && (
            <div className="preview-notice workspace-notice">
              <ShieldCheck size={17} />
              <span>
                {admin
                  ? "Workspace preview. Sample listings show the review layout; no administrative actions are enabled."
                  : "Welcome to your personal space. Sign in to manage listings, inquiries and availability. Saved sample places stay on this device."}{" "}
                <Link
                  href={`/login?next=${admin ? "/admin" : "/dashboard"}`}
                  style={{ textDecoration: "underline", fontWeight: 600 }}
                >
                  Log in to continue{" "}
                  <ArrowUpRight size={11} style={{ display: "inline" }} />
                </Link>
              </span>
            </div>
          )}
          {loadError && (
            <div className="form-error">
              {loadError}
              <button
                onClick={reload}
                style={{ marginLeft: 10, textDecoration: "underline" }}
              >
                Try again
              </button>
            </div>
          )}
          {fetching && (
            <p
              style={{ fontSize: 10, color: "var(--muted)", marginBottom: 15 }}
            >
              Refreshing your workspace…
            </p>
          )}
          {tab === "overview" && (
            <>
              <div className="stats-grid">
                {stats.map((s) => (
                  <div className="stat-card" key={s.label}>
                    <div className="stat-top">
                      {s.label}
                      <s.icon size={18} strokeWidth={1.5} />
                    </div>
                    <strong>{s.value}</strong>
                    <small>{s.note}</small>
                  </div>
                ))}
              </div>
              <div className="workspace-grid">
                <div className="panel" style={{ marginBottom: 0 }}>
                  <div className="panel-header">
                    <div>
                      <h2>
                        {admin
                          ? "A week in the marketplace"
                          : "Your places, at a glance"}
                      </h2>
                      <p>
                        {admin
                          ? "New submissions over the last 7 days"
                          : "Listings you’ve added over the last 7 days"}
                      </p>
                    </div>
                    <span className="status">Last 7 days</span>
                  </div>
                  <div className="panel-body">
                    <div className="chart">
                      {Array.from({ length: 7 }, (_, i) => {
                        const day = new Date();
                        day.setDate(day.getDate() - 6 + i);
                        const dayString = day.toISOString().slice(0, 10);
                        const n = actual.filter((l) =>
                          l.createdAt.startsWith(dayString),
                        ).length;
                        return (
                          <div key={i} className="chart-column">
                            <div
                              style={{ height: `${Math.min(100, n * 15)}%` }}
                              title={`${dayString}: ${n} submissions`}
                            />
                            <span>
                              {day.toLocaleDateString("en", {
                                weekday: "short",
                              })}
                            </span>
                          </div>
                        );
                      })}
                      {actual.length === 0 && (
                        <span className="chart-empty">
                          A fresh start. Your story will appear here.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="welcome-card">
                  <span className="eyebrow">
                    {admin
                      ? "A THOUGHTFUL COMMUNITY"
                      : "ROOM FOR SOMETHING GOOD"}
                  </span>
                  <h3>
                    {admin
                      ? "Behind every place, there’s a person."
                      : "Your space could be someone’s somewhere."}
                  </h3>
                  <p>
                    {admin
                      ? "Verify the details. Read the story. Help good places find the people who will love them."
                      : "Have a spare room, a little retreat or a home to share? Your next chapter could start right here."}
                  </p>
                  <Link
                    className="button button-dark"
                    href={admin ? "/policies/moderation" : "/submit"}
                  >
                    {admin ? "Our moderation principles" : "Share your place"}
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <h2>
                      {admin
                        ? "Places to keep an eye on"
                        : "Your latest places"}
                    </h2>
                    <p>
                      {admin
                        ? "A closer look at the most recent listings"
                        : "A little overview of what you’ve shared"}
                    </p>
                  </div>
                  <button onClick={() => selectTab("listings")}>
                    View all{" "}
                    <ArrowRight
                      size={12}
                      style={{ display: "inline", marginLeft: 5 }}
                    />
                  </button>
                </div>
                {table(listings.slice(0, 4))}
              </div>
              <div className="panel">
                <div className="panel-header">
                  <h2>A little activity</h2>
                  <History size={16} />
                </div>
                <div className="panel-body">
                  {history.length ? (
                    history.slice(0, 4).map((h, i) => (
                      <div className="activity-item" key={i}>
                        <span className="activity-icon">
                          <CheckCircle2 size={14} />
                        </span>
                        <div>
                          <strong>{h.title}</strong>
                          <p>
                            {h.action.replaceAll("_", " ")}
                            {h.note ? ` · ${h.note}` : ""}
                          </p>
                          <small>{new Date(h.at).toLocaleString()}</small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: 11, color: "var(--muted)" }}>
                      When something happens, you’ll find the update here.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
          {["listings", "pending"].includes(tab) && (
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2>
                    {tab === "pending"
                      ? "Ready for a thoughtful review"
                      : admin
                        ? "Every place, in one place"
                        : "Places you’ve shared"}
                  </h2>
                  <p>
                    {displayListings.length} listing
                    {displayListings.length !== 1 ? "s" : ""} · Up to 100 most
                    recent
                  </p>
                </div>
                <label className="workspace-search">
                  <Search size={13} />
                  <input
                    aria-label="Search your listings"
                    placeholder="Find a listing…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
              </div>
              {tab !== "pending" && (
                <div className="status-tabs">
                  {[
                    "all",
                    "approved",
                    "pending",
                    "changes_requested",
                    "rejected",
                    "suspended",
                  ].map((s) => (
                    <button
                      key={s}
                      className={status === s ? "active" : ""}
                      onClick={() => setStatus(s)}
                    >
                      {s === "all"
                        ? "All places"
                        : s
                            .replace("_", " ")
                            .replace(/^./, (c) => c.toUpperCase())}
                    </button>
                  ))}
                </div>
              )}
              {table(displayListings)}
            </div>
          )}
          {tab === "saved" && (
            <>
              <div className="workspace-section-header">
                <h2>A little inspiration for later.</h2>
                <Link href="/explore" className="text-link">
                  Find more places <ArrowRight size={15} />
                </Link>
              </div>
              {savedPlaces.length ? (
                <div className="listing-grid dashboard-saved">
                  {savedPlaces.map((l) => (
                    <ListingCard key={l._id} listing={l} />
                  ))}
                </div>
              ) : (
                <div className="panel">
                  <Empty
                    icon={Heart}
                    title="Keep a little possibility close."
                    text="Tap the heart on any place that catches your eye. You’ll find it right here."
                    href="/explore"
                    linkText="Find a place to love"
                  />
                </div>
              )}
            </>
          )}
          {["inquiries", "notifications", "messages"].includes(tab) && (
            <div className="panel">
              <div className="panel-header">
                <h2>
                  {tab === "notifications"
                    ? "The latest from your corner"
                    : "Good things start with a conversation"}
                </h2>
              </div>
              {(tab === "inquiries"
                ? data.inquiries
                : tab === "messages"
                  ? data.messages
                  : data.notifications
              )?.length ? (
                (tab === "inquiries"
                  ? data.inquiries
                  : tab === "messages"
                    ? data.messages
                    : data.notifications)!.map((m) => (
                  <div key={m._id} className="inquiry-card">
                    <h3>{m.title || m.listingTitle || m.name}</h3>
                    <small>
                      {m.name ? `${m.name} · ` : ""}
                      {new Date(m.createdAt).toLocaleDateString()}
                    </small>
                    <p>{m.message}</p>
                    {m.email && (
                      <a href={`mailto:${m.email}`}>
                        Reply by email{" "}
                        <ArrowUpRight size={12} style={{ display: "inline" }} />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <Empty
                  icon={tab === "notifications" ? Bell : MessageSquare}
                  title={
                    tab === "notifications"
                      ? "All quiet in your corner."
                      : "A conversation is waiting to happen."
                  }
                  text={
                    tab === "notifications"
                      ? "Listing updates and review decisions will appear here."
                      : "Messages will appear here when someone gets in touch."
                  }
                />
              )}
            </div>
          )}
          {tab === "availability" && (
            <div className="panel">
              <div className="panel-header">
                <h2>Keep your calendar in the know.</h2>
                <p>Availability updates do not require a new review.</p>
              </div>
              {listings.length ? (
                listings.map((l) => (
                  <AvailabilityRow key={l._id} listing={l} reload={reload} />
                ))
              ) : (
                <Empty
                  icon={CalendarDays}
                  title="Make room for what’s next."
                  text="Your listings will appear here so you can keep dates and availability up to date."
                  href="/submit"
                  linkText="Add your first place"
                />
              )}
            </div>
          )}
          {tab === "profile" && (
            <div className="form-panel profile-form">
              <h2>Your little introduction.</h2>
              <p>Make it easy for people to know who they’re speaking with.</p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await api(
                      "profile",
                      Object.fromEntries(new FormData(e.currentTarget)),
                      "PATCH",
                    );
                    await refreshUser();
                    notify("Your profile is up to date.");
                  } catch (e) {
                    notify((e as Error).message, true);
                  }
                }}
              >
                <label className="field">
                  Your name
                  <input
                    name="name"
                    required
                    minLength={2}
                    maxLength={80}
                    defaultValue={user?.name}
                    placeholder="Your name"
                  />
                </label>
                <label className="field">
                  Email address
                  <input
                    value={user?.email || ""}
                    readOnly
                    placeholder="Sign in to see your email"
                  />
                  <small>
                    Your login email is protected and cannot be changed here.
                  </small>
                </label>
                <button className="button button-dark" disabled={!authorized}>
                  Save your profile <Check size={15} />
                </button>
              </form>
              {user && !user.verified && (
                <div className="preview-notice">
                  <span>
                    Your email hasn’t been verified yet.{" "}
                    <button
                      style={{ textDecoration: "underline" }}
                      onClick={async () => {
                        try {
                          const r = await api<{ verificationUrl?: string }>(
                            "auth/resend",
                            {},
                          );
                          if (r.verificationUrl) router.push(r.verificationUrl);
                          else
                            notify(
                              "Verification email sent. Check your inbox.",
                            );
                        } catch (e) {
                          notify((e as Error).message, true);
                        }
                      }}
                    >
                      Send a new verification link
                    </button>
                  </span>
                </div>
              )}
            </div>
          )}
          {tab === "users" && (
            <div className="panel">
              <div className="panel-header">
                <h2>The people behind the places</h2>
                <p>Roles are managed through the secure operator command.</p>
              </div>
              {data.users?.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>PERSON</th>
                        <th>EMAIL</th>
                        <th>ROLE</th>
                        <th>EMAIL STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.users.map((u) => (
                        <tr key={u._id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>
                            <span className="status">{u.role}</span>
                          </td>
                          <td>{u.verified ? "Verified" : "Not verified"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty
                  icon={Users}
                  title="A community in the making."
                  text="Registered members and their account roles will appear here."
                />
              )}
            </div>
          )}
          {tab === "reports" && (
            <div className="panel">
              <div className="panel-header">
                <h2>A little care goes a long way.</h2>
                <p>
                  Review community reports and take action on the listing when
                  needed.
                </p>
              </div>
              {data.reports?.length ? (
                data.reports.map((r) => (
                  <div className="inquiry-card" key={r._id}>
                    <span className="status">{r.status}</span>
                    <h3 style={{ marginTop: 10 }}>{r.reason}</h3>
                    <p>{r.details || "No additional details provided."}</p>
                    <div className="table-actions">
                      <button
                        onClick={() => {
                          const l = listings.find((l) => l._id === r.listingId);
                          if (l) setSelected(l);
                          else
                            notify(
                              "This listing is no longer in the current workspace.",
                            );
                        }}
                      >
                        Review listing
                      </button>
                      {r.status !== "resolved" && (
                        <button
                          onClick={async () => {
                            try {
                              await api(`admin/reports/${r._id}`, {});
                              await reload();
                              notify("Report marked as resolved.");
                            } catch (e) {
                              notify((e as Error).message, true);
                            }
                          }}
                        >
                          Mark resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <Empty
                  icon={ShieldCheck}
                  title="Nothing to flag right now."
                  text="Community reports will appear here for your review."
                />
              )}
            </div>
          )}
          {tab === "seo" && (
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2>Good places deserve to be discovered.</h2>
                  <p>
                    Only approved, verified-contact listings with useful content
                    can be indexed. Sample listings are always excluded.
                  </p>
                </div>
                <a href="/sitemap.xml" target="_blank" className="text-link">
                  Sitemap <ArrowUpRight size={13} />
                </a>
              </div>
              {listings.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>PAGE</th>
                        <th>INDEXING</th>
                        <th>CONTENT</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map((l) => (
                        <tr key={l._id}>
                          <td>
                            <strong>{l.title}</strong>
                            <small
                              style={{
                                display: "block",
                                marginTop: 6,
                                color: "var(--muted)",
                              }}
                            >
                              /places/{l.slug}
                            </small>
                          </td>
                          <td>
                            <span
                              className={`status ${!l.demo && l.status === "approved" && l.contactVerified && !l.seo?.noindex ? "status-approved" : ""}`}
                            >
                              {!l.demo &&
                              l.status === "approved" &&
                              l.contactVerified &&
                              !l.seo?.noindex
                                ? "Eligible"
                                : "Noindex"}
                            </span>
                          </td>
                          <td>
                            {l.description.length} characters ·{" "}
                            {l.images.length} photos
                          </td>
                          <td>
                            <button
                              className="text-link"
                              onClick={() => setSelected(l)}
                            >
                              Edit metadata <Pencil size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty
                  icon={Globe}
                  title="Discovery starts with a good listing."
                  text="Content quality and search visibility controls will appear here."
                />
              )}
            </div>
          )}
          {tab === "locations" && (
            <>
              <div className="panel">
                <div className="panel-header">
                  <h2>A little island. Every province.</h2>
                  <p>
                    Validated location hierarchy · Catalog maintained in the
                    application.
                  </p>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>PROVINCE</th>
                        <th>DISTRICTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(provinces).map(
                        ([province, districts]) => (
                          <tr key={province}>
                            <td>{province}</td>
                            <td>{districts.join(", ")}</td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="panel">
                <div className="panel-header">
                  <h2>A place for every possibility</h2>
                </div>
                <div className="panel-body">
                  <div className="choice-group">
                    {categoryNames.map((c) => (
                      <Link
                        key={c}
                        className="button button-outline button-small"
                        href={`/category/${slugify(c)}`}
                      >
                        {c}
                        <ArrowUpRight size={12} />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
          {tab === "audit" && (
            <div className="panel">
              <div className="panel-header">
                <h2>A record of every decision</h2>
                <p>
                  Stored with each listing, alongside the actor and timestamp.
                </p>
              </div>
              {history.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>WHEN</th>
                        <th>LISTING</th>
                        <th>ACTION</th>
                        <th>NOTE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h, i) => (
                        <tr key={i}>
                          <td>{new Date(h.at).toLocaleString()}</td>
                          <td>{h.title}</td>
                          <td>{h.action.replaceAll("_", " ")}</td>
                          <td>{h.note || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty
                  icon={History}
                  title="A clean slate."
                  text="Submission, editing, verification and moderation events will be recorded here."
                />
              )}
            </div>
          )}
          {tab === "settings" && (
            <div className="form-panel profile-form">
              <h2>A little behind-the-scenes care.</h2>
              <p>
                Control marketplace submissions and the operator contact email.
              </p>
              <form
                key={JSON.stringify(data.settings)}
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  try {
                    await api("admin/settings", {
                      submissionsOpen: form.get("submissionsOpen") === "on",
                      contactEmail: form.get("contactEmail"),
                    });
                    await reload();
                    notify("Site settings saved.");
                  } catch (e) {
                    notify((e as Error).message, true);
                  }
                }}
              >
                <label className="field">
                  Contact email
                  <input
                    name="contactEmail"
                    type="email"
                    defaultValue={data.settings?.contactEmail || ""}
                    placeholder="Your operator contact email"
                  />
                </label>
                <label className="check-field">
                  <input
                    name="submissionsOpen"
                    type="checkbox"
                    defaultChecked={data.settings?.submissionsOpen !== false}
                  />{" "}
                  Accept new listing submissions
                </label>
                <button
                  className="button button-dark"
                  disabled={!authorized || user?.role === "moderator"}
                  style={{ marginTop: 15 }}
                >
                  Save settings <Check size={15} />
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
      {selected && (
        <ManageModal
          listing={selected}
          admin={admin}
          preview={preview}
          onClose={() => setSelected(null)}
          reload={reload}
          seo={tab === "seo"}
        />
      )}
    </div>
  );
}
function Empty({
  icon: Icon,
  title,
  text,
  href,
  linkText,
}: {
  icon: typeof House;
  title: string;
  text: string;
  href?: string;
  linkText?: string;
}) {
  return (
    <div className="workspace-empty">
      <Icon size={34} strokeWidth={1.2} />
      <h3>{title}</h3>
      <p>{text}</p>
      {href && (
        <Link className="button button-dark button-small" href={href}>
          {linkText}
          <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}
function AvailabilityRow({
  listing: l,
  reload,
}: {
  listing: Listing;
  reload: () => Promise<void>;
}) {
  const { notify } = useApp();
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="panel-body"
      style={{ borderBottom: "1px solid var(--line)" }}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const f = new FormData(e.currentTarget);
        try {
          await api(
            `listings/${l._id}`,
            {
              action: "availability",
              ...(l.boarding ? { vacancies: Number(f.get("vacancies")) } : {}),
              available: f.get("available") === "on",
              availableFrom: f.get("availableFrom"),
              blockedDates: String(f.get("blockedDates") || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            },
            "PATCH",
          );
          await reload();
          notify("Availability updated. A little more certainty for everyone.");
        } catch (e) {
          notify((e as Error).message, true);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3 style={{ fontSize: 15, marginBottom: 18 }}>{l.title}</h3>
      <div className="field-row">
        <label className="field">
          Available from
          <input
            type="date"
            name="availableFrom"
            defaultValue={l.availableFrom}
          />
        </label>
        <label className="field">
          Unavailable dates
          <input
            name="blockedDates"
            defaultValue={l.blockedDates.join(", ")}
            placeholder="2026-10-01, 2026-10-02"
          />
          <small>Separate dates with commas, in YYYY-MM-DD format.</small>
        </label>
      </div>
      {l.boarding && (
        <label className="field">
          Available spaces (of {l.boarding.capacity})
          <input
            name="vacancies"
            type="number"
            required
            min="0"
            max={l.boarding.capacity}
            defaultValue={l.boarding.vacancies}
          />
        </label>
      )}
      <label className="check-field">
        <input type="checkbox" name="available" defaultChecked={l.available} />{" "}
        Available for inquiries
      </label>
      <button className="button button-dark button-small" disabled={busy}>
        {busy ? "Saving…" : "Update availability"}
      </button>
    </form>
  );
}
function ManageModal({
  listing: l,
  admin,
  preview,
  onClose,
  reload,
  seo,
}: {
  listing: Listing;
  admin: boolean;
  preview: boolean;
  onClose: () => void;
  reload: () => Promise<void>;
  seo: boolean;
}) {
  const { notify } = useApp();
  const [boarding, setBoarding] = useState(l.boarding || defaultBoarding);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function action(action: string, extra: Record<string, unknown> = {}) {
    if (preview) return;
    setBusy(true);
    setError("");
    try {
      await api(`admin/listings/${l._id}`, {
        action,
        note,
        version: l.updatedAt,
        ...extra,
      });
      await reload();
      notify("Decision saved. The listing and audit history are up to date.");
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = old;
    };
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">
              {seo
                ? "SEARCH & DISCOVERY"
                : admin
                  ? "A THOUGHTFUL REVIEW"
                  : "YOUR PLACE, YOUR DETAILS"}
            </span>
            <h2 id="manage-title">{l.title}</h2>
            <p>
              {l.city} · {l.category} ·{" "}
              <span className={`status status-${l.status}`}>{l.status}</span>
            </p>
          </div>
          <button
            autoFocus
            className="icon-button"
            aria-label="Close listing"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="modal-image">
          <Image
            src={l.images[0]}
            alt={l.title}
            fill
            sizes="650px"
            unoptimized={l.images[0].startsWith("/api/")}
          />
        </div>
        {preview && (
          <div className="preview-notice">
            This is a sample review. Sign in with an authorized account to
            manage real submissions.
          </div>
        )}
        {l.boarding && <BoardingSummary value={l.boarding} />}
        {admin ? (
          seo ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void action("seo", {
                  title: f.get("title"),
                  description: f.get("description"),
                  noindex: f.get("noindex") === "on",
                });
              }}
            >
              <label className="field">
                Search title
                <input
                  name="title"
                  required
                  minLength={10}
                  maxLength={100}
                  defaultValue={l.seo?.title || l.title}
                />
              </label>
              <label className="field">
                Meta description
                <textarea
                  name="description"
                  required
                  minLength={50}
                  maxLength={200}
                  defaultValue={
                    l.seo?.description || l.description.slice(0, 155)
                  }
                />
              </label>
              <label className="check-field">
                <input
                  name="noindex"
                  type="checkbox"
                  defaultChecked={l.seo?.noindex}
                />{" "}
                Exclude this listing from search indexing
              </label>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--muted)",
                  marginBottom: 20,
                }}
              >
                Canonical and social URLs are generated from the listing’s
                permanent address. Sample and unapproved listings remain
                noindex.
              </p>
              <button className="button button-dark" disabled={busy || preview}>
                Save metadata
              </button>
            </form>
          ) : (
            <>
              <p
                style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.9 }}
              >
                {l.description}
              </p>
              <div className="review-data">
                <div>
                  <span>Price</span>Rs. {priceLabel(l.price)} / {l.unit}
                </div>
                <div>
                  <span>Contact</span>
                  {l.contactName} ·{" "}
                  {l.contactVerified ? "Email verified" : "Email not verified"}
                </div>
                {!preview && (
                  <>
                    <div>
                      <span>Email</span>
                      {l.contactEmail}
                    </div>
                    <div>
                      <span>Phone</span>
                      {l.contactPhone}
                    </div>
                  </>
                )}
              </div>
              <label className="field">
                Review notes
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={1000}
                  placeholder="Record verification evidence, explain a decision, or tell the owner what needs changing."
                />
              </label>
              <div className="moderation-actions">
                <button
                  className="button button-dark"
                  disabled={busy || preview || !l.contactVerified}
                  onClick={() => action("approve")}
                >
                  <CheckCircle2 size={15} />
                  Approve
                </button>
                <button
                  className="button button-outline"
                  disabled={busy || preview}
                  onClick={() => action("request_changes")}
                >
                  Request changes
                </button>
                <button
                  className="button button-outline"
                  disabled={busy || preview}
                  onClick={() => action("reject")}
                >
                  Reject
                </button>
                <button
                  className="button button-outline"
                  disabled={busy || preview}
                  onClick={() => action("suspend")}
                >
                  <Ban size={14} />
                  Suspend
                </button>
                <button
                  className="button button-outline"
                  disabled={busy || preview}
                  onClick={() => action("feature")}
                >
                  <Star size={14} />
                  {l.featured ? "Unfeature" : "Feature"}
                </button>
                <button
                  className="button button-outline"
                  disabled={busy || preview}
                  onClick={() => action("verify")}
                >
                  <ShieldCheck size={14} />
                  {l.verified ? "Unverify" : "Verify"}
                </button>
                <button
                  className="button button-danger"
                  disabled={busy || preview || !note}
                  onClick={() => action("delete")}
                >
                  Delete listing
                </button>
              </div>
              <div className="history-list">
                <strong>Submission history</strong>
                {l.history.length ? (
                  l.history.map((h, i) => (
                    <p key={i}>
                      {new Date(h.at).toLocaleString()} ·{" "}
                      {h.action.replaceAll("_", " ")}
                      {h.note ? ` · ${h.note}` : ""}
                    </p>
                  ))
                ) : (
                  <p>No real events in this sample.</p>
                )}
              </div>
            </>
          )
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                await api(
                  `listings/${l._id}`,
                  {
                    ...Object.fromEntries(new FormData(e.currentTarget)),
                    ...(l.category === "Boarding" ? { boarding } : {}),
                  },
                  "PATCH",
                );
                await reload();
                notify(
                  "Changes saved. Your listing is back in the review queue.",
                );
                onClose();
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="field">
              Title
              <input
                name="title"
                required
                minLength={10}
                maxLength={100}
                defaultValue={l.title}
              />
            </label>
            <label className="field">
              Description
              <textarea
                name="description"
                required
                minLength={100}
                maxLength={5000}
                defaultValue={l.description}
              />
            </label>
            <label className="field">
              Price (LKR)
              <input
                name="price"
                required
                type="number"
                min="1"
                defaultValue={l.price}
              />
            </label>
            {l.category === "Boarding" && (
              <BoardingFields value={boarding} onChange={setBoarding} />
            )}
            <div className="preview-notice">
              Changes to your boarding details, title, description or price will
              return your listing to review.
            </div>
            <button className="button button-dark" disabled={busy || preview}>
              {busy ? "Saving…" : "Save & submit for review"}
              <ArrowRight size={15} />
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
