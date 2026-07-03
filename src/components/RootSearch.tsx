"use client";

import { useId } from "react";

const HAS_ARABIC = /[؀-ۿ]/;

export default function RootSearch({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const inputId = useId();
  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-2xl border border-border-soft bg-surface p-2 shadow-sm focus-within:border-secondary"
    >
      <label htmlFor={inputId} className="sr-only">
        Search a root
      </label>
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        dir={HAS_ARABIC.test(value) || value === "" ? "rtl" : "ltr"}
        lang="ar"
        placeholder="اكتب جذرًا مثل سمع"
        autoComplete="off"
        spellCheck={false}
        className="min-w-0 flex-1 bg-transparent px-3 py-2 font-arabic text-lg text-ink outline-none placeholder:text-muted"
      />
      <button
        type="submit"
        className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
      >
        Search
      </button>
    </form>
  );
}
