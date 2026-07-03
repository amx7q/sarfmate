"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export default function EmptyState({
  query,
  onSuggest,
}: {
  query: string;
  onSuggest: () => void;
}) {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.01 : 0.4, ease: "easeOut" }}
      className="mx-auto max-w-md rounded-2xl border border-border-soft bg-surface p-8 text-center shadow-sm"
    >
      <p
        dir="rtl"
        lang="ar"
        className="font-arabic text-4xl text-muted"
        aria-hidden="true"
      >
        {query}
      </p>
      <h2 className="mt-4 text-lg font-semibold text-primary">
        We do not have this root yet.
      </h2>
      <p className="mt-2 text-sm text-muted">
        Help improve SarfMate by suggesting it.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onSuggest}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          Suggest this root
        </button>
        <Link
          href="/browse"
          className="rounded-xl border border-border-soft bg-surface px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-background"
        >
          Browse available roots
        </Link>
      </div>
    </motion.div>
  );
}
