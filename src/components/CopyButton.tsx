"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export default function CopyButton({
  text,
  ariaLabel,
  label = "Copy",
}: {
  text: string;
  ariaLabel: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (e.g. insecure context); leave state unchanged.
    }
  }

  return (
    <motion.button
      type="button"
      onClick={handleCopy}
      aria-label={ariaLabel}
      whileTap={reduced ? undefined : { scale: 0.96 }}
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: reduced ? 1 : 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-secondary"
            aria-hidden="true"
          >
            ✓
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          >
            ⧉
          </motion.span>
        )}
      </AnimatePresence>
      {copied ? "Copied" : label}
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </motion.button>
  );
}
