'use client'
import React, { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem('pos_token')
    if (!token) return
    
    fetch('http://localhost:3001/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => {
        if (r.ok) {
          setIsLoggedIn(true)
        } else {
          localStorage.removeItem('pos_token')
          setIsLoggedIn(false)
        }
      })
      .catch(() => {
        setIsLoggedIn(false)
      })
  }, [])
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-24 px-6 max-w-6xl mx-auto">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-surface
            border border-border rounded-full px-3 py-1 mb-8">
            <span className="w-2 h-2 rounded-full bg-green
              animate-pulse"></span>
            <span className="text-xs text-muted font-medium">
              Free for public repos
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black
            tracking-tighter text-text leading-none mb-6">
            Prove You<br />
            Ship<br />
            <span className="text-green">Clean Code.</span>
          </h1>

          <p className="text-xl text-muted max-w-xl mb-10
            leading-relaxed">
            Connect GitHub. Get a verified ProofOfShip Score
            that proves you ship fast and clean. Share it
            everywhere.
          </p>

          {!mounted ? (
            <div className="h-[60px]" aria-hidden="true" />
          ) : isLoggedIn ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-3
                bg-green text-bg px-8 py-4 rounded-lg
                font-bold text-lg hover:opacity-90
                transition-opacity active:scale-95"
            >
              Go to Dashboard
            </button>
          ) : (
            <a href="http://localhost:3001/auth/github"
              className="inline-flex items-center gap-3
              bg-green text-bg px-8 py-4 rounded-lg
              font-bold text-lg hover:opacity-90
              transition-opacity active:scale-95">
              <svg width="20" height="20" viewBox="0 0 24 24"
                fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31
                  3.435 9.795 8.205 11.385.6.105.825-.255
                  .825-.57 0-.285-.015-1.23-.015-2.235-3.015
                  .555-3.795-.735-4.035-1.41-.135-.345-.72
                  -1.41-1.23-1.695-.42-.225-1.02-.78-.015
                  -.795.945-.015 1.62.87 1.845 1.23 1.08
                  1.815 2.805 1.305 3.495.99.105-.78.42
                  -1.305.765-1.605-2.67-.3-5.46-1.335-5.46
                  -5.925 0-1.305.465-2.385 1.23-3.225-.12
                  -.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3
                  1.23.96-.27 1.98-.405 3-.405s2.04.135 3
                  .405c2.295-1.56 3.3-1.23 3.3-1.23.66
                  1.65.24 2.88.12 3.18.765.84 1.23 1.905
                  1.23 3.225 0 4.605-2.805 5.625-5.475
                  5.925.435.375.81 1.095.81 2.22 0 1.605
                  -.015 2.895-.015 3.3 0 .315.225.69.825
                  .57A12.02 12.02 0 0 0 24 12c0-6.63-5.37
                  -12-12-12z"/>
              </svg>
              Connect GitHub
            </a>
          )}
        </div>
      </section>

      {/* SCORE PREVIEW */}
      <section className="py-24 px-6 bg-surface border-y
        border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16
            items-center">
            <div>
              <p className="text-xs text-muted uppercase
                tracking-widest font-semibold mb-4">
                Your Score Card
              </p>
              <h2 className="text-4xl font-black
                tracking-tighter text-text mb-4">
                One number.<br />
                Every signal.
              </h2>
              <p className="text-muted leading-relaxed mb-6">
                Comprehension health, hallucination debt,
                architectural consistency, and debt trajectory
                — combined into a single verified score
                relative to your project complexity.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Comprehension Health', '30%'],
                  ['Hallucination Debt', '25%'],
                  ['Architectural Consistency', '20%'],
                  ['Debt Trajectory', '15%'],
                ].map(([label, weight]) => (
                  <div key={label}
                    className="bg-bg border border-border
                    rounded-lg p-3">
                    <p className="text-xs text-muted mb-1">
                      {label}
                    </p>
                    <p className="text-green font-bold
                      font-mono">{weight}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <svg width="495" height="195" viewBox="0 0 495 195" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '10px', boxShadow: '0 0 40px rgba(63,185,80,0.15)' }}>
                <rect width="495" height="195" rx="10" fill="#0a0a0a" stroke="#1a1a1a" strokeWidth="1" />
                <circle cx="40" cy="40" r="16" fill="#333" />
                <text x="64" y="45" fill="#3fb950" fontFamily="sans-serif" fontSize="14" fontWeight="bold">@demo-user</text>
                
                <text x="24" y="85" fill="#8b949e" fontFamily="sans-serif" fontSize="12">ProofOfShip Score</text>
                <text x="24" y="130" fill="#3fb950" fontFamily="sans-serif" fontSize="48" fontWeight="bold">74</text>
                
                <rect x="24" y="145" width="70" height="20" rx="10" fill="#1a1a1a" />
                <text x="33" y="159" fill="#8b949e" fontFamily="sans-serif" fontSize="10">moderate</text>

                <text x="220" y="40" fill="#8b949e" fontFamily="sans-serif" fontSize="10" fontWeight="bold" letterSpacing="1">SCORE BREAKDOWN</text>
                
                <text x="220" y="65" fill="#8b949e" fontFamily="sans-serif" fontSize="10">Comprehension Health</text>
                <rect x="220" y="72" width="220" height="6" rx="3" fill="#1a1a1a" />
                <rect x="220" y="72" width="176" height="6" rx="3" fill="#3fb950" />
                
                <text x="220" y="95" fill="#8b949e" fontFamily="sans-serif" fontSize="10">Hallucination Debt</text>
                <rect x="220" y="102" width="220" height="6" rx="3" fill="#1a1a1a" />
                <rect x="220" y="102" width="143" height="6" rx="3" fill="#3fb950" />
                
                <text x="220" y="125" fill="#8b949e" fontFamily="sans-serif" fontSize="10">Architectural Consistency</text>
                <rect x="220" y="132" width="220" height="6" rx="3" fill="#1a1a1a" />
                <rect x="220" y="132" width="154" height="6" rx="3" fill="#3fb950" />
                
                <text x="220" y="155" fill="#8b949e" fontFamily="sans-serif" fontSize="10">Debt Trajectory</text>
                <rect x="220" y="162" width="220" height="6" rx="3" fill="#1a1a1a" />
                <rect x="220" y="162" width="165" height="6" rx="3" fill="#3fb950" />

                <text x="390" y="180" fill="#484f58" fontFamily="monospace" fontSize="10">proofofship.dev</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs text-muted uppercase
            tracking-widest font-semibold mb-12">
            How it works
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                n: '01',
                title: 'Connect GitHub',
                body: 'Authorize read access to your public repos. We never write to your code.',
              },
              {
                n: '02',
                title: 'Get your Score',
                body: 'Our engine computes complexity, quality delta, and LLM-assisted comprehension analysis.',
              },
              {
                n: '03',
                title: 'Share everywhere',
                body: 'Embed your dynamic card in your README, portfolio, or LinkedIn. Updates automatically.',
              },
            ].map(({ n, title, body }) => (
              <div key={n}
                className="border border-border rounded-lg
                p-6 bg-surface">
                <p className="font-mono text-4xl font-bold
                  text-border mb-4">{n}</p>
                <h3 className="text-lg font-bold text-text
                  mb-2">{title}</h3>
                <p className="text-muted text-sm
                  leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex justify-between
          items-center">
          <div>
            <p className="font-bold text-text mb-1">
              ProofOfShip
            </p>
            <p className="text-xs text-muted">
              © 2026 ProofOfShip.
              Verified reputation for developers.
            </p>
          </div>
          <p className="font-mono text-xs text-green">
            proofofship.dev
          </p>
        </div>
      </footer>
    </div>
  )
}
