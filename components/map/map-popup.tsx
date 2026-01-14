"use client"

import { CheckCircle2, Clock, AlertCircle } from "lucide-react"
import type { CountyData } from "./jurisdiction-map"

interface MapPopupProps {
  county: CountyData
}

export function MapPopup({ county }: MapPopupProps) {
  const getStatusInfo = (status: CountyData["dataStatus"]) => {
    switch (status) {
      case "complete":
        return {
          icon: CheckCircle2,
          label: "Complete",
          color: "text-emerald-500",
          bg: "bg-emerald-500/10"
        }
      case "partial":
        return {
          icon: Clock,
          label: "Partial",
          color: "text-amber-500",
          bg: "bg-amber-500/10"
        }
      default:
        return {
          icon: AlertCircle,
          label: "State Code Only",
          color: "text-zinc-400",
          bg: "bg-zinc-500/10"
        }
    }
  }

  const statusInfo = getStatusInfo(county.dataStatus)
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-w-[180px] p-1">
      <div className="font-semibold text-zinc-900 mb-1">
        {county.name}
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
          <StatusIcon className="h-3 w-3" />
          {statusInfo.label}
        </span>
      </div>
      <div className="text-xs text-zinc-600 space-y-0.5">
        <div>{county.cities} cities</div>
        <div>Updated: {county.lastUpdated}</div>
      </div>
      <div className="mt-2 pt-2 border-t border-zinc-200 text-xs text-zinc-500">
        Click to view details
      </div>
    </div>
  )
}
