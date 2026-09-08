import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { once } from "node:events";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import { ensureIndexes } from "../lib/db";
import type { Listing, User } from "../lib/types";
const mongo = await MongoMemoryServer.create({
  binary: { version: "8.2.3" },
  instance: { ip: "127.0.0.1" },
});
const client = await new MongoClient(mongo.getUri()).connect();
const database = client.db("ceylon_integration");
await ensureIndexes(database);
const base = "http://localhost:3107";
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", "-p", "3107"],
  {
    env: {
      ...process.env,
      NODE_ENV: "development",
      MONGODB_URI: mongo.getUri(),
      MONGODB_DB: "ceylon_integration",
      NEXT_PUBLIC_SITE_URL: base,
      DEMO_CONTENT: "false",
      NEXT_DIST_DIR: ".next-integration",
      RESEND_API_KEY: "",
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: "",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let logs = "";
server.stdout.on("data", (d) => {
  logs = (logs + d).slice(-12000);
});
server.stderr.on("data", (d) => {
  logs = (logs + d).slice(-12000);
});
class Visitor {
  cookies = new Map<string, string>();
  async request(path: string, method = "GET", body?: unknown, origin = base) {
    const form = body instanceof FormData;
    const response = await fetch(base + path, {
      method,
      headers: {
        Origin: origin,
        Cookie: [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; "),
        ...(body && !form ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: form ? body : JSON.stringify(body) } : {}),
    });
    for (const cookie of response.headers.getSetCookie()) {
      const [pair] = cookie.split(";");
      const at = pair.indexOf("=");
      this.cookies.set(pair.slice(0, at), pair.slice(at + 1));
    }
    return response;
  }
  async json(path: string, method = "GET", body?: unknown, expected = 200) {
    const response = await this.request(path, method, body);
    const data = await response.json();
    assert.equal(
      response.status,
      expected,
      `${method} ${path}: ${JSON.stringify(data)}`,
    );
    return data;
  }
}
let checks = 0;
function passed(name: string) {
  checks++;
  console.log(`PASS ${checks}: ${name}`);
}
try {
  for (let i = 0; i < 120; i++) {
    try {
      const response = await fetch(base + "/api/auth/me");
      if (response.ok) break;
    } catch {
      /* wait for isolated server */
    }
    await new Promise((r) => setTimeout(r, 500));
    if (i === 119) throw new Error("Test server failed to start: " + logs);
  }
  const guest = new Visitor(),
    owner = new Visitor(),
    admin = new Visitor(),
    stranger = new Visitor();
  await guest.json("/api/admin", "GET", undefined, 401);
  passed("Admin data requires authentication");
  assert.equal(
    (
      await guest.request(
        "/api/auth/register",
        "POST",
        {},
        "https://other.example",
      )
    ).status,
    403,
  );
  passed("Cross-origin writes are refused");
  const registration = await owner.json(
    "/api/auth/register",
    "POST",
    {
      name: "Integration Host",
      email: "host@example.test",
      password: "a-local-test-password-72",
      role: "admin",
    },
    201,
  );
  assert.equal(registration.user.role, "user");
  assert.ok(registration.verificationUrl);
  assert.ok(!registration.user.passwordHash);
  passed("Registration stores safe users and ignores role injection");
  await owner.json("/api/admin", "GET", undefined, 403);
  passed("Ordinary accounts cannot access admin data");
  const ownerRecord = await database
    .collection<User>("users")
    .findOne({ email: "host@example.test" });
  assert.ok(
    ownerRecord?.passwordHash &&
      !ownerRecord.passwordHash.includes("a-local-test-password"),
  );
  passed("Passwords are stored as salted hashes");
  const adminRegistration = await admin.json(
    "/api/auth/register",
    "POST",
    {
      name: "Integration Admin",
      email: "admin@example.test",
      password: "a-local-admin-password-83",
    },
    201,
  );
  await database
    .collection<User>("users")
    .updateOne(
      { _id: adminRegistration.user._id },
      { $set: { role: "admin", verified: true } },
    );
  await admin.json("/api/admin");
  passed("Authorized admin can open the workspace");
  const body = new FormData();
  body.append(
    "file",
    new File([await readFile("public/images/villa.webp")], "villa.webp", {
      type: "image/webp",
    }),
  );
  const upload = await owner.json("/api/uploads", "POST", body, 201);
  assert.equal((await stranger.request(upload.url)).status, 404);
  assert.equal((await owner.request(upload.url)).status, 200);
  passed("Unpublished photos are private to the uploader");
  const invalid = new FormData();
  invalid.append(
    "file",
    new File(["<svg>not a photo</svg>"], "pretend.jpg", { type: "image/jpeg" }),
  );
  await owner.json("/api/uploads", "POST", invalid, 400);
  passed("Fake image contents are rejected");
  const fields = {
    title: "A Real Integration Test Villa",
    description:
      "A deliberately created integration fixture with a private garden and three comfortable bedrooms. This record verifies the real submission, review and publication workflow and will be deleted after testing.",
    category: "Villa",
    purpose: "Stay",
    city: "Galle",
    district: "Galle",
    province: "Southern",
    area: "Test area",
    price: 22000,
    unit: "night",
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    amenities: ["Wi-Fi", "Pool"],
    images: [upload.url],
    contactName: "Integration Host",
    contactEmail: "host@example.test",
    contactPhone: "+94770000000",
    available: true,
    blockedDates: [],
    status: "approved",
    verified: true,
  };
  const submitted = await owner.json("/api/listings", "POST", fields, 201);
  assert.equal(submitted.status, "pending");
  assert.equal((await guest.json("/api/listings")).total, 0);
  const pending = await database
    .collection<Listing>("listings")
    .findOne({ _id: submitted.id });
  assert.ok(pending);
  assert.equal((await guest.request(`/places/${pending.slug}`)).status, 404);
  passed("Pending submissions cannot leak into browse or public detail pages");
  await admin.json(
    `/api/admin/listings/${submitted.id}`,
    "POST",
    { action: "approve" },
    400,
  );
  passed("Admin cannot approve unverified contact details");
  const verifyToken = new URL(registration.verificationUrl).searchParams.get(
    "token",
  );
  await owner.json("/api/verify", "POST", { token: verifyToken });
  await owner.json("/api/verify", "POST", { token: verifyToken }, 400);
  passed("Email verification is single-use and verifies pending owner contact");
  await admin.json(`/api/admin/listings/${submitted.id}`, "POST", {
    action: "approve",
  });
  const publicData = await guest.json("/api/listings");
  assert.equal(publicData.total, 1);
  assert.equal(publicData.listings[0].contactEmail, undefined);
  assert.equal(publicData.listings[0].ownerId, undefined);
  assert.equal((await stranger.request(upload.url)).status, 200);
  passed(
    "Only approval publishes a listing and its photos, without private contact data",
  );
  const page = await (await guest.request(`/places/${pending.slug}`)).text();
  assert.ok(page.includes("application/ld+json"));
  assert.ok(page.includes(`rel="canonical"`));
  passed("Approved listing emits canonical metadata and structured data");
  const sitemap = await (
    await guest.request("/sitemaps/listings-0.xml")
  ).text();
  assert.ok(sitemap.includes(pending.slug));
  passed("Approved quality listing enters the sitemap");
  await stranger.json(
    `/api/listings/${submitted.id}`,
    "PATCH",
    { action: "availability", available: false },
    401,
  );
  passed("Availability updates require the owner");
  await owner.json(`/api/listings/${submitted.id}`, "PATCH", {
    action: "availability",
    available: true,
    blockedDates: ["2026-12-25"],
  });
  assert.equal((await guest.json("/api/listings?date=2026-12-25")).total, 0);
  assert.equal((await guest.json("/api/listings?date=2026-12-26")).total, 1);
  passed("Search respects unavailable dates");
  await owner.json("/api/favorites", "POST", {
    listingId: submitted.id,
    saved: true,
  });
  assert.equal((await owner.json("/api/workspace")).saved.length, 1);
  await owner.json("/api/favorites", "POST", {
    listingId: submitted.id,
    saved: false,
  });
  assert.equal((await owner.json("/api/workspace")).saved.length, 0);
  passed("Favorites persist and remove correctly");
  await guest.json(
    "/api/inquiries",
    "POST",
    {
      listingId: submitted.id,
      name: "Interested Visitor",
      email: "visitor@example.test",
      message: "Could you confirm the available dates and your check-in time?",
    },
    201,
  );
  assert.equal((await owner.json("/api/workspace")).inquiries.length, 1);
  passed("Inquiries reach the owner dashboard");
  await guest.json(
    "/api/reports",
    "POST",
    {
      listingId: submitted.id,
      reason: "Incorrect information",
      details: "Integration report for review.",
    },
    201,
  );
  const reports = (await admin.json("/api/admin")).reports;
  assert.equal(reports.length, 1);
  await admin.json(`/api/admin/reports/${reports[0]._id}`, "POST", {});
  passed("Reports enter the admin queue and can be resolved");
  await owner.json(`/api/listings/${submitted.id}`, "PATCH", {
    title: "An Updated Integration Villa",
    description: fields.description,
    price: 23000,
  });
  assert.equal((await guest.json("/api/listings")).total, 0);
  assert.ok(
    !(await (await guest.request("/sitemaps/listings-0.xml")).text()).includes(
      pending.slug,
    ),
  );
  passed("Important owner edits withdraw publication and sitemap inclusion");
  await admin.json(`/api/admin/listings/${submitted.id}`, "POST", {
    action: "reject",
    note: "Please provide updated property details.",
  });
  assert.equal(
    (await owner.json("/api/workspace")).listings[0].status,
    "rejected",
  );
  assert.ok((await owner.json("/api/workspace")).notifications.length > 0);
  passed("Moderation decisions and notes reach the owner");
  const guestForm = new FormData();
  guestForm.append(
    "file",
    new File([await readFile("public/images/apartment.webp")], "guest.webp", {
      type: "image/webp",
    }),
  );
  const guestPhoto = await guest.json("/api/uploads", "POST", guestForm, 201);
  const guestListing = await guest.json(
    "/api/listings",
    "POST",
    {
      ...fields,
      title: "A Guest Submitted Integration Home",
      images: [guestPhoto.url],
      contactEmail: "guest@example.test",
    },
    201,
  );
  assert.ok(guestListing.verificationUrl);
  assert.equal(guestListing.status, "pending");
  passed("Guest submissions require verification and cannot self-publish");
  const history = (await database
    .collection<Listing>("listings")
    .findOne({ _id: submitted.id }))!.history;
  assert.ok(
    history.some((h) => h.action === "approve") &&
      history.some((h) => h.action === "edited_and_resubmitted") &&
      history.some((h) => h.action === "reject"),
  );
  passed("Audit trail records publication and revision decisions");

  const boarding = {
    audience: "women",
    roomType: "shared",
    capacity: 3,
    vacancies: 2,
    priceBasis: "person",
    tenantType: "students",
  };
  const boardingFields = {
    ...fields,
    title: "Three Person Boarding Room in Galle",
    category: "Boarding",
    purpose: "Rent",
    unit: "month",
    boarding,
  };
  await owner.json(
    "/api/listings",
    "POST",
    { ...boardingFields, boarding: undefined },
    400,
  );
  await owner.json(
    "/api/listings",
    "POST",
    { ...boardingFields, boarding: { ...boarding, vacancies: 4 } },
    400,
  );
  await owner.json(
    "/api/listings",
    "POST",
    { ...boardingFields, unit: "night" },
    400,
  );
  await owner.json(
    "/api/listings",
    "POST",
    {
      ...boardingFields,
      boarding: { ...boarding, audience: "couples", capacity: 1, vacancies: 1 },
    },
    400,
  );
  passed(
    "Boarding requires complete, consistent occupancy and monthly pricing",
  );
  const room = await owner.json("/api/listings", "POST", boardingFields, 201);
  await admin.json(`/api/admin/listings/${room.id}`, "POST", {
    action: "approve",
  });
  const roomPath = `/api/listings/${room.id}`;
  const results = await guest.json(
    "/api/listings?category=Boarding&audience=women&capacity=3&vacancies=2&priceBasis=person",
  );
  assert.equal(results.total, 1);
  assert.equal(results.listings[0].boarding.vacancies, 2);
  assert.equal(results.listings[0].guests, 3);
  assert.equal(
    (await guest.json("/api/listings?category=Boarding&audience=men")).total,
    0,
  );
  assert.equal(
    (await guest.json("/api/listings?category=Boarding&vacancies=3")).total,
    0,
  );
  assert.equal(
    (await guest.json("/api/listings?category=Boarding&priceBasis=room")).total,
    0,
  );
  passed(
    "Published boarding is searchable by audience, exact capacity, vacancies and price basis",
  );
  const roomHtml = await (
    await guest.request(`/places/${results.listings[0].slug}`)
  ).text();
  assert.ok(
    roomHtml.includes("Your boarding arrangement") &&
      roomHtml.includes("person / month"),
  );
  await stranger.json(
    roomPath,
    "PATCH",
    { action: "availability", available: true, vacancies: 1 },
    401,
  );
  await owner.json(
    roomPath,
    "PATCH",
    { action: "availability", available: true, vacancies: 4 },
    400,
  );
  await owner.json(
    roomPath,
    "PATCH",
    { action: "availability", available: true, vacancies: 0 },
    400,
  );
  await owner.json(roomPath, "PATCH", {
    action: "availability",
    available: false,
    vacancies: 0,
  });
  assert.equal(
    (await guest.json("/api/listings?category=Boarding&vacancies=1")).total,
    0,
  );
  assert.equal(
    (await database.collection<Listing>("listings").findOne({ _id: room.id }))!
      .status,
    "approved",
  );
  passed(
    "Owner-only vacancy updates reject impossible counts and hide full rooms from availability searches",
  );
  await owner.json(roomPath, "PATCH", {
    title: boardingFields.title,
    description: fields.description,
    price: 18000,
    boarding: { ...boarding, audience: "men", capacity: 6, vacancies: 6 },
  });
  assert.equal((await guest.json("/api/listings?category=Boarding")).total, 0);
  await admin.json(`/api/admin/listings/${room.id}`, "POST", {
    action: "approve",
  });
  assert.equal(
    (
      await guest.json(
        "/api/listings?category=Boarding&audience=men&capacity=6",
      )
    ).total,
    1,
  );
  passed(
    "Changing a boarding arrangement returns it to moderation before republication",
  );
  const thin = await (await guest.request("/boarding-for-women/galle")).text();
  assert.match(thin, /name="robots" content="noindex, follow"/);
  const guide = await (
    await guest.request("/guides/boarding-house-checklist")
  ).text();
  assert.ok(
    guide.includes('"@type":"Article"') &&
      guide.includes('"@type":"BreadcrumbList"'),
  );
  assert.ok(
    !guide.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"),
  );
  passed(
    "Thin boarding pages stay noindex; original guides have structured data and ads remain disabled",
  );
  // Qualifying inventory for one audience must not index another audience's page.
  const template = (await database
    .collection<Listing>("listings")
    .findOne({ _id: room.id }))!;
  await database
    .collection<Listing>("listings")
    .insertMany(
      [1, 2, 3].map((i) => ({
        ...template,
        _id: `seo-boarding-${i}`,
        slug: `seo-boarding-${i}`,
        boarding: { ...template.boarding!, audience: "women" as const },
      })),
    );
  const discoveryMap = await (
    await guest.request("/sitemaps/discovery.xml")
  ).text();
  assert.ok(
    discoveryMap.includes("/boarding-for-women/galle") &&
      discoveryMap.includes("/boarding-for-women</loc>"),
  );
  assert.ok(!discoveryMap.includes("/boarding-for-men/galle"));
  const indexed = await (
    await guest.request("/boarding-for-women/galle")
  ).text();
  assert.match(indexed, /name="robots" content="index, follow"/);
  passed(
    "Audience-specific sitemap and indexing gates require matching, approved inventory",
  );
  await owner.json("/api/auth/logout", "POST", {});
  await owner.json("/api/workspace", "GET", undefined, 401);
  passed("Logout revokes the session");
  for (let i = 0; i < 15; i++)
    await stranger.request("/api/auth/login", "POST", {
      email: "unknown@example.test",
      password: "incorrect",
    });
  assert.equal(
    (
      await stranger.request("/api/auth/login", "POST", {
        email: "unknown@example.test",
        password: "incorrect",
      })
    ).status,
    429,
  );
  passed("Authentication attempts are rate limited");
  console.log(
    `\n${checks} integration checks passed against an isolated MongoDB instance.`,
  );
} catch (error) {
  console.error(error);
  console.error(logs.slice(-3000));
  process.exitCode = 1;
} finally {
  server.kill("SIGTERM");
  await Promise.race([
    once(server, "exit"),
    new Promise((r) => setTimeout(r, 5000)),
  ]);
  if (server.exitCode === null) server.kill("SIGKILL");
  await database.dropDatabase();
  await client.close();
  await mongo.stop();
}
