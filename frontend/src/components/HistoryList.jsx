export default function HistoryList({ items, onSelect }) {
  if (!items.length) {
    return (
      <div className="text-center py-6 text-slate-600 text-xs font-semibold">
        No scanned documents yet.
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => onSelect(item)}
          className="w-full flex items-center gap-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 px-3.5 py-2.5 text-left transition-all duration-200 shadow-sm"
        >
          <img src={item.thumb} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 tracking-wide truncate">{item.ic || '—'}</p>
            <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{item.alamat || 'No address'}</p>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-500 font-bold flex-shrink-0">{item.time}</span>
        </button>
      ))}
    </div>
  )
}
