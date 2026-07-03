export default function ExampleSentence({
  arabic,
  english,
}: {
  arabic: string;
  english: string;
}) {
  return (
    <div className="space-y-1 border-t border-border-soft pt-3">
      <p dir="rtl" lang="ar" className="font-arabic text-lg leading-relaxed text-ink">
        {arabic}
      </p>
      <p lang="en" className="text-sm text-muted">
        {english}
      </p>
    </div>
  );
}
