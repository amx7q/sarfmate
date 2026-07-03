import Link from "next/link";

/** SarfMate mark: an Arabic-arch outline with three root letters growing from gold roots. */
function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      {/* arch outline */}
      <path
        d="M32 4 L40 12 H52 V30 L58 38 L52 46 V56 H12 V46 L6 38 L12 30 V12 H24 Z"
        stroke="#0f4d4a"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* trunk */}
      <path d="M32 40 V26" stroke="#0f4d4a" strokeWidth="2.5" />
      <path d="M32 30 L22 24 M32 30 L42 24" stroke="#0f4d4a" strokeWidth="2.5" />
      {/* three letter nodes */}
      <circle cx="32" cy="19" r="6" stroke="#0f4d4a" strokeWidth="2" fill="#ffffff" />
      <circle cx="20" cy="23" r="5.5" stroke="#0f4d4a" strokeWidth="2" fill="#ffffff" />
      <circle cx="44" cy="23" r="5.5" stroke="#0f4d4a" strokeWidth="2" fill="#ffffff" />
      <text x="32" y="22" textAnchor="middle" fontSize="8" fill="#0f4d4a">ر</text>
      <text x="20" y="26" textAnchor="middle" fontSize="7" fill="#0f4d4a">ف</text>
      <text x="44" y="26" textAnchor="middle" fontSize="7" fill="#0f4d4a">س</text>
      {/* gold roots */}
      <path
        d="M32 40 L32 46 M32 42 L24 50 M32 42 L40 50 M32 44 L18 52 M32 44 L46 52"
        stroke="#d4af37"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M29 40 h6 l-3 -4 z M29 40 h6 l-3 4 z" fill="#d4af37" />
    </svg>
  );
}

export default function Logo({ showTagline = true }: { showTagline?: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 rounded-lg"
      aria-label="SarfMate home"
    >
      <LogoMark className="h-11 w-11" />
      <span className="flex flex-col leading-tight">
        <span className="text-xl font-bold tracking-tight text-primary">
          Sarf<span className="text-secondary">Mate</span>
        </span>
        {showTagline && (
          <span className="text-xs text-accent font-medium">
            Arabic roots &amp; forms
          </span>
        )}
      </span>
    </Link>
  );
}
