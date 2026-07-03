"use client";

import type { SarfForm, SarfFormKey } from "@/lib/types";
import FormCard from "@/components/FormCard";

/**
 * The six form cards in a single right-to-left row.
 * dir="rtl" makes DOM order equal visual right-to-left order, so form 1
 * (الماضي) sits on the far right and the stagger sweeps right-to-left.
 * On small screens the row becomes a scroll-snap carousel starting at form 1.
 */
export default function FormRow({
  forms,
  onReportError,
}: {
  forms: SarfForm[];
  onReportError: (formKey: SarfFormKey) => void;
}) {
  return (
    <ul
      dir="rtl"
      tabIndex={0}
      aria-label="Verb forms, ordered 1 to 6"
      className="flex list-none snap-x snap-mandatory gap-4 overflow-x-auto pb-4 xl:snap-none xl:overflow-visible"
    >
      {forms.map((form, index) => (
        <li key={form.key} className="flex xl:min-w-0 xl:flex-1">
          <FormCard
            form={form}
            index={index}
            onReportError={() => onReportError(form.key)}
          />
        </li>
      ))}
    </ul>
  );
}
