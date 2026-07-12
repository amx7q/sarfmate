"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Dialog from "@/components/Dialog";
import {
  createPracticeSession,
  getPracticeEligibleRoots,
  type PracticeDifficulty,
  type PracticeQuestion,
  type PracticeSession as Session,
} from "@/lib/practice";
import {
  DAILY_PRACTICE_STORAGE_KEY,
  EMPTY_DAILY_PROGRESS,
  completeDailyPractice,
  createSeededRandom,
  getActiveDailyStreak,
  getUtcDateKey,
  parseDailyPracticeProgress,
  type DailyPracticeProgress,
} from "@/lib/dailyPractice";
import {
  EMPTY_ATTEMPTS_STORE,
  PRACTICE_ATTEMPTS_STORAGE_KEY,
  getWeakItems,
  parseAttemptsStore,
  recordAttempt,
} from "@/lib/practiceAttempts";
import type { RootEntry } from "@/lib/types";
import { usePublicRoots } from "@/lib/usePublicRoots";

const DIFFICULTIES: Array<{
  id: PracticeDifficulty;
  label: string;
  description: string;
}> = [
  { id: "easy", label: "Easy", description: "Direct Arabic and English meanings" },
  { id: "medium", label: "Medium", description: "Meanings plus recognising form types" },
  { id: "hard", label: "Hard", description: "Meanings inside example sentences" },
];

type SessionMode = "practice" | "daily" | "review";

type AnsweredEntry = {
  question: PracticeQuestion;
  selectedOptionId: string;
  correct: boolean;
};

function dailyCaption(score: number, total: number, streak: number): string {
  const streakLabel = `${streak} day${streak === 1 ? "" : "s"}`;
  return `I scored ${score}/${total} on today's SarfMate Daily Arabic Quiz!\n${streakLabel} streak · 5 questions on Arabic roots, forms and meanings.\n\nHow will you score?\nhttps://sarfmate.app/practice`;
}

async function makeShareImage(
  score: number,
  total: number,
  streak: number,
  dateKey: string,
): Promise<Blob> {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const context = canvas.getContext("2d");
  if (!context) return Promise.reject(new Error("Canvas is not supported."));

  context.fillStyle = "#f7f4ed";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#0f4d4a";
  context.fillRect(0, 0, canvas.width, 14);

  context.fillStyle = "#0f4d4a";
  context.font = "700 40px Inter, system-ui, sans-serif";
  context.fillText("SarfMate", 72, 80);

  context.fillStyle = "#d4af37";
  context.font = "600 20px Inter, system-ui, sans-serif";
  context.textAlign = "right";
  context.fillText("Daily Arabic quiz", 1128, 76);

  context.fillStyle = "#102a2a";
  context.textAlign = "left";
  context.font = "700 50px Inter, system-ui, sans-serif";
  context.fillText(`I scored ${score}/${total} in today's Arabic quiz`, 72, 164);
  context.fillStyle = "#667085";
  context.font = "500 25px Inter, system-ui, sans-serif";
  context.fillText("A five-question challenge on Arabic roots, forms and meanings", 72, 207);

  context.fillStyle = "#0f4d4a";
  context.beginPath();
  context.roundRect(72, 242, 642, 200, 18);
  context.fill();

  context.fillStyle = "rgba(255, 255, 255, 0.72)";
  context.font = "700 18px Inter, system-ui, sans-serif";
  context.fillText("QUIZ SCORE", 112, 288);
  context.fillStyle = "#ffffff";
  context.font = "700 90px Inter, system-ui, sans-serif";
  context.fillText(`${score} / ${total}`, 108, 386);
  context.fillStyle = "#bdebdc";
  context.font = "600 24px Inter, system-ui, sans-serif";
  context.fillText(`${Math.round((score / total) * 100)}% accuracy`, 112, 419);

  context.fillStyle = "#ffffff";
  context.strokeStyle = "rgba(15, 77, 74, 0.14)";
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(742, 242, 386, 200, 18);
  context.fill();
  context.stroke();
  context.fillStyle = "#667085";
  context.font = "700 18px Inter, system-ui, sans-serif";
  context.fillText("CURRENT STREAK", 782, 288);
  context.fillStyle = "#14a37f";
  context.font = "700 64px Inter, system-ui, sans-serif";
  context.fillText(`${streak} day${streak === 1 ? "" : "s"}`, 782, 370);
  context.fillStyle = "#667085";
  context.font = "500 22px Inter, system-ui, sans-serif";
  context.fillText("Keep learning every day", 782, 412);

  context.strokeStyle = "rgba(15, 77, 74, 0.14)";
  context.beginPath();
  context.moveTo(72, 470);
  context.lineTo(1128, 470);
  context.stroke();
  context.fillStyle = "#102a2a";
  context.font = "700 30px Inter, system-ui, sans-serif";
  context.fillText("How will you score?", 108, 516);
  context.fillStyle = "#667085";
  context.font = "500 20px Inter, system-ui, sans-serif";
  context.fillText("Take today's free five-question challenge", 108, 549);

  context.fillStyle = "#0f4d4a";
  context.beginPath();
  context.roundRect(806, 492, 286, 60, 12);
  context.fill();
  context.fillStyle = "#ffffff";
  context.font = "700 20px Inter, system-ui, sans-serif";
  context.textAlign = "center";
  context.fillText("TRY TODAY'S QUIZ  →", 949, 529);

  context.textAlign = "left";
  context.fillStyle = "#667085";
  context.font = "500 18px Inter, system-ui, sans-serif";
  context.fillText(dateKey, 72, 610);
  context.textAlign = "right";
  context.fillStyle = "#0f4d4a";
  context.font = "600 18px Inter, system-ui, sans-serif";
  context.fillText("sarfmate.app/practice", 1128, 610);

  return await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not create the share image."));
    }, "image/png");
  });
}

