import { adsPublisher } from "@/lib/ads";
export const dynamic = "force-dynamic";
export function GET() {
  const publisher = adsPublisher();
  return new Response(
    publisher
      ? `google.com, ${publisher.replace("ca-", "")}, DIRECT, f08c47fec0942fa0\n`
      : "# Advertising is not configured.\n",
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300",
        "X-Robots-Tag": "noindex",
      },
    },
  );
}
