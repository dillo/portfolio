import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resume',
  description: 'Resume of Dillo Raju, senior software engineer.',
}

export default function Resume() {
  return (
    <div className="flex flex-col gap-8">
      <div className="border-border bg-paper/72 flex flex-col gap-6 rounded-lg border p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <p className="font-mono text-xs uppercase text-accent">Resume</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">Experience record.</h1>
        </div>
        <a
          href="/resume.pdf"
          download
          className="bg-foreground text-background hover:bg-accent rounded-md px-5 py-3 text-center text-sm font-semibold transition-colors"
        >
          Download PDF
        </a>
      </div>

      <div className="border-border bg-paper overflow-hidden rounded-lg border p-2 shadow-[0_18px_60px_rgba(23,19,15,0.08)]">
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
