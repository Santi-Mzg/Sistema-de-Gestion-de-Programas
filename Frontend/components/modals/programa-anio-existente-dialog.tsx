"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import type { ProgramaResponseDTO } from "@/app/api/generated/model"

interface CargarProgramaVigenteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  programa: ProgramaResponseDTO | undefined
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function ProgramaAnioExistenteDialog({
  open,
  onOpenChange,
  programa,
  onConfirm,
  onCancel,
  isLoading = false,
}: CargarProgramaVigenteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <AlertCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle>Programa Existente</DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Ya existe un programa registrado para el año {programa?.anio}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {programa && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
            <p className="text-sm">
              <span className="font-semibold text-foreground">Materia:</span>{" "}
              <span className="text-muted-foreground">{programa.materia?.nombre}</span>
            </p>
            <p className="text-sm">
              <span className="font-semibold text-foreground">Año:</span>{" "}
              <span className="text-muted-foreground">{programa.anio}</span>
            </p>
            {programa.historialEstados && programa.historialEstados.length > 0 && (
              <p className="text-sm">
                <span className="font-semibold text-foreground">Estado:</span>{" "}
                <span className="text-muted-foreground">
                  {programa.historialEstados[0].estado}
                </span>
              </p>
            )}
            {programa.historialEstados && programa.historialEstados.length > 0 && (
              <p className="text-sm">
                <span className="font-semibold text-foreground">Última modificación:</span>{" "}
                <span className="text-muted-foreground">
                  {programa.historialEstados[0].fecha?.split("T")[0]}
                </span>
              </p>
            )}
          </div>
        )}

        <p className="text-sm text-foreground">Si crea un nuevo programa se borrará el existente ¿Desea continuar?</p>

        <DialogFooter className="flex gap-3 sm:gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isLoading} className="flex-1 bg-transparent">
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={isLoading} className="flex-1 bg-primary hover:bg-primary/90">
            {isLoading ? "Cargando..." : "Continuar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
