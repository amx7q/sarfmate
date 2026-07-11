import type { Metadata } from "next";
import DailyRootChallenge from "@/components/DailyRootChallenge";
import { getPublicRootEntries } from "@/lib/publicData";
import { pageMetadata } from "@/lib/siteConfig";

export const metadata: Metadata = pageMetadata({
  title: "Daily Root Challenge",
  description:
    "Recall all six Arabic forms and English meanings for a different reviewed root each day.",
});

export default function DailyRootChallengePage() {
  return (
    <div className="py-4">
      <div className="mx-auto max-w-2xl px-1 pt-6 text-center">
        <p className="leading-7 text-muted">
          SarfMate&rsquo;s Daily Root Challenge picks one reviewed Arabic root
          each day and asks you to recall all six of its core forms — past
          verb, present verb, imperative, place noun / mim-masdar, active
          participle, and passive participle — by typing the vowelled Arabic
          and its English meaning from memory. Correct answers build a daily
          streak, and you can share your score as an image once you submit.
        </p>
      </div>
      <DailyRootChallenge roots={getPublicRootEntries()} />
    </div>
  );
}
