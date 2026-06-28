import Link from 'next/link'
import type { BlogFrontmatter } from '@/lib/mdx'
import { readingTime } from '@/lib/mdx'

interface Props {
  slug: string
  frontmatter: BlogFrontmatter
  content: string
}

export default function BlogPostCard({ slug, frontmatter, content }: Props) {
  const { title, date, summary, tags } = frontmatter

  return (
    <article className="group border-border bg-paper/58 hover:border-accent flex flex-col gap-4 border-b p-5 transition-colors first:rounded-t-lg first:border-t last:rounded-b-lg sm:p-6">
      <div className="text-muted flex items-center gap-3 font-mono text-[11px] uppercase">
        <time dateTime={date}>
          {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        <span>·</span>
        <span>{readingTime(content)}</span>
      </div>

      <Link href={`/blog/${slug}`}>
        <h2 className="text-foreground group-hover:text-accent text-2xl font-black tracking-tight transition-colors">
          {title}
        </h2>
      </Link>

      <p className="text-muted max-w-3xl text-sm leading-6">{summary}</p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="border-border bg-background/70 text-muted rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase"
            >
              {tag}
            </span>
          ))}
        </div>
        <Link
          href={`/blog/${slug}`}
          className="text-accent hover:text-accent-hover font-mono text-xs font-semibold uppercase transition-colors"
        >
          Read essay
        </Link>
      </div>
    </article>
  )
}
