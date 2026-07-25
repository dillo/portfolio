import type { Lesson, Module, Series } from './types'
import { aiEngineering } from './ai-engineering'

/** Every series, in the order they appear on /guides. */
export const series: Series[] = [aiEngineering]

const bySeriesId = new Map(series.map((s) => [s.id, s]))

export function getSeries(id: string): Series | undefined {
  return bySeriesId.get(id)
}

/** Lesson slugs are unique per series, so both segments are needed to resolve one. */
export function getLesson(seriesId: string, slug: string): Lesson | undefined {
  return getSeries(seriesId)?.lessons.find((l) => l.slug === slug)
}

export function getModule(s: Series, moduleId: string): Module | undefined {
  return s.modules.find((m) => m.id === moduleId)
}

/**
 * Lessons grouped for display. Series without modules fall back to a single
 * unlabelled group so the index page has one shape to render.
 */
export function lessonsByModule(s: Series): { module?: Module; lessons: Lesson[] }[] {
  if (s.modules.length === 0) return [{ lessons: s.lessons }]

  const groups = s.modules
    .map((module) => ({
      module,
      lessons: s.lessons.filter((l) => l.module === module.id),
    }))
    .filter((g) => g.lessons.length > 0)

  const ungrouped = s.lessons.filter((l) => !l.module || !getModule(s, l.module))
  return ungrouped.length > 0 ? [...groups, { lessons: ungrouped }] : groups
}

/** Prev/next scope to the series, never across series. */
export function adjacentLessons(seriesId: string, slug: string): { prev?: Lesson; next?: Lesson } {
  const s = getSeries(seriesId)
  if (!s) return {}
  const i = s.lessons.findIndex((l) => l.slug === slug)
  if (i === -1) return {}
  return {
    prev: i > 0 ? s.lessons[i - 1] : undefined,
    next: i < s.lessons.length - 1 ? s.lessons[i + 1] : undefined,
  }
}

export function lessonNumber(s: Series, slug: string): number {
  return s.lessons.findIndex((l) => l.slug === slug) + 1
}

/** Static map so Tailwind sees every class it needs to generate. */
export const accentClasses = {
  accent: {
    text: 'text-accent',
    border: 'border-accent',
    bg: 'bg-accent',
    bgSoft: 'bg-accent-soft',
    hoverBorder: 'hover:border-accent',
    hoverText: 'group-hover:text-accent',
  },
  signal: {
    text: 'text-signal',
    border: 'border-signal',
    bg: 'bg-signal',
    bgSoft: 'bg-signal-soft',
    hoverBorder: 'hover:border-signal',
    hoverText: 'group-hover:text-signal',
  },
} as const

export type { Block, Lesson, Module, Section, Series, SeriesAccent } from './types'
