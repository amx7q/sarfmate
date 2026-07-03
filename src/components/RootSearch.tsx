"use client";

import { useId, useRef, useState } from "react";
import ArabicKeyboard from "@/components/ArabicKeyboard";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  function insertChar(char: string) {
    onChange(value + char);
    inputRef.current?.focus();
  }

  function backspace() {
    onChange([...value].slice(0, -1).join(""));
    inputRef.current?.focus();
  }

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="flex items-center gap-2 rounded-2xl border border-border-soft bg-surface p-2 shadow-sm focus-within:border-secondary"
      >
        <label htmlFor={inputId} className="sr-only">
          Search a root in Arabic or by English meaning
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          dir={HAS_ARABIC.test(value) || value === "" ? "rtl" : "ltr"}
          placeholder="اكتب جذرًا مثل سمع — or type in English"
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 font-arabic text-lg text-ink outline-none placeholder:text-muted"
        />
        <button
          type="button"
          onClick={() => setKeyboardOpen((open) => !open)}
          aria-pressed={keyboardOpen}
          aria-label={
            keyboardOpen
              ? "Hide on-screen Arabic keyboard"
              : "Show on-screen Arabic keyboard"
          }
          className={`shrink-0 rounded-xl border px-3 py-2.5 text-base transition-colors ${
            keyboardOpen
              ? "border-secondary bg-secondary/10 text-primary"
              : "border-border-soft bg-surface text-muted hover:text-primary"
          }`}
        >
          <span aria-hidden="true">⌨</span>
        </button>
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          Search
        </button>
      </form>

      <ArabicKeyboard
        open={keyboardOpen}
        onKey={insertChar}
        onBackspace={backspace}
      />
    </div>
  );
}
