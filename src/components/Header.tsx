import Link from "next/link";
import Logo from "@/components/Logo";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/practice", label: "Practice" },
  { href: "/about", label: "About" },
] as const;

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-surface/90 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Logo />
        <details className="group sm:hidden">
          <summary data-cuelume-toggle="" className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-xl border border-border-soft text-primary marker:content-none [&::-webkit-details-marker]:hidden" aria-label="Open main navigation">
            <span aria-hidden="true" className="text-xl group-open:hidden">☰</span>
            <span aria-hidden="true" className="hidden text-xl group-open:inline">×</span>
          </summary>
          <nav aria-label="Mobile navigation" className="absolute inset-x-4 top-full mt-2 rounded-2xl border border-border-soft bg-surface p-2 shadow-md">
            <ul className="grid gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} data-cuelume-press="" data-cuelume-release="" className="flex min-h-11 items-center rounded-xl px-4 text-sm font-medium text-ink hover:bg-background hover:text-primary">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </details>
        <nav aria-label="Main navigation" className="hidden min-w-0 flex-1 sm:block">
          <ul className="flex w-max min-w-full items-center justify-end gap-0.5 sm:gap-2">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  data-cuelume-hover="tick"
                  data-cuelume-press=""
                  data-cuelume-release=""
                  className="block rounded-lg px-2.5 py-2 text-sm font-medium text-ink transition-[color,background-color,transform] duration-200 hover:bg-background hover:text-primary sm:px-3"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
