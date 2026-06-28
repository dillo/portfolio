import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/mdx'
import BlogPostCard from '@/components/BlogPostCard'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Writing on software engineering, systems, and craft.',
}

export default function Blog() {
  const posts = getAllPosts()

  return (
    <div className="flex flex-col gap-10">
      <div className="border-border bg-paper/72 rounded-lg border p-6 sm:p-8">
        <p className="font-mono text-xs uppercase text-accent">Field notes</p>
        <h1 className="mt-3 max-w-3xl text-5xl font-black tracking-tight sm:text-6xl">
          Writing about software that survives contact with reality.
        </h1>
        <p className="text-muted mt-5 max-w-2xl leading-7">
          Thoughts on engineering, systems, and craft.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-muted text-sm">No posts yet — check back soon.</p>
      ) : (
        <div className="flex flex-col">
          {posts.map((p) => (
            <BlogPostCard
              key={p.slug}
              slug={p.slug}
              frontmatter={p.frontmatter}
              content={p.content}
            />
          ))}
        </div>
      )}
    </div>
  )
}
