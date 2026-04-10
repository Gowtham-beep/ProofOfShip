'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { scoreColor } from '@/components/ScoreColor'

interface PublicScore {
  score: number
  complexityTier: string
  repo: { name: string; language: string; description: string | null }
}

interface PublicSummary {
  averageScore: number
  totalRepos: number
  topRepo: { fullName: string; score: number }
}

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>()
  const [scores, setScores] = useState<PublicScore[]>([])
  const [summary, setSummary] = useState<PublicSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`http://localhost:3001/profile/${username}`)
      .then(r => {
        if (r.status === 404) {
          setNotFound(true)
          setLoading(false)
          return null
        }
        return r.json()
      })
      .then(data => {
        if (!data) return
        if (Array.isArray(data.scores)) {
          setScores(data.scores)
          setSummary(data.summary)
        } else {
          setNotFound(true)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [username])

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center
      justify-center">
      <div className="w-8 h-8 border-2 border-green
        border-t-transparent rounded-full animate-spin">
      </div>
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="flex items-center justify-center
        min-h-screen">
        <div className="text-center">
          <p className="text-6xl font-black text-border
            mb-4">404</p>
          <p className="text-muted">
            @{username} hasn't connected GitHub yet.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">

        {/* Profile header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs text-muted uppercase
              tracking-widest mb-2">ProofOfShip Profile</p>
            <h1 className="text-5xl font-black
              tracking-tighter text-text">
              @{username}
            </h1>
            <p className="text-muted mt-2">
              {summary?.totalRepos} repos analyzed
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted mb-1">Score</p>
            <p className="text-7xl font-black font-mono
              tracking-tighter"
              style={{
                color: scoreColor(summary?.averageScore ?? 0)
              }}>
              {summary?.averageScore ?? 0}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="mb-12">
          <img
            src={`http://localhost:3002/card/${username}`}
            alt={`${username} ProofOfShip Card`}
            width={495}
            height={195}
            style={{ borderRadius: '10px',
              boxShadow: '0 0 40px rgba(63,185,80,0.15)'
            }}
          />
        </div>

        {/* Repos */}
        <div className="space-y-3">
          {(scores ?? []).map((s, i) => (
            <div key={i}
              className="bg-surface border border-border
              rounded-lg p-5 flex items-center
              justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-semibold text-text">
                    {s.repo.name}
                  </p>
                  <span className="text-xs text-muted
                    bg-bg border border-border rounded
                    px-2 py-0.5">
                    {s.complexityTier}
                  </span>
                </div>
                {s.repo.description && (
                  <p className="text-xs text-muted">
                    {s.repo.description}
                  </p>
                )}
              </div>
              <p className="text-2xl font-black font-mono"
                style={{ color: scoreColor(s.score) }}>
                {s.score}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
