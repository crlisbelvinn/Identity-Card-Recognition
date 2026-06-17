import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'

export default function UploadZone({ onFileSelect, previewUrl, onClear, ocrResults, hoveredText, setHoveredText }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFileSelect(file)
  }

  if (previewUrl) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white/80 flex flex-col items-center justify-center p-2 group shadow-sm">
        <div className="relative w-full max-h-72 flex items-center justify-center overflow-hidden rounded-xl">
          <img src={previewUrl} alt="MyKad preview" className="max-h-72 object-contain w-full select-none" />
          
          {/* Scanline overlay animation when processing or when data exists */}
          {!ocrResults && (
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-60 scan-line" />
          )}

          {/* Interactive Bounding Boxes Overlay */}
          {ocrResults && ocrResults.map((res, i) => {
            if (!res.box) return null
            const { x, y, width, height } = res.box
            const isHovered = hoveredText === res.text
            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredText(res.text)}
                onMouseLeave={() => setHoveredText(null)}
                className={`absolute border rounded-[2px] transition-all duration-150 cursor-help ${
                  isHovered 
                    ? 'border-indigo-400 bg-indigo-500/25 ring-2 ring-indigo-400/20 scale-105 z-20' 
                    : 'border-emerald-500/30 bg-emerald-500/5 hover:border-indigo-400 hover:bg-indigo-500/15 z-10'
                }`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                }}
                title={`${res.text} (${res.confidence}%)`}
              />
            )
          })}
        </div>

        <span className="absolute top-4 left-4 text-[10px] px-2.5 py-1 rounded-full bg-white/95 border border-slate-200 text-slate-600 font-medium tracking-wide shadow-sm">
          MyKad Document
        </span>
        <button
          onClick={onClear}
          aria-label="Remove image"
          className="absolute top-4.5 right-4 w-7 h-7 rounded-full bg-white/90 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`rounded-2xl border-2 border-dashed px-8 py-14 text-center cursor-pointer transition-all duration-300
        ${dragOver ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99] shadow-inner' : 'border-slate-300 hover:border-slate-400 bg-white/40 hover:bg-white/60'}`}
    >
      <div className="flex justify-center mb-3">
        <ImagePlus className="w-10 h-10 text-slate-400 animate-bounce" />
      </div>
      <p className="text-sm text-slate-800 font-semibold">Drop identity card image here</p>
      <p className="text-xs text-slate-500 mt-1.5">or click to browse from system · JPG, PNG, WEBP</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileSelect(f) }}
      />
    </div>
  )
}
