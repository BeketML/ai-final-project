import { useState } from 'react'

export const ROLE_COLORS = {
  'Data Scientist':                 'from-blue-500 to-cyan-500',
  'Frontend Developer':             'from-orange-500 to-yellow-400',
  'Backend Developer':              'from-green-600 to-emerald-400',
  'Full Stack Python Developer':    'from-blue-600 to-indigo-500',
  'Full Stack Java Developer':      'from-red-600 to-orange-500',
  'DevOps Engineer':                'from-slate-500 to-blue-500',
  'Kubernetes Operations Engineer': 'from-blue-700 to-sky-500',
  'Cybersecurity Engineer':         'from-red-700 to-rose-500',
  'Blockchain Developer':           'from-amber-500 to-yellow-400',
  'Mobile Developer':               'from-pink-600 to-rose-400',
  'AIML':                           'from-violet-600 to-purple-500',
  'Data Analyst':                   'from-teal-600 to-cyan-400',
  'Designer':                       'from-fuchsia-600 to-pink-400',
  'Game Developer':                 'from-lime-600 to-green-400',
  'Web Developer':                  'from-sky-600 to-blue-400',
  'C# Developer':                   'from-indigo-600 to-violet-500',
  'PHP Developer':                  'from-purple-600 to-indigo-400',
  'Software Project Manager':       'from-slate-600 to-gray-500',
  'Marketing':                      'from-orange-600 to-red-500',
  'HR':                             'from-pink-500 to-rose-400',
}

function ConfidenceBadge({ value }) {
  const pct = Math.round(value * 100)
  const color = pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-yellow-400' : 'text-orange-400'
  return <span className={`text-4xl font-bold ${color}`}>{pct}%</span>
}

function ProbBar({ role, probability, index }) {
  const pct = Math.round(probability * 100)
  const barColor = index === 0
    ? 'from-indigo-500 to-sky-400'
    : 'from-indigo-400/40 to-sky-400/40'
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className={`text-sm font-medium truncate pr-2 ${index === 0 ? 'text-white' : 'text-white/55'}`}>
          {role}
        </span>
        <span className={`text-sm font-semibold tabular-nums shrink-0 ${index === 0 ? 'text-sky-300' : 'text-white/40'}`}>
          {pct}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} bar-fill`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function MiniBar({ role, probability }) {
  const pct = Math.round(probability * 100)
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/50 w-44 truncate shrink-0">{role}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-400/60 bar-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-white/40 tabular-nums w-8 text-right">{pct}%</span>
    </div>
  )
}

export default function PredictionResult({ result, onReset }) {
  const [showAll, setShowAll] = useState(false)
  const [copied, setCopied] = useState(false)

  const gradient = ROLE_COLORS[result.predicted_role] || 'from-indigo-600 to-sky-500'
  const pct = Math.round(result.confidence * 100)

  const top3Roles = new Set(result.top_3.map(r => r.role))
  const allRoles = result.all_probabilities?.length
    ? result.all_probabilities
    : result.top_3

  async function handleShare() {
    const text = `I got "${result.predicted_role}" (${pct}% confidence) — JobRole AI`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fade-in-up space-y-4">
      {/* Hero card */}
      <div className="glass rounded-2xl p-6 text-center pulse-glow">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} mb-4 shadow-lg`}>
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Best Match</p>
        <h2 className="text-white text-2xl font-bold mb-3">{result.predicted_role}</h2>
        <ConfidenceBadge value={result.confidence} />
        <p className="text-white/40 text-xs mt-1">confidence</p>
      </div>

      {/* Top 3 */}
      <div className="glass rounded-2xl p-5 space-y-3">
        <h3 className="text-white/50 text-xs uppercase tracking-widest font-medium">Top Matches</h3>
        {result.top_3.map((item, i) => (
          <ProbBar key={item.role} role={item.role} probability={item.probability} index={i} />
        ))}

        {/* Full breakdown toggle */}
        <button
          type="button"
          onClick={() => setShowAll(v => !v)}
          className="w-full text-xs text-indigo-300 hover:text-white transition pt-1"
        >
          {showAll ? 'Hide full breakdown ▲' : 'Show all roles ▾'}
        </button>

        {showAll && allRoles.length > 3 && (
          <div className="space-y-2 pt-1 border-t border-white/10">
            {allRoles.slice(3).map(item => (
              <MiniBar key={item.role} role={item.role} probability={item.probability} />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleShare}
          className="flex-1 py-2.5 rounded-xl glass border border-white/10 text-white/60 hover:text-white hover:border-white/25 text-sm font-medium transition flex items-center justify-center gap-2"
        >
          {copied ? '✓ Copied' : '⎘ Share result'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex-1 py-2.5 rounded-xl glass border border-white/10 text-white/60 hover:text-white hover:border-white/25 text-sm font-medium transition"
        >
          ← Try again
        </button>
      </div>
    </div>
  )
}
