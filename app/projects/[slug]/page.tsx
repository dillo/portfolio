import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllProjects, getProjectBySlug } from '@/lib/mdx'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) return {}
  return {
    title: project.frontmatter.title,
    description: project.frontmatter.description,
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) notFound()

  const { title, description, tags, date, github, live } = project.frontmatter

  return (
    <article className="mx-auto flex max-w-5xl flex-col gap-10">
      {/* Header */}
      <div className="border-border bg-paper/72 rounded-lg border p-6 sm:p-8">
        <Link
          href="/projects"
          className="text-muted hover:text-foreground font-mono text-xs uppercase transition-colors"
        >
          Back to projects
        </Link>
        <div className="mt-6 flex flex-col gap-4">
          <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-6xl">{title}</h1>
          <p className="text-muted max-w-3xl text-lg leading-8">{description}</p>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <time className="text-muted font-mono text-xs uppercase">
            {new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
            })}
          </time>
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-foreground flex items-center gap-1.5 font-mono text-xs uppercase transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
          )}
          {live && (
            <a
              href={live}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-foreground flex items-center gap-1.5 font-mono text-xs uppercase transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              </svg>
              Live site
            </a>
          )}
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
        <MDXRemote source={project.content} />
      </div>
    </article>
  )
}
