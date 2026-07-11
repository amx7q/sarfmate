import type { Metadata } from "next";
import { Suspense } from "react";
import PracticeSession from "@/components/PracticeSession";
import { getPublicRootEntries } from "@/lib/publicData";
import { pageMetadata } from "@/lib/siteConfig";

export const metadata: Metadata = pageMetadata({
  title: "Practice Arabic forms",
  description:
    "Practice Arabic root forms with five short questions using reviewed SarfMate data.",
});

export default function PracticePage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl px-1 text-center">
        {/* PracticeSession renders its own <h1> once hydrated; this stays a
            <p> so the page never has two top-level headings. */}
        <p className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          Practice Arabic forms
        </p>
        <p className="mt-4 leading-7 text-muted">
          Test your recall of Arabic roots with short, focused questions drawn
          from SarfMate&rsquo;s reviewed root library. Each question checks
          one of the six core forms — past verb, present verb, imperative,
          place noun / mim-masdar, active participle, or passive participle —
          against its Arabic form, English meaning, or an example sentence.
        </p>
        <p className="mt-3 leading-7 text-muted">
          Choose <strong>Easy</strong> to match Arabic forms with their
          English meanings, <strong>Medium</strong> to also recognise which
          of the six forms you&rsquo;re looking at, or <strong>Hard</strong>{" "}
          to spot meanings inside full example sentences. A five-question
          daily quiz below tracks a streak, and a separate practice mode lets
          you drill roots you&rsquo;ve gotten wrong before.
        </p>
      </div>
      <Suspense fallback={<p className="text-center text-muted">Loading practice…</p>}>
        <PracticeSession roots={getPublicRootEntries()} />
      </Suspense>
    </div>
  );
}
