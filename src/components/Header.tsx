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
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Logo />
        <nav aria-label="Main navigation" className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex w-max min-w-full items-center justify-end gap-0.5 sm:gap-2">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
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
