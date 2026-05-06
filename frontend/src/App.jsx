import { useState, useCallback } from 'react'
import Header from './components/Header'
import StatsBar from './components/StatsBar'
import PredictionForm from './components/PredictionForm'
import PredictionResult from './components/PredictionResult'
import PredictionHistory from './components/PredictionHistory'
import Toast from './components/Toast'

export default function App() {
  const [result, setResult]             = useState(null)
  const [loading, setLoading]           = useState(false)
  const [history, setHistory]           = useState([])
  const [toast, setToast]               = useState(null)
  const [showHistory, setShowHistory]   = useState(false)

  function handleResult(data) {
    setResult(data)
    setHistory(prev => [
      { role: data.predicted_role, confidence: Math.round(data.confidence * 100), time: Date.now() },
      ...prev,
    ].slice(0, 5))
    setShowHistory(true)
  }

  const handleError = useCallback((message) => {
    setToast({ message, type: 'error' })
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        historyCount={history.length}
        onToggleHistory={() => setShowHistory(v => !v)}
      />
      <StatsBar />

      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-6 items-start justify-center">

          {/* Main card */}
          <div className="w-full max-w-lg mx-auto lg:mx-0">
            <div className="text-center mb-7">
              <h2 className="gradient-text text-3xl font-extrabold mb-2">
                Discover Your Ideal Role
              </h2>
              <p className="text-white/40 text-sm leading-relaxed">
                Enter your skills, qualification, and experience to get an AI-powered prediction.
              </p>
            </div>

            <div className="glass rounded-2xl p-7 shadow-2xl">
              {result ? (
                <PredictionResult result={result} onReset={() => setResult(null)} />
              ) : (
                <PredictionForm
                  onResult={handleResult}
                  onError={handleError}
                  loading={loading}
                  setLoading={setLoading}
                />
              )}
            </div>

            <p className="text-center text-white/20 text-xs mt-5">
              XGBoost · 998 candidates · 20 job roles · 99% accuracy
            </p>
          </div>

          {/* History panel */}
          <PredictionHistory
            history={history}
            onClear={() => setHistory([])}
            showMobile={showHistory}
          />
        </div>
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
