import type { Metadata } from "next";

/** Canonical site constants shared by metadata, sitemap, robots, and JSON-LD. */
export const SITE_URL = "https://sarfmate.app";
export const SITE_NAME = "SarfMate";
export const SITE_TITLE = "SarfMate — Arabic roots & forms";
export const SITE_DESCRIPTION =
  "Type an Arabic root and see its core forms, meanings, and examples in one clean learner-friendly view. Built for English-speaking students of Arabic, ṣarf, and Quranic vocabulary.";

/** Shared OG/Twitter image — Next.js does not merge `openGraph`/`twitter`
 * objects between a layout and a page, so any page defining its own
 * `openGraph`/`twitter` must repeat this image or it silently disappears. */
export const SITE_OG_IMAGE = { url: "/og.png", width: 1200, height: 630, alt: SITE_TITLE };

/** Builds a page's `openGraph`/`twitter` metadata with the shared image/siteName
 * always included, so per-page titles never drop the site-wide social card. */
export function pageMetadata({
  title,
  description,
  type = "website",
}: {
  title: string;
  description: string;
  type?: "website" | "article";
}): Metadata {
  return {
    title,
    description,
    openGraph: {
      siteName: SITE_NAME,
      locale: "en_US",
      type,
      title,
      description,
      images: [SITE_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SITE_OG_IMAGE.url],
    },
  };
}

/** Publisher identity, matching the credits already shown in the site footer. */
export const SITE_AUTHOR = "Abu Yahya";
export const SITE_SAME_AS = [
  "https://github.com/amx7q/sarfmate",
  "https://buymeacoffee.com/ammarabuyahya",
  "https://linktr.ee/ammarabuyahya",
];

/** Absolute URL for a root detail page, with the Arabic segment encoded. */
export function rootUrl(root: string): string {
  return `${SITE_URL}/root/${encodeURIComponent(root)}`;
}

/** schema.org Organization JSON-LD, describing SarfMate as the site publisher. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    founder: { "@type": "Person", name: SITE_AUTHOR },
    sameAs: SITE_SAME_AS,
  };
}

/** schema.org BreadcrumbList JSON-LD for Home > Browse > current page trails. */
export function breadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
