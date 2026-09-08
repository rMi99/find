import assert from "node:assert/strict";
import { AutoAds } from "../components/auto-ads";
import { SiteLink, NavigationPolicy } from "../components/site-link";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { adsEnabled, adsPublisher } from "../lib/ads";
import { boardingSchema } from "../lib/validation";
import { pageMetadata } from "../lib/metadata";
const env = process.env as Record<string, string | undefined>;
const original = { ...env };
try {
  for (const key of [
    "ADSENSE_ENABLED",
    "ADSENSE_PUBLISHER_ID",
    "ADSENSE_PRIVACY_READY",
    "NEXT_PUBLIC_SITE_URL",
    "DEMO_CONTENT",
  ])
    delete env[key];
  assert.equal(adsEnabled(), false);
  env.ADSENSE_PUBLISHER_ID = "ca-pub-0000000000000000";
  assert.equal(adsPublisher(), null);
  env.ADSENSE_PUBLISHER_ID = "ca-pub-1234567890123456";
  assert.equal(adsPublisher(), "ca-pub-1234567890123456");
  Object.assign(env, {
    NODE_ENV: "production",
    ADSENSE_ENABLED: "true",
    NEXT_PUBLIC_SITE_URL: "https://example.test",
    DEMO_CONTENT: "false",
  });
  assert.equal(
    adsEnabled(),
    false,
    "No ads without privacy configuration confirmation",
  );
  env.ADSENSE_PRIVACY_READY = "true";
  assert.equal(adsEnabled(), true);
  assert.equal(AutoAds({ eligible: false }), null);
  const ad = AutoAds({ eligible: true });
  assert.ok(ad);
  assert.equal(ad.props.strategy, "lazyOnload");
  assert.equal(
    ad.props.src,
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456",
  );
  const link = renderToStaticMarkup(
    createElement(NavigationPolicy, {
      full: true,
      children: createElement(SiteLink, {
        href: "/dashboard",
        children: "Dashboard",
      }),
    }),
  );
  assert.equal(link, '<a href="/dashboard">Dashboard</a>');
  env.DEMO_CONTENT = "true";
  assert.equal(adsEnabled(), false);
  assert.equal(AutoAds({ eligible: true }), null);
  env.DEMO_CONTENT = "false";
  env.NEXT_PUBLIC_SITE_URL = "https://localhost";
  assert.equal(adsEnabled(), false);
  env.NEXT_PUBLIC_SITE_URL = "http://example.test";
  assert.equal(adsEnabled(), false);
  env.NEXT_PUBLIC_SITE_URL = "https://example.test";
  env.NODE_ENV = "development";
  assert.equal(adsEnabled(), false);
  for (const audience of ["women", "men", "couples", "any"])
    for (const capacity of [1, 2, 3, 6, 12, 30]) {
      const result = boardingSchema.safeParse({
        audience,
        capacity,
        vacancies: capacity,
        roomType: "shared",
        priceBasis: "person",
        tenantType: "any",
      });
      assert.equal(result.success, !(audience === "couples" && capacity === 1));
    }
  assert.equal(
    boardingSchema.safeParse({
      audience: "men",
      capacity: 6,
      vacancies: 7,
      roomType: "shared",
      priceBasis: "person",
      tenantType: "any",
    }).success,
    false,
  );
  const metadata = pageMetadata(
    "Boarding for women",
    "Compare available spaces.",
    "/boarding-for-women",
    false,
  );
  assert.deepEqual(metadata.robots, { index: false, follow: true });
  assert.equal(metadata.openGraph?.title, "Boarding for women");
  console.log(
    "SEO metadata, boarding capacity matrix and AdSense configuration gates passed.",
  );
} finally {
  for (const key of Object.keys(env)) if (!(key in original)) delete env[key];
  Object.assign(env, original);
}
