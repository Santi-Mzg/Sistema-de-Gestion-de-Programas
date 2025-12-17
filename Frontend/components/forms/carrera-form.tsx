"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CarreraCreateDTO, DepartamentoResponseDTO } from "@/app/api/generated/model"
import { useCreateCarrera } from "@/app/api/generated/client"

interface CarreraFormProps {
  departamentos: DepartamentoResponseDTO[] 
  onCancel?: () => void
}

export function CarreraForm({ departamentos, onCancel }: CarreraFormProps) {
  const [formData, setFormData] = useState<CarreraCreateDTO>({
    plan: "",
    nombre: "",
    duracion: "",
    departamentoId: undefined,
  })

    const { mutate, isPending } = useCreateCarrera({
        mutation: {
          onSuccess: () => {
            alert("Carrera creada exitosamente!");
            // Aquí puedes invalidar otras queries con queryClient.invalidateQueries(...)
          },
          onError: (error: Error) => {
            alert(`Error al crear: ${error.message}`);
          },
        }
    });

    // 💡 Esta es la función que se pasa al formulario
    const handleFormSubmit = (data: CarreraCreateDTO) => {
      // La función 'mutate' espera el objeto { data: T } si no se especificó un mutator diferente
      mutate({ data }); 
    };

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
    handleFormSubmit(formData)
    setFormData({
      nombre: "",
      duracion: "",
      // cantidadMaterias: undefined,
      departamentoId: undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-l-4 border-primary pl-6 py-4 bg-primary/5 rounded-r-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-sm font-semibold">
              Nombre de la Carrera *
            </Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Licenciatura en Computación"
              required
              className="border-2 border-border focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan" className="text-sm font-semibold">
              Plan *
            </Label>
            <Input
              id="plan"
              name="plan"
              value={formData.plan}
              onChange={handleChange}
              placeholder="Ej: Plan 2025 - Versión 1"
              required
              className="border-2 border-border focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="duracion" className="text-sm font-semibold">
              Duración (cuatrimestres) *
            </Label>
            <Input
              id="duracion"
              name="duracion"
              value={formData.duracion}
              onChange={handleChange}
              placeholder="Ej: 10 Cuat."
              className="border-2 border-border focus:border-primary"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="departamentoId" className="text-sm font-semibold">
              Departamento *
            </Label>
            <select
              id="departamentoId"
              name="departamentoId"
              value={formData.departamentoId || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-border rounded-lg focus:border-primary focus:ring-0 bg-background"
            >
              <option value="">Seleccionar Departamento...</option>
              {departamentos.map((departamento) => (
                <option key={departamento.id} value={departamento.id}>
                  {departamento.nombre}
                </option>
              ))}
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
