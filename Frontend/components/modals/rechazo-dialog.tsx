"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useRole } from "@/context/role-context"
import { UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"

interface RechazDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (destino: UsuarioDepartamentoDTORolesItem, justificacion: string) => void
  isLoading?: boolean
}

export function RechazoDialog({ open, onOpenChange, onConfirm, isLoading }: RechazDialogProps) {
  const { activeRole } = useRole()
  const [step, setStep] = useState<"destino" | "justificacion">("destino")
  const [selectedDestino, setSelectedDestino] = useState<UsuarioDepartamentoDTORolesItem>("ADMINISTRACION")
  const [justificacion, setJustificacion] = useState("")

  const handleNextStep = () => {
    setStep("justificacion")
  }

  const handleConfirm = () => {
    onConfirm(selectedDestino, justificacion)
    setStep("destino")
    setJustificacion("")
  }

  const handleCancel = () => {
    onOpenChange(false)
    setStep("destino")
    setJustificacion("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === "destino" ? (
          <>
            <DialogHeader>
              <DialogTitle>¿A quién enviar el rechazo?</DialogTitle>
              <DialogDescription>Selecciona el destino del rechazo del syllabus</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-primary/5 transition">
                <input
                  type="radio"
                  name="destino"
                  value="ADMINISTRACION"
                  checked={selectedDestino === "ADMINISTRACION"}
                  onChange={(e) => setSelectedDestino(e.target.value as UsuarioDepartamentoDTORolesItem)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-semibold text-foreground">Administración</p>
                  <p className="text-sm text-muted-foreground">Enviar para revisión administrativa</p>
                </div>
              </label>
              {!(activeRole === "DOCENTE") && 
                <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-primary/5 transition">
                  <input
                    type="radio"
                    name="destino"
                    value="DOCENTE"
                    checked={selectedDestino === "DOCENTE"}
                    onChange={(e) => setSelectedDestino(e.target.value as UsuarioDepartamentoDTORolesItem)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-semibold text-foreground">Docente Responsable</p>
                    <p className="text-sm text-muted-foreground">Devolver al docente para correcciones</p>
                  </div>
                </label>
              }
            </div>

            <DialogFooter className="gap-3">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleNextStep} className="bg-primary hover:bg-primary/90">
                Siguiente
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Justificación del Rechazo</DialogTitle>
              <DialogDescription>Ingresa una justificación detallada para el rechazo</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm font-medium text-foreground">
                  Destinatario:{" "}
                  <span className="font-semibold">
                    {selectedDestino === "ADMINISTRACION" ? "Administración" : "Docente Responsable"}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="justificacion" className="text-sm font-semibold">
                  Justificación *
                </Label>
                <Textarea
                  id="justificacion"
                  value={justificacion}
                  onChange={(e) => setJustificacion(e.target.value)}
                  placeholder="Describe los motivos del rechazo y qué debe corregirse..."
                  className="border-border focus:border-primary min-h-24 resize-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button type="button" variant="outline" onClick={() => setStep("destino")}>
                Atrás
              </Button>
              <Button type="button" onClick={handleCancel} variant="outline">
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={!justificacion.trim() || isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? "Procesando..." : "Rechazar"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
