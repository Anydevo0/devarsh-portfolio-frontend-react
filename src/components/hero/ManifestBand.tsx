import { useSiteContent } from '@/lib/siteContent/useSiteContent'

export function ManifestBand() {
  const { focus } = useSiteContent()

  return (
    <section className="border-edge bg-void border-t px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        {focus.eyebrow && (
          <p className="text-pulse mb-5 font-mono text-xs font-medium tracking-[0.15em] uppercase">
            {focus.eyebrow}
          </p>
        )}
        <p className="text-mist max-w-3xl text-lg leading-8 sm:text-xl sm:leading-9">
          {focus.intro}
        </p>
        <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {focus.highlights.map((highlight) => (
            <li
              key={highlight.title}
              className="group border-edge bg-panel/60 hover:border-pulse/40 hover:shadow-pulse/5 rounded-2xl border p-6 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <h3 className="text-pulse font-mono text-xs font-semibold tracking-wider uppercase">
                {highlight.title}
              </h3>
              <p className="text-fog mt-3 text-sm leading-6">{highlight.text}</p>
              {highlight.tags.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {highlight.tags.map((tag) => (
                    <li
                      key={tag}
                      className="border-edge bg-void/60 text-fog/90 rounded-full border px-2.5 py-1 font-mono text-[0.6875rem]"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
