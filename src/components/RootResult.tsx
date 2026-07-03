"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { RootEntry, SarfFormKey } from "@/lib/types";
import { getOrderedForms } from "@/lib/roots";
import StatusBadge from "@/components/StatusBadge";
import FormRow from "@/components/FormRow";
import ReportErrorDialog from "@/components/ReportErrorDialog";

export default function RootResult({ entry }: { entry: RootEntry }) {
  const [reportTarget, setReportTarget] = useState<SarfFormKey | null>(null);
  const reduced = useReducedMotion() ?? false;
  const forms = getOrderedForms(entry);
  const reportForm = forms.find((f) => f.key === reportTarget);

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
          <StatusBadge status={entry.status} />
        </div>
        {entry.notes && (
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted">{entry.notes}</p>
        )}
        <p className="mt-5 text-sm text-muted">
          Showing the core forms of this Arabic root in a fixed learner-friendly
          order.
        </p>
      </div>

      <div className="mt-8">
        <FormRow forms={forms} onReportError={(key) => setReportTarget(key)} />
      </div>

      <ReportErrorDialog
        open={reportTarget !== null}
        onClose={() => setReportTarget(null)}
        root={entry.root}
        formKey={reportTarget ?? undefined}
        currentValue={reportForm?.arabic}
      />
    </motion.section>
  );
}
