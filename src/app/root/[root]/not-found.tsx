import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <h1 className="text-2xl font-semibold text-primary">
        We do not have this root yet.
      </h1>
      <p className="mt-3 text-sm text-muted">
        Help improve SarfMate by suggesting it from the home page.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          Suggest this root
        </Link>
        <Link
          href="/browse"
          className="rounded-xl border border-border-soft bg-surface px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-background"
        >
          Browse available roots
        </Link>
      </div>
    </div>
  );
}
