import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resume',
  description: 'Resume of Dillo Raju, senior software engineer.',
}

const highlights = [
  {
    label: '15 years',
    detail:
      'shipping production software — Argonne National Laboratory, Panorama Education, GovCIO, RentPath.',
  },
  {
    label: '~20 apps',
    detail: 'co-leading migration of legacy Ruby applications to Java, Spring Boot, and React.',
  },
  {
    label: '10+ engineers',
    detail: 'using AI-agent skills built for Codex and Claude Code to automate upgrades.',
  },
  {
    label: 'Millions of users',
    detail: 'served by products built for education, healthcare, and real estate teams.',
  },
]

export default function Resume() {
  return (
    <div className="flex flex-col gap-8">
      <div className="border-border bg-paper/72 flex flex-col gap-6 rounded-lg border p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <p className="text-accent font-mono text-xs uppercase">Resume</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">
            Experience record.
          </h1>
        </div>
        <a
          href="/resume.pdf"
          download
          className="bg-foreground text-background hover:bg-accent rounded-md px-5 py-3 text-center text-sm font-semibold transition-colors"
        >
          Download PDF
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map(({ label, detail }) => (
          <div key={label} className="border-border bg-paper/58 rounded-lg border p-5">
            <p className="text-foreground text-xl font-black tracking-tight">{label}</p>
            <p className="text-muted mt-2 text-sm leading-6">{detail}</p>
          </div>
        ))}
      </div>

      <div className="border-border bg-paper/72 overflow-hidden rounded-lg border p-2 backdrop-blur">
        <iframe
          src="/resume.pdf"
          className="w-full rounded-md"
          style={{ height: '80vh', minHeight: 600 }}
          title="Dillo Raju - Resume"
        />
      </div>

      <p className="text-muted text-center text-xs">
        If the PDF doesn&apos;t load,{' '}
        <a
          href="/resume.pdf"
          download
          className="text-accent hover:text-accent-hover underline underline-offset-2 transition-colors"
        >
          download it directly
        </a>
        .
      </p>
    </div>
  )
}
