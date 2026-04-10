export function scoreColor(score: number): string {
  if (score >= 80) return '#3fb950'
  if (score >= 60) return '#d29922'
  if (score >= 40) return '#f85149'
  return '#8b949e'
}

export function scoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Needs Work'
  return 'Critical'
}
