import { SubmissionForm } from "@/components/submission-form";
export const metadata = {
  title: "List your place",
  robots: { index: false, follow: true },
};
export default function Submit() {
  return <SubmissionForm />;
}
