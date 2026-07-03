import type { Metadata } from "next";
import AboutSarfMate from "@/components/AboutSarfMate";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Arabic roots are, what ṣarf is, and why SarfMate shows six forms in a fixed learner-friendly order.",
};

export default function AboutPage() {
  return <AboutSarfMate />;
}
