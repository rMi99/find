// Publisher IDs are public identifiers. Keep serving off until the account,
// site's privacy messages and AdSense page exclusions have been configured.
export function adsPublisher() {
  const id = process.env.ADSENSE_PUBLISHER_ID || "";
  return /^ca-pub-\d{16}$/.test(id) && !/^ca-pub-0+$/.test(id) ? id : null;
}
export function adsEnabled() {
  let publicHost = false;
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SITE_URL || "");
    publicHost =
      url.protocol === "https:" &&
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  } catch {
    /* A public canonical origin is required. */
  }
  return (
    process.env.NODE_ENV === "production" &&
    process.env.DEMO_CONTENT !== "true" &&
    publicHost &&
    process.env.ADSENSE_ENABLED === "true" &&
    process.env.ADSENSE_PRIVACY_READY === "true" &&
    !!adsPublisher()
  );
}
