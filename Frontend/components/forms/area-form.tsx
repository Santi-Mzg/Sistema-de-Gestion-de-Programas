"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DepartamentoResponseDTO, AreaCreateDTO } from "@/app/api/generated/model"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useCreateArea } from "@/app/api/generated/client"


interface AreaFormProps {
  departamentos: DepartamentoResponseDTO[] 
  onCancel?: () => void
}

export function AreaForm( {departamentos, onCancel}: AreaFormProps ) {
  const [formData, setFormData] = useState<AreaCreateDTO>({
    nombre: "",
    departamentoId: undefined,
  })


    const { mutate, isPending } = useCreateArea({
        mutation: {
          onSuccess: () => {
            alert("Area creada exitosamente!");
          },
          onError: (error: Error) => {
            alert(`Error al crear: ${error.message}`);
          },
        }
    });

    const handleFormSubmit = (data: AreaCreateDTO) => {
      // La función 'mutate' espera el objeto { data: T } si no se especificó un mutator diferente
      mutate({ data }); 
    };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: name === "departamentoId" ? (value ? Number.parseInt(value) : undefined) : value,
    }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      departamentoId: value ? Number.parseInt(value) : undefined,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleFormSubmit(formData)
    setFormData({
      nombre: "",
      departamentoId: undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-l-4 border-primary pl-6 py-4 bg-primary/5 rounded-r-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-sm font-semibold">
              Nombre del Área
            </Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Ciencias Básicas"
              required
              className="border-2 border-border focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="departamentoId" className="text-sm font-semibold">
              Departamento *
            </Label>
            <Select
              value={formData.departamentoId?.toString() ?? ""}
              onValueChange={handleSelectChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar departamento" />
              </SelectTrigger>
              <SelectContent> 
                {departamentos?.map((departamento) => (
                  <SelectItem key={departamento.id} value={departamento.id!.toString()}>
                    {departamento.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
            Crear Area
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
