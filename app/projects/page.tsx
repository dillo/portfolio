import type { Metadata } from 'next'
import { getAllProjects } from '@/lib/mdx'
import ProjectCard from '@/components/ProjectCard'

export const metadata: Metadata = {
  title: 'Projects',
  description: "Things I've built — open source tools, systems projects, and more.",
}

export default function Projects() {
  const projects = getAllProjects()

  return (
    <div className="flex flex-col gap-10">
      <div className="border-border bg-paper/72 rounded-lg border p-6 sm:p-8">
        <p className="font-mono text-xs uppercase text-accent">Selected work</p>
        <h1 className="mt-3 max-w-3xl text-5xl font-black tracking-tight sm:text-6xl">
          Systems, tools, and product surfaces with operational taste.
        </h1>
        <p className="text-muted mt-5 max-w-2xl leading-7">
          Things I&apos;ve built, shipped, and learned from.
        </p>
      </div>

      {projects.length === 0 ? (
        <p className="text-muted text-sm">No projects yet — check back soon.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {projects.map((p) => (
            <ProjectCard key={p.slug} slug={p.slug} frontmatter={p.frontmatter} />
          ))}
        </div>
      )}
    </div>
  )
}
