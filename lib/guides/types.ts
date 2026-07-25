/**
 * Content model for Guides.
 *
 * Series -> Module -> Lesson. A series is a subject (AI engineering, systems
 * design, clean code); modules are an optional grouping inside a series; a
 * lesson is a single page. Content is plain typed data, not MDX.
 */

export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'list'; ordered?: boolean; items: string[] }
  | { kind: 'callout'; tone: 'tip' | 'note' | 'warn'; title: string; text: string }
  | { kind: 'code'; lang: string; code: string }

export interface Section {
  heading: string
  blocks: Block[]
}

export interface Lesson {
  slug: string
  title: string
  /** One short line shown on cards and under the lesson title. */
  tagline: string
  /** Lead paragraph that opens the lesson, above the diagram. */
  intro: string
  /** Id of the module this lesson belongs to. Omit for unmoduled series. */
  module?: string
  minutes: number
  sections: Section[]
  takeaways: string[]
  goDeeper?: { label: string; url: string }[]
}

export interface Module {
  id: string
  title: string
  blurb: string
}

/**
 * Each series gets one accent, drawn from the site's existing tokens. Modules
 * are not colour-coded — they read as numbered groupings instead, so adding a
 * series never means inventing a new palette.
 */
export type SeriesAccent = 'accent' | 'signal'

export interface Series {
  id: string
  title: string
  blurb: string
  /** Longer description shown on the series index page. */
  intro: string
  accent: SeriesAccent
  /** Empty for a series that does not group its lessons. */
  modules: Module[]
  lessons: Lesson[]
}
