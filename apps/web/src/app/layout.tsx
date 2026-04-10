import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ProofOfShip — Prove You Ship Clean Code',
  description: 'Verified reputation for developers who ship with AI.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  )
}
