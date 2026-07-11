import type { Metadata } from "next";
import DailyRootChallenge from "@/components/DailyRootChallenge";
import { getPublicRootEntries } from "@/lib/publicData";

export const metadata: Metadata = {
  title: "Daily Root Challenge",
  description: "Recall all six Arabic forms and English meanings for a different reviewed root each day.",
};

export default function DailyRootChallengePage() {
  return <DailyRootChallenge roots={getPublicRootEntries()} />;
}
