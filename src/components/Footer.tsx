import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border-soft bg-surface">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6 lg:grid-cols-[1fr_auto_auto]">
        <div>
          <p className="text-sm font-semibold text-primary">
            SarfMate{" "}
            <span className="text-muted font-normal">
              &mdash; Arabic roots &amp; forms
            </span>
          </p>
          <p className="mt-1 text-sm text-muted">
            Designed for English-speaking Arabic students.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <ul className="flex items-center gap-4 text-sm text-muted">
            <li>
              <Link href="/browse" className="rounded hover:text-primary">
                Browse roots
              </Link>
            </li>
            <li>
              <Link href="/about" className="rounded hover:text-primary">
                About
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/amx7q/sarfmate"
                className="rounded hover:text-primary"
              >
                GitHub
              </a>
            </li>
          </ul>
        </nav>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <p className="text-xs text-muted">Found SarfMate useful?</p>
          <a
            href="https://buymeacoffee.com/ammarabuyahya"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-secondary"
          >
            Buy Me a Coffee
          </a>
          </div>
      </div>
      <div className="border-t border-border-soft">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs leading-5 text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            Arabic morphology can vary by verb form, context, and usage.
            SarfMate entries are curated and reviewed over time.
          </p>
          <p>
            Website by{" "}
            <a
              href="https://linktr.ee/ammarabuyahya"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded font-medium text-primary hover:text-secondary"
            >
              Abu Yahya
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
