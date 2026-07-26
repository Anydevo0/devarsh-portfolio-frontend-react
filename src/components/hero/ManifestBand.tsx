const HIGHLIGHTS = [
  {
    title: 'Backend architecture',
    text: 'I build scalable backend services with Python, FastAPI, and DRF, designing clean APIs, maintainable service layers, and efficient data flows for complex applications.',
  },
  {
    title: 'AI-powered systems',
    text: 'I develop intelligent applications using LLM workflows, RAG pipelines, and AI integrations, Custom MCPs that transform business processes into smarter user experiences.',
  },
  {
    title: 'Production engineering',
    text: 'I focus on building reliable systems with cloud infrastructure, background processing, observability, and scalable data architectures that perform in real-world environments.',
  },
]

export function ManifestBand() {
  return (
    <section className="bg-ink px-6 py-10 sm:py-12">
      <div className="mx-auto max-w-4xl rounded-3xl border border-line-on-ink/60 bg-ink/80 p-6 shadow-sm sm:p-8">
        <p className="mb-4 font-mono text-xs tracking-wider text-mute-on-ink uppercase">
          // backend + ai focus
        </p>
        <p className="max-w-3xl text-base leading-7 text-paper/85 sm:text-lg">
          I build software systems that are designed for real-world complexity — combining reliable backend engineering with practical AI solutions to create scalable, production-ready applications.
        </p>
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {HIGHLIGHTS.map((highlight) => (
            <li key={highlight.title} className="rounded-2xl border border-line-on-ink/60 bg-paper/5 p-4">
              <h3 className="font-mono text-xs tracking-wider text-signal uppercase">{highlight.title}</h3>
              <p className="mt-2 text-sm leading-6 text-paper/80">{highlight.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
