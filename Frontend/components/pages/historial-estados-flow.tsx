"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ChevronDown,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  Building2,
  AlertTriangle,
} from "lucide-react"
import type { EstadoHistoricoResponseDTO } from "@/app/api/generated/model"
import { cn, formatDate, getProgramStateLabel, getProgramStateStyles, getRoleLabel } from "@/lib/utils"

interface EstadoHistorialFlowProps {
  historial: EstadoHistoricoResponseDTO[]
}

function EstadoCard({ estado, numero, esUltimo }: {
  estado: EstadoHistoricoResponseDTO
  numero: number
  esUltimo: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  if (!estado.estado) return null

  const estilos = getProgramStateStyles(estado.estado)
  const esRechazo = estado.estado.startsWith("RECHAZADO_A_")
  const Icon = esRechazo ? XCircle : estado.estado === "APROBADO" ? CheckCircle2 : Clock
  const nombreActor = [estado.actor?.apellido, estado.actor?.nombre].filter(Boolean).join(", ")
  const esAceptacionArea = estado.estado === "PENDIENTE_DE_COMISIONES_CURRICULARES"
    && estado.actorRol === "COORDINADOR_AREA"

  return (
    <li className="relative min-w-0 pl-8">
      {!esUltimo && (
        <div aria-hidden="true" className="absolute left-3 top-9 -bottom-2.5 w-px bg-border" />
      )}
      <span aria-hidden="true" className={cn(
        "absolute left-0 top-2.5 flex size-6 items-center justify-center rounded-full border text-[11px] font-semibold",
        estilos,
      )}>
        {numero}
      </span>
      <Card
        className={cn("min-w-0 gap-0 overflow-hidden rounded-lg border border-l-4 py-0 shadow-xs", estilos)}
      >
        <div className="flex flex-col gap-1.5 px-3 py-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <div className="flex items-start gap-2">
              <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <h3 className="min-w-0 break-words text-sm font-semibold leading-5">
                {getProgramStateLabel(estado.estado)}
              </h3>
            </div>
            {esAceptacionArea && (
              <p className="pl-6 text-xs leading-5 opacity-80">Aceptación de coordinación de área</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-xs leading-5 opacity-80">
            <Calendar aria-hidden="true" className="size-3.5 shrink-0" />
            <time dateTime={estado.fecha}>{formatDate(estado.fecha)}</time>
          </div>
        </div>

        <dl className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-2 border-t border-border/60 px-3 py-2 text-foreground sm:grid-cols-2 lg:grid-cols-3">
          {estado.actor && (
            <div className="min-w-0">
              <dt className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <User aria-hidden="true" className="size-3" />Intervino
              </dt>
              <dd className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs leading-5">
                <span className="min-w-0 break-words font-medium">{nombreActor}</span>
                {estado.actor.legajo && (
                  <span className="min-w-0 break-words text-muted-foreground">Legajo: {estado.actor.legajo}</span>
                )}
              </dd>
            </div>
          )}
          {estado.actorRol && (
            <div className="min-w-0">
              <dt className="text-[11px] font-medium text-muted-foreground">Rol</dt>
              <dd className="mt-0.5 break-words text-xs leading-5">{getRoleLabel(estado.actorRol)}</dd>
            </div>
          )}
          {estado.departamentoName && (
            <div className="min-w-0">
              <dt className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Building2 aria-hidden="true" className="size-3" />Departamento
              </dt>
              <dd className="mt-0.5 break-words text-xs leading-5">{estado.departamentoName}</dd>
            </div>
          )}
        </dl>

        {estado.observacion && (
          <p className="whitespace-pre-wrap break-words px-3 pb-2 text-xs leading-5 text-foreground/80">{estado.observacion}</p>
        )}

        {esRechazo && estado.justificacion && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-t border-destructive/20">
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto min-h-8 w-full justify-between whitespace-normal rounded-none px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <span className="flex min-w-0 items-center gap-1.5 text-left">
                  <AlertTriangle aria-hidden="true" className="size-3.5 shrink-0" />
                  {isOpen ? "Ocultar justificación del rechazo" : "Ver justificación del rechazo"}
                </span>
                <ChevronDown aria-hidden="true" className={cn("size-4 shrink-0 transition-transform", isOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mx-3 mb-3 rounded-md border border-destructive/20 bg-background/70 p-3">
                <p className="whitespace-pre-wrap break-words text-sm leading-5 text-foreground">{estado.justificacion}</p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </Card>
    </li>
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
    <div className="w-full space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
          <FileText aria-hidden="true" className="size-3.5 shrink-0" />Inicio del proceso de carga
          <time dateTime={historial[0].fecha} className="whitespace-nowrap">{formatDate(historial[0].fecha)}</time>
        </span>
        <span>{historial.length} {historial.length === 1 ? "estado registrado" : "estados registrados"}</span>
      </div>

      <ol aria-label="Historial de estados del programa" className="space-y-2.5">
        {historial.map((estado, index) => (
          <EstadoCard key={index} estado={estado} numero={index + 1} esUltimo={index === historial.length - 1} />
        ))}
      </ol>
    </div>
  )
}
