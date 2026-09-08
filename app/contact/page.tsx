import { pageMetadata } from "@/lib/metadata";
import { ContactForm } from "@/components/contact-form";
export const metadata = pageMetadata(
  "Contact Ceylon",
  "Contact the Ceylon team for help with listings, your account, feedback or property discovery in Sri Lanka.",
  "/contact",
);
export default function Contact() {
  return (
    <main className="container" style={{ maxWidth: 760, paddingBottom: 70 }}>
      <div className="page-top">
        <span className="eyebrow">GOOD THINGS START WITH A CONVERSATION</span>
        <h1>Say a little hello.</h1>
        <p>
          Questions, feedback or a little help finding your way? Leave a note
          for the team. Please don’t include passwords or sensitive documents.
        </p>
      </div>
      <ContactForm />
    </main>
  );
}
