import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Dillo Raju — Senior Software Engineer & Technical Lead',
  description:
    'Senior software engineer and technical lead building AI-enabled product development, application modernization, and developer productivity workflows.',
}

export default function Home() {
  return (
    <div className="flex flex-col gap-20">
      <section className="flex flex-col gap-8">
        <div className="border-border bg-paper/68 text-muted w-fit rounded-lg border px-3 py-2 font-mono text-[11px] uppercase backdrop-blur">
          AI-enabled product development / application modernization / developer productivity
        </div>

        <div>
          <h1 className="text-foreground max-w-6xl text-5xl leading-[0.95] font-black tracking-tight sm:text-6xl lg:text-7xl">
            Building AI-enabled products and the engineering workflows that ship them.
          </h1>
          <p className="text-muted mt-8 max-w-2xl text-lg leading-8 sm:text-xl">
            I&apos;m Dillo Raju, a senior software engineer and technical lead. I build AI-agent
            workflows for Codex and Claude Code, modernize legacy platforms, and ship products used
            by millions of people.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/resume"
            className="bg-foreground text-background hover:bg-accent rounded-md px-5 py-3 text-sm font-semibold transition-colors"
          >
            View résumé
          </Link>
          <Link
            href="/contact"
            className="border-border bg-paper/70 text-foreground hover:border-accent hover:text-accent rounded-md border px-5 py-3 text-sm font-semibold transition-colors"
          >
            Start a conversation
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          [
            '01',
            'Agentic workflows',
            'AI-agent skills for Codex and Claude Code that automate Java and Spring Boot upgrades, adopted by 10+ developers.',
          ],
          [
            '02',
            'Modernization',
            'Co-leading migration of ~20 legacy Ruby applications to Java, Spring Boot, and React — architecture, standards, and sequencing.',
          ],
          [
            '03',
            'Product leadership',
            'Cross-functional delivery, mentoring, and developer enablement for products serving millions of users.',
          ],
        ].map(([num, title, body]) => (
          <div
            key={title}
            className="border-border bg-paper/72 rounded-lg border p-5 backdrop-blur"
          >
            <p className="text-accent font-mono text-xs">{num}</p>
            <h2 className="mt-8 text-xl font-bold tracking-tight">{title}</h2>
            <p className="text-muted mt-3 text-sm leading-6">{body}</p>
          </div>
        ))}
      </section>

      <section className="border-border bg-foreground text-background rounded-lg border p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase opacity-70">
              Open to senior, staff, lead, and product-engineering roles
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
              Need an engineer who can use software and AI to solve complex operational problems?
            </h2>
          </div>
          <Link
            href="/contact"
            className="bg-background text-foreground hover:bg-accent-soft rounded-md px-5 py-3 text-center text-sm font-semibold transition-colors"
          >
            Contact Dillo
          </Link>
        </div>
      </section>
    </div>
  )
}
