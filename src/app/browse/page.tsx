import type { Metadata } from "next";
import { getPublicQuranRootIndex, getPublicRootEntries } from "@/lib/publicData";
import BrowseRoots from "@/components/BrowseRoots";

export const metadata: Metadata = {
  title: "Browse roots",
  description:
    "Browse the SarfMate library of Arabic roots with English meanings and status badges.",
};

export default function BrowsePage() {
  const roots = getPublicRootEntries();
  const quranRoots = getPublicQuranRootIndex();

  return (
    <div className="py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Browse roots
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Explore every root in the SarfMate library. Filter by Arabic letters
          or English meaning, then open a root to see its six core forms.
        </p>
      </div>
      <div className="mt-10">
        <BrowseRoots roots={roots} quranRoots={quranRoots} />
      </div>
    </div>
  );
}
