import type { Metadata } from "next";
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  indexable = true,
  image = "/images/mirissa-hero.webp",
): Metadata {
  const index =
    indexable &&
    !!process.env.NEXT_PUBLIC_SITE_URL &&
    process.env.DEMO_CONTENT !== "true";
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index, follow: true },
    openGraph: {
      type: "website",
      title,
      description,
      url: path,
      siteName: "Ceylon",
      locale: "en_LK",
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
