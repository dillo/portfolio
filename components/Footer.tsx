import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-auto px-4 pb-6 sm:px-6 lg:px-8">
      <div className="border-border bg-paper/75 mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 rounded-lg border px-5 py-5 backdrop-blur sm:flex-row">
        <p className="text-muted font-mono text-xs uppercase">
          © {new Date().getFullYear()} Dillo Raju / built with care
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="https://www.linkedin.com/in/dillo-raju/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-muted hover:text-accent transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect width="4" height="12" x="2" y="9" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </Link>
          <Link
            href="https://medium.com/@dilloshion"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Medium"
            className="text-muted hover:text-accent transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  )
}
