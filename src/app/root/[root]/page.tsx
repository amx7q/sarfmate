import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllRoots, findRoot } from "@/lib/roots";
import RootResult from "@/components/RootResult";

type Params = { root: string };

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
  return {
    title: `${entry.root} — ${entry.meaningEn}`,
    description: `The Arabic root ${entry.displayRoot} (${entry.meaningEn}) with its six core forms, meanings, and example sentences.`,
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

  return (
    <div className="py-12">
      <div className="mb-8">
        <Link
          href="/browse"
          className="rounded text-sm font-medium text-muted transition-colors hover:text-primary"
        >
          ← Back to browse
        </Link>
      </div>
      <RootResult entry={entry} />
    </div>
  );
}
