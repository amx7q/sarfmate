"use client";

import { useRef, useState } from "react";
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
  idPrefix,
  onReportError,
}: {
  forms: SarfForm[];
  idPrefix?: string;
  onReportError: (formKey: SarfFormKey) => void;
}) {
  const rowRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function scrollToForm(index: number) {
    const nextIndex = Math.max(0, Math.min(forms.length - 1, index));
    const item = rowRef.current?.children.item(nextIndex) as HTMLElement | null;
    item?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    setActiveIndex(nextIndex);
  }

  function updateActiveForm() {
    const row = rowRef.current;
    if (!row) return;
    const rowCenter = row.getBoundingClientRect().left + row.clientWidth / 2;
    const distances = Array.from(row.children).map((child) => {
      const rect = child.getBoundingClientRect();
      return Math.abs(rect.left + rect.width / 2 - rowCenter);
    });
    setActiveIndex(distances.indexOf(Math.min(...distances)));
  }

  return (
    <div>
      <ul
        ref={rowRef}
        dir="rtl"
        tabIndex={0}
        onScroll={updateActiveForm}
        aria-label="Verb forms, ordered 1 to 6"
        aria-describedby={`${idPrefix ?? "forms"}-navigation-help`}
        className="flex list-none snap-x snap-mandatory gap-4 overflow-x-auto pb-4 xl:snap-none xl:overflow-visible"
      >
        {forms.map((form, index) => (
          <li key={form.key} className="flex xl:min-w-0 xl:flex-1">
            <FormCard
              form={form}
              index={index}
              idPrefix={idPrefix}
              onReportError={() => onReportError(form.key)}
            />
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-3 xl:hidden">
        <button
          type="button"
          disabled={activeIndex === 0}
          onClick={() => scrollToForm(activeIndex - 1)}
          className="min-h-11 rounded-xl border border-border-soft bg-surface px-4 py-2 text-sm font-medium text-primary disabled:opacity-40"
        >
          Previous
        </button>
        <p
          id={`${idPrefix ?? "forms"}-navigation-help`}
          aria-live="polite"
          className="text-center text-xs text-muted"
        >
          Form {activeIndex + 1} of {forms.length}
        </p>
        <button
          type="button"
          disabled={activeIndex === forms.length - 1}
          onClick={() => scrollToForm(activeIndex + 1)}
          className="min-h-11 rounded-xl border border-border-soft bg-surface px-4 py-2 text-sm font-medium text-primary disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
