"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import type { ProgramaCarreraResponseDTO } from "@/app/api/generated/model"

interface PDFGeneratorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bloques: ProgramaCarreraResponseDTO[]
  cargando: boolean
  error: boolean
  generando: boolean
  onReintentar: () => void
  onGenerar: (planIds?: number[]) => void
}

export function PDFGeneratorDialog({
  open,
  onOpenChange,
  bloques,
  cargando,
  error,
  generando,
  onReintentar,
  onGenerar,
}: PDFGeneratorDialogProps) {
  // null representa «Todos los planes»; [] representa ninguna selección.
  const [seleccion, setSeleccion] = useState<number[] | null>(null)
  const planes = bloques.flatMap(bloque => bloque.plan?.id
    ? [{ id: bloque.plan.id, texto: `${bloque.carreraNombre} - Plan ${bloque.plan.anio}-${bloque.plan.version}` }]
    : [])
  const puedeGenerar = !cargando && !error && !generando && planes.length > 0
    && (seleccion === null || seleccion.length > 0)

  const handleConfirm = () => {
    if (puedeGenerar) onGenerar(seleccion ?? undefined)
  }

  return (
    <Dialog open={open} onOpenChange={nextOpen => { if (!generando) onOpenChange(nextOpen) }}>
      <DialogContent className="max-h-[90dvh] max-w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-6 w-6 shrink-0 text-primary" />
            Generar PDF
          </DialogTitle>
          <DialogDescription>Seleccioná los planes que querés incluir en la información por carrera del programa.</DialogDescription>
        </DialogHeader>

        <div className="min-w-0 space-y-4 py-4">
          {cargando ? <p role="status" className="text-sm text-muted-foreground">Cargando planes...</p>
            : error ? <div className="space-y-2">
              <p role="alert" className="text-sm text-destructive">No se pudieron cargar los planes del programa.</p>
              <Button type="button" variant="outline" onClick={onReintentar}>Reintentar</Button>
            </div>
            : planes.length === 0 ? <p role="alert" className="text-sm text-muted-foreground">El programa no tiene planes disponibles.</p>
            : <fieldset disabled={generando} className="min-w-0 space-y-2">
              <legend className="mb-2 text-sm font-medium">Planes a incluir</legend>
              <label className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3 ${seleccion === null ? "border-primary bg-primary/5" : "border-border"}`}>
                <input type="checkbox" className="shrink-0 accent-primary" checked={seleccion === null}
                  onChange={event => setSeleccion(event.target.checked ? null : [])} />
                <span className="text-sm font-medium">Todos los planes</span>
              </label>
              <div className="max-h-[35dvh] space-y-2 overflow-y-auto pr-1">
                {planes.map(plan => {
                  const seleccionado = seleccion?.includes(plan.id) ?? false
                  return <label key={plan.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3 ${seleccionado ? "border-primary bg-primary/5" : "border-border"}`}>
                    <input type="checkbox" className="shrink-0 accent-primary" checked={seleccionado}
                      onChange={event => setSeleccion(actual => event.target.checked
                        ? [...(actual ?? []), plan.id]
                        : (actual ?? []).filter(id => id !== plan.id))} />
                    <span className="min-w-0 break-words text-sm">{plan.texto}</span>
                  </label>
                })}
              </div>
              {seleccion?.length === 0 && <p role="alert" className="text-sm text-destructive">Seleccioná al menos una opción para generar el PDF.</p>}
            </fieldset>}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" disabled={generando} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!puedeGenerar}>
            {generando ? "Generando..." : "Generar PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
