"use client";

import type { SarfForm, SarfFormKey } from "@/lib/types";
import FormCard from "@/components/FormCard";

/**
 * RTL grid placement keeps form 1 on the right at multi-column breakpoints.
 * Each mixed-language card resets its base direction to LTR.
 */
export default function FormRow({
  forms,
  idPrefix,
  onReportError,
}: {
  forms: SarfForm[];
  idPrefix?: string;
  onReportError: (formKey: SarfFormKey) => void;
}) {
  return (
    <ul
      dir="rtl"
      aria-label="Verb forms, ordered 1 to 6"
      className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6"
    >
        {forms.map((form, index) => (
          <li key={form.key} className="flex min-w-0">
            <FormCard
              form={form}
              index={index}
              idPrefix={idPrefix}
              onReportError={() => onReportError(form.key)}
            />
          </li>
        ))}
    </ul>
  );
}
