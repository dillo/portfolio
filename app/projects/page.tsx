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
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted">Things I&apos;ve built, shipped, and learned from.</p>
      </div>

      {projects.length === 0 ? (
        <p className="text-muted text-sm">No projects yet — check back soon.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <ProjectCard key={p.slug} slug={p.slug} frontmatter={p.frontmatter} />
          ))}
        </div>
      )}
    </div>
  )
}
