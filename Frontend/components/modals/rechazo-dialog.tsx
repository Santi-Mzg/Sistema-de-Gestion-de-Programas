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
import { Rol } from "@/app/api/generated/model"

interface RechazDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (destino: Rol, justificacion: string) => void
  destinos?: Rol[]
  isLoading?: boolean
}

export function RechazoDialog({ open, onOpenChange, onConfirm, isLoading, destinos }: RechazDialogProps) {
  const { activeRole } = useRole()
  const [step, setStep] = useState<"destino" | "justificacion">("destino")
  const [selectedDestino, setSelectedDestino] = useState<Rol>("ADMINISTRACION")
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
              {(destinos ?? (activeRole === 'DOCENTE' ? ['ADMINISTRACION', 'SECRETARIA'] : ['ADMINISTRACION', 'SECRETARIA', 'DOCENTE'])).map(destino => (
                <label key={destino} className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-primary/5">
                  <input type="radio" name="destino" value={destino} checked={selectedDestino === destino}
                    onChange={() => setSelectedDestino(destino as Rol)} />
                  <span className="font-semibold">{destino === 'ADMINISTRACION' ? 'Administración' : destino === 'SECRETARIA' ? 'Secretaría inicial' : 'Docente responsable'}</span>
                </label>
              ))}
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
              <DialogTitle>Justificación del rechazo</DialogTitle>
              <DialogDescription>Ingresa una justificación detallada para el rechazo</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm font-medium text-foreground">
                  Destinatario:{" "}
                  <span className="font-semibold">
                    {selectedDestino === "ADMINISTRACION" ? "Administración" : selectedDestino === "SECRETARIA" ? "Secretaría inicial" : "Docente responsable"}
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
