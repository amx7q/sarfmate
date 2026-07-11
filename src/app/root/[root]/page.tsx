import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllRoots, findRoot } from "@/lib/roots";
import { SITE_URL, SITE_NAME, rootUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/siteConfig";
import { toPublicRootEntry } from "@/lib/publicData";
import RootResult from "@/components/RootResult";
import type { RootEntry } from "@/lib/types";

type Params = { root: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getAllRoots().map((entry) => ({ root: entry.root }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { root } = await params;
  const entry = findRoot(decodeURIComponent(root));
  if (!entry) return { title: "Root not found" };
  const title = `${entry.root} — ${entry.meaningEn}`;
  const description = `The Arabic root ${entry.displayRoot} (${entry.meaningEn}) with its six core forms, meanings, and example sentences.`;
  const canonical = `/root/${encodeURIComponent(entry.root)}`;
  const base = pageMetadata({ title, description, type: "article" });
  return {
    ...base,
    alternates: { canonical },
    openGraph: { ...base.openGraph, url: canonical },
  };
}

function rootJsonLd(entry: RootEntry) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": rootUrl(entry.root),
    url: rootUrl(entry.root),
    name: entry.displayRoot,
    description: entry.meaningEn,
    inLanguage: "ar",
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: `${SITE_NAME} Arabic root library`,
      url: `${SITE_URL}/browse`,
    },
  };
}

export default async function RootPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { root } = await params;
  const entry = findRoot(decodeURIComponent(root));
  if (!entry) notFound();

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Browse roots", url: `${SITE_URL}/browse` },
    { name: entry.displayRoot, url: rootUrl(entry.root) },
  ]);

  return (
    <div className="py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(rootJsonLd(entry)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <div className="mb-8">
        <Link
          href="/browse"
          className="rounded text-sm font-medium text-muted transition-colors hover:text-primary"
        >
          ← Back to browse
        </Link>
      </div>
      <RootResult entry={toPublicRootEntry(entry)} />
    </div>
  );
}
