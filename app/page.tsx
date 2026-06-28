import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllProjects } from '@/lib/mdx'

export const metadata: Metadata = {
  title: 'Dillo Raju — Software Engineer',
  description:
    'Senior software engineer designing reliable systems, developer tools, and product surfaces.',
}

export default function Home() {
  const projects = getAllProjects().slice(0, 2)

  return (
    <div className="flex flex-col gap-20">
      <section className="grid min-h-[calc(100vh-11rem)] gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div className="flex flex-col justify-end gap-8 pb-2">
          <div className="border-border bg-paper/68 w-fit rounded-lg border px-3 py-2 font-mono text-[11px] uppercase text-muted backdrop-blur">
            Senior software engineer / distributed systems / dev tools
          </div>

          <div className="max-w-4xl">
            <h1 className="max-w-5xl text-6xl font-black leading-[0.9] tracking-tight text-foreground sm:text-7xl lg:text-8xl">
              Building software that stays calm under pressure.
            </h1>
            <p className="text-muted mt-6 max-w-2xl text-lg leading-8 sm:text-xl">
              I&apos;m Dillo Raju, a systems-minded engineer who turns ambiguous product problems
              into reliable platforms, sharp APIs, and tools teams actually want to use.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/projects"
              className="bg-foreground text-background hover:bg-accent rounded-md px-5 py-3 text-sm font-semibold transition-colors"
            >
              See selected work
            </Link>
            <Link
              href="/contact"
              className="border-border bg-paper/70 text-foreground hover:border-accent hover:text-accent rounded-md border px-5 py-3 text-sm font-semibold transition-colors"
            >
              Start a conversation
            </Link>
          </div>
        </div>

        <div className="drift border-border bg-paper relative min-h-[28rem] overflow-hidden rounded-lg border p-5 shadow-[0_30px_100px_rgba(23,19,15,0.12)]">
          <div className="absolute inset-x-0 top-0 h-2 bg-[linear-gradient(90deg,var(--accent),var(--signal),var(--foreground))]" />
          <div className="border-border grid h-full grid-rows-[auto_1fr_auto] rounded-md border bg-background/60 p-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="font-mono text-xs uppercase text-muted">Reliability console</span>
              <span className="bg-signal-soft text-signal rounded-full px-2.5 py-1 font-mono text-[10px] uppercase">
                live
              </span>
            </div>
            <div className="grid content-center gap-4 py-8">
              {[
                ['p99 latency', '< 2ms'],
                ['daily jobs', '1M+'],
                ['delivery model', 'at-least-once'],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-4">
                  <span className="border-b border-dashed border-border pb-2 font-mono text-xs uppercase text-muted">
                    {label}
                  </span>
                  <span className="justify-self-end text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-border bg-card rounded-md border p-4">
              <p className="font-mono text-[11px] uppercase text-muted">Current focus</p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                Designing systems that make failure visible, recovery boring, and product iteration
                faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ['01', 'Architecture', 'Clean boundaries, observable workflows, durable interfaces.'],
          ['02', 'Execution', 'Small teams, high ambiguity, production-focused decisions.'],
          ['03', 'Craft', 'Readable code, calm operations, tools with taste.'],
        ].map(([num, title, body]) => (
          <div key={title} className="border-border bg-paper/72 rounded-lg border p-5 backdrop-blur">
            <p className="font-mono text-xs text-accent">{num}</p>
            <h2 className="mt-8 text-xl font-bold tracking-tight">{title}</h2>
            <p className="text-muted mt-3 text-sm leading-6">{body}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <p className="font-mono text-xs uppercase text-accent">Selected work</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Proof that taste and operational rigor can coexist.
          </h2>
          <p className="text-muted mt-4 leading-7">
            A compact set of projects showing how I think about throughput, developer experience,
            and maintainable systems.
          </p>
        </div>

        <div className="grid gap-4">
          {projects.map(({ slug, frontmatter }, index) => (
            <Link
              key={slug}
              href={`/projects/${slug}`}
              className="group border-border bg-paper/78 hover:border-accent grid gap-5 rounded-lg border p-5 transition-colors sm:grid-cols-[7rem_1fr] sm:items-center"
            >
              <span className="text-muted font-mono text-xs uppercase">case 0{index + 1}</span>
              <span>
                <span className="group-hover:text-accent block text-xl font-bold transition-colors">
                  {frontmatter.title}
                </span>
                <span className="text-muted mt-2 block text-sm leading-6">
                  {frontmatter.description}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-border bg-foreground text-background rounded-lg border p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase opacity-70">Available for the right problem</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
              Need a senior engineer who can make the complex feel navigable?
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
