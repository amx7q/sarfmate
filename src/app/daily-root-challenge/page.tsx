import type { Metadata } from "next";
import DailyRootChallenge from "@/components/DailyRootChallenge";
import { pageMetadata } from "@/lib/siteConfig";

export const metadata: Metadata = pageMetadata({
  title: "Daily Root Challenge",
  description:
    "Recall all six Arabic forms and English meanings for a different reviewed root each day.",
});

export default function DailyRootChallengePage() {
  return (
    <div className="py-4">
      <DailyRootChallenge />
    </div>
  );
}
