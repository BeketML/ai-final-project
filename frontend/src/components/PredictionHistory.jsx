import { ROLE_COLORS } from './PredictionResult'

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function PredictionHistory({ history, onClear, showMobile }) {
  if (!history.length) return null

  return (
    <aside className={`w-full lg:w-72 ${showMobile ? 'block' : 'hidden lg:block'}`}>
      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm text-white/80 font-semibold">Recent Predictions</h3>
          <span className="text-xs text-white/40">Last 5</span>
        </div>
        <div className="space-y-2">
          {history.map((item, index) => {
            const gradient = ROLE_COLORS[item.role] || 'from-indigo-600 to-sky-500'
            return (
              <div key={`${item.role}-${item.time}-${index}`} className="glass-light rounded-xl p-3 border border-white/10">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${gradient}`} />
                    <p className="text-sm text-white truncate">{item.role}</p>
                  </div>
                  <span className="text-xs text-sky-300 font-semibold">{item.confidence}%</span>
                </div>
                <p className="text-xs text-white/40 mt-1">{formatTime(item.time)}</p>
              </div>
            )
          })}
        </div>
        <button
          type="button"
          onClick={onClear}
          className="w-full text-xs py-2 rounded-lg border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition"
        >
          Clear history
        </button>
      </div>
    </aside>
  )
}
