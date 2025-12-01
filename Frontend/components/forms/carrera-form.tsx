"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CarreraCreateDTO } from "@/app/api/generated/model"

interface CarreraFormProps {
  onSubmit: (data: CarreraCreateDTO) => void
  onCancel?: () => void
}

export function CarreraForm({ onSubmit, onCancel }: CarreraFormProps) {
  const [formData, setFormData] = useState<CarreraCreateDTO>({
    codigo: "",
    nombre: "",
    duracion: "",
    cantidadMaterias: undefined,
    materiasIds: [],
    departamentoId: undefined,
    comisionId: undefined,
    profesoresIds: [],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: ["cantidadMaterias", "departamentoId", "comisionId"].includes(name)
        ? value
          ? Number.parseInt(value)
          : undefined
        : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      codigo: "",
      nombre: "",
      duracion: "",
      cantidadMaterias: undefined,
      materiasIds: [],
      departamentoId: undefined,
      comisionId: undefined,
      profesoresIds: [],
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-l-4 border-primary pl-6 py-4 bg-primary/5 rounded-r-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="codigo" className="text-sm font-semibold">
              Código
            </Label>
            <Input
              id="codigo"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              placeholder="Ej: ING-001"
              required
              className="border-2 border-border focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-sm font-semibold">
              Nombre de la Carrera
            </Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Ingeniería en Informática"
              required
              className="border-2 border-border focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="duracion" className="text-sm font-semibold">
              Duración (años)
            </Label>
            <Input
              id="duracion"
              name="duracion"
              value={formData.duracion}
              onChange={handleChange}
              placeholder="Ej: 4"
              className="border-2 border-border focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cantidadMaterias" className="text-sm font-semibold">
              Cantidad de Materias
            </Label>
            <Input
              id="cantidadMaterias"
              name="cantidadMaterias"
              type="number"
              value={formData.cantidadMaterias || ""}
              onChange={handleChange}
              placeholder="Ej: 40"
              className="border-2 border-border focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="departamentoId" className="text-sm font-semibold">
              Departamento
            </Label>
            <select
              id="departamentoId"
              name="departamentoId"
              value={formData.departamentoId || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-border rounded-lg focus:border-primary focus:ring-0 bg-background"
            >
              <option value="">Seleccionar departamento</option>
              <option value="1">Ingeniería</option>
              <option value="2">Ciencias Exactas</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comisionId" className="text-sm font-semibold">
              Comisión
            </Label>
            <select
              id="comisionId"
              name="comisionId"
              value={formData.comisionId || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-border rounded-lg focus:border-primary focus:ring-0 bg-background"
            >
              <option value="">Seleccionar comisión</option>
              <option value="1">Comisión A</option>
              <option value="2">Comisión B</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
            Crear Carrera
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
