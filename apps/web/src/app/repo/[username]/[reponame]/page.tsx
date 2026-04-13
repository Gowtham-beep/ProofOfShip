'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface RepoData {
  repo: {
    fullName: string
    name: string
    description: string
    language: string
    stars: number
  }
  score: {
    score: number
    comprehensionHealth: number
    hallucinationDebt: number
    architecturalConsistency: number
    debtTrajectory: number
    complexityAdjustment: number
    complexityTier: string
    version: string
    createdAt: string
  }
  breakdown: {
    signals: {
      hasCI: boolean
      hasDocs: boolean
      hasTests: boolean
      primaryLanguage: string
      languageCount: number
      sizeKb: number
      commitVelocity: string
    }
    llmInsights: {
      comprehensionSummary: string
      architectureNotes: string
      hallucinationRisk: 'low' | 'medium' | 'high'
      improvementSuggestions: string[]
    }
  }
}

export default function RepoAuditPage() {
  const { username, reponame } = useParams()
  const [data, setData] = useState<RepoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`http://localhost:3001/profile/${username}/${reponame}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch repository data')
        return res.json()
      })
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [username, reponame])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green"></div>
          <span className="ml-3 text-muted">Loading audit...</span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Audit Not Found</h1>
          <p className="text-muted mb-6">{error || 'Could not find the requested repository audit.'}</p>
          <Link href={`/u/${username}`} className="text-sm text-muted hover:text-text transition-colors">
            ← Back to @{username}
          </Link>
        </div>
      </div>
    )
  }

  const { repo, score, breakdown } = data
  const { signals, llmInsights } = breakdown

  const getComplexityColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'trivial': return 'text-muted border-muted/30 bg-muted/10'
      case 'moderate': return 'text-yellow border-yellow/30 bg-yellow/10'
      case 'complex': return 'text-orange-400 border-orange-400/30 bg-orange-400/10'
      default: return 'text-muted border-muted/30 bg-muted/10'
    }
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'bg-green/20 text-green border-green/30'
      case 'medium': return 'bg-yellow/20 text-yellow border-yellow/30'
      case 'high': return 'bg-red/20 text-red border-red/30'
      default: return 'bg-muted/20 text-muted border-muted/30'
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text pb-20">
      <Navbar />

      <main className="pt-20 max-w-4xl mx-auto px-6">
        {/* Back link */}
        <Link href={`/u/${username}`} className="text-xs text-muted hover:text-text transition-colors mb-6 inline-block">
          ← Back to @{username}
        </Link>

        {/* Repo Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight">{repo.name}</h1>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium border border-border bg-surface text-muted">
                {repo.language}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getComplexityColor(score.complexityTier)}`}>
                {score.complexityTier}
              </span>
            </div>
          </div>
          <p className="text-muted text-lg">{repo.description}</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Left Card: Score */}
          <div className="bg-surface border border-border rounded-lg p-8 flex flex-col items-center justify-center text-center">
            <span className="text-6xl font-bold text-green mb-2">{score.score}</span>
            <span className="text-sm font-semibold uppercase tracking-widest text-muted">ProofOfShip Score</span>
            <span className={`mt-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${getComplexityColor(score.complexityTier)}`}>
              {score.complexityTier} Complexity
            </span>
          </div>

          {/* Right Card: Breakdown */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-6">Score Breakdown</h3>
            <div className="space-y-4">
              <BreakdownRow label="Comprehension Health" value={score.comprehensionHealth} />
              <BreakdownRow label="Hallucination Debt" value={score.hallucinationDebt} />
              <BreakdownRow label="Architectural Consistency" value={score.architecturalConsistency} />
              <BreakdownRow label="Debt Trajectory" value={score.debtTrajectory} />
              <BreakdownRow label="Complexity Adjustment" value={score.complexityAdjustment} />
            </div>
          </div>
        </div>

        {/* Audit Trail Section */}
        <section className="mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-6 border-b border-border pb-2">Audit Trail</h2>
          
          <div className="space-y-10">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-3">Comprehension Summary</label>
              <p className="leading-relaxed">{llmInsights.comprehensionSummary}</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-3">Architecture Notes</label>
              <p className="leading-relaxed">{llmInsights.architectureNotes}</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-3">Hallucination Risk</label>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded border text-xs font-bold uppercase tracking-wider ${getRiskBadgeColor(llmInsights.hallucinationRisk)}`}>
                  {llmInsights.hallucinationRisk}
                </span>
                <p className="text-sm text-muted italic">
                  Hallucination risk indicates the likelihood of the LLM misinterpreting complex patterns in this codebase.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-3">Improvement Suggestions</label>
              <ol className="list-decimal list-inside space-y-2">
                {llmInsights.improvementSuggestions.map((suggestion, i) => (
                  <li key={i} className="text-text">{suggestion}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Signals Section */}
        <section className="mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-6 border-b border-border pb-2">Signals</h2>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <SignalChip label="Tests" status={signals.hasTests} />
              <SignalChip label="CI" status={signals.hasCI} />
              <SignalChip label="Docs" status={signals.hasDocs} />
            </div>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <SignalStat label="Primary Language" value={signals.primaryLanguage} />
              <SignalStat label="Size" value={`${signals.sizeKb}kb`} />
              <SignalStat label="Commit Velocity" value={signals.commitVelocity} />
              <SignalStat label="Language Count" value={signals.languageCount} />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-border">
          <p className="text-xs text-muted">
            Analyzed on {new Date(score.createdAt).toLocaleDateString()} · Version {score.version}
          </p>
        </footer>
      </main>
    </div>
  )
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-muted">{label}</span>
        <span className="font-mono text-text">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
        <div 
          className="h-full bg-green rounded-full transition-all duration-500" 
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function SignalChip({ label, status }: { label: string; status: boolean }) {
  return (
    <div className={`px-3 py-1.5 rounded-lg border text-sm font-medium flex items-center gap-2 ${
      status 
        ? 'bg-green/10 border-green/20 text-green' 
        : 'bg-red/10 border-red/20 text-red'
    }`}>
      <span>{status ? '✓' : '✗'}</span>
      <span>{label}</span>
    </div>
  )
}

function SignalStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface border border-border px-4 py-2 rounded-lg">
      <div className="text-[10px] uppercase tracking-widest text-muted mb-0.5">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  )
}
