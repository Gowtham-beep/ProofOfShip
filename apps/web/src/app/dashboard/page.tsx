'use client'
import { useEffect, useState, useRef } from 'react'
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

interface Repo {
  id: string
  name: string
  fullName: string
  language: string | null
  description: string | null
  sizeKb: number
}

function getClientComplexity(sizeKb: number) {
  if (sizeKb < 500) return 'trivial'
  if (sizeKb < 5000) return 'simple'
  if (sizeKb < 50000) return 'moderate'
  if (sizeKb < 200000) return 'complex'
  return 'advanced'
}

export default function Dashboard() {
  const router = useRouter()
  const [scores, setScores] = useState<Score[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')

  const [showSelection, setShowSelection] = useState(false)
  const [ingesting, setIngesting] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [queueMessage, setQueueMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRepoIds, setSelectedRepoIds] = useState<Set<string>>(new Set())
  const pollingInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('pos_token')
    if (!token) { router.replace('/'); return }

    const headers = { Authorization: `Bearer ${token}` }

    const fetchAll = async () => {
      try {
        const [scoresRes, summaryRes, meRes, reposRes] = await Promise.all([
          fetch('http://localhost:3001/scores', { headers }),
          fetch('http://localhost:3001/scores/summary', { headers }),
          fetch('http://localhost:3001/auth/me', { headers }),
          fetch('http://localhost:3001/repos', { headers }),
        ])

        const scoresData = await scoresRes.json()
        const summaryData = await summaryRes.json()
        const meData = await meRes.json()
        const reposData = await reposRes.json()

        setScores(scoresData)
        setSummary(summaryData)
        setUsername(meData.username || '')
        setRepos(reposData)

        if (scoresData.length === 0) {
          setShowSelection(true) // State A
          if (reposData.length === 0) {
            setIngesting(true)
            fetch('http://localhost:3001/repos/ingest', { method: 'POST', headers })
              .then(() => {
                let prevCount = 0
                const pollRepos = async () => {
                  try {
                    const res = await fetch('http://localhost:3001/repos', { headers })
                    const data = await res.json()
                    if (Array.isArray(data)) {
                      setRepos(data)
                      if (data.length === prevCount && data.length > 0) {
                        clearInterval(pollInterval)
                        setIngesting(false)
                      }
                      prevCount = data.length
                    }
                  } catch (e) {
                    // Ignore transient errors
                  }
                }
                const pollInterval = setInterval(pollRepos, 3000)
                setTimeout(() => {
                  clearInterval(pollInterval)
                  setIngesting(false)
                }, 60000)
              })
          }
        }
        setLoading(false)
      } catch (err) {
        router.replace('/')
      }
    }

    fetchAll()
  }, [router])

  const handleAnalyze = async () => {
    if (selectedRepoIds.size === 0) return
    const initialScoreCount = scores.length
    const expectedCount = selectedRepoIds.size
    setAnalyzing(true)
    const token = localStorage.getItem('pos_token')
    const headers = { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
    
    try {
      const res = await fetch('http://localhost:3001/repos/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({ repoIds: Array.from(selectedRepoIds) })
      })
      
      if (res.ok) {
        setQueueMessage('Analysis queued — this takes ~2 min per repo')
        
        pollingInterval.current = setInterval(async () => {
          try {
            const scoresRes = await fetch('http://localhost:3001/scores', { headers })
            const scoresData = await scoresRes.json()
            
            if (scoresData.length >= initialScoreCount + expectedCount) {
              setScores(scoresData)
              const summaryRes = await fetch('http://localhost:3001/scores/summary', { headers })
              const summaryData = await summaryRes.json()
              setSummary(summaryData)
              
              if (pollingInterval.current) {
                clearInterval(pollingInterval.current)
                pollingInterval.current = null
              }
              setAnalyzing(false)
              setQueueMessage('')
              setShowSelection(false)
            }
          } catch (e) {
            // Quietly ignore polling errors
          }
        }, 5000)
      } else {
        setAnalyzing(false)
      }
    } catch (e) {
      setAnalyzing(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedRepoIds.size === filteredRepos.length) {
      setSelectedRepoIds(new Set())
    } else {
      setSelectedRepoIds(new Set(filteredRepos.map(r => r.id)))
    }
  }

  const toggleRepo = (id: string) => {
    const next = new Set(selectedRepoIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedRepoIds(next)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const filteredRepos = repos.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">

        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-2">
              Your Dashboard
            </p>
            <div className="flex items-center gap-4">
              <h1 className="text-5xl font-black tracking-tighter text-text">
                @{username}
              </h1>
              {!showSelection && scores.length > 0 && (
                <button onClick={() => setShowSelection(true)}
                  className="mt-2 text-sm bg-surface border border-border text-green px-3 py-1.5 rounded hover:bg-border transition-colors">
                  Analyze more repos
                </button>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted mb-1">Average Score</p>
            <p className="text-6xl font-black font-mono tracking-tighter"
              style={{ color: scoreColor(summary?.averageScore ?? 0) }}>
              {summary?.averageScore ?? 0}
            </p>
          </div>
        </div>

        {/* Summary strip */}
        {!showSelection && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              ['Total Repos', summary?.totalRepos ?? 0],
              ['Top Score', summary?.topRepo?.score ?? 0],
              ['Top Repo', summary?.topRepo?.fullName?.split('/')[1] ?? '—'],
              ['Status', scoreLabel(summary?.averageScore ?? 0)],
            ].map(([label, value]) => (
              <div key={label as string} className="bg-surface border border-border rounded-lg p-4">
                <p className="text-xs text-muted mb-1">{label}</p>
                <p className="text-xl font-bold text-text truncate">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Card embed */}
        {!showSelection && (
          <div className="mb-12">
            <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-4">
              Your shareable card
            </p>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <img
                src={`http://localhost:3002/card/${username}`}
                alt="Your ProofOfShip Card"
                width={495}
                height={195}
                style={{ borderRadius: '10px' }}
              />
              <div className="bg-surface border border-border rounded-lg p-4 flex-1">
                <p className="text-xs text-muted mb-2">Embed in your README</p>
                <code className="text-xs font-mono text-green break-all">
                  {`![ProofOfShip](https://proofofship.dev/card/${username})`}
                </code>
              </div>
            </div>
          </div>
        )}

        {/* State A: Repo Selection */}
        {showSelection ? (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-text mb-2">Select repos to analyze</h2>
              <p className="text-muted">Choose the repos you want scored. We'll analyze complexity, code quality, and generate your ProofOfShip Score.</p>
            </div>
            
            {ingesting && (
              <div className="flex items-center gap-3 bg-surface border border-border rounded-lg px-4 py-3 mb-6">
                <div className="w-4 h-4 border-2 border-green border-t-transparent rounded-full animate-spin shrink-0"></div>
                <p className="text-sm text-muted">
                  Fetching your repositories... ({repos.length} found)
                </p>
              </div>
            )}
            
            <div className="bg-surface border border-border rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <input
                  type="text"
                  placeholder="Search repos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-bg border border-border text-text text-sm rounded-md px-3 py-2 w-64 focus:outline-none focus:border-green"
                />
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted font-mono">{selectedRepoIds.size} repos selected</span>
                  <button
                    onClick={toggleSelectAll}
                    className="text-sm text-text hover:text-green transition-colors border border-border px-3 py-1.5 rounded bg-bg">
                    {selectedRepoIds.size === filteredRepos.length ? 'Deselect All' : 'Select All'}
                  </button>
                  {analyzing ? (
                    <div className="flex items-center gap-3 bg-surface border border-green/30 rounded-lg px-4 py-3">
                      <div className="w-4 h-4 border-2 border-green border-t-transparent rounded-full animate-spin shrink-0"></div>
                      <div>
                        <p className="text-sm text-text font-medium">Analysis queued</p>
                        <p className="text-xs text-muted">This takes ~2 minutes per repo. Refresh the page when done.</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleAnalyze}
                      disabled={selectedRepoIds.size === 0}
                      className="text-sm bg-green text-bg font-bold px-4 py-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
                      Analyze Selected Repos
                    </button>
                  )}
                </div>
              </div>

              {queueMessage ? (
                <div className="bg-bg border border-green/30 text-green px-4 py-3 rounded mb-6 text-sm flex items-center justify-between">
                  <span>{queueMessage}</span>
                  {scores.length > 0 && (
                    <button onClick={() => setShowSelection(false)} className="underline font-bold">Go back to scores</button>
                  )}
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredRepos.map(r => {
                  const isSelected = selectedRepoIds.has(r.id)
                  return (
                    <div key={r.id}
                      onClick={() => toggleRepo(r.id)}
                      style={{ animation: 'fadeIn 0.3s ease-in' }}
                      className={`cursor-pointer border rounded-lg p-4 transition-colors ${isSelected ? 'border-green bg-green/5' : 'border-border bg-bg hover:border-muted'}`}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'border-green bg-green' : 'border-muted'}`}>
                            {isSelected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0d1117" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                          </div>
                          <p className="font-bold text-text truncate">{r.name}</p>
                        </div>
                      </div>
                      {r.description && <p className="text-xs text-muted truncate mb-3">{r.description}</p>}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted bg-surface border border-border rounded px-2 py-0.5">{getClientComplexity(r.sizeKb)}</span>
                        {r.language && <span className="text-[10px] text-muted">{r.language}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          /* State B: Repos list */
          <div>
            <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-4">
              Analyzed repos ({scores.length})
            </p>
            <div className="space-y-3">
              {scores.map(s => (
                <Link href={`/repo/${username}/${s.repo.name}`} key={s.id} className="bg-surface border border-border rounded-lg p-5 flex items-center justify-between gap-4 hover:border-muted transition-colors block">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-text truncate">{s.repo.name}</p>
                      <span className="text-xs text-muted bg-bg border border-border rounded px-2 py-0.5 shrink-0">{s.complexityTier}</span>
                      {s.repo.language && <span className="text-xs text-muted shrink-0">{s.repo.language}</span>}
                    </div>
                    {s.repo.description && <p className="text-xs text-muted truncate">{s.repo.description}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-black font-mono" style={{ color: scoreColor(s.score) }}>{s.score}</p>
                    <p className="text-xs text-muted">/ 100</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
