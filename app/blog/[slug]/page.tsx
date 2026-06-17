import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllPosts, getPostBySlug, readingTime } from '@/lib/mdx'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.summary,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const { title, date, summary, tags } = post.frontmatter

  return (
    <article className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link href="/blog" className="text-muted hover:text-foreground text-sm transition-colors">
          ← All posts
        </Link>
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted text-lg">{summary}</p>
        </div>
        <div className="text-muted flex flex-wrap items-center gap-3 text-xs">
          <time dateTime={date}>
            {new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <span>·</span>
          <span>{readingTime(post.content)}</span>
        </div>
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
      </div>

      <hr className="border-border" />

      {/* MDX body */}
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <MDXRemote source={post.content} />
      </div>
    </article>
  )
}
