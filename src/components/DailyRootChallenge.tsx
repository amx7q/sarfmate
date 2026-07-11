"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ArabicKeyboard from "@/components/ArabicKeyboard";
import Dialog from "@/components/Dialog";
import {
  getLocalDateKey,
  getPreviousLocalDateKey,
  selectDailyChallengeRoot,
  selectDailyRoot,
} from "@/lib/dailyRoot";
import {
  EMPTY_DAILY_ROOT_CHALLENGE_PROGRESS,
  arabicPoints,
  completeDailyRootChallenge,
  gradeArabicAnswer,
  gradeEnglishAnswer,
  type AnswerScore,
  type DailyRootChallengeProgress,
} from "@/lib/dailyRootChallenge";
import type { RootEntry } from "@/lib/types";

const STORAGE_KEY = "sarfmate-daily-root-challenge-v1";
type Answers = Record<string, { arabic: string; english: string }>;
type Result = { arabic: AnswerScore; english: boolean };

function emptyAnswers(entry: RootEntry): Answers {
  return Object.fromEntries(entry.forms.map((form) => [form.key, { arabic: "", english: "" }]));
}

function readProgress(): DailyRootChallengeProgress {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<DailyRootChallengeProgress> | null;
    if (!value || typeof value.lastCompletedDate !== "string" || !Number.isInteger(value.streak) || value.streak! < 0) return EMPTY_DAILY_ROOT_CHALLENGE_PROGRESS;
    return { ...EMPTY_DAILY_ROOT_CHALLENGE_PROGRESS, ...value };
  } catch {
    return EMPTY_DAILY_ROOT_CHALLENGE_PROGRESS;
  }
}

function challengeCaption(score: number, streak: number): string {
  return `I scored ${score}/12 on today’s SarfMate Daily Root Challenge!\n${streak} day${streak === 1 ? "" : "s"} challenge streak · Six Arabic forms and meanings.\n\nCan you build today’s root?\nhttps://sarfmate.app/daily-root-challenge`;
}

function makeChallengeShareImage(score: number, streak: number, dateKey: string): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const context = canvas.getContext("2d");
  if (!context) return Promise.reject(new Error("Canvas is unavailable."));

  context.fillStyle = "#0f4d4a";
  context.fillRect(0, 0, 1200, 630);
  context.fillStyle = "#d4af37";
  context.fillRect(0, 0, 1200, 10);
  context.fillStyle = "#ffffff";
  context.font = "700 42px Arial, sans-serif";
  context.fillText("SarfMate", 72, 82);
  context.fillStyle = "#d4af37";
  context.font = "600 24px Arial, sans-serif";
  context.fillText("Daily root challenge", 72, 135);
  context.fillStyle = "#ffffff";
  context.font = "700 74px Arial, sans-serif";
  context.fillText(`${score} / 12`, 72, 255);
  context.font = "600 31px Arial, sans-serif";
  context.fillText("Six Arabic forms and meanings", 72, 310);
  context.strokeStyle = "rgba(255,255,255,0.24)";
  context.lineWidth = 2;
  context.strokeRect(72, 360, 470, 130);
  context.fillStyle = "#ffffff";
  context.font = "600 22px Arial, sans-serif";
  context.fillText("Current challenge streak", 102, 408);
  context.font = "700 45px Arial, sans-serif";
  context.fillText(`${streak} day${streak === 1 ? "" : "s"}`, 102, 463);
  context.font = "600 25px Arial, sans-serif";
  context.fillText("Can you build today’s root?", 72, 605);
  context.textAlign = "right";
  context.fillText("sarfmate.app/daily-root-challenge", 1128, 605);
  context.textAlign = "left";
  context.fillStyle = "rgba(255,255,255,0.65)";
  context.font = "500 20px Arial, sans-serif";
  context.fillText(dateKey, 1020, 82);

  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not create image.")), "image/png"));
}

