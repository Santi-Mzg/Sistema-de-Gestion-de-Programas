"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AboutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AboutDialog({
  open,
  onOpenChange,
}: AboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Sílabus-UNS
          </DialogTitle>

          <DialogDescription>
            Sistema de Gestión de Programas Académicos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Sistema desarrollado originalmente por{" "}
            <span className="font-medium text-foreground">
              Santiago Maszong
            </span>{" "}
            como Proyecto Final de carrera de Ingeniería en Sistemas de Información.
          </p>

          <div className="border-t pt-4 text-xs text-muted-foreground">
            <p>Departamento de Ciencias e Ingeniería de la Computación</p>
            <p>Universidad Nacional del Sur · 2026</p>
            <p>Sílabus-UNS · v{process.env.NEXT_PUBLIC_APP_VERSION}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}