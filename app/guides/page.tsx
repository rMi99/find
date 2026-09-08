import { pageMetadata } from "@/lib/metadata";
import Image from "next/image";
import Link from "@/components/site-link";
import { ArrowUpRight } from "lucide-react";
import { guides } from "@/lib/editorial";
export const metadata = pageMetadata(
  "Sri Lanka rental, boarding & stay guides",
  "Practical guides to boarding rooms, rental viewings, weekend stays and writing useful property listings in Sri Lanka.",
  "/guides",
);
export default function Guides() {
  return (
    <main className="container">
      <div className="page-top">
        <span className="eyebrow">THE LOCAL EDIT</span>
        <h1>A little inspiration goes a long way.</h1>
        <p>
          Good questions. Thoughtful ideas. A few things to help you find your
          somewhere.
        </p>
      </div>
      <div className="guide-grid">
        {guides.map((g) => (
          <article className="guide-card" key={g.slug}>
            <Link href={`/guides/${g.slug}`}>
              <div className="guide-image">
                <Image
                  src={g.image}
                  alt={g.title}
                  fill
                  sizes="(max-width: 600px) 90vw, 33vw"
                />
              </div>
              <div className="guide-copy">
                <span className="eyebrow" style={{ fontSize: 8 }}>
                  {g.category}
                </span>
                <h2>{g.title}</h2>
                <p>{g.description}</p>
                <span className="text-link">
                  Take a little look <ArrowUpRight size={15} />
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
