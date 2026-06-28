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
  { label: 'Distributed systems', code: 'SYS' },
  { label: 'Developer tooling', code: 'DX' },
  { label: 'Programming languages', code: 'PL' },
  { label: 'Open source', code: 'OSS' },
  { label: 'Technical writing', code: 'DOC' },
  { label: 'Rock climbing', code: 'OFF' },
]

export default function About() {
  return (
    <div className="flex flex-col gap-16">
      <section className="border-border bg-paper/72 rounded-lg border p-6 sm:p-8">
        <p className="font-mono text-xs uppercase text-accent">About</p>
        <h1 className="mt-3 max-w-4xl text-5xl font-black tracking-tight sm:text-6xl">
          I make complex systems easier to build, operate, and trust.
        </h1>
        <div className="text-muted mt-8 grid gap-5 leading-7 lg:grid-cols-3">
          <p>
            I&apos;m Dillo Raju, a senior software engineer who loves building systems that are
            correct, observable, and easy to reason about. I&apos;ve spent my career working across
            the stack - from low-level infrastructure and distributed systems to product-facing APIs
            and frontend interfaces.
          </p>
          <p>
            I care deeply about the craft. That means writing code that&apos;s clear, designing APIs
            that are hard to misuse, and treating observability as a first-class concern - not an
            afterthought. I like working on hard problems with small, focused teams.
          </p>
          <p>
            When I&apos;m not writing software I&apos;m usually reading about it, contributing to
            open source, or away from a screen entirely.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <p className="font-mono text-xs uppercase text-accent">Toolbox</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">Practical range, sharp edges.</h2>
        </div>
        <ul className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <li
              key={skill}
              className="border-border bg-paper/72 text-foreground rounded-full border px-3 py-1.5 font-mono text-xs uppercase"
            >
              {skill}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {interests.map(({ label, code }) => (
          <div key={label} className="border-border bg-paper/58 rounded-lg border p-5">
            <span className="text-accent font-mono text-xs">{code}</span>
            <p className="mt-8 text-lg font-bold">{label}</p>
          </div>
        ))}
      </section>

      <section className="border-border bg-foreground text-background rounded-lg border p-6 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Connect</h2>
            <p className="mt-3 text-sm opacity-80">
              The best way to reach me is LinkedIn. I&apos;m always open to interesting
              conversations.
            </p>
          </div>
          <Link
            href="https://www.linkedin.com/in/dillo-raju/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-background text-foreground hover:bg-accent-soft rounded-md px-5 py-3 text-center text-sm font-semibold transition-colors"
          >
            Open LinkedIn
          </Link>
        </div>
      </section>
    </div>
  )
}
