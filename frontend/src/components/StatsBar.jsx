const STATS = [
  '998 candidates',
  '20 job roles',
  '99% accuracy',
  '7 models compared',
]

export default function StatsBar() {
  return (
    <div className="px-4 pt-4">
      <div className="max-w-5xl mx-auto glass-light border border-white/10 rounded-xl px-3 py-2">
        <div className="flex flex-wrap justify-center gap-2">
          {STATS.map(item => (
            <span key={item} className="text-xs text-white/70 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
