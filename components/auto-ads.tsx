import Script from "next/script";
import { adsEnabled, adsPublisher } from "@/lib/ads";
export function AutoAds({ eligible = false }: { eligible?: boolean }) {
  if (!eligible || !adsEnabled()) return null;
  // Google Privacy & Messaging must be published in the AdSense account.
  // The AdSense tag deploys the configured messages and consumes their signals.
  return (
    <Script
      id="ceylon-adsense"
      strategy="lazyOnload"
      async
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsPublisher()}`}
    />
  );
}
