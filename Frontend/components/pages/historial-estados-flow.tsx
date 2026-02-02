"use client"

import React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ChevronDown,
  ChevronRight,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowDown,
  User,
  Calendar,
  Building2,
  AlertTriangle,
} from "lucide-react"
import { EstadoHistoricoResponseDTO } from "@/app/api/generated/model"
import { formatDate, getRoleLabel } from "@/lib/utils"

interface EstadoHistorialFlowProps {
  historial: EstadoHistoricoResponseDTO[]
}

// Estado display configuration
const estadoConfig: Record<
  string,
  {
    label: string
    color: string
    bgColor: string
    borderColor: string
    icon: React.ElementType
    isRejection: boolean
  }
> = {
  INCOMPLETO_POR_ADMINISTRACION: {
    label: "Pendiente Administración (Incompleto)",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    icon: Clock,
    isRejection: false,
  },
  RECHAZADO_A_ADMINISTRACION: {
    label: "Rechazado a Administración",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    icon: XCircle,
    isRejection: true,
  },
  COMPLETO_POR_ADMINISTRACION: {
    label: "Pendiente Docente",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    icon: CheckCircle2,
    isRejection: false,
  },
  INCOMPLETO_POR_PROFESOR: {
    label: "Pendiente Docente (Incompleto)",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    icon: Clock,
    isRejection: false,
  },
  RECHAZADO_A_PROFESOR: {
    label: "Rechazado a Docente",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    icon: XCircle,
    isRejection: true,
  },
  COMPLETO_POR_PROFESOR: {
    label: "En Revisión (Comisiones Curriculares)",
    color: "text-violet-700",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-300",
    icon: CheckCircle2,
    isRejection: false,
  },
  APROBADO_POR_COMISION: {
    label: "En Revisión (Secretaría)",
    color: "text-sky-700",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-300",
    icon: CheckCircle2,
    isRejection: false,
  },
  APROBADO_POR_SECRETARIA: {
    label: "Aprobado",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-400",
    icon: CheckCircle2,
    isRejection: false,
  },
}

const rolLabels: Record<string, string> = {
  SYSTEM_ADMIN: "Administrador del Sistema",
  DIRECCION_ADMINISTRATIVA: "Dirección Administrativa",
  SECRETARIA: "Secretaría",
  COORDINACION_COMISION_CURRICULAR: "Coordinación Comisión Curricular",
  DOCENTE: "Docente",
  ADMINISTRACION: "Administración",
}


function EstadoCard({ estado, isFirst }: { estado: EstadoHistoricoResponseDTO; isFirst: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const config = estado.estado ? estadoConfig[estado.estado] : null
  const Icon = config?.icon || Clock

  if (!config) return null

  return (
    <div className="relative">
      {/* Arrow connector */}
      {!isFirst && (
        <div className="flex justify-center py-2">
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-4 bg-linear-to-b from-muted-foreground/30 to-muted-foreground/60" />
            <ArrowDown className="h-4 w-4 text-muted-foreground/60 -mt-1" />
          </div>
        </div>
      )}

      {/* Estado Card */}
      <Card
        className={`relative overflow-hidden border-2 ${config.borderColor} ${config.bgColor} transition-all duration-200 hover:shadow-md`}
      >
        {/* Left accent bar */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${config.borderColor.replace("border-", "bg-")}`}
        />

        <div className="p-4 pl-5">
          {/* Header: Estado + Date */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-full ${config.bgColor} border ${config.borderColor}`}>
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>
              <span className={`font-semibold text-sm ${config.color}`}>{config.label}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(estado.fecha)}</span>
            </div>
          </div>

          {/* Actor info line */}
          <span className="text-foreground/80 text-sm">Realizado por:</span>
          <div className="flex flex-col pl-8 flex-wrap gap-x-4 gap-y-2 text-sm text-foreground/80">
            {estado.actor && (
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>
                  {estado.actor.apellido}, {estado.actor.nombre}
                  {estado.actor.legajo && (
                    <span className="text-muted-foreground ml-1">(Legajo: {estado.actor.legajo})</span>
                  )}
                </span>
              </div>
            )}
            {estado.actorRol && (
              <Badge variant="default" className="text-xs font-normal">
                {getRoleLabel(estado.actorRol)}
              </Badge>
            )}
            {estado.departamentoName && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span>Departamento de {estado.departamentoName}</span>
              </div>
            )}
          </div>

          {/* Rejection justification (collapsible) */}
          {config.isRejection && estado.justificacion && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-3">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between bg-red-100/50 hover:bg-red-100 border border-red-200 text-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                    <span className="text-red-700 font-medium">Ver justificación del rechazo</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-red-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-red-600" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="p-3 bg-red-100/50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800 whitespace-pre-wrap">{estado.justificacion}</p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </Card>
    </div>
  )
}

export function EstadoHistorialFlow({ historial }: EstadoHistorialFlowProps) {
  if (!historial || historial.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mb-2" />
        <p className="text-sm">Sin historial de estados</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Initial state: Carga del programa */}
      <div className="relative">
        <Card className="relative overflow-hidden border-2 border-slate-300 bg-slate-50 transition-all duration-200">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-400" />
          <div className="p-4 pl-5">
             <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-slate-100 border border-slate-300">
                    <FileText className="h-4 w-4 text-slate-600" />
                    </div>
                    <span className="font-semibold text-sm text-slate-700">Inicio del Proceso de Carga</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(historial[0].fecha)}</span>
                </div>
            </div>

              <span className="text-foreground/80 text-sm">Realizado por:</span>
              <div className="flex flex-col pl-8 flex-wrap gap-x-4 gap-y-2 text-sm text-foreground/80">
                {historial[0].actor && (
                <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>
                    {historial[0].actor.apellido}, {historial[0].actor.nombre}
                    {historial[0].actor.legajo && (
                        <span className="text-muted-foreground ml-1">(Legajo: {historial[0].actor.legajo})</span>
                    )}
                    </span>
                </div>
                )}
                {historial[0].actorRol && (
                <Badge variant="default" className="text-xs font-normal">
                    {getRoleLabel(historial[0].actorRol)}
                </Badge>
                )}
                {historial[0].departamentoName && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    <span>Departamento de {historial[0].departamentoName}</span>
                </div>
                )}
            </div>
          </div>
        </Card>
      </div>

      {/* Estado history cards */}
      {historial.map((estado, index) => (
        <EstadoCard key={index} estado={estado} isFirst={false} />
      ))}
    </div>
  )
}
