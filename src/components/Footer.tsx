import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border-soft bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-sm font-semibold text-primary">
            SarfMate <span className="text-muted font-normal">— Arabic roots &amp; forms</span>
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
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted sm:px-6">
          Arabic morphology can vary by verb form, context, and usage. SarfMate
          entries are curated and reviewed over time.
        </p>
      </div>
    </footer>
  );
}
