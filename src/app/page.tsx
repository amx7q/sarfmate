import type { Metadata } from "next";
import { Suspense } from "react";
import Hero from "@/components/Hero";
import HomeSearch from "@/components/HomeSearch";
import FeatureCards from "@/components/FeatureCards";
import CommunityPanel from "@/components/CommunityPanel";
import DailyRootCard from "@/components/DailyRootCard";
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/siteConfig";
import { getPublicQuranRootIndex, getPublicRootEntries } from "@/lib/publicData";

export const metadata: Metadata = {
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: SITE_TITLE,
  url: `${SITE_URL}/`,
  description: SITE_DESCRIPTION,
  inLanguage: "en",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function HomePage() {
  const roots = getPublicRootEntries();
  const quranRoots = getPublicQuranRootIndex();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <Hero />
      <Suspense fallback={null}>
        <HomeSearch roots={roots} quranRoots={quranRoots} />
      </Suspense>
      <DailyRootCard roots={roots} />
      <FeatureCards />
      <CommunityPanel />
    </>
  );
}
