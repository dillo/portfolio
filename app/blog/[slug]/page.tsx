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
    <article className="mx-auto flex max-w-4xl flex-col gap-10">
      {/* Header */}
      <div className="border-border bg-paper/72 rounded-lg border p-6 sm:p-8">
        <Link
          href="/blog"
          className="text-muted hover:text-foreground font-mono text-xs uppercase transition-colors"
        >
          Back to posts
        </Link>
        <div className="mt-6 flex flex-col gap-4">
          <h1 className="text-5xl font-black tracking-tight sm:text-6xl">{title}</h1>
          <p className="text-muted text-lg leading-8">{summary}</p>
        </div>
        <div className="text-muted mt-6 flex flex-wrap items-center gap-3 font-mono text-xs uppercase">
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
        <div className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="border-border bg-background/70 text-muted rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* MDX body */}
      <div className="prose prose-neutral dark:prose-invert bg-paper/72 prose-headings:font-black prose-a:text-accent max-w-none rounded-lg border border-border p-6 sm:p-8">
        <MDXRemote source={post.content} />
      </div>
    </article>
  )
}
