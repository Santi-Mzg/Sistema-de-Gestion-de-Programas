"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Building2, Check, UserRoundCog } from "lucide-react"
import { Label } from "@/components/ui/label"
import { DepartamentoResponseDTO, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"
import { getRoleLabel } from "@/lib/utils"

const ROL_PRIORITY: Record<string, number> = {
  [UsuarioDepartamentoDTORolesItem.SYSTEM_ADMIN]: 1,
  [UsuarioDepartamentoDTORolesItem.DIRECCION_ADMINISTRATIVA]: 2,
  [UsuarioDepartamentoDTORolesItem.SECRETARIA]: 3,
  [UsuarioDepartamentoDTORolesItem.COORDINACION_COMISION_CURRICULAR]: 4,
  [UsuarioDepartamentoDTORolesItem.DOCENTE]: 5,
  [UsuarioDepartamentoDTORolesItem.ADMINISTRACION]: 6,
};

interface RoleSelectorDialogProps {
  activeDeptName: string | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
  availableRoles: UsuarioDepartamentoDTORolesItem[]
  activeRole: UsuarioDepartamentoDTORolesItem | null
  onSelectRole: (role: UsuarioDepartamentoDTORolesItem) => void
}

export function RoleSelectorDialog({
  activeDeptName,
  open,
  onOpenChange,
  availableRoles,
  activeRole,
  onSelectRole,
}: RoleSelectorDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UsuarioDepartamentoDTORolesItem>(activeRole || "" as UsuarioDepartamentoDTORolesItem)

  const rolesOrdenados = availableRoles?.slice().sort((a, b) => {
    const pesoA = ROL_PRIORITY[a] ?? 99; // 99 por si aparece un rol nuevo no mapeado
    const pesoB = ROL_PRIORITY[b] ?? 99;
    
    return pesoA - pesoB;
  }) ?? [];

  const handleConfirm = () => {
    if (selectedRole) {
      onSelectRole(selectedRole)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserRoundCog className="h-6 w-6 text-primary" />
            Seleccionar Rol
          </DialogTitle>
          <DialogDescription>Elige un rol para continuar trabajando</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Label className="text-sm font-medium">{activeDeptName ? "Roles disponibles para el departamento de "+activeDeptName : "Debe elegir un departemento previamente"}</Label>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {rolesOrdenados.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`w-full px-4 py-3 rounded-lg border-2 flex items-center justify-between transition-all ${
                  selectedRole === role
                    ? "border-primary bg-primary/5 text-primary font-medium"
                    : "border-border hover:border-primary/50 hover:bg-accent/50"
                }`}
              >
                <span className="text-sm">{getRoleLabel(role)}</span>
                {selectedRole === role && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedRole}>
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
