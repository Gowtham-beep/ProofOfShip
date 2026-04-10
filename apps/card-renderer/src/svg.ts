import type { CardData } from './scores.js';

function getScoreColor(score: number): string {
  if (score >= 80) return '#3fb950';
  if (score >= 60) return '#d29922';
  if (score >= 40) return '#f85149';
  return '#6e7681';
}

function getScoreSuffixWidth(score: number): number {
  if (score >= 100) return 58;
  if (score >= 10) return 40;
  return 22;
}

function getBarLabel(key: string): string {
  const labels: Record<string, string> = {
    comprehensionHealth: 'Comprehension Health',
    hallucinationDebt: 'Hallucination Debt',
    architecturalConsistency: 'Architectural Consistency',
    debtTrajectory: 'Debt Trajectory',
  };
  return labels[key] || key;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateCard(data: CardData): string {
  const isPending = !!data.pending;
  const scoreColor = isPending ? '#8b949e' : getScoreColor(data.score);
  const scoreText = isPending ? '—' : data.score.toString();
  const suffixWidth = isPending ? 22 : getScoreSuffixWidth(data.score);
  const complexityBadgeText = isPending ? 'not analyzed' : data.complexityTier;
  const complexityBadgeWidth = complexityBadgeText.length * 7 + 16;

  const bars = [
    { key: 'comprehensionHealth', value: data.breakdown.comprehensionHealth },
    { key: 'hallucinationDebt', value: data.breakdown.hallucinationDebt },
    { key: 'architecturalConsistency', value: data.breakdown.architecturalConsistency },
    { key: 'debtTrajectory', value: data.breakdown.debtTrajectory },
  ];

  const barsSvg = bars.map(({ key, value }) => {
    const y = key === 'comprehensionHealth' ? 50
      : key === 'hallucinationDebt' ? 85
      : key === 'architecturalConsistency' ? 120
      : 155;
    const fillWidth = isPending ? 0 : (value / 100) * 220;
    const barColor = isPending ? '#8b949e' : getScoreColor(value);
    const label = getBarLabel(key);
    const valueText = isPending ? '—' : value.toString();

    return `
    <text x="230" y="${y - 8}" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="400" fill="#8b949e">${escapeXml(label)}</text>
    <rect x="230" y="${y}" width="220" height="8" rx="4" fill="#21262d"/>
    <rect x="230" y="${y}" width="${fillWidth}" height="8" rx="4" fill="${barColor}"/>
    <text x="458" y="${y + 8}" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="400" fill="#8b949e" text-anchor="end">${valueText}</text>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="495" height="195" viewBox="0 0 495 195">
  <rect width="495" height="195" rx="10" fill="#0d1117" stroke="#30363d" stroke-width="1"/>
  
  <defs>
    <clipPath id="avatarClip">
      <circle cx="50" cy="55" r="30"/>
    </clipPath>
  </defs>
  
  <image href="${escapeXml(data.avatarUrl)}" x="20" y="25" width="60" height="60" clip-path="url(#avatarClip)"/>
  
  <text x="95" y="45" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#e6edf3">@${escapeXml(data.username)}</text>
  <text x="95" y="62" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="400" fill="#8b949e">ProofOfShip Score</text>
  
  <text x="95" y="90" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="700" fill="${scoreColor}">${scoreText}</text>
  <text x="${95 + suffixWidth}" y="90" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="400" fill="#8b949e">/100</text>
  
  <rect x="95" y="108" width="${complexityBadgeWidth}" height="18" rx="3" fill="#21262d"/>
  <text x="${95 + complexityBadgeWidth / 2}" y="120" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="400" fill="#8b949e" text-anchor="middle">${escapeXml(complexityBadgeText)}</text>
  
  <line x1="215" y1="15" x2="215" y2="180" stroke="#30363d" stroke-width="1"/>
  
  <text x="230" y="30" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="#8b949e">SCORE BREAKDOWN</text>${barsSvg}
  
  <rect y="175" width="495" height="20" fill="#161b22"/>
  <text x="15" y="188" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="400" fill="#8b949e">${isPending ? 'No repos analyzed yet' : `${data.totalRepos} repos analyzed`}</text>
  <text x="480" y="188" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="400" fill="#8b949e" text-anchor="end">proofofship.dev</text>
</svg>`;
}