function shareFile(blob: Blob, dateKey: string): File {
  return new File([blob], `sarfmate-daily-${dateKey}.png`, { type: "image/png" });
}

function downloadShareImage(blob: Blob, dateKey: string): void {
  const file = new File([blob], `sarfmate-daily-${dateKey}.png`, { type: "image/png" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function copyShareCaption(caption: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(caption);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = caption;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Copy is not supported.");
}

function PracticeSessionContent({ roots }: { roots: RootEntry[] }) {
  const searchParams = useSearchParams();
  const priorityRoot = searchParams.get("root") ?? undefined;
  const today = getUtcDateKey();
  const [difficulty, setDifficulty] = useState<PracticeDifficulty>("medium");
  const [activeDifficulty, setActiveDifficulty] = useState<PracticeDifficulty>("medium");
  const [mode, setMode] = useState<SessionMode>("practice");
  const [session, setSession] = useState<Session | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [dailyProgress, setDailyProgress] = useState<DailyPracticeProgress>(EMPTY_DAILY_PROGRESS);
  const [attemptsStore, setAttemptsStore] = useState(EMPTY_ATTEMPTS_STORE);
  const [answeredLog, setAnsweredLog] = useState<AnsweredEntry[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareBlob, setShareBlob] = useState<Blob | null>(null);
  const [shareMessage, setShareMessage] = useState("");
  const [sharing, setSharing] = useState(false);
  const questionHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setDailyProgress(
        parseDailyPracticeProgress(localStorage.getItem(DAILY_PRACTICE_STORAGE_KEY)),
      );
      setAttemptsStore(parseAttemptsStore(localStorage.getItem(PRACTICE_ATTEMPTS_STORAGE_KEY)));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const eligibleRootNames = new Set(getPracticeEligibleRoots(roots).map((entry) => entry.root));
  const weakItems = getWeakItems(attemptsStore, today, 5).filter((item) => eligibleRootNames.has(item.root));

  const startSession = (nextMode: SessionMode) => {
    if (nextMode === "review") {
      setSession(
        createPracticeSession(roots, {
          random: Math.random,
          priorityItems: weakItems,
          questionCount: weakItems.length || 5,
        }),
      );
      setMode("review");
      setQuestionIndex(0);
      setSelectedOptionId(null);
      setCorrectAnswers(0);
      setAnsweredLog([]);
      setShareMessage("");
      return;
    }

    const isDaily = nextMode === "daily";
    const random = isDaily
      ? createSeededRandom(`sarfmate-daily:${today}`)
      : Math.random;
    setSession(
      createPracticeSession(roots, {
        random,
        priorityRoot: isDaily ? undefined : priorityRoot,
        difficulty: isDaily ? "daily" : difficulty,
      }),
    );
    setMode(nextMode);
    setActiveDifficulty(difficulty);
    setQuestionIndex(0);
    setSelectedOptionId(null);
    setCorrectAnswers(0);
    setAnsweredLog([]);
    setShareMessage("");
  };

  useEffect(() => {
    if (session) questionHeading.current?.focus({ preventScroll: true });
  }, [questionIndex, session]);

  const completedToday = dailyProgress.lastCompletedDate === today;
  const activeStreak = getActiveDailyStreak(dailyProgress, today);

  if (!session) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="text-sm font-semibold text-muted">Practice</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Build confidence with Arabic forms.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-muted">
            Choose a flexible session or return each day for shared recognition and recall challenges.
          </p>
        </div>

        <div className="mt-7 space-y-8">
          <section className="rounded-2xl border border-border-soft bg-surface p-5 shadow-sm sm:p-6">
            <div>
              <p className="text-sm font-semibold text-muted">Flexible practice</p>
              <h2 className="mt-1 text-2xl font-bold text-primary">Start a practice session</h2>
              <p className="mt-1 text-sm text-muted">Five questions tailored to the level you choose.</p>
            </div>
            {priorityRoot && (
              <p className="mt-2 text-sm text-muted">This session will prioritise the root you were viewing.</p>
            )}
            <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="min-w-0 flex-1">
                <fieldset>
                  <legend className="sr-only">Choose practice difficulty</legend>
                  <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-border-soft bg-background/50 p-1">
                    {DIFFICULTIES.map((item) => {
                      const selected = difficulty === item.id;
                      return (
                        <label
                          key={item.id}
                          className={`flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-semibold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-secondary sm:px-4 ${
                            selected
                              ? "bg-surface text-primary shadow-sm ring-1 ring-secondary"
                              : "text-muted hover:bg-surface/70 hover:text-primary"
                          }`}
                        >
                          <input
                            type="radio"
                            name="practice-difficulty"
                            value={item.id}
                            checked={selected}
                            onChange={() => setDifficulty(item.id)}
                            className="sr-only"
                          />
                          {selected && <span aria-hidden="true" className="text-secondary">✓</span>}
                          <span>{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <p className="mt-2 min-h-5 text-sm text-muted" aria-live="polite">
                  {DIFFICULTIES.find((item) => item.id === difficulty)?.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => startSession("practice")}
                data-cuelume-press=""
                data-cuelume-release=""
                className="min-h-11 w-full shrink-0 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 lg:w-auto"
              >
                Start practice
              </button>
            </div>
          </section>

          <section id="daily-activities" aria-labelledby="daily-activities-heading" className="scroll-mt-24">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-accent-strong">Return each day</p>
              <h2 id="daily-activities-heading" className="mt-1 text-2xl font-bold text-primary">Daily activities</h2>
              <p className="mt-2 text-muted">Two shared challenges for practicing recognition and active recall.</p>
            </div>
            <div className="mt-5 grid items-stretch gap-5 md:grid-cols-2">
              <article className="flex h-full flex-col rounded-2xl border border-border-soft bg-surface p-6 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-primary/20 hover:shadow-md">
                <p className="text-sm font-semibold text-accent-strong">Daily quiz</p>
                <h3 className="mt-2 text-xl font-bold text-primary">Five mixed questions</h3>
                <p className="mt-3 leading-7 text-muted">
                  Recognise Arabic forms and meanings in a balanced quiz that changes at midnight UTC.
                </p>
                <div className="mt-6 border-y border-border-soft py-4">
                  <p className="text-sm font-semibold text-ink">
                    {completedToday ? `Completed today · ${dailyProgress.lastScore} / ${dailyProgress.questionCount}` : "Today's quiz is ready"}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {activeStreak > 0
                      ? `${activeStreak} day${activeStreak === 1 ? "" : "s"} in your current streak`
                      : "Complete it today to begin your streak."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startSession("daily")}
                  data-cuelume-press=""
                  data-cuelume-release=""
                  className="mt-auto inline-flex min-h-11 items-end pt-5 text-left text-sm font-semibold text-primary hover:text-secondary"
                >
                  {completedToday ? "Replay today's quiz →" : "Start daily quiz →"}
                </button>
              </article>
              <article className="flex h-full flex-col rounded-2xl border border-border-soft bg-surface p-6 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-primary/20 hover:shadow-md">
                <p className="text-sm font-semibold text-accent-strong">Daily root challenge</p>
                <h3 className="mt-2 text-xl font-bold text-primary">Build all six forms</h3>
                <p className="mt-3 leading-7 text-muted">
                  Recall the vowelled Arabic forms and their English meanings for today’s reviewed root.
                </p>
                <div className="mt-6 border-y border-border-soft py-4">
                  <p className="text-sm font-semibold text-ink">12 points available</p>
                  <p className="mt-1 text-sm text-muted">Arabic vowel accuracy earns full credit.</p>
                </div>
                <Link href="/daily-root-challenge" className="mt-auto inline-flex min-h-11 items-end pt-5 text-sm font-semibold text-primary hover:text-secondary">
                  Open daily root challenge →
                </Link>
              </article>
            </div>
          </section>

          <section className="rounded-2xl border border-border-soft bg-surface p-6 shadow-sm sm:p-8">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-secondary">Review</p>
                <h2 className="mt-1 text-xl font-bold text-primary">
                  {weakItems.length > 0
                    ? `${weakItems.length} form${weakItems.length === 1 ? "" : "s"} to review`
                    : "No mistakes waiting"}
                </h2>
                <p className="mt-1 text-muted">
                  {weakItems.length > 0
                    ? "A short session focused on what you missed recently."
                    : "Mistakes you make in practice will show up here for focused review."}
                </p>
              </div>
              {weakItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => startSession("review")}
                  className="shrink-0 rounded-xl border border-secondary px-5 py-3 text-sm font-semibold text-primary hover:bg-secondary/10"
                >
                  Start review
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (session.questions.length === 0) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-border-soft bg-surface p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-primary">Practice is not available yet</h1>
        <p className="mt-3 text-muted">There are not enough complete reviewed forms to build a reliable session at this level.</p>
        <Link href="/browse" className="mt-6 inline-flex rounded-xl border border-border-soft px-5 py-3 text-sm font-semibold text-primary hover:bg-background">
          Browse roots
        </Link>
      </section>
    );
  }

  if (questionIndex >= session.questions.length) {
    const accuracy = Math.round((correctAnswers / session.questions.length) * 100);
    const isDaily = mode === "daily";
    const isReview = mode === "review";
    const missed = answeredLog.filter((entry) => !entry.correct);
    const reviewMistakes = () => {
      const seen = new Set<string>();
      const items = missed
        .filter((entry) => {
          const key = `${entry.question.root}:${entry.question.formKey}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map((entry) => ({ root: entry.question.root, formKey: entry.question.formKey }));
      setSession(
        createPracticeSession(roots, {
          random: Math.random,
          priorityItems: items,
          questionCount: items.length || 5,
        }),
      );
      setMode("review");
      setQuestionIndex(0);
      setSelectedOptionId(null);
      setCorrectAnswers(0);
      setAnsweredLog([]);
      setShareMessage("");
    };
    const caption = dailyCaption(
      correctAnswers,
      session.questions.length,
      dailyProgress.streak,
    );
    const openShareModal = () => {
      setShareOpen(true);
      setShareBlob(null);
      setSharing(true);
      setShareMessage("Preparing your result image…");
      void makeShareImage(
        correctAnswers,
        session.questions.length,
        dailyProgress.streak,
        today,
      ).then((blob) => {
        setShareBlob(blob);
        setShareMessage("Your image is ready to share.");
      }).catch(() => {
        setShareMessage("The share image could not be created. Please try again.");
      }).finally(() => setSharing(false));
    };
    const handleNativeShare = async () => {
      if (!shareBlob) return;
      const file = shareFile(shareBlob, today);
      if (!navigator.share || !navigator.canShare?.({ files: [file] })) {
        downloadShareImage(shareBlob, today);
        try {
          await copyShareCaption(caption);
          setShareMessage("System sharing is unavailable here, so the image was saved and the caption copied.");
        } catch {
          setShareMessage("System sharing is unavailable here. The image was saved; copy the caption below manually.");
        }
        return;
      }

      setSharing(true);
      setShareMessage("Opening your share options…");
      try {
        await navigator.share({
          title: "My SarfMate Daily Quiz result",
          text: caption,
          files: [file],
        });
        setShareMessage("Result shared.");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setShareMessage("Sharing cancelled.");
        } else {
          setShareMessage("The share sheet could not open. You can download the image or copy the caption below.");
        }
      } finally {
        setSharing(false);
      }
    };
    const handleDownload = () => {
      if (!shareBlob) return;
      downloadShareImage(shareBlob, today);
      setShareMessage("Result image downloaded.");
    };
    const handleCopyCaption = async () => {
      try {
        await copyShareCaption(caption);
        setShareMessage("Caption copied.");
      } catch {
        setShareMessage("The caption could not be copied automatically. Select and copy it below.");
      }
    };

    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-border-soft bg-surface p-6 text-center shadow-sm sm:p-10">
        <p className="text-sm font-semibold text-muted">
          {isDaily ? "Daily Quiz complete" : isReview ? "Review complete" : "Practice complete"}
        </p>
        <h1 className="mt-3 text-4xl font-bold text-primary">{correctAnswers} / {session.questions.length}</h1>
        <p className="mt-2 text-lg text-muted">{accuracy}% accuracy</p>
        {isDaily && (
          <p className="mt-5 text-sm font-semibold text-secondary">
            {dailyProgress.streak} day{dailyProgress.streak === 1 ? "" : "s"} streak
          </p>
        )}
        {!isDaily && !isReview && (
          <p className="mt-4 text-sm font-semibold capitalize text-primary">{activeDifficulty} difficulty</p>
        )}
        {isReview && (
          <p className="mt-4 text-sm font-semibold text-primary">Review session</p>
        )}
        <div className="mt-7 border-t border-border-soft pt-6">
          <h2 className="text-sm font-semibold text-ink">Roots in this session</h2>
          <ul className="mt-3 flex flex-wrap justify-center gap-2" aria-label="Roots in this session">
            {session.roots.map((root) => (
              <li key={root.root} dir="rtl" lang="ar" className="rounded-full bg-background px-3 py-1 font-arabic text-xl text-primary">
                {root.displayRoot}
              </li>
            ))}
          </ul>
        </div>
        {answeredLog.length > 0 && (
          <div className="mt-7 border-t border-border-soft pt-6 text-left">
            <h2 className="text-sm font-semibold text-ink">Your answers</h2>
            <ol className="mt-3 space-y-3" aria-label="Question breakdown">
              {answeredLog.map((entry, index) => {
                const yourOption = entry.question.options.find((option) => option.id === entry.selectedOptionId);
                const correctOption = entry.question.options.find(
                  (option) => option.id === entry.question.correctOptionId,
                );
                const isArabicOption = entry.question.optionLanguage === "arabic";
                return (
                  <li
                    key={entry.question.id}
                    className={`rounded-2xl border p-4 ${entry.correct ? "border-border-soft bg-background" : "border-danger/40 bg-danger/5"}`}
                  >
                    <p className="text-sm font-semibold text-primary">
                      {index + 1}. {entry.question.explanation.formLabelEn}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {entry.correct ? "Correct" : "Not quite"} · Correct answer:{" "}
                      <span dir={isArabicOption ? "rtl" : undefined} lang={isArabicOption ? "ar" : undefined} className={isArabicOption ? "font-arabic text-lg text-primary" : "font-semibold text-primary"}>
                        {correctOption?.label}
                      </span>
                    </p>
                    {!entry.correct && (
                      <p className="mt-1 text-sm text-muted">
                        Your answer:{" "}
                        <span dir={isArabicOption ? "rtl" : undefined} lang={isArabicOption ? "ar" : undefined} className={isArabicOption ? "font-arabic text-lg" : undefined}>
                          {yourOption?.label}
                        </span>
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {isDaily && (
            <button
              type="button"
              onClick={openShareModal}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Share result
            </button>
          )}
          {missed.length > 0 && (
            <button
              type="button"
              onClick={reviewMistakes}
              className="rounded-xl bg-secondary px-5 py-3 text-sm font-semibold text-white hover:bg-secondary/90"
            >
              Review {missed.length} mistake{missed.length === 1 ? "" : "s"}
            </button>
          )}
          <button
            type="button"
            onClick={() => startSession(mode)}
            className={`rounded-xl px-5 py-3 text-sm font-semibold ${isDaily ? "border border-border-soft text-primary hover:bg-background" : "bg-primary text-white hover:bg-primary/90"}`}
          >
            {isDaily ? "Replay Daily Quiz" : isReview ? "Review again" : "Practice again"}
          </button>
          <Link href="/browse" className="rounded-xl border border-border-soft px-5 py-3 text-sm font-semibold text-primary hover:bg-background">
            Browse roots
          </Link>
        </div>
        {isDaily && (
          <Dialog open={shareOpen} onClose={() => setShareOpen(false)} title="Share your Daily Quiz result">
            <div className="rounded-2xl border border-border-soft bg-surface p-5 text-left text-ink">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-bold">SarfMate</p>
                  <span className="text-sm font-semibold text-accent-strong">
                    Daily Arabic Quiz
                  </span>
                </div>
                <h3 className="mt-5 text-2xl font-bold">I scored {correctAnswers}/{session.questions.length} today</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Five questions on Arabic roots, forms and meanings.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="border-t border-border-soft pt-3">
                    <p className="text-sm text-muted">Accuracy</p>
                    <p className="mt-1 text-2xl font-bold">{accuracy}%</p>
                  </div>
                  <div className="border-t border-border-soft pt-3 text-primary">
                    <p className="text-sm text-muted">Current streak</p>
                    <p className="mt-1 text-2xl font-bold text-secondary">
                      {dailyProgress.streak} day{dailyProgress.streak === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 bg-secondary/20 px-5 py-4">
                <div>
                  <p className="font-semibold">How will you score?</p>
                  <p className="text-xs text-white/70">sarfmate.app/practice</p>
                </div>
                <span className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-primary">Try today&apos;s quiz →</span>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-ink">Caption</p>
              <p className="mt-2 whitespace-pre-line rounded-xl border border-border-soft bg-background p-3 text-sm leading-6 text-muted">
                {caption}
              </p>
            </div>

            <button
              type="button"
              disabled={!shareBlob || sharing}
              onClick={handleNativeShare}
              className="mt-5 w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
            >
              {sharing ? "Preparing image…" : "Share image and caption"}
            </button>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={!shareBlob}
                onClick={handleDownload}
                className="rounded-xl border border-border-soft px-4 py-2.5 text-sm font-semibold text-primary hover:bg-background disabled:cursor-wait disabled:opacity-50"
              >
                Download image
              </button>
              <button
                type="button"
                onClick={handleCopyCaption}
                className="rounded-xl border border-border-soft px-4 py-2.5 text-sm font-semibold text-primary hover:bg-background"
              >
                Copy caption
              </button>
            </div>
            <p aria-live="polite" className="mt-4 min-h-5 text-sm text-muted">{shareMessage}</p>
          </Dialog>
        )}
      </section>
    );
  }

  const question = session.questions[questionIndex];
  const answered = selectedOptionId !== null;
  const correct = selectedOptionId === question.correctOptionId;

  const answerQuestion = (optionId: string) => {
    if (answered) return;
    const isCorrect = optionId === question.correctOptionId;
    setSelectedOptionId(optionId);
    if (isCorrect) setCorrectAnswers((score) => score + 1);
    setAnsweredLog((log) => [...log, { question, selectedOptionId: optionId, correct: isCorrect }]);
    setAttemptsStore((store) => {
      const next = recordAttempt(store, question.root, question.formKey, isCorrect, today);
      try {
        localStorage.setItem(PRACTICE_ATTEMPTS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Attempt history still works in memory when storage is unavailable.
      }
      return next;
    });
  };

  const nextQuestion = () => {
    if (questionIndex === session.questions.length - 1 && mode === "daily") {
      const nextProgress = completeDailyPractice(
        dailyProgress,
        today,
        correctAnswers,
        session.questions.length,
      );
      setDailyProgress(nextProgress);
      try {
        localStorage.setItem(DAILY_PRACTICE_STORAGE_KEY, JSON.stringify(nextProgress));
      } catch {
        // The result still works in memory when storage is unavailable.
      }
    }
    setQuestionIndex((index) => index + 1);
    setSelectedOptionId(null);
  };

  return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-border-soft bg-surface p-5 shadow-sm sm:p-8">
      <div className="flex items-center justify-between gap-3 text-sm font-semibold text-muted">
        <p>Question {questionIndex + 1} of {session.questions.length}</p>
        <p>{mode === "daily" ? "Daily Quiz" : mode === "review" ? "Review" : `${activeDifficulty[0].toUpperCase()}${activeDifficulty.slice(1)}`}</p>
      </div>
      <h1 ref={questionHeading} tabIndex={-1} className="mt-4 text-2xl font-bold tracking-tight text-primary sm:text-3xl">
        {question.prompt}
      </h1>
      {question.promptArabic && (
        <p dir="rtl" lang="ar" className="mt-3 font-arabic text-4xl text-primary">{question.promptArabic}</p>
      )}
      {question.sentenceArabic && question.targetArabic && (
        <p dir="rtl" lang="ar" className="mt-4 rounded-2xl bg-background p-4 font-arabic text-3xl leading-loose text-primary">
          {question.sentenceArabic.split(question.targetArabic).map((part, index, parts) => (
            <span key={`${part}-${index}`}>
              {part}
              {index < parts.length - 1 && (
                <mark className="rounded bg-accent/25 px-1 text-primary">{question.targetArabic}</mark>
              )}
            </span>
          ))}
        </p>
      )}

      <div className="mt-7 grid gap-3" role="group" aria-label="Answer options">
        {question.options.map((option) => {
          const isSelected = option.id === selectedOptionId;
          const isCorrect = option.id === question.correctOptionId;
          const feedbackClass = answered && isCorrect
            ? "border-secondary bg-secondary/10 text-primary"
            : answered && isSelected
              ? "border-danger bg-danger/5 text-danger"
              : "border-border-soft bg-surface text-ink hover:border-secondary hover:bg-background";
          return (
            <button
              key={option.id}
              type="button"
              data-cuelume-press=""
              data-cuelume-release=""
              disabled={answered}
              aria-pressed={isSelected}
              onClick={() => answerQuestion(option.id)}
              className={`flex min-h-14 items-center justify-between rounded-2xl border px-4 py-3 text-left font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-100 ${feedbackClass}`}
            >
              <span dir={question.optionLanguage === "arabic" ? "rtl" : "ltr"} lang={question.optionLanguage === "arabic" ? "ar" : undefined} className={question.optionLanguage === "arabic" ? "font-arabic text-3xl leading-none" : "text-base"}>
                {option.label}
              </span>
              {answered && isCorrect && <span className="ml-3 text-sm font-semibold">Correct answer</span>}
              {answered && isSelected && !isCorrect && <span className="ml-3 text-sm font-semibold">Your answer</span>}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-6 rounded-2xl border border-border-soft bg-background p-5" role="status" aria-live="polite">
          <p className="font-semibold text-primary">{correct ? "Correct" : "Not quite"}</p>
          <div className="mt-3 border-l-2 border-secondary pl-4">
            <p dir="rtl" lang="ar" className="font-arabic text-3xl text-primary">{question.explanation.arabic}</p>
            <p className="mt-1 font-semibold text-ink">{question.explanation.formLabelEn}</p>
            <p dir="rtl" lang="ar" className="font-arabic text-lg text-muted">{question.explanation.formLabelAr}</p>
            <p className="mt-1 text-sm text-muted">{question.explanation.meaningEn}</p>
          </div>
          <button type="button" onClick={nextQuestion} data-cuelume-press="" data-cuelume-release="" className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90">
            {questionIndex === session.questions.length - 1 ? "See results" : "Next question"}
          </button>
        </div>
      )}
    </section>
  );
}

export default function PracticeSession({ roots: initialRoots }: { roots?: RootEntry[] }) {
  const { roots, error } = usePublicRoots(initialRoots);

  if (error) {
    return <p className="text-center text-sm text-danger">Practice data could not be loaded. Please refresh and try again.</p>;
  }
  if (!roots) {
    return <p className="text-center text-sm text-muted">Loading practice…</p>;
  }
  return <PracticeSessionContent roots={roots} />;
}
