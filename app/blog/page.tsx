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
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
        <p className="text-muted">Thoughts on software engineering, systems, and craft.</p>
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
