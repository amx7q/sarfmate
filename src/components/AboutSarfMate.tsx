const SECTIONS = [
  {
    title: "What are Arabic roots?",
    body: "Arabic words often grow from roots, usually three letters. The root س م ع carries the idea of hearing, and from it grow words like سَمِعَ (he heard), سامِع (listener), and مَسْمُوع (heard). Once you can see the root inside a word, Arabic vocabulary starts to feel connected instead of random.",
  },
  {
    title: "What is ṣarf?",
    body: "Ṣarf (صرف) is Arabic morphology — the study of how words are formed from roots using patterns. It explains why مَكْتَب means \"office\" and كاتِب means \"writer\": both come from the root ك ت ب (writing), shaped by different patterns. SarfMate shows you the most useful patterns first, without drowning you in technical terms.",
  },
  {
    title: "Why this fixed order of six forms?",
    body: "SarfMate always shows the same six forms in the same order: past verb, present verb, imperative, place noun / mim-masdar, active participle, and passive participle. A fixed order builds a mental habit — after a few roots, you will start predicting the forms before you see them. That is exactly the skill ṣarf students need.",
  },
  {
    title: "Why learners, meanings, and examples come first",
    body: "Many Arabic dictionaries and conjugators are built for advanced readers. SarfMate is built for English-speaking students. Every form has a plain English meaning and a short example sentence with its translation, so you always see the word working inside real Arabic.",
  },
  {
    title: "Why entries are reviewed",
    body: "Arabic morphology can vary by verb form, context, and usage. SarfMate entries are curated and reviewed over time. Each root carries a status badge — Reviewed, Partially reviewed, Community suggested, or AI draft — and individual forms that still need scholarly review are clearly marked, so you always know how much to trust what you see.",
  },
  {
    title: "How community corrections help",
    body: "If you notice an error or want a new root added, use the \"Notice an error\" button on any card or the \"Suggest a root\" button. Community suggestions are reviewed before publishing. Every correction makes SarfMate more reliable for the next student.",
  },
] as const;

export default function AboutSarfMate() {
  return (
    <article className="mx-auto max-w-2xl py-12">
      <h1 className="text-3xl font-bold tracking-tight text-primary">
        About SarfMate
      </h1>
      <p className="mt-4 text-lg text-muted">
        SarfMate helps you see the most important forms of an Arabic root in
        one clean view, with English meanings and example sentences.
      </p>
      <div className="mt-10 space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold text-primary">{section.title}</h2>
            <p className="mt-3 leading-relaxed text-ink">{section.body}</p>
          </section>
        ))}
        <section>
          <h2 className="text-xl font-semibold text-primary">Sources and attribution</h2>
          <p className="mt-3 leading-relaxed text-ink">
            Conjugated verb forms are checked with{" "}
            <a className="font-medium text-primary hover:text-secondary" href="https://qutrub.arabeyes.org/">
              Qutrub
            </a>
            . Derived-form lemmas are checked with Birzeit University&rsquo;s{" "}
            <a className="font-medium text-primary hover:text-secondary" href="https://sina.birzeit.edu/qabas/about">
              Qabas Arabic Lexicon
            </a>
            , by Mustafa Jarrar and Tymaa Hammouda, used under CC BY-ND 4.0.
            Disputed vowel forms are independently cross-checked with NYU Abu Dhabi&rsquo;s{" "}
            <a
              className="font-medium text-primary hover:text-secondary"
              href="https://camel-tools.readthedocs.io/"
            >
              CALIMA-MSA via CAMeL Tools
            </a>
            , and unresolved participles are additionally checked with the official open-source{" "}
            <a
              className="font-medium text-primary hover:text-secondary"
              href="https://github.com/otakar-smrz/elixir-fm"
            >
              ElixirFM morphology lexicon
            </a>
            .
            Source confirmation does not replace contextual scholarly review.
          </p>
        </section>
      </div>
    </article>
  );
}
