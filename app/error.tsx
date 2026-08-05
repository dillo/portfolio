'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-start gap-8 py-16">
      <div className="border-border bg-paper/72 w-full rounded-lg border p-6 sm:p-8">
        <p className="text-warn font-mono text-xs uppercase">Error</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">
          Something went wrong.
        </h1>
        <p className="text-muted mt-5 max-w-xl leading-7">
          This page hit an unexpected error. You can try again, or head back to safe ground.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => unstable_retry()}
            className="bg-foreground text-background hover:bg-accent rounded-md px-5 py-3 text-sm font-semibold transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="border-border bg-paper/70 text-foreground hover:border-accent hover:text-accent rounded-md border px-5 py-3 text-sm font-semibold transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
