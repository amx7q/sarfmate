"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { SarfForm } from "@/lib/types";
import ExampleSentence from "@/components/ExampleSentence";
import CopyButton from "@/components/CopyButton";

export default function FormCard({
  form,
  index,
  idPrefix = "form",
  onReportError,
}: {
  form: SarfForm;
  index: number;
  idPrefix?: string;
  onReportError: () => void;
}) {
  const reduced = useReducedMotion() ?? false;
  const titleId = `${idPrefix}-${form.key}-title`;

  return (
    <motion.article
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.01 : 0.24, delay: reduced ? 0 : index * 0.04, ease: [0.23, 1, 0.32, 1] }}
      dir="ltr"
      lang="en"
      className="flex w-full min-w-0 max-w-none flex-col rounded-2xl border border-border-soft bg-surface p-5 text-left shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-primary/20 hover:shadow-md"
      aria-labelledby={titleId}
    >
      <div dir="ltr" className="flex items-start gap-3">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white"
          aria-hidden="true"
        >
          {form.order}
        </span>
        <div className="min-w-0 flex-1 text-left">
          <p dir="rtl" lang="ar" className="text-left font-arabic text-sm font-medium text-muted">
            {form.labelAr}
          </p>
          <p className="text-xs text-muted">{form.labelEn}</p>
        </div>
      </div>

      {form.arabic ? (
        <h3
          id={titleId}
          dir="rtl"
          lang="ar"
          className="mt-4 text-center font-arabic text-4xl font-medium leading-snug text-primary"
        >
          {form.arabic}
        </h3>
      ) : (
        <p id={titleId} className="mt-5 text-sm font-medium text-muted">Form pending review</p>
      )}
      {form.transliteration && <p className="mt-3 text-sm text-muted">{form.transliteration}</p>}
      {form.meaningEn && (
        <p className="mb-4 mt-1 text-base font-medium leading-6 text-ink">{form.meaningEn}</p>
      )}

      <div className="mt-auto">
        {form.exampleAr && form.exampleEn && (
          <ExampleSentence arabic={form.exampleAr} english={form.exampleEn} />
        )}
        <div className="mt-4 flex flex-col gap-2 border-t border-border-soft pt-3 min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between">
          {form.arabic && (
            <CopyButton text={form.arabic} ariaLabel={`Copy Arabic word ${form.arabic}`} />
          )}
          <button
            type="button"
            onClick={onReportError}
            aria-label={`Report an error in the ${form.labelEn} form`}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium text-danger transition-colors hover:bg-danger/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
          >
            <span aria-hidden="true">⚑</span> Report
          </button>
        </div>
      </div>
    </motion.article>
  );
}
