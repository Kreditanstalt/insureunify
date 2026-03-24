import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'InsureUnify',
  description: 'Unified Insurance Questionnaire Engine за застрахователни брокери',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <body className="font-sans">{children}</body>
    </html>
  )
}
