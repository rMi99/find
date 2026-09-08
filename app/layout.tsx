import { adsEnabled, adsPublisher } from "@/lib/ads";
import { NavigationPolicy } from "@/components/site-link";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { Header, Footer } from "@/components/shell";
import "./globals.css";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  ...(adsPublisher()
    ? { other: { "google-adsense-account": adsPublisher()! } }
    : {}),
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "Ceylon · Find your kind of somewhere",
    template: "%s | Ceylon",
  },
  description:
    "Discover homes, boarding houses, villas, stays and day-out experiences across Sri Lanka. Find a place to call home or a little escape with Ceylon.",
  openGraph: {
    type: "website",
    locale: "en_LK",
    siteName: "Ceylon",
    images: [
      {
        url: "/images/mirissa-hero.webp",
        width: 1800,
        height: 1350,
        alt: "Find your kind of somewhere with Ceylon",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  robots:
    process.env.NEXT_PUBLIC_SITE_URL && process.env.DEMO_CONTENT !== "true"
      ? { index: true, follow: true }
      : { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <NavigationPolicy full={adsEnabled()}>
          <Providers>
            <a href="#main-content" className="skip-link">
              Skip to content
            </a>
            <Header />
            <div id="main-content">{children}</div>
            <Footer />
          </Providers>
        </NavigationPolicy>
      </body>
    </html>
  );
}
