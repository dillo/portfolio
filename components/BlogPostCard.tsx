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
    <article className="group border-border flex flex-col gap-3 border-b py-8 first:pt-0 last:border-0">
      <div className="text-muted flex items-center gap-3 text-xs">
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
        <h2 className="text-foreground group-hover:text-accent text-xl font-semibold transition-colors">
          {title}
        </h2>
      </Link>

      <p className="text-muted text-sm leading-relaxed">{summary}</p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="border-border bg-card text-muted rounded-full border px-2.5 py-0.5 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        <Link
          href={`/blog/${slug}`}
          className="text-accent hover:text-accent-hover text-xs font-medium transition-colors"
        >
          Read more →
        </Link>
      </div>
    </article>
  )
}
