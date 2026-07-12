"use client";

import { useEffect } from "react";
import { bind } from "cuelume";

export default function CuelumeSounds() {
  useEffect(() => {
    bind();
  }, []);

  return null;
}
