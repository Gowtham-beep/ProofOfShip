'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { scoreColor, scoreLabel } from '@/components/ScoreColor'

interface Score {
  id: string
  score: number
  complexityTier: string
  comprehensionHealth: number
  hallucinationDebt: number
  architecturalConsistency: number
  debtTrajectory: number
  breakdown: {
    llmInsights: {
      comprehensionSummary: string
      hallucinationRisk: string
      improvementSuggestions: string[]
    }
  }
  repo: {
    fullName: string
    name: string
    language: string
    description: string | null
  }
  createdAt: string
}

interface Summary {
  averageScore: number
  totalRepos: number
  topRepo: { fullName: string; score: number }
  complexityDistribution: Record<string, number>
  lastAnalyzedAt: string
}

export default function Dashboard() {
  const router = useRouter()
  const [scores, setScores] = useState<Score[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('pos_token')
    if (!token) { router.replace('/'); return }

    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch('http://localhost:3001/scores', { headers })
        .then(r => r.json()),
      fetch('http://localhost:3001/scores/summary', { headers })
        .then(r => r.json()),
      fetch('http://localhost:3001/auth/me', { headers })
        .then(r => r.json()),
    ]).then(([scoresData, summaryData, meData]) => {
      setScores(scoresData)
      setSummary(summaryData)
      setUsername(meData.username || '')
      setLoading(false)
    }).catch(() => {
      router.replace('/')
    })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center
        justify-center">
        <div className="w-8 h-8 border-2 border-green
          border-t-transparent rounded-full animate-spin">
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">

        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs text-muted uppercase
              tracking-widest font-semibold mb-2">
              Your Dashboard
            </p>
            <h1 className="text-5xl font-black tracking-tighter
              text-text">
              @{username}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted mb-1">
              Average Score
            </p>
            <p className="text-6xl font-black font-mono
              tracking-tighter"
              style={{ color: scoreColor(summary?.averageScore ?? 0) }}>
              {summary?.averageScore ?? 0}
            </p>
          </div>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4
          mb-12">
          {[
            ['Total Repos', summary?.totalRepos ?? 0],
            ['Top Score', summary?.topRepo?.score ?? 0],
            ['Top Repo', summary?.topRepo?.fullName
              ?.split('/')[1] ?? '—'],
            ['Status', scoreLabel(summary?.averageScore ?? 0)],
          ].map(([label, value]) => (
            <div key={label as string}
              className="bg-surface border border-border
              rounded-lg p-4">
              <p className="text-xs text-muted mb-1">
                {label}
              </p>
              <p className="text-xl font-bold text-text
                truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Card embed */}
        <div className="mb-12">
          <p className="text-xs text-muted uppercase
            tracking-widest font-semibold mb-4">
            Your shareable card
          </p>
          <div className="flex flex-col md:flex-row gap-6
            items-start">
            <img
              src={`http://localhost:3002/card/${username}`}
              alt="Your ProofOfShip Card"
              width={495}
              height={195}
              style={{ borderRadius: '10px' }}
            />
            <div className="bg-surface border border-border
              rounded-lg p-4 flex-1">
              <p className="text-xs text-muted mb-2">
                Embed in your README
              </p>
              <code className="text-xs font-mono text-green
                break-all">
                {`![ProofOfShip](https://proofofship.dev/card/${username})`}
              </code>
            </div>
          </div>
        </div>

        {/* Repos list */}
        <div>
          <p className="text-xs text-muted uppercase
            tracking-widest font-semibold mb-4">
            Analyzed repos ({scores.length})
          </p>
          <div className="space-y-3">
            {scores.map(s => (
              <div key={s.id}
                className="bg-surface border border-border
                rounded-lg p-5 flex items-center
                justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3
                    mb-1">
                    <p className="font-semibold text-text
                      truncate">{s.repo.name}</p>
                    <span className="text-xs text-muted
                      bg-bg border border-border rounded
                      px-2 py-0.5 shrink-0">
                      {s.complexityTier}
                    </span>
                    {s.repo.language && (
                      <span className="text-xs text-muted
                        shrink-0">
                        {s.repo.language}
                      </span>
                    )}
                  </div>
                  {s.repo.description && (
                    <p className="text-xs text-muted
                      truncate">{s.repo.description}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-black font-mono"
                    style={{ color: scoreColor(s.score) }}>
                    {s.score}
                  </p>
                  <p className="text-xs text-muted">/ 100</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
