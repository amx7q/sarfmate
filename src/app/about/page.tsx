import type { Metadata } from "next";
import AboutSarfMate from "@/components/AboutSarfMate";
import { pageMetadata } from "@/lib/siteConfig";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "What Arabic roots are, what ṣarf is, and why SarfMate shows six forms in a fixed learner-friendly order.",
});

export default function AboutPage() {
  return <AboutSarfMate />;
}
