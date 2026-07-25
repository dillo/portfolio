import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LessonBody } from '@/components/guides/LessonBody'
import { Inline } from '@/components/guides/Inline'
import { LessonDiagram } from '@/components/guides/diagrams'
import {
  accentClasses,
  adjacentLessons,
  getLesson,
  getModule,
  getSeries,
  lessonNumber,
  series,
} from '@/lib/guides'

interface Props {
  params: Promise<{ series: string; lesson: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return series.flatMap((s) => s.lessons.map((l) => ({ series: s.id, lesson: l.slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { series: seriesId, lesson: slug } = await params
  const lesson = getLesson(seriesId, slug)
  if (!lesson) return {}
  return {
    title: lesson.title,
    description: lesson.tagline,
    openGraph: { title: lesson.title, description: lesson.tagline },
  }
}

export default async function LessonPage({ params }: Props) {
  const { series: seriesId, lesson: slug } = await params
  const s = getSeries(seriesId)
  const lesson = s ? getLesson(seriesId, slug) : undefined
  if (!s || !lesson) notFound()

  const accent = accentClasses[s.accent]
  const lessonModule = lesson.module ? getModule(s, lesson.module) : undefined
  const { prev, next } = adjacentLessons(s.id, lesson.slug)
  const n = lessonNumber(s, lesson.slug)

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-12">
      <header className="border-border bg-paper/72 rounded-lg border p-6 sm:p-8">
        <div className="text-muted flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs uppercase">
          <Link href={`/guides/${s.id}`} className={`${accent.text} transition-colors`}>
            {s.title}
          </Link>
          {lessonModule && (
            <>
              <span aria-hidden>·</span>
              <span>{lessonModule.title}</span>
            </>
          )}
          <span aria-hidden>·</span>
          <span>
            Lesson {String(n).padStart(2, '0')} of {s.lessons.length}
          </span>
          <span aria-hidden>·</span>
          <span>{lesson.minutes} min</span>
        </div>

        <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">{lesson.title}</h1>
        <p className="text-muted mt-4 text-lg leading-8">{lesson.tagline}</p>
      </header>

      <p className="text-muted text-[17px] leading-[1.75]">
        <Inline text={lesson.intro} />
      </p>

      <LessonDiagram seriesId={s.id} slug={lesson.slug} />

      <LessonBody sections={lesson.sections} />

      <section className="border-border bg-paper/72 rounded-lg border p-6 sm:p-8">
        <h2 className={`${accent.text} font-mono text-xs uppercase`}>Takeaways</h2>
        <ul className="mt-4 space-y-3">
          {lesson.takeaways.map((t, i) => (
            <li key={i} className="text-foreground flex gap-3 leading-7">
              <span className={`${accent.text} font-mono text-xs`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>
                <Inline text={t} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      {lesson.goDeeper && lesson.goDeeper.length > 0 && (
        <section>
          <h2 className="text-muted font-mono text-xs uppercase">Go deeper</h2>
          <ul className="mt-4 grid gap-2">
            {lesson.goDeeper.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${accent.text} hover:text-accent-hover text-sm underline underline-offset-4 transition-colors`}
                >
                  {link.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className="border-border grid gap-3 border-t pt-8 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/guides/${s.id}/${prev.slug}`}
            className={`group border-border bg-paper/72 ${accent.hoverBorder} rounded-lg border p-5 transition-colors`}
          >
            <span className="text-muted font-mono text-xs uppercase">← Previous</span>
            <span
              className={`text-foreground mt-2 block font-bold ${accent.hoverText} transition-colors`}
            >
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/guides/${s.id}/${next.slug}`}
            className={`group border-border bg-paper/72 ${accent.hoverBorder} rounded-lg border p-5 text-right transition-colors sm:col-start-2`}
          >
            <span className="text-muted font-mono text-xs uppercase">Next →</span>
            <span
              className={`text-foreground mt-2 block font-bold ${accent.hoverText} transition-colors`}
            >
              {next.title}
            </span>
          </Link>
        )}
      </nav>
    </article>
  )
}
