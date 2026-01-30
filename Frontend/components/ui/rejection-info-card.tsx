"use client"

import { useState } from "react"
import { AlertCircle, ChevronDown, ChevronUp, User, Calendar } from "lucide-react"
import type { EstadoHistoricoResponseDTO } from "@/app/api/generated/model"

interface RejectionInfoCardProps {
  estadoHistorico: EstadoHistoricoResponseDTO
}

export function RejectionInfoCard({ estadoHistorico }: RejectionInfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if(!(estadoHistorico?.estado === "RECHAZADO_A_ADMINISTRACION" || estadoHistorico?.estado === "RECHAZADO_A_PROFESOR")) {
    // return null
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Fecha no disponible"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getRejectionType = (estado?: string) => {
    if (estado === "RECHAZADO_A_ADMINISTRACION") return "Administración"
    if (estado === "RECHAZADO_A_PROFESOR") return "Profesor Responsable"
    return "Desconocido"
  }

  return (
    <div className="sticky top-0 z-40 mb-6 animate-in slide-in-from-top-5 fade-in duration-500">
      <div className="bg-linear-to-br from-destructive/95 to-destructive/90 backdrop-blur-md rounded-xl shadow-2xl border-2 border-destructive overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-destructive/20 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background/20 rounded-lg animate-pulse">
              <AlertCircle className="w-5 h-5 text-destructive-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-destructive-foreground text-sm">Programa Rechazado</h3>
              <p className="text-xs text-destructive-foreground/80">Para {getRejectionType(estadoHistorico.estado)}</p>
            </div>
          </div>
          <button
            type="button"
            className="p-1 hover:bg-background/10 rounded-lg transition-colors"
            aria-label={isExpanded ? "Contraer" : "Expandir"}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-destructive-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-destructive-foreground" />
            )}
          </button>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Divider */}
            <div className="h-px bg-destructive-foreground/20" />

            {/* Metadata */}
            <div className="flex items-center gap-6">
              <div className="flex items-start gap-2 bg-background/10 rounded-lg p-3 flex-1">
                <User className="w-4 h-4 text-destructive-foreground/70 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-destructive-foreground/70 font-medium">Rechazado por {estadoHistorico.actorRol}</p>
                  <p className="text-sm text-destructive-foreground font-semibold">
                    {estadoHistorico.actor?.apellido + ", " +estadoHistorico.actor?.nombre || "No especificado"}
                  </p>
                  <p className="text-sm text-destructive-foreground font-semibold">
                    {"Legajo: " + estadoHistorico.actor?.legajo + "" || "No especificado"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-background/10 rounded-lg p-3 flex-1">
                <Calendar className="w-4 h-4 text-destructive-foreground/70 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-destructive-foreground/70 font-medium">Fecha</p>
                  <p className="text-sm text-destructive-foreground font-semibold">
                    {formatDate(estadoHistorico.fecha)}
                  </p>
                </div>
              </div>
            </div>

            {/* Justification */}
            <div className="bg-background/10 rounded-lg p-4">
              <p className="text-xs text-destructive-foreground/70 font-medium mb-2">Justificación</p>
              <p className="text-sm text-destructive-foreground leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                {estadoHistorico.justificacion || "No se proporcionó justificación"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
