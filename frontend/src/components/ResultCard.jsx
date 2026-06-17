import { Loader2, Clock } from 'lucide-react'

export default function ResultCard({ name, tag, dotColor, barColor, data, loading, highlighted = false }) {
  if (loading) {
    return (
      <div className={`rounded-xl border p-4 ${highlighted ? 'bg-indigo-50 border-indigo-200/60' : 'bg-white border-slate-200/80'}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <span className="text-xs font-semibold text-slate-800">{name}</span>
          <span className="text-[10px] text-slate-500 ml-auto bg-slate-100 px-2 py-0.5 rounded-full">{tag}</span>
        </div>
        <div className="space-y-2.5 animate-pulse">
          <div className="h-2 w-16 bg-slate-200 rounded" />
          <div className="h-4 w-3/4 bg-slate-200 rounded" />
          <div className="h-2 w-16 bg-slate-200 rounded mt-3" />
          <div className="h-4 w-full bg-slate-200 rounded" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white/60 p-5 flex flex-col items-center justify-center text-center h-full min-h-[160px] shadow-sm">
        <Loader2 className="w-8 h-8 mb-3 opacity-40 animate-spin text-slate-400" />
        <p className="text-[11px] text-slate-500 font-medium">System ready...</p>
      </div>
    )
  }

  const { nomor_ic, alamat, confidence, processing_ms, error } = data

  return (
    <div className={`rounded-xl border p-5 flex flex-col transition-all duration-300 shadow-sm ${
      highlighted 
        ? 'bg-indigo-50/80 border-indigo-200 shadow-indigo-100' 
        : 'bg-white border-slate-200/80'
    }`}>
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span className="text-xs font-bold text-slate-800 tracking-wide">{name}</span>
        {tag && (
          <span className={`text-[10px] ml-auto px-2 py-0.5 rounded-full font-medium ${
            highlighted ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
          }`}>{tag}</span>
        )}
      </div>

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-75 min-h-[120px] py-4">
          <Clock className="w-7 h-7 mb-2.5 text-slate-400 animate-pulse" />
          <p className="text-xs font-bold text-slate-600">On Progress</p>
          <p className="text-[10px] text-slate-400 mt-1.5 max-w-[180px] leading-relaxed">
            Model integration and validation are currently in progress.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div>
            <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">IC Number</div>
            <div className={`text-sm font-semibold mt-1 tracking-wide ${!nomor_ic ? 'text-slate-400 italic font-normal' : 'text-slate-800'}`}>
              {nomor_ic || 'Not found'}
            </div>

            <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-3.5">Address</div>
            <div className={`text-xs font-medium mt-1 leading-relaxed ${!alamat ? 'text-slate-400 italic font-normal' : 'text-slate-700'}`}>
              {alamat || 'Not found'}
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span>Confidence</span>
              <span className="font-bold">{confidence}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full mt-1.5 overflow-hidden">
              <div className={`h-1.5 rounded-full transition-all duration-1000 ${barColor}`} style={{ width: `${confidence}%` }} />
            </div>
            {processing_ms != null && (
              <div className="flex items-center justify-end gap-1 text-[9px] text-slate-500 font-semibold mt-2.5">
                <Clock className="w-3 h-3" />
                {processing_ms} ms
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
