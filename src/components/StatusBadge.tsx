import { STATUS_LABELS, type RootStatus } from "@/lib/types";

const STYLES: Record<RootStatus, { pill: string; dot: string }> = {
  reviewed: {
    pill: "border-secondary/30 bg-secondary/10 text-primary",
    dot: "bg-secondary",
  },
  community_suggested: {
    pill: "border-accent/40 bg-accent/10 text-ink",
    dot: "bg-accent",
  },
  ai_draft: {
    pill: "border-border-soft bg-background text-muted",
    dot: "bg-muted",
  },
};

export default function StatusBadge({ status }: { status: RootStatus }) {
  const style = STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${style.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}
