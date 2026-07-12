"use client";

import { useEffect, useState } from "react";
import type { RootEntry } from "@/lib/types";

let publicRootsPromise: Promise<RootEntry[]> | undefined;

function fetchPublicRoots(): Promise<RootEntry[]> {
  publicRootsPromise ??= fetch("/data/roots").then(async (response) => {
    if (!response.ok) throw new Error("Could not load the root library.");
    return (await response.json()) as RootEntry[];
  });
  return publicRootsPromise;
}

export function usePublicRoots(initialRoots?: RootEntry[]) {
  const [roots, setRoots] = useState<RootEntry[] | undefined>(initialRoots);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (initialRoots) return;

    let active = true;
    fetchPublicRoots().then(
      (entries) => active && setRoots(entries),
      () => active && setError(true),
    );
    return () => {
      active = false;
    };
  }, [initialRoots]);

  return { roots, error };
}
