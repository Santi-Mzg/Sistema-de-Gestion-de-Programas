"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AreaResponseDTO, DepartamentoResponseDTO, MateriaCreateDTO } from "@/app/api/generated/model"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useCreateMateria } from "@/app/api/generated/client"


interface MateriaFormProps {
  departamentos: DepartamentoResponseDTO[] 
  onCancel?: () => void
}

export function MateriaForm( {departamentos, onCancel}: MateriaFormProps ) {
  const [departamento, setDepartamento] = useState<DepartamentoResponseDTO | null>(null)
  const [areasDisponibles, setAreasDisponibles] = useState<AreaResponseDTO[]>([])
  const [formData, setFormData] = useState<MateriaCreateDTO>({
    codigo: "",
    nombre: "",
    areaId: 0,
    departamentoId: undefined,
  })


  // const {
  //   data: areas,
  // } = useListAreasDepartamento(departamento?.id!, {
  //   query: {
  //     queryKey: ["areasPorDepartamento", departamento?.id],
  //     enabled: !!departamento,
  //   },
  // })

  const areas: AreaResponseDTO[] = []

  // useEffect(() => {
  //   if (areas) {
  //     setAreasDisponibles(areas)
  //   }
  // }, [areas])


  const { mutate, isPending } = useCreateMateria({
      mutation: {
        onSuccess: () => {
          alert("Materia creado exitosamente!");
          // Aquí puedes invalidar otras queries con queryClient.invalidateQueries(...)
        },
        onError: (error: Error) => {
          alert(`Error al crear: ${error.message}`);
        },
      }
  });

  const handleFormSubmit = (data: MateriaCreateDTO) => {
    // La función 'mutate' espera el objeto { data: T } si no se especificó un mutator diferente
    mutate({ data }); 
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "departamentoId" ? (value ? Number.parseInt(value) : undefined) : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleFormSubmit(formData)
    setFormData({
      codigo: "",
      nombre: "",
      areaId: 0,
      departamentoId: undefined,
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
              placeholder="Ej: MAT-101"
              required
              className="border-2 border-border focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-sm font-semibold">
              Nombre de la Materia
            </Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Cálculo Diferencial"
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

          <div className="space-y-2">
            <Label htmlFor="areaId" className="text-sm font-semibold">
              Area *
            </Label>
            <Select
              value={formData.areaId?.toString() ?? ""}
              onValueChange={(e) => setFormData((prev) => ({
                ...prev,
                areaId: Number(e),
              }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar área" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id!.toString()}>
                    {area.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
            Crear Materia
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
