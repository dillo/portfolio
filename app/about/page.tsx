import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
  description: 'Senior software engineer building reliable, scalable systems.',
}

const skills = [
  'TypeScript',
  'Go',
  'Python',
  'Rust',
  'React',
  'Next.js',
  'Node.js',
  'PostgreSQL',
  'Redis',
  'Kubernetes',
  'Docker',
  'AWS',
  'gRPC',
  'Kafka',
  'GraphQL',
  'REST',
]

const interests = [
  { label: 'Distributed systems', icon: '⚙️' },
  { label: 'Developer tooling', icon: '🛠️' },
  { label: 'Programming languages', icon: '📐' },
  { label: 'Open source', icon: '🌐' },
  { label: 'Technical writing', icon: '✍️' },
  { label: 'Rock climbing', icon: '🧗' },
]

export default function About() {
  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">About me</h1>
        <div className="text-muted flex flex-col gap-4 leading-relaxed">
          <p>
            I&apos;m Dillo Raju, a senior software engineer who loves building systems that are
            correct, observable, and easy to reason about. I&apos;ve spent my career working across
            the stack — from low-level infrastructure and distributed systems to product-facing APIs
            and frontend interfaces.
          </p>
          <p>
            I care deeply about the craft. That means writing code that&apos;s clear, designing APIs
            that are hard to misuse, and treating observability as a first-class concern — not an
            afterthought. I like working on hard problems with small, focused teams.
          </p>
          <p>
            When I&apos;m not writing software I&apos;m usually reading about it, contributing to
            open source, or away from a screen entirely.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Skills</h2>
        <ul className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <li
              key={skill}
              className="border-border bg-card text-foreground rounded-full border px-3 py-1 text-sm"
            >
              {skill}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Interests</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {interests.map(({ label, icon }) => (
            <li key={label} className="text-muted flex items-center gap-3">
              <span className="text-lg">{icon}</span>
              <span className="text-sm">{label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Connect</h2>
        <p className="text-muted text-sm">
          The best way to reach me is via{' '}
          <Link
            href="https://www.linkedin.com/in/dillo-raju/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover underline underline-offset-2 transition-colors"
          >
            LinkedIn
          </Link>
          . I&apos;m always open to interesting conversations.
        </p>
      </section>
    </div>
  )
}
