"use client";

import { useState } from "react";
import { FORM_LABELS, FORM_SEQUENCE, type SarfFormKey, type Submission } from "@/lib/types";
import { submissionsStore } from "@/lib/submissionsStore";
import Dialog from "@/components/Dialog";
import SubmissionSuccess from "@/components/SubmissionSuccess";

const inputClass =
  "w-full rounded-xl border border-border-soft bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-secondary";

export default function ReportErrorDialog({
  open,
  onClose,
  root,
  formKey,
  currentValue,
}: {
  open: boolean;
  onClose: () => void;
  root: string;
  formKey?: SarfFormKey;
  currentValue?: string;
}) {
  const [saved, setSaved] = useState<Submission | null>(null);

  function handleClose() {
    setSaved(null);
    onClose();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const selectedForm = String(data.get("formKey") ?? "");
    const submission = submissionsStore.add({
      type: "error_report",
      root,
      formKey: (selectedForm || undefined) as SarfFormKey | undefined,
      currentValue: String(data.get("currentValue") ?? "").trim() || undefined,
      suggestedCorrection: String(data.get("correction") ?? "").trim(),
      explanation: String(data.get("explanation") ?? "").trim() || undefined,
      contributorName: String(data.get("name") ?? "").trim() || undefined,
      contributorEmail: String(data.get("email") ?? "").trim() || undefined,
    });
    setSaved(submission);
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Notice an error">
      {saved ? (
        <SubmissionSuccess submission={saved} onDone={handleClose} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted">
            Reporting an issue with the root{" "}
            <span dir="rtl" lang="ar" className="font-arabic text-base text-primary">
              {root}
            </span>
            . Thank you for helping keep SarfMate accurate.
          </p>
          <div>
            <label htmlFor="report-form" className="mb-1 block text-sm font-medium text-ink">
              Which form?
            </label>
            <select
              id="report-form"
              name="formKey"
              defaultValue={formKey ?? ""}
              className={inputClass}
            >
              <option value="">Whole entry / not sure</option>
              {FORM_SEQUENCE.map((key) => (
                <option key={key} value={key}>
                  {FORM_LABELS[key].labelEn}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="report-current" className="mb-1 block text-sm font-medium text-ink">
              Current value (optional)
            </label>
            <input
              id="report-current"
              name="currentValue"
              defaultValue={currentValue ?? ""}
              className={`${inputClass} font-arabic`}
              dir="auto"
            />
          </div>
          <div>
            <label htmlFor="report-correction" className="mb-1 block text-sm font-medium text-ink">
              Suggested correction <span className="text-accent">*</span>
            </label>
            <textarea
              id="report-correction"
              name="correction"
              required
              rows={2}
              className={inputClass}
              dir="auto"
            />
          </div>
          <div>
            <label htmlFor="report-explanation" className="mb-1 block text-sm font-medium text-ink">
              Explanation or source (optional)
            </label>
            <textarea id="report-explanation" name="explanation" rows={2} className={inputClass} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="report-name" className="mb-1 block text-sm font-medium text-ink">
                Your name (optional)
              </label>
              <input id="report-name" name="name" className={inputClass} />
            </div>
            <div>
              <label htmlFor="report-email" className="mb-1 block text-sm font-medium text-ink">
                Email (optional)
              </label>
              <input id="report-email" name="email" type="email" className={inputClass} />
            </div>
          </div>
          <p className="text-xs text-muted">
            Community suggestions are reviewed before publishing.
          </p>
          <button
            type="submit"
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            Save report
          </button>
        </form>
      )}
    </Dialog>
  );
}
