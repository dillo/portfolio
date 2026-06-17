import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/components/ThemeProvider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Dillo Raju',
    template: '%s | Dillo Raju',
  },
  description: 'Senior software engineer — projects, writing, and more.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Dillo Raju',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <ThemeProvider>
          <Nav />
          <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
