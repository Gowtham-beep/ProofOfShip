import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ProofOfShip — Prove You Ship Clean Code',
  description: 'Connect GitHub. Get a verified ProofOfShip Score. Share it everywhere.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
