"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { play } from "cuelume";
import { getDailyCardForms, getLocalDateKey, selectDailyRoot } from "@/lib/dailyRoot";
import type { RootEntry } from "@/lib/types";
import { usePublicRoots } from "@/lib/usePublicRoots";

export default function DailyRootCard({
  roots: initialRoots,
  initialEntry,
}: {
  roots?: RootEntry[];
  initialEntry?: RootEntry;
}) {
  const { roots } = usePublicRoots(initialRoots);
  // Seeded with the server-computed root so the first client render matches
  // the static HTML exactly (no hydration mismatch); the effect below then
  // corrects to the visitor's actual local date once mounted.
  const [entry, setEntry] = useState<RootEntry | undefined>(initialEntry);
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    if (!roots) return;
    const refresh = () => setEntry(selectDailyRoot(roots, getLocalDateKey()));
    refresh();
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [roots]);

  if (!entry) {
    return (
      <section className="my-12 rounded-2xl border border-border-soft bg-surface p-7 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-primary">Root of the Day</h2>
        <p className="mt-2 text-muted">Today’s root is not available. Browse the reviewed root library instead.</p>
        <Link href="/browse" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">Browse roots</Link>
      </section>
    );
  }

  const forms = getDailyCardForms(entry);
  const shareText = `SarfMate · Root of the Day\n${entry.displayRoot} — ${entry.meaningEn}\n${forms.map((form) => `${form.labelEn}: ${form.arabic} — ${form.meaningEn}`).join("\n")}\n\nsarfmate.app`;

  async function share() {
    const canShare = typeof navigator.share === "function";
    try {
      if (canShare) await navigator.share({ title: "SarfMate Root of the Day", text: shareText, url: `${window.location.origin}/root/${encodeURIComponent(entry!.root)}` });
      else await navigator.clipboard.writeText(shareText);
      play("success");
      setShareMessage(canShare ? "Shared." : "Root copied.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareMessage("Sharing is unavailable here.");
    }
  }

  return (
    <section aria-labelledby="daily-root-heading" className="relative mb-16 mt-14 overflow-hidden rounded-2xl border border-border-soft bg-surface p-6 shadow-sm sm:p-8">
      <div className="absolute inset-x-0 top-0 h-1 bg-accent" aria-hidden="true" />
      <div className="flex flex-col gap-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div>
          <h2 id="daily-root-heading" className="text-base font-semibold text-accent-strong">Root of the day</h2>
          <div className="mt-2 flex flex-col items-center gap-1 sm:flex-row sm:items-baseline sm:justify-start sm:gap-4">
            <p dir="rtl" lang="ar" className="whitespace-nowrap font-arabic text-6xl font-medium leading-none text-primary">{entry.displayRoot}</p>
            <p className="text-xl text-ink">{entry.meaningEn}</p>
          </div>
          <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
            Review three useful forms, then open the complete root or test your recall.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <Link href={`/root/${encodeURIComponent(entry.root)}`} className="rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-white hover:bg-primary/90">Study the full root</Link>
          <Link href="/practice#daily-activities" className="px-2 py-1 text-center text-sm font-semibold text-secondary hover:text-primary">Take today’s daily quiz →</Link>
        </div>
      </div>
      <div className="mt-7 grid grid-cols-3 border-y border-border-soft">
        {forms.map((form) => (
          <article key={form.key} className="min-w-0 border-l border-border-soft px-2 py-4 text-center first:border-l-0 sm:p-4">
            <p dir="rtl" lang="ar" className="font-arabic text-4xl text-primary">{form.arabic}</p>
            <h3 className="mt-2 text-sm font-semibold text-ink">{form.labelEn}</h3>
            <p className="mt-1 text-sm text-muted">{form.meaningEn}</p>
          </article>
        ))}
      </div>
      <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <Link href={`/practice?root=${encodeURIComponent(entry.root)}`} className="text-sm font-semibold text-primary hover:text-secondary">Practice this root →</Link>
        <button type="button" onClick={share} data-cuelume-press="" data-cuelume-release="" aria-label="Share today’s root" className="min-h-11 rounded-xl border border-border-soft px-4 py-2 text-sm font-semibold text-primary hover:bg-background">Share root</button>
      </div>
      <p aria-live="polite" className="mt-3 min-h-5 text-center text-sm text-muted">{shareMessage}</p>
    </section>
  );
}
