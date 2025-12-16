"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DepartamentoCreateDTO, UserCreateDTO, UserCreateDTORolesItem } from "@/app/api/generated/model"

const AVAILABLE_ROLES = Object.values(UserCreateDTORolesItem).map((value) => ({
  value,
  label: value.charAt(0) + value.slice(1).toLowerCase().replaceAll("_", " "),
}));

interface UsuarioFormProps {
  onCancel?: () => void
}

export function UsuarioForm({ onCancel }: UsuarioFormProps) {
  const [formData, setFormData] = useState<UserCreateDTO>({
    nombre: "",
    apellido: "",
    dni: "",
    legajo: "",
    email: "",
    roles: [],
  })

  const { mutate, isPending } = useCreateUser({
      mutation: {
        onSuccess: () => {
          alert("Usuario creado exitosamente!");
          // Aquí puedes invalidar otras queries con queryClient.invalidateQueries(...)
        },
        onError: (error: Error) => {
          alert(`Error al crear: ${error.message}`);
        },
      }
  });

  const handleFormSubmit = (data: DepartamentoCreateDTO) => { 
    // La función 'mutate' espera el objeto { data: T } si no se especificó un mutator diferente
    mutate({ data }); 
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRoleChange = (role: UserCreateDTORolesItem) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles?.includes(role) ? prev.roles.filter((r) => r !== role) : [...(prev.roles || []), role],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleFormSubmit(formData)
    setFormData({
      nombre: "",
      apellido: "",
      dni: "",
      legajo: "",
      email: "",
      roles: [],
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="border-l-4 border-primary pl-6 py-4 bg-primary/5 rounded-r-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-sm font-semibold">
              Nombre
            </Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre del usuario"
              required
              className="border-2 border-border focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apellido" className="text-sm font-semibold">
              Apellido
            </Label>
            <Input
              id="apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              placeholder="Apellido del usuario"
              required
              className="border-2 border-border focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="usuario@uns.edu.ar"
              required
              className="border-2 border-border focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dni" className="text-sm font-semibold">
              DNI
            </Label>
            <Input
              id="dni"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              placeholder="Ej: 12345678"
              className="border-2 border-border focus:border-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="legajo" className="text-sm font-semibold">
            Legajo
          </Label>
          <Input
            id="legajo"
            name="legajo"
            value={formData.legajo}
            onChange={handleChange}
            placeholder="Número de legajo"
            className="border-2 border-border focus:border-primary"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold">Roles</Label>
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border-2 border-border">
            {AVAILABLE_ROLES.map(({ value, label }) => (
              <div key={value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`role-${value}`}
                  checked={formData.roles?.includes(value) || false}
                  onChange={() => handleRoleChange(value)}
                  className="border-2 border-primary"
                />
                <label htmlFor={`role-${value}`} className="text-sm cursor-pointer">
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
            Crear Usuario
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
