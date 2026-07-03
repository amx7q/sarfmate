const FEATURES = [
  {
    title: "Root-first learning",
    body: "See how words grow from three letters, starting from the root itself.",
    icon: "🌱",
  },
  {
    title: "English meanings",
    body: "Every form comes with a clear English meaning written for learners.",
    icon: "🔤",
  },
  {
    title: "Example sentences",
    body: "Each form includes a short Arabic sentence with its translation.",
    icon: "📖",
  },
  {
    title: "Community reviewed",
    body: "Entries are curated and reviewed, with community corrections welcome.",
    icon: "🤝",
  },
] as const;

export default function FeatureCards() {
  return (
    <section aria-label="Features" className="py-14">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-border-soft bg-surface p-5 shadow-sm"
          >
            <span className="text-2xl" aria-hidden="true">
              {feature.icon}
            </span>
            <h3 className="mt-3 text-sm font-semibold text-primary">
              {feature.title}
            </h3>
            <p className="mt-1.5 text-sm text-muted">{feature.body}</p>
          </article>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        Designed for English-speaking Arabic students.
      </p>
    </section>
  );
}
