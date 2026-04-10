'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<{username: string} | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="text-sm text-muted hover:text-text
                  transition-colors outline-none"
                >
                  @{user.username}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-40 bg-bg
                    border border-border rounded-lg py-1 z-50">
                    <Link
                      href={`/u/${user.username}`}
                      onClick={() => setDropdownOpen(false)}
                      className="block w-full text-left px-4 py-2 text-sm
                        text-muted hover:text-text hover:bg-surface transition-colors"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={() => {
                        localStorage.removeItem('pos_token')
                        router.push('/')
                        setDropdownOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm
                        text-red-400 hover:text-red-300 hover:bg-surface transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
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
