"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DepartamentoCreateDTO } from "@/app/api/generated/model"

interface DepartamentoFormProps {
  onSubmit: (data: DepartamentoCreateDTO) => void
  onCancel?: () => void
}

export function DepartamentoForm({ onSubmit, onCancel }: DepartamentoFormProps) {
  const [formData, setFormData] = useState<DepartamentoCreateDTO>({
    nombre: "",
    direccion: "",
    cuerpo: "",
    email: "",
    sitioWeb: "",
    administracionIds: [],
    secretariaId: undefined,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      nombre: "",
      direccion: "",
      cuerpo: "",
      email: "",
      sitioWeb: "",
      administracionIds: [],
      secretariaId: undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-l-4 border-primary pl-6 py-4 bg-primary/5 rounded-r-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-sm font-semibold">
              Nombre del Departamento
            </Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Departamento de Ingeniería"
              required
              className="border-2 border-border focus:border-primary"
            />
          </div>

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
              placeholder="contacto@departamento.edu"
              className="border-2 border-border focus:border-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="direccion" className="text-sm font-semibold">
            Dirección
          </Label>
          <Input
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            placeholder="Dirección física del departamento"
            className="border-2 border-border focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cuerpo" className="text-sm font-semibold">
            Descripción/Cuerpo
          </Label>
          <Textarea
            id="cuerpo"
            name="cuerpo"
            value={formData.cuerpo}
            onChange={handleChange}
            placeholder="Descripción del departamento"
            className="border-2 border-border focus:border-primary min-h-24"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sitioWeb" className="text-sm font-semibold">
            Sitio Web
          </Label>
          <Input
            id="sitioWeb"
            name="sitioWeb"
            value={formData.sitioWeb}
            onChange={handleChange}
            placeholder="https://departamento.uns.edu.ar"
            className="border-2 border-border focus:border-primary"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
            Crear Departamento
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
