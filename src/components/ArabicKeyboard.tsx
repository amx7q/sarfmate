"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const KEY_ROWS: string[][] = [
  ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج", "د"],
  ["ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك", "ط"],
  ["ذ", "ء", "ؤ", "ر", "ى", "ة", "و", "ز", "ظ", "أ", "إ"],
];

const keyClass =
  "flex h-10 min-w-9 flex-1 items-center justify-center rounded-lg border border-border-soft bg-surface font-arabic text-lg text-ink shadow-sm transition-colors hover:bg-background active:scale-95 active:bg-background";

/**
 * Floating on-screen Arabic keyboard for users without an Arabic layout.
 * Keys use onMouseDown preventDefault so the search input keeps focus.
 */
export default function ArabicKeyboard({
  open,
  onKey,
  onBackspace,
}: {
  open: boolean;
  onKey: (char: string) => void;
  onBackspace: () => void;
}) {
  const reduced = useReducedMotion() ?? false;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: reduced ? 0.01 : 0.2, ease: "easeOut" }}
          className="absolute inset-x-0 top-full z-30 mt-3 rounded-2xl border border-border-soft bg-surface/95 p-3 shadow-xl backdrop-blur"
          role="group"
          aria-label="On-screen Arabic keyboard"
          dir="rtl"
        >
          <div className="space-y-2">
            {KEY_ROWS.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1.5">
                {row.map((char) => (
                  <button
                    key={char}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onKey(char)}
                    className={keyClass}
                    aria-label={`Arabic letter ${char}`}
                  >
                    {char}
                  </button>
                ))}
              </div>
            ))}
            <div className="flex gap-1.5">
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onKey(" ")}
                className={`${keyClass} flex-[4]`}
                aria-label="Space"
              >
                <span className="text-xs text-muted">مسافة</span>
              </button>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={onBackspace}
                className={`${keyClass} max-w-24`}
                aria-label="Backspace"
              >
                <span aria-hidden="true">⌫</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
