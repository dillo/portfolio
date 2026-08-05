import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Not Found',
  description: 'This page could not be found.',
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-start gap-8 py-16">
      <div className="border-border bg-paper/72 w-full rounded-lg border p-6 sm:p-8">
        <p className="text-accent font-mono text-xs uppercase">404</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">
          This page isn&apos;t in the notebook.
        </h1>
        <p className="text-muted mt-5 max-w-xl leading-7">
          The page you&apos;re looking for doesn&apos;t exist, or the link may be out of date.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="bg-foreground text-background hover:bg-accent rounded-md px-5 py-3 text-sm font-semibold transition-colors"
          >
            Back to home
          </Link>
          <Link
            href="/guides"
            className="border-border bg-paper/70 text-foreground hover:border-accent hover:text-accent rounded-md border px-5 py-3 text-sm font-semibold transition-colors"
          >
            Browse Guides
          </Link>
        </div>
      </div>
    </div>
  )
}
