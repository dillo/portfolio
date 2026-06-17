import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Dillo Raju — Software Engineer',
  description: 'Senior software engineer. I build reliable, scalable software.',
}

export default function Home() {
  return (
    <div className="flex flex-col gap-24">
      {/* Hero */}
      <section className="flex flex-col gap-6 pt-12">
        <div className="flex flex-col gap-3">
          <p className="text-accent text-sm font-medium tracking-widest uppercase">
            Software Engineer
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Hi, I&apos;m Dillo Raju.
          </h1>
          <p className="text-muted max-w-xl text-xl leading-relaxed">
            I build reliable, scalable software.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/projects"
            className="bg-accent hover:bg-accent-hover rounded-md px-5 py-2.5 text-sm font-medium text-white transition-colors"
          >
            View Projects
          </Link>
          <Link
            href="/resume"
            className="border-border text-foreground hover:bg-card rounded-md border px-5 py-2.5 text-sm font-medium transition-colors"
          >
            View Resume
          </Link>
        </div>
      </section>

      {/* Quick bio */}
      <section className="flex flex-col gap-4">
        <h2 className="text-foreground text-lg font-semibold">About me</h2>
        <p className="text-muted leading-relaxed">
          I&apos;m a senior software engineer with a focus on building systems that are correct,
          observable, and easy to reason about. I care about the craft — clean APIs, thoughtful
          abstractions, and software that&apos;s a pleasure to maintain.
        </p>
        <Link
          href="/about"
          className="text-accent hover:text-accent-hover text-sm font-medium transition-colors"
        >
          More about me →
        </Link>
      </section>

      {/* Explore grid */}
      <section className="flex flex-col gap-4">
        <h2 className="text-foreground text-lg font-semibold">Explore</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { href: '/projects', label: 'Projects', desc: "Things I've built" },
            { href: '/blog', label: 'Blog', desc: 'Writing & thoughts' },
            { href: '/contact', label: 'Contact', desc: 'Get in touch' },
          ].map(({ href, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="border-border bg-card hover:border-accent flex flex-col gap-1 rounded-lg border p-4 transition-colors"
            >
              <span className="text-foreground text-sm font-medium">{label}</span>
              <span className="text-muted text-xs">{desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
