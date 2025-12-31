"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Building2, Check } from "lucide-react"
import { Label } from "@/components/ui/label"

interface DepartamentoSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableDepartamentos: Array<{ departamentoId?: number; departamentoNombre?: string }>
  activeDepartamento: { departamentoId?: number; departamentoNombre?: string } | null
  onSelectDepartamento: (deptId: string) => void
}

export function DepartamentoSelectorDialog({
  open,
  onOpenChange,
  availableDepartamentos,
  activeDepartamento,
  onSelectDepartamento,
}: DepartamentoSelectorDialogProps) {
  const [selectedDept, setSelectedDept] = useState<string>(activeDepartamento?.departamentoNombre?.toString() || "")

  const handleConfirm = () => {
    if (selectedDept) {
      onSelectDepartamento(selectedDept)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Seleccionar Departamento
          </DialogTitle>
          <DialogDescription>Elige el departamento para continuar trabajando</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Label className="text-sm font-medium">Departamentos disponibles</Label>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {availableDepartamentos.map((dept) => (
              <button
                key={dept.departamentoId}
                onClick={() => setSelectedDept(dept.departamentoNombre!.toString())}
                className={`w-full px-4 py-3 rounded-lg border-2 flex items-center justify-between transition-all ${
                  selectedDept === dept.departamentoNombre?.toString()
                    ? "border-primary bg-primary/5 text-primary font-medium"
                    : "border-border hover:border-primary/50 hover:bg-accent/50"
                }`}
              >
                <span className="text-sm">{dept.departamentoNombre}</span>
                {selectedDept === dept.departamentoNombre?.toString() && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedDept}>
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
