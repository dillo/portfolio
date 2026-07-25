import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Senior software engineer and technical lead building AI-enabled product development, application modernization, and developer productivity workflows.',
}

const toolbox = [
  {
    group: 'AI & developer productivity',
    items: [
      'Codex',
      'Claude Code',
      'AI-agent skills',
      'Agentic workflows',
      'Code generation',
      'Upgrade automation',
    ],
  },
  {
    group: 'Languages & frameworks',
    items: [
      'Ruby',
      'Ruby on Rails',
      'Java',
      'Spring Boot',
      'JavaScript',
      'React',
      'Vue.js',
      'Python',
      'SQL',
    ],
  },
  {
    group: 'Architecture & delivery',
    items: [
      'REST APIs',
      'Service-oriented architecture',
      'CI/CD',
      'Docker',
      'AWS',
      'PostgreSQL',
      'MySQL',
      'Redis',
      'Elasticsearch',
      'TDD',
    ],
  },
]

const experience = [
  {
    org: 'Argonne National Laboratory',
    role: 'Senior Software Engineer',
    period: 'Mar 2025 — Present',
  },
  { org: 'Panorama Education', role: 'Lead Software Engineer', period: 'Apr 2022 — Jun 2024' },
  {
    org: 'GovCIO',
    role: 'Senior Software Engineer & Backend Lead',
    period: 'Sep 2020 — Apr 2022',
  },
  { org: 'RentPath', role: 'Technical Lead Engineer', period: 'Jan 2011 — Sep 2020' },
]

const focusAreas = [
  { label: 'AI-enabled product development', code: 'AI' },
  { label: 'Agentic software workflows', code: 'AGENT' },
  { label: 'Application modernization & platform architecture', code: 'MOD' },
  { label: 'Developer productivity & engineering enablement', code: 'DX' },
  { label: 'Backend APIs & full-stack product delivery', code: 'API' },
  { label: 'Technical leadership & cross-functional collaboration', code: 'LEAD' },
]

export default function About() {
  return (
    <div className="flex flex-col gap-16">
      <section className="border-border bg-paper/72 rounded-lg border p-6 sm:p-8">
        <p className="text-accent font-mono text-xs uppercase">About</p>
        <h1 className="mt-3 max-w-4xl text-5xl font-black tracking-tight sm:text-6xl">
          I build products and engineering systems that make complex work easier.
        </h1>
        <div className="text-muted mt-8 grid gap-5 leading-7 lg:grid-cols-3">
          <p>
            I&apos;m Dillo Raju, a senior software engineer and technical lead. My work spans
            hands-on software delivery, application architecture, product collaboration, legacy
            modernization, and developer enablement. I&apos;m especially interested in applying AI
            agents to real engineering problems: accelerating upgrades, turning legacy-system
            analysis into actionable migration plans, improving organizational knowledge, and
            helping developers spend more time building useful features.
          </p>
          <p>
            At Argonne National Laboratory, I co-lead the modernization of a portfolio of legacy
            applications and build reusable AI-agent skills for Codex and Claude Code. These
            workflows help engineers automate Java and Spring Boot upgrades, analyze legacy Rails
            applications, and plan migrations to modern Java and React architectures.
          </p>
          <p>
            Earlier in my career I led products and platforms serving educators, veterans,
            healthcare teams, real estate customers, and millions of end users. I enjoy working at
            the intersection of engineering, product thinking, and practical problem-solving - from
            shaping requirements and architecture to mentoring engineers and shipping reliable
            software.
          </p>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <p className="text-accent font-mono text-xs uppercase">Experience</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">
            Fifteen years shipping production software.
          </h2>
          <p className="text-muted mt-4 leading-7">
            Mission-driven, education, healthcare, and real estate products — from backend APIs to
            platform architecture and technical leadership.
          </p>
          <Link
            href="/resume"
            className="text-accent hover:text-accent-hover mt-4 inline-block text-sm font-semibold underline underline-offset-4 transition-colors"
          >
            View the full résumé
          </Link>
        </div>
        <ul className="grid gap-3">
          {experience.map(({ org, role, period }) => (
            <li
              key={org}
              className="border-border bg-paper/72 grid gap-2 rounded-lg border p-5 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-4"
            >
              <div>
                <p className="text-foreground text-lg font-bold tracking-tight">{org}</p>
                <p className="text-muted mt-1 text-sm leading-6">{role}</p>
              </div>
              <p className="text-muted font-mono text-xs uppercase">{period}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <p className="text-accent font-mono text-xs uppercase">Toolbox</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">What I build with.</h2>
        </div>
        <div className="grid gap-6">
          {toolbox.map(({ group, items }) => (
            <div key={group}>
              <p className="text-muted font-mono text-[11px] uppercase">{group}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {items.map((item) => (
                  <li
                    key={item}
                    className="border-border bg-paper/72 text-foreground rounded-full border px-3 py-1.5 font-mono text-xs uppercase"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {focusAreas.map(({ label, code }) => (
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
            <p className="mt-3 max-w-2xl text-sm leading-6 opacity-80">
              I&apos;m interested in senior, staff, lead, and product-engineering roles where I can
              use software and AI to build valuable products or solve complex operational problems.
              The best way to reach me is LinkedIn.
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
