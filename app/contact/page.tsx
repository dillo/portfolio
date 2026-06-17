import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Dillo Raju via LinkedIn or Medium.',
}

const links = [
  {
    label: 'LinkedIn',
    handle: 'dillo-raju',
    href: 'https://www.linkedin.com/in/dillo-raju/',
    description:
      "Connect with me professionally or send me a message — it's the best way to reach me.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: 'Medium',
    handle: '@dilloshion',
    href: 'https://medium.com/@dilloshion',
    description:
      'Read my writing on software engineering, systems, and craft. Comments and responses welcome.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
      </svg>
    ),
  },
]

export default function Contact() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
        <p className="text-muted">
          The best way to get in touch is via LinkedIn or Medium. I read everything.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {links.map(({ label, handle, href, description, icon }) => (
          <Link
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group border-border bg-card hover:border-accent flex items-start gap-5 rounded-lg border p-6 transition-colors"
          >
            <span className="text-muted group-hover:text-accent mt-0.5 shrink-0 transition-colors">
              {icon}
            </span>
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-foreground font-semibold">{label}</span>
                <span className="text-muted text-xs">{handle}</span>
              </div>
              <p className="text-muted text-sm leading-relaxed">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
