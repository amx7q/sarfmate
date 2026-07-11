const FEATURES = [
  {
    title: "Root-first learning",
    body: "See how words grow from three letters, starting from the root itself.",
  },
  {
    title: "English meanings",
    body: "Every form comes with a clear English meaning written for learners.",
  },
  {
    title: "Example sentences",
    body: "Each form includes a short Arabic sentence with its translation.",
  },
  {
    title: "Community reviewed",
    body: "Entries are curated and reviewed, with community corrections welcome.",
  },
] as const;

export default function FeatureCards() {
  return (
    <section aria-labelledby="features-heading" className="py-10 sm:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="features-heading" className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
          Built around how learners study
        </h2>
        <p className="mt-3 text-muted">
          Arabic forms stay central, with just enough English guidance to make each pattern useful.
        </p>
      </div>
      <div className="mt-8 grid overflow-hidden rounded-2xl border border-border-soft bg-surface sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature, index) => (
          <article
            key={feature.title}
            className={`p-5 ${index > 0 ? "border-t border-border-soft sm:border-t-0" : ""} ${index % 2 === 1 ? "sm:border-l sm:border-border-soft" : ""} ${index > 1 ? "sm:border-t sm:border-border-soft lg:border-t-0" : ""} ${index > 0 ? "lg:border-l lg:border-border-soft" : ""}`}
          >
            <h3 className="text-sm font-semibold text-primary">
              {feature.title}
            </h3>
            <p className="mt-1.5 text-sm text-muted">{feature.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
