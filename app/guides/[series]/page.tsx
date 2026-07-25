import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { accentClasses, getSeries, lessonNumber, lessonsByModule, series } from '@/lib/guides'

interface Props {
  params: Promise<{ series: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return series.map((s) => ({ series: s.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { series: seriesId } = await params
  const s = getSeries(seriesId)
  if (!s) return {}
  return {
    title: s.title,
    description: s.intro,
  }
}

export default async function SeriesPage({ params }: Props) {
  const { series: seriesId } = await params
  const s = getSeries(seriesId)
  if (!s) notFound()

  const accent = accentClasses[s.accent]
  const groups = lessonsByModule(s)

  return (
    <div className="flex flex-col gap-16">
      <section className="border-border bg-paper/72 rounded-lg border p-6 sm:p-8">
        <Link
          href="/guides"
          className="text-muted hover:text-foreground font-mono text-xs uppercase transition-colors"
        >
          ← All guides
        </Link>
        <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight sm:text-6xl">{s.title}</h1>
        <p className="text-muted mt-6 max-w-2xl leading-8">{s.intro}</p>
        <p className={`${accent.text} mt-6 font-mono text-xs uppercase`}>
          {s.lessons.length} lessons
          {s.modules.length > 0 ? ` · ${s.modules.length} modules` : ''}
        </p>
      </section>

      {groups.map((group, gi) => (
        <section
          key={group.module?.id ?? `group-${gi}`}
          className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]"
        >
          <div>
            {group.module ? (
              <>
                <p className={`${accent.text} font-mono text-xs`}>
                  {String(gi + 1).padStart(2, '0')}
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight">{group.module.title}</h2>
                <p className="text-muted mt-3 leading-7">{group.module.blurb}</p>
              </>
            ) : (
              <h2 className="text-3xl font-black tracking-tight">Lessons</h2>
            )}
          </div>

          <ul className="grid gap-3">
            {group.lessons.map((lesson) => {
              const n = lessonNumber(s, lesson.slug)
              return (
                <li key={lesson.slug}>
                  <Link
                    href={`/guides/${s.id}/${lesson.slug}`}
                    className={`group border-border bg-paper/72 ${accent.hoverBorder} grid gap-4 rounded-lg border p-5 transition-colors sm:grid-cols-[3rem_1fr_auto] sm:items-baseline`}
                  >
                    <span className="text-muted font-mono text-xs uppercase">
                      {String(n).padStart(2, '0')}
                    </span>
                    <span>
                      <span
                        className={`text-foreground block text-lg font-bold tracking-tight ${accent.hoverText} transition-colors`}
                      >
                        {lesson.title}
                      </span>
                      <span className="text-muted mt-1 block text-sm leading-6">
                        {lesson.tagline}
                      </span>
                    </span>
                    <span className="text-muted font-mono text-xs uppercase">
                      {lesson.minutes} min
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
