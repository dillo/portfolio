import type { Metadata } from 'next'
import Link from 'next/link'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Dillo Raju.',
}

export default function Contact() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
        <p className="text-muted">
          Have a question or want to work together? Send me a message or find me on{' '}
          <Link
            href="https://www.linkedin.com/in/dillo-raju/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover underline underline-offset-2 transition-colors"
          >
            LinkedIn
          </Link>
          .
        </p>
      </div>

      <ContactForm />
    </div>
  )
}
