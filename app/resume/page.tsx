import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resume',
  description: 'Resume of Dillo Raju, senior software engineer.',
}

export default function Resume() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Resume</h1>
        <a
          href="/resume.pdf"
          download
          className="bg-accent hover:bg-accent-hover rounded-md px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          Download PDF
        </a>
      </div>

      <div className="border-border overflow-hidden rounded-lg border">
        <iframe
          src="/resume.pdf"
          className="w-full"
          style={{ height: '80vh', minHeight: 600 }}
          title="Dillo Raju — Resume"
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
