import { useEffect } from 'react'

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [toast, onClose])

  if (!toast) return null

  const classes = toast.type === 'success'
    ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-200'
    : 'border-rose-500/30 bg-rose-500/15 text-rose-200'

  return (
    <div className="fixed bottom-5 right-5 z-50 fade-in-right">
      <div className={`rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur ${classes}`}>
        {toast.message}
      </div>
    </div>
  )
}
