import type { Metadata } from "next";
import { Suspense } from "react";
import PracticeSession from "@/components/PracticeSession";
import { getPublicRootEntries } from "@/lib/publicData";

export const metadata: Metadata = {
  title: "Practice Arabic forms",
  description: "Practice Arabic root forms with five short questions using reviewed SarfMate data.",
};

export default function PracticePage() {
  return (
    <div className="py-12 sm:py-16">
      <Suspense fallback={<p className="text-center text-muted">Loading practice…</p>}>
        <PracticeSession roots={getPublicRootEntries()} />
      </Suspense>
    </div>
  );
}
