'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [user, setUser] = useState<{username: string} | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('pos_token')
    if (!token) return
    fetch('http://localhost:3001/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.username) setUser(data)
      })
      .catch(() => {})
  }, [])

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border
      bg-bg/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center
        justify-between">
        <Link href="/"
          className="font-bold text-lg text-text tracking-tight">
          ProofOfShip
        </Link>
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link href={`/u/${user.username}`}
                className="text-sm text-muted hover:text-text
                transition-colors">
                @{user.username}
              </Link>
              <Link href="/dashboard"
                className="text-sm bg-green text-bg px-4 py-1.5
                rounded-md font-semibold hover:opacity-90
                transition-opacity">
                Dashboard
              </Link>
            </>
          ) : (
            <a href="http://localhost:3001/auth/github"
              className="text-sm bg-green text-bg px-4 py-1.5
              rounded-md font-semibold hover:opacity-90
              transition-opacity">
              Connect GitHub
            </a>
          )}
        </div>
      </div>
    </nav>
  )
}
