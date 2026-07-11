"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function Hero() {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.section
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.01 : 0.28, ease: [0.23, 1, 0.32, 1] }}
      className="pb-9 pt-12 text-center sm:pb-11 sm:pt-16"
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
      <p className="mt-5 text-sm text-muted">
        Built for students of Arabic, ṣarf, and Quranic vocabulary.
      </p>
    </motion.section>
  );
}
