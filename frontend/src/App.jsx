import { useState } from 'react'
import { ShieldCheck, FileSearch, AlertCircle } from 'lucide-react'
import UploadZone from './components/UploadZone.jsx'
import ResultCard from './components/ResultCard.jsx'
import ConsensusBanner from './components/ConsensusBanner.jsx'
import HistoryList from './components/HistoryList.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function App() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const [hoveredText, setHoveredText] = useState(null)

  const handleFileSelect = (f) => {
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setResult(null)
    setError(null)
    setHoveredText(null)
  }

  const handleClear = () => {
    setFile(null)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
    setHoveredText(null)
  }

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch(`${API_URL}/extract`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error(`Server error (${res.status})`)

      const data = await res.json()
      setResult(data)

      const entry = {
        thumb: previewUrl,
        ic: data.hybrid?.nomor_ic || data.consensus?.nomor_ic || data.ocr?.nomor_ic || '—',
        alamat: data.hybrid?.alamat || data.claude?.alamat || data.ocr?.alamat || '—',
        time: new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' }),
      }
      setHistory((prev) => [entry, ...prev].slice(0, 5))
    } catch (err) {
      setError(err.message || 'Something went wrong. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-start justify-center px-4 py-10 md:py-16">
      <div className="w-full max-w-6xl">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-10 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-50 text-xs text-indigo-700 font-medium mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Identity Verification System
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent">
            MyKad Data Extractor
          </h1>
          <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
            Securely extract, verify, and cross-reference Malaysian MyKad information.
          </p>
        </div>

        {/* Main Workspace Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          {/* Left Column: Upload & Image Viewer */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="glass-panel p-5 rounded-2xl">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
                Document Upload
              </h2>
              <UploadZone 
                onFileSelect={handleFileSelect} 
                previewUrl={previewUrl} 
                onClear={handleClear} 
                ocrResults={result?.ocr?.raw_results}
                hoveredText={hoveredText}
                setHoveredText={setHoveredText}
              />

              <button
                onClick={handleAnalyze}
                disabled={!file || loading}
                className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none hover:from-indigo-500 hover:to-violet-500 transition-all active:scale-[0.99] flex items-center justify-center gap-2 glow-btn"
              >
                {loading ? 'Extracting Document Data…' : (
                  <>
                    <FileSearch className="w-4 h-4" />
                    Extract MyKad Data
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 text-xs font-medium text-rose-400 border border-rose-500/20 bg-rose-500/10 rounded-xl px-4 py-3 flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            {/* History List */}
            <div className="glass-panel p-5 rounded-2xl">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Recent Scans
              </h2>
              <HistoryList
                items={history}
                onSelect={(item) => setPreviewUrl(item.thumb)}
              />
            </div>
          </div>

          {/* Right Column: Comparative Results */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Consensus & Status Banner */}
            {result?.consensus && (
              <div className="w-full">
                <ConsensusBanner consensus={result.consensus} />
              </div>
            )}

            {/* Models Matrix */}
            <div className="glass-panel p-5 rounded-2xl flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Data Extraction Results
                </h2>
                {result && (
                  <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium px-2 py-0.5 rounded-full shadow-sm">
                    Completed in {((result?.ocr?.processing_ms || 0) + (result?.hybrid?.processing_ms || 0)) / 1000}s
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                {/* EasyOCR Card */}
                <ResultCard
                  name="EasyOCR (Raw)"
                  tag="Standard OCR"
                  dotColor="bg-emerald-500"
                  barColor="bg-emerald-500"
                  data={result?.ocr}
                  loading={loading}
                />

                {/* Hybrid Fusion Card */}
                <ResultCard
                  name="Enhanced Analysis"
                  tag=""
                  dotColor="bg-indigo-500"
                  barColor="bg-gradient-to-r from-indigo-500 to-violet-500"
                  data={result?.hybrid}
                  loading={loading}
                  highlighted={false}
                />

                {/* Gemini Vision Card */}
                <ResultCard
                  name="Cloud Vision"
                  tag=""
                  dotColor="bg-blue-500"
                  barColor="bg-blue-500"
                  data={result?.gemini}
                  loading={loading}
                />
              </div>

              {/* OCR Segment View on Hover */}
              {result?.ocr?.raw_results && result.ocr.raw_results.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-200">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                    Interactive Segment Inspector (Hover or tap boxes on image)
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {result.ocr.raw_results.map((segment, idx) => (
                      <span
                        key={idx}
                        onMouseEnter={() => setHoveredText(segment.text)}
                        onMouseLeave={() => setHoveredText(null)}
                        className={`text-xs px-2.5 py-1 rounded-md border transition-all cursor-default ${
                          hoveredText === segment.text
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 scale-105 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {segment.text}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

