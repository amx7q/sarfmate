"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export default function Hero() {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.section
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.01 : 0.55, ease: "easeOut" }}
      className="py-14 text-center sm:py-20"
    >
      <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">
        Arabic roots &amp; forms
      </p>
      <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-primary sm:text-5xl">
        Understand Arabic from the root.
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
        Type an Arabic root and see its core forms, meanings, and examples in
        one clean learner-friendly view.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href="#search"
          className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90"
        >
          Search a root
        </a>
        <Link
          href="/browse"
          className="rounded-xl border border-border-soft bg-surface px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-background"
        >
          Browse examples
        </Link>
      </div>
      <p className="mt-6 text-sm text-muted">
        Built for students of Arabic, ṣarf, and Quranic vocabulary.
      </p>
    </motion.section>
  );
}
