import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'InsureUnify',
  description: 'Unified Insurance Questionnaire Engine за застрахователни брокери',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
