import { useMemo, useState } from 'react'

const MAX_CHIPS = 15

function normalizeSkills(value) {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

export default function SkillTagInput({ value, onChange, examples }) {
  const [inputValue, setInputValue] = useState('')
  const chips = useMemo(() => normalizeSkills(value || ''), [value])

  function pushChips(items) {
    const unique = [...new Set([...chips, ...items])]
    const limited = unique.slice(0, MAX_CHIPS)
    onChange(limited.join(', '))
  }

  function addFromInput() {
    const items = normalizeSkills(inputValue)
    if (!items.length) return
    pushChips(items)
    setInputValue('')
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addFromInput()
      return
    }

    if (event.key === 'Backspace' && !inputValue && chips.length) {
      event.preventDefault()
      const next = chips.slice(0, -1)
      onChange(next.join(', '))
    }
  }

  function removeChip(index) {
    const next = chips.filter((_, i) => i !== index)
    onChange(next.join(', '))
  }

  function handlePaste(event) {
    const pasted = event.clipboardData.getData('text')
    if (!pasted.includes(',')) return
    event.preventDefault()
    const items = normalizeSkills(pasted)
    pushChips(items)
  }

  function fillExample(label) {
    onChange(examples[label])
  }

  return (
    <div>
      <div className="glass-light rounded-xl px-3 py-3 border border-indigo-400/30 focus-within:ring-2 focus-within:ring-indigo-500/60 transition">
        <div className="flex flex-wrap gap-2 mb-2">
          {chips.map((chip, index) => (
            <span key={`${chip}-${index}`} className="tag-chip">
              {chip}
              <button
                type="button"
                className="tag-chip-remove"
                onClick={() => removeChip(index)}
                aria-label={`Remove ${chip}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={addFromInput}
          placeholder="Type skill and press Enter or comma..."
          className="w-full bg-transparent text-white placeholder-white/30 text-sm focus:outline-none"
          disabled={chips.length >= MAX_CHIPS}
        />
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        <span className="text-white/30 text-xs self-center">Examples:</span>
        {Object.keys(examples).map(label => (
          <button
            key={label}
            type="button"
            onClick={() => fillExample(label)}
            className="text-xs px-2.5 py-1 rounded-lg glass-light text-indigo-300 hover:text-white hover:bg-white/10 transition"
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-xs text-white/30 mt-2">{chips.length}/{MAX_CHIPS} skills</p>
    </div>
  )
}
