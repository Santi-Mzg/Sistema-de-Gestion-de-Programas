"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CarreraCreateDTO } from "@/app/api/generated/model"
import { useCreateCarrera } from "@/app/api/generated/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useDept } from "@/context/dept-context"

export function CarreraForm() {
  const { activeDepartamento } = useDept()

  if (!activeDepartamento || !activeDepartamento.departamentoId) {
    return(
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-yellow-700">Cargando departamento...</p>
        </div>
      </div>
    )
  }

  const [formData, setFormData] = useState<CarreraCreateDTO>({
    plan: "",
    nombre: "",
    duracion: "",
    departamentoId: activeDepartamento.departamentoId,
  })

  const { mutate, isPending } = useCreateCarrera({
      mutation: {
        onSuccess: () => {
          alert("Carrera creada exitosamente!");
        },
        onError: (error: Error) => {
          alert(`Error al crear: ${error.message}`);
        },
      }
  });

  const handleFormSubmit = (data: CarreraCreateDTO) => {
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

          <div className="space-y-2">
            <Label htmlFor="departamentoId" className="text-sm font-semibold">
              Departamento *
            </Label>
            <Select
              value={formData.departamentoId?.toString() ?? ""}
            >
              <SelectTrigger>
                <SelectValue placeholder={activeDepartamento.departamentoNombre} />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem key={activeDepartamento.departamentoId} value={activeDepartamento.departamentoId!.toString()}>
                    {activeDepartamento?.departamentoNombre}
                  </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isPending} className="flex-1 bg-primary hover:bg-primary/90">
            {isPending ? "Cargando..." : "Crear"}
          </Button>
        </div>
      </div>
    </form>
  )
}
