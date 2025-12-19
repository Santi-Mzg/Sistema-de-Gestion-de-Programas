"use client"

import { useState } from "react"
import { Search, User, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { UserResponseDTO } from "@/app/api/generated/model"

interface UserSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (user: UserResponseDTO) => void

  title: string
  description?: string

  currentUser?: UserResponseDTO
  availableUsers?: UserResponseDTO[]

  roleLabel?: string
  confirmLabel?: string

  isLoading?: boolean
}

export function UserSelectorDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  currentUser,
  availableUsers = [],
  roleLabel = "Actual",
  confirmLabel = "Confirmar",
  isLoading = false,
}: UserSelectorDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserResponseDTO | null>(null)

  const filteredUsers = availableUsers.filter((u) =>
    `${u.nombre} ${u.apellido} ${u.legajo}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  const handleConfirm = () => {
    if (!selectedUser) return
    onConfirm(selectedUser)
    onOpenChange(false)
    setSelectedUser(null)
    setSearchTerm("")
  }

  const handleClose = () => {
    onOpenChange(false)
    setSelectedUser(null)
    setSearchTerm("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <User size={28} />
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* Current User */}
        {currentUser && (
          <div className="bg-muted/50 border-2 border-border rounded-xl p-4">
            <p className="text-sm font-semibold text-muted-foreground mb-2">
              {roleLabel}:
            </p>
            <p className="font-semibold">
              {currentUser.nombre} {currentUser.apellido} — Legajo {currentUser.legajo}
            </p>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, apellido o legajo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 py-6"
          />
        </div>

        {/* Users */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-[300px]">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Cargando usuarios...</p>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const isSelected = selectedUser?.id === user.id
              const isCurrent = currentUser?.id === user.id

              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full p-4 rounded-xl border-2 text-left flex justify-between ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-lg">
                      {user.nombre} {user.apellido}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Legajo: {user.legajo}
                      {isCurrent && ` · ${roleLabel}`}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Check size={18} className="text-primary-foreground" />
                    </div>
                  )}
                </button>
              )
            })
          ) : (
            <p className="text-center text-muted-foreground">
              No se encontraron usuarios
            </p>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedUser || selectedUser?.id === currentUser?.id}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
