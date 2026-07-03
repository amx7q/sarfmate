import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border-soft bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
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
      </div>
      <div className="border-t border-border-soft">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="max-w-2xl text-sm text-muted">
            Found SarfMate useful?
          </p>
          <a
            href="https://buymeacoffee.com/ammarabuyahya"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:bg-[#caa229] focus-visible:outline-secondary"
          >
            Buy Me a Coffee
          </a>
        </div>
      </div>
      <div className="border-t border-border-soft">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            Arabic morphology can vary by verb form, context, and usage.
            SarfMate entries are curated and reviewed over time.
          </p>
          <p>
            Website created by{" "}
            <a
              href="https://www.linkedin.com/in/ammar7q"
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