function downloadImage(blob: Blob, dateKey: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `sarfmate-daily-root-challenge-${dateKey}.png`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function DailyRootChallenge({ roots }: { roots: RootEntry[] }) {
  const [dateKey, setDateKey] = useState("");
  const [entry, setEntry] = useState<RootEntry>();
  const [answers, setAnswers] = useState<Answers>({});
  const [results, setResults] = useState<Record<string, Result> | null>(null);
  const [progress, setProgress] = useState(EMPTY_DAILY_ROOT_CHALLENGE_PROGRESS);
  const [activeKeyboard, setActiveKeyboard] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareBlob, setShareBlob] = useState<Blob | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const today = getLocalDateKey();
      const homepageRoot = selectDailyRoot(roots, today);
      const challengeRoot = selectDailyChallengeRoot(roots, today, homepageRoot?.root);
      setDateKey(today);
      setEntry(challengeRoot);
      if (challengeRoot) setAnswers(emptyAnswers(challengeRoot));
      setProgress(readProgress());
    }, 0);
    return () => window.clearTimeout(timer);
  }, [roots]);

  if (!entry || !dateKey) {
    return <p className="py-20 text-center text-muted">Preparing today’s challenge…</p>;
  }

  function update(formKey: string, field: "arabic" | "english", value: string) {
    if (results) return;
    setAnswers((current) => ({ ...current, [formKey]: { ...current[formKey], [field]: value } }));
  }

  function keyboardKey(char: string) {
    if (!activeKeyboard) return;
    update(activeKeyboard, "arabic", `${answers[activeKeyboard]?.arabic ?? ""}${char}`);
    inputRefs.current[activeKeyboard]?.focus();
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const graded = Object.fromEntries(entry!.forms.map((form) => [form.key, {
      arabic: gradeArabicAnswer(answers[form.key]?.arabic ?? "", form.arabic),
      english: gradeEnglishAnswer(answers[form.key]?.english ?? "", form.meaningEn!),
    }])) as Record<string, Result>;
    setResults(graded);
    setActiveKeyboard(null);
    const score = entry!.forms.reduce((total, form) => total + arabicPoints(graded[form.key].arabic) + (graded[form.key].english ? 1 : 0), 0);
    const next = completeDailyRootChallenge(progress, dateKey, score, getPreviousLocalDateKey(dateKey));
    setProgress(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Progress remains available for this visit. */ }
  }

  const score = results ? entry.forms.reduce((total, form) => total + arabicPoints(results[form.key].arabic) + (results[form.key].english ? 1 : 0), 0) : 0;
  const caption = challengeCaption(score, progress.streak);

  function openShareModal() {
    setShareOpen(true);
    setShareBlob(null);
    setSharing(true);
    setShareMessage("Preparing your result image…");
    void makeChallengeShareImage(score, progress.streak, dateKey)
      .then((blob) => { setShareBlob(blob); setShareMessage("Your image is ready to share."); })
      .catch(() => setShareMessage("The share image could not be created. Please try again."))
      .finally(() => setSharing(false));
  }

  async function shareResult() {
    if (!shareBlob) return;
    const file = new File([shareBlob], `sarfmate-daily-root-challenge-${dateKey}.png`, { type: "image/png" });
    if (!navigator.share || !navigator.canShare?.({ files: [file] })) {
      downloadImage(shareBlob, dateKey);
      try { await navigator.clipboard.writeText(caption); setShareMessage("Image saved and caption copied."); }
      catch { setShareMessage("Image saved. Copy the caption below manually."); }
      return;
    }
    setSharing(true);
    setShareMessage("Opening your share options…");
    try {
      await navigator.share({ title: "My SarfMate Daily Root Challenge result", text: caption, files: [file] });
      setShareMessage("Result shared.");
    } catch (error) {
      setShareMessage(error instanceof DOMException && error.name === "AbortError" ? "Sharing cancelled." : "The share sheet could not open. You can download the image or copy the caption below.");
    } finally { setSharing(false); }
  }

  async function copyCaption() {
    try { await navigator.clipboard.writeText(caption); setShareMessage("Caption copied."); }
    catch { setShareMessage("The caption could not be copied automatically."); }
  }

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="text-sm font-semibold text-muted">Daily root challenge</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-primary sm:text-4xl">Build the complete root.</h1>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-muted">Enter all six vowelled Arabic forms and their English meanings. A new reviewed root is selected each day.</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
            <span className="font-semibold text-primary">{progress.streak} day streak</span>
            <span className="text-border-soft" aria-hidden="true">·</span>
            <span className="text-muted">Completion counts on submission</span>
          </div>
        </div>

        <form onSubmit={submit} className="mt-9 rounded-2xl border border-border-soft bg-surface p-4 shadow-sm sm:p-8">
          <div className="flex flex-col gap-2 border-b border-border-soft pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-muted">Today’s challenge root</p>
              <h2 dir="rtl" lang="ar" className="mt-1 font-arabic text-5xl font-medium text-primary">{entry.displayRoot}</h2>
              <p className="mt-1 text-lg font-semibold text-ink">{entry.meaningEn}</p>
            </div>
            <p className="text-sm text-muted">12 points · Arabic vowel accuracy earns full credit</p>
          </div>

          <div className="mt-6 space-y-5">
            {entry.forms.map((form, index) => {
              const result = results?.[form.key];
              return (
                <fieldset key={form.key} className="border-b border-border-soft px-1 pb-5 last:border-b-0 sm:px-0">
                  <legend className="text-sm font-semibold text-primary">{index + 1}. {form.labelEn}</legend>
                  <div className="mt-2 grid gap-4 md:grid-cols-2">
                    <div className="relative">
                      <label htmlFor={`${form.key}-arabic`} className="text-sm font-medium text-ink">Vowelled Arabic form</label>
                      <div className="mt-2 flex gap-2">
                        <input ref={(node) => { inputRefs.current[form.key] = node; }} id={`${form.key}-arabic`} dir="rtl" lang="ar" value={answers[form.key]?.arabic ?? ""} onChange={(event) => update(form.key, "arabic", event.target.value)} disabled={Boolean(results)} autoComplete="off" className="min-w-0 flex-1 rounded-xl border border-border-soft bg-surface px-4 py-3 font-arabic text-2xl text-primary disabled:opacity-80" />
                        {!results && <button type="button" aria-label={`Open Arabic keyboard for ${form.labelEn}`} aria-expanded={activeKeyboard === form.key} onClick={() => setActiveKeyboard((current) => current === form.key ? null : form.key)} className="shrink-0 rounded-xl border border-border-soft bg-surface px-3 text-xl hover:bg-background">⌨</button>}
                      </div>
                      <ArabicKeyboard open={!results && activeKeyboard === form.key} includeDiacritics onKey={keyboardKey} onBackspace={() => update(form.key, "arabic", (answers[form.key]?.arabic ?? "").slice(0, -1))} />
                    </div>
                    <div>
                      <label htmlFor={`${form.key}-english`} className="text-sm font-medium text-ink">English meaning</label>
                      <input id={`${form.key}-english`} value={answers[form.key]?.english ?? ""} onChange={(event) => update(form.key, "english", event.target.value)} disabled={Boolean(results)} autoComplete="off" className="mt-2 w-full rounded-xl border border-border-soft bg-surface px-4 py-3 text-ink disabled:opacity-80" />
                    </div>
                  </div>
                  {result && (
                    <div className="mt-4 border-t border-border-soft pt-4" role="status">
                      <p className="font-semibold text-primary">Arabic: {result.arabic === "correct" ? "Correct · 1 point" : result.arabic === "partial" ? "Right letters, check the vowels · ½ point" : "Not correct yet · 0 points"} · English: {result.english ? "Correct · 1 point" : "Review needed · 0 points"}</p>
                      <p className="mt-2 text-sm text-muted">Correct answer: <span dir="rtl" lang="ar" className="font-arabic text-xl text-primary">{form.arabic}</span> — {form.meaningEn}</p>
                    </div>
                  )}
                </fieldset>
              );
            })}
          </div>

          <div className="mt-7 flex flex-col items-center justify-between gap-4 border-t border-border-soft pt-6 sm:flex-row">
            {results ? (
              <>
                <div><p className="text-2xl font-bold text-primary">{score} / 12 points</p><p className="text-sm text-muted">Challenge complete · {progress.streak} day streak</p></div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={openShareModal} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90">Share result</button>
                  <Link href={`/root/${encodeURIComponent(entry.root)}`} className="rounded-xl border border-border-soft px-5 py-3 text-center text-sm font-semibold text-primary hover:bg-background">Study the full root</Link>
                </div>
              </>
            ) : (
              <><p className="text-sm text-muted">You’ll see all corrections after submitting.</p><button type="submit" className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 sm:w-auto">Submit challenge</button></>
            )}
          </div>
        </form>
        {results && (
          <Dialog open={shareOpen} onClose={() => setShareOpen(false)} title="Share your Daily Root Challenge result">
            <div className="rounded-2xl border border-border-soft bg-surface p-5 text-ink">
              <div className="p-5">
                <div className="flex items-center justify-between gap-3"><p className="text-lg font-bold text-primary">SarfMate</p><span className="text-sm font-semibold text-accent">Daily root challenge</span></div>
                <h3 className="mt-5 text-3xl font-bold">I scored {score}/12 today</h3>
                <p className="mt-2 text-sm text-muted">Six Arabic forms and their English meanings.</p>
                <div className="mt-5 border-t border-border-soft pt-3 text-primary"><p className="text-sm text-muted">Current challenge streak</p><p className="mt-1 text-2xl font-bold text-secondary">{progress.streak} day{progress.streak === 1 ? "" : "s"}</p></div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-border-soft pt-4"><div><p className="font-semibold">Can you build today’s root?</p><p className="text-xs text-muted">sarfmate.app/daily-root-challenge</p></div><span className="text-sm font-semibold text-primary">Try it →</span></div>
            </div>
            <div className="mt-5"><p className="text-sm font-semibold text-ink">Caption</p><p className="mt-2 whitespace-pre-line rounded-xl border border-border-soft bg-background p-3 text-sm leading-6 text-muted">{caption}</p></div>
            <button type="button" disabled={!shareBlob || sharing} onClick={shareResult} className="mt-5 w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60">{sharing ? "Preparing image…" : "Share image and caption"}</button>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button type="button" disabled={!shareBlob} onClick={() => shareBlob && downloadImage(shareBlob, dateKey)} className="rounded-xl border border-border-soft px-4 py-2.5 text-sm font-semibold text-primary hover:bg-background disabled:opacity-50">Download image</button>
              <button type="button" onClick={copyCaption} className="rounded-xl border border-border-soft px-4 py-2.5 text-sm font-semibold text-primary hover:bg-background">Copy caption</button>
            </div>
            <p aria-live="polite" className="mt-4 min-h-5 text-sm text-muted">{shareMessage}</p>
          </Dialog>
        )}
      </div>
    </section>
  );
}
