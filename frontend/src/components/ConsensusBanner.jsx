import { CheckCircle2, AlertTriangle } from 'lucide-react'

export default function ConsensusBanner({ consensus }) {
  if (!consensus) return null

  const { agreement, nomor_ic } = consensus

  return (
    <div
      className={`flex items-center gap-3 text-xs px-4 py-3 rounded-xl border shadow-sm ${
        agreement 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
          : 'bg-amber-50 border-amber-200 text-amber-700'
      }`}
    >
      {agreement ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      <span className="font-semibold tracking-wide">
        {agreement
          ? `Consensus Achieved — All systems matched IC: ${nomor_ic}`
          : 'Consensus Mismatch — Systems returned differing IC values. Review manually.'}
      </span>
    </div>
  )
}
