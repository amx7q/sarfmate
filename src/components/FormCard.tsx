"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { SarfForm } from "@/lib/types";
import ExampleSentence from "@/components/ExampleSentence";
import CopyButton from "@/components/CopyButton";

export default function FormCard({
  form,
  index,
  onReportError,
}: {
  form: SarfForm;
  index: number;
  onReportError: () => void;
}) {
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.article
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.01 : 0.4, delay: reduced ? 0 : index * 0.07, ease: "easeOut" }}
      className="flex w-[280px] shrink-0 snap-center flex-col rounded-2xl border border-border-soft bg-surface p-5 shadow-sm xl:w-auto xl:min-w-0 xl:flex-1"
      aria-labelledby={`form-${form.key}-title`}
    >
      <div dir="ltr" className="flex items-start justify-between gap-2">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white"
          aria-hidden="true"
        >
          {form.order}
        </span>
        <div className="text-right">
          <p dir="rtl" lang="ar" className="font-arabic text-sm font-medium text-accent">
            {form.labelAr}
          </p>
          <p className="text-xs text-muted">{form.labelEn}</p>
        </div>
      </div>

      <h3
        id={`form-${form.key}-title`}
        dir="rtl"
        lang="ar"
        className="mt-4 text-center font-arabic text-4xl font-medium leading-snug text-primary"
      >
        {form.arabic}
      </h3>
      <p className="mt-2 text-center text-sm font-semibold italic text-ink">
        {form.transliteration}
      </p>
      <p className="mb-4 mt-1 text-center text-sm text-muted">{form.meaningEn}</p>

      <div className="mt-auto">
        <ExampleSentence arabic={form.exampleAr} english={form.exampleEn} />
        {form.notes && (
          <p className="mt-3 flex items-start gap-1.5 text-xs text-muted">
            <span
              className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
              aria-hidden="true"
            />
            <span>
              <span className="font-medium text-ink">Needs review: </span>
              {form.notes}
            </span>
          </p>
        )}
        <div dir="ltr" className="mt-3 flex items-center justify-between border-t border-border-soft pt-2">
          <CopyButton
            text={form.arabic}
            ariaLabel={`Copy Arabic word ${form.arabic}`}
          />
          <button
            type="button"
            onClick={onReportError}
            aria-label={`Report an error in the ${form.labelEn} form`}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/10"
          >
            <span aria-hidden="true">⚑</span> Notice an error
          </button>
        </div>
      </div>
    </motion.article>
  );
}
