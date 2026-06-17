'use client'

import { useState } from 'react'

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.')
        setStatus('error')
        return
      }

      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="border-border bg-card flex flex-col items-center gap-3 rounded-lg border px-8 py-12 text-center">
        <span className="text-3xl">✓</span>
        <p className="text-foreground font-medium">Message sent!</p>
        <p className="text-muted text-sm">Thanks for reaching out — I'll get back to you soon.</p>
        <button
          onClick={() => setStatus('idle')}
          className="text-accent hover:text-accent-hover mt-2 text-xs transition-colors"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-foreground text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            className="border-border bg-background text-foreground placeholder:text-muted focus:border-accent focus:ring-accent rounded-md border px-3 py-2 text-sm transition-colors focus:ring-1 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-foreground text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="border-border bg-background text-foreground placeholder:text-muted focus:border-accent focus:ring-accent rounded-md border px-3 py-2 text-sm transition-colors focus:ring-1 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-foreground text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          value={form.message}
          onChange={handleChange}
          placeholder="What's on your mind?"
          className="border-border bg-background text-foreground placeholder:text-muted focus:border-accent focus:ring-accent resize-y rounded-md border px-3 py-2 text-sm transition-colors focus:ring-1 focus:outline-none"
        />
      </div>

      {status === 'error' && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="bg-accent hover:bg-accent-hover self-start rounded-md px-5 py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
