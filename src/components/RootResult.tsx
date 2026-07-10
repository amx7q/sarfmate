"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { RootEntry, RootVerbEntry, SarfForm, SarfFormKey } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import FormRow from "@/components/FormRow";
import ReportErrorDialog from "@/components/ReportErrorDialog";

function getRootVerbEntries(entry: RootEntry): RootVerbEntry[] {
  return [
    {
      id: `${entry.root}-main`,
      meaningEn: entry.meaningEn,
      status: entry.status,
      measure: entry.measure,
      forms: entry.forms,
      source: entry.source,
      updatedAt: entry.updatedAt,
    },
    ...(entry.variants ?? []),
  ];
}

function getOrderedForms(entry: { forms: SarfForm[] }): SarfForm[] {
  return [...entry.forms].sort((a, b) => a.order - b.order);
}

export default function RootResult({ entry }: { entry: RootEntry }) {
  const [reportTarget, setReportTarget] = useState<{
    entryId: string;
    formKey: SarfFormKey;
  } | null>(null);
  const reduced = useReducedMotion() ?? false;
  const verbEntries = getRootVerbEntries(entry);
  const reportEntry = verbEntries.find((verbEntry) => verbEntry.id === reportTarget?.entryId);
  const reportForm = reportEntry?.forms.find((form) => form.key === reportTarget?.formKey);

  return (
    <motion.section
      key={entry.root}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.01 : 0.4, ease: "easeOut" }}
      aria-label={`Root result for ${entry.displayRoot}`}
    >
      <div className="text-center">
        <h2
          dir="rtl"
          lang="ar"
          className="font-arabic text-6xl font-medium tracking-wide text-primary sm:text-7xl"
        >
          {entry.displayRoot}
        </h2>
        <p className="mt-3 text-xl text-accent">{entry.meaningEn}</p>
        <div className="mt-4 flex justify-center">
          <div className="flex flex-wrap justify-center gap-2">
            {entry.quranic && (
              <span className="inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-ink">
                Quranic root
              </span>
            )}
            <StatusBadge status={entry.status} />
          </div>
        </div>
        {entry.quranic && (
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted">
            This root appears in the Quranic index. Quranic roots can have rich
            meanings across different contexts, so SarfMate summaries are learner
            aids, not a replacement for tafsir or specialist dictionaries.
          </p>
        )}
        <p className="mt-5 text-sm text-muted">
          Showing the core forms of this Arabic root in a fixed learner-friendly
          order.
        </p>
      </div>

      <div className="mt-8 space-y-8">
        {verbEntries.map((verbEntry, index) => {
          const forms = getOrderedForms(verbEntry);
          const isMainEntry = index === 0;
          return (
            <section
              key={verbEntry.id}
              aria-label={`${isMainEntry ? "Main" : "Variant"} verb entry: ${verbEntry.meaningEn}`}
              className={isMainEntry ? undefined : "border-t border-border-soft pt-8"}
            >
              {!isMainEntry && (
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-accent">
                      Additional verb entry · Form {verbEntry.measure}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-ink">
                      {verbEntry.meaningEn}
                    </h3>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={verbEntry.status} />
                  </div>
                </div>
              )}
              {verbEntry.source && (
                <div className="mb-4 rounded-2xl border border-accent/30 bg-accent/5 p-4 text-sm leading-6 text-ink">
                  <p className="font-semibold text-primary">Source and review status</p>
                  <p className="mt-1">
                    The source verifies the English meaning, past, present, imperative,
                    and maṣdar for this entry. Transliteration, examples, participles,
                    and root/measure inference still need human review.
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {verbEntry.source.chapter} · {verbEntry.source.sourcePage}
                  </p>
                </div>
              )}
              <FormRow
                forms={forms}
                idPrefix={`form-${verbEntry.id}`}
                onReportError={(formKey) => setReportTarget({ entryId: verbEntry.id, formKey })}
              />
            </section>
          );
        })}
      </div>

      <ReportErrorDialog
        open={reportTarget !== null}
        onClose={() => setReportTarget(null)}
        root={entry.root}
        formKey={reportTarget?.formKey}
        currentValue={reportForm?.arabic}
      />
    </motion.section>
  );
}
