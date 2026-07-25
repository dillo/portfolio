import type { Metadata } from 'next'
import Link from 'next/link'
import { accentClasses, series } from '@/lib/guides'

export const metadata: Metadata = {
  title: 'Guides',
  description:
    'Illustrated engineering guides — worked explanations of the ideas behind AI systems, architecture, and craft.',
}

export default function GuidesIndex() {
  return (
    <div className="flex flex-col gap-16">
      <section className="border-border bg-paper/72 rounded-lg border p-6 sm:p-8">
        <p className="text-accent font-mono text-xs uppercase">Guides</p>
        <h1 className="mt-3 max-w-4xl text-5xl font-black tracking-tight sm:text-6xl">
          Explanations I wish I&apos;d had the first time.
        </h1>
        <p className="text-muted mt-6 max-w-2xl leading-8">
          Illustrated walkthroughs of the ideas I lean on at work — written to be read in order, or
          dipped into whenever a concept stops making sense.
        </p>
      </section>

      <section className="grid gap-4">
        {series.map((s) => {
          const accent = accentClasses[s.accent]
          return (
            <Link
              key={s.id}
              href={`/guides/${s.id}`}
              className={`group border-border bg-paper/72 ${accent.hoverBorder} grid gap-5 rounded-lg border p-6 transition-colors sm:grid-cols-[1fr_auto] sm:items-center sm:p-8`}
            >
              <div>
                <p className={`${accent.text} font-mono text-xs uppercase`}>
                  {s.lessons.length} lessons
                  {s.modules.length > 0 ? ` · ${s.modules.length} modules` : ''}
                </p>
                <h2
                  className={`mt-3 text-3xl font-black tracking-tight ${accent.hoverText} transition-colors`}
                >
                  {s.title}
                </h2>
                <p className="text-muted mt-3 max-w-2xl leading-7">{s.intro}</p>
              </div>
              <span className={`${accent.text} font-mono text-xs uppercase`}>Start reading →</span>
            </Link>
          )
        })}
      </section>
    </div>
  )
}
