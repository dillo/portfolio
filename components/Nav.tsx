'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useTheme } from './ThemeProvider'

const links = [
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/resume', label: 'Resume' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

export default function Nav() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <nav className="border-border bg-paper/82 mx-auto flex max-w-7xl items-center justify-between rounded-lg border px-4 py-3 shadow-[0_18px_60px_rgba(23,19,15,0.08)] backdrop-blur-xl">
        <Link
          href="/"
          className="group flex items-center gap-3"
        >
          <span className="bg-foreground text-background flex size-9 items-center justify-center rounded-md font-mono text-xs font-bold">
            DR
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-foreground group-hover:text-accent text-sm font-semibold transition-colors">
              Dillo Raju
            </span>
            <span className="text-muted hidden font-mono text-[10px] uppercase sm:inline">
              systems / product
            </span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="border-border bg-background/45 hidden items-center gap-1 rounded-md border p-1 md:flex">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`block rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                  pathname === href
                    ? 'bg-foreground text-background'
                    : 'text-muted hover:bg-card hover:text-foreground'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="border-border text-muted hover:bg-card hover:text-foreground rounded-md border p-2 transition-colors"
          >
            {theme === 'dark' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            className="border-border text-muted hover:bg-card hover:text-foreground rounded-md border p-2 transition-colors md:hidden"
          >
            {menuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <ul className="border-border bg-paper/95 mx-auto mt-2 max-w-7xl rounded-lg border px-4 py-3 shadow-[0_18px_60px_rgba(23,19,15,0.08)] backdrop-blur-xl md:hidden">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                  pathname === href
                    ? 'bg-foreground text-background font-medium'
                    : 'text-muted hover:bg-card hover:text-foreground'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
