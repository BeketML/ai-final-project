import { useState } from 'react'
import SkillTagInput from './SkillTagInput'

const QUALIFICATION_SUGGESTIONS = [
  "Bachelor's in Computer Science",
  "Bachelor's in Software Engineering",
  "Bachelor's in Design",
  "Bachelor's in Game Development",
  "Bachelor's in Cybersecurity",
  "Bachelor's in Information Technology",
  "Master's in Data Science",
  "Master's in Computer Science",
  "Master's in Artificial Intelligence",
  "Master's in Software Engineering",
  "Master's in Cybersecurity",
  "Master's in Finance",
  "PhD in Computer Science",
  "PhD in Data Science",
  "PhD in Artificial Intelligence",
]

const SKILL_EXAMPLES = {
  'Data Scientist':       'Python, SQL, TensorFlow, Machine Learning, Keras',
  'Frontend Developer':   'HTML, CSS, JavaScript, React, Redux',
  'DevOps Engineer':      'AWS, Docker, Kubernetes, Terraform, Linux',
  'Blockchain Developer': 'Solidity, Ethereum, Web3, JavaScript, Blockchain',
  'Designer':             'Figma, Adobe XD, UI/UX Design, Creativity, Prototyping',
}

export default function PredictionForm({ onResult, onError, loading, setLoading }) {
  const [skills, setSkills]               = useState('')
  const [qualification, setQualification] = useState('')
  const [experience, setExperience]       = useState('')
  const [error, setError]                 = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filtered = qualification.length > 1
    ? QUALIFICATION_SUGGESTIONS.filter(q => q.toLowerCase().includes(qualification.toLowerCase()))
    : QUALIFICATION_SUGGESTIONS

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!skills.trim()) return setError('Please add at least one skill.')
    if (!qualification.trim()) return setError('Please enter your qualification.')
    if (!experience) return setError('Please select an experience level.')

    setLoading(true)
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills, qualification, experience_level: experience }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || `Server error ${res.status}`)
      }
      onResult(await res.json())
    } catch (err) {
      if (err.message.startsWith('Server error') || err.message.includes('fetch')) {
        onError(err.message)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Skills tag input */}
      <div>
        <label className="block text-white/70 text-sm font-medium mb-2">
          Skills
        </label>
        <SkillTagInput value={skills} onChange={setSkills} examples={SKILL_EXAMPLES} />
      </div>

      {/* Qualification */}
      <div className="relative">
        <label className="block text-white/70 text-sm font-medium mb-2">
          Qualification
        </label>
        <input
          value={qualification}
          onChange={e => { setQualification(e.target.value); setShowSuggestions(true) }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="e.g. Master's in Data Science"
          className="w-full glass-light rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition"
        />
        {showSuggestions && filtered.length > 0 && (
          <ul className="absolute z-20 w-full mt-1 glass rounded-xl border border-white/10 overflow-hidden max-h-52 overflow-y-auto">
            {filtered.map(q => (
              <li
                key={q}
                onMouseDown={() => { setQualification(q); setShowSuggestions(false) }}
                className="px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 cursor-pointer transition"
              >
                {q}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Experience level */}
      <div>
        <label className="block text-white/70 text-sm font-medium mb-3">
          Experience Level
        </label>
        <div className="flex gap-3">
          {['Entry', 'Mid', 'Senior'].map(level => (
            <button
              key={level}
              type="button"
              onClick={() => setExperience(level)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition ${
                experience === level
                  ? 'btn-gradient border-transparent text-white shadow-lg'
                  : 'glass-light border-white/10 text-white/50 hover:text-white hover:border-white/20'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Inline validation error */}
      {error && (
        <p className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2.5">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="btn-gradient w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg"
      >
        {loading ? (
          <><span className="spinner" /> Analyzing profile…</>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Predict Job Role
          </>
        )}
      </button>
    </form>
  )
}
