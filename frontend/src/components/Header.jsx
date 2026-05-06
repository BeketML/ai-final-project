export default function Header({ historyCount, onToggleHistory }) {
  return (
    <header className="glass border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl btn-gradient flex items-center justify-center text-white font-bold text-lg">
            AI
          </div>
          <div>
            <h1 className="gradient-text text-xl font-bold leading-none">JobRole AI</h1>
            <p className="text-white/40 text-xs mt-0.5">Predict Your Career Path</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-white/50 text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
            99% accuracy · XGBoost
          </div>

          {/* History toggle */}
          <button
            type="button"
            onClick={onToggleHistory}
            className="relative glass-light border border-white/10 rounded-xl px-3 py-2 text-white/50 hover:text-white hover:border-white/25 transition flex items-center gap-1.5 text-sm"
            title="Prediction history"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-bold">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
