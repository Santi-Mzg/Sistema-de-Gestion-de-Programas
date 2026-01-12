"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CarreraCreateDTO } from "@/app/api/generated/model"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useDept } from "@/context/dept-context"
import { getListCarrerasDepartamentoQueryKey, useCreateCarrera } from "@/app/api/generated/client"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query";

export function CarreraForm() {
  const router = useRouter();
  const { activeDepartamento } = useDept()
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CarreraCreateDTO>({
    planAnio: "",
    planVersion: 1,
    nombre: "",
    duracion: "",
  })

  const { mutate, isPending } = useCreateCarrera({
      mutation: {
        onSuccess: () => {
          toast({
            title: "✓ Éxito",
            description: "Carrera creada exitosamente",
            variant: "success",
          })
          setFormData({
            planAnio: "",
            planVersion: 1,
            nombre: "",
            duracion: "",
            // cantidadMaterias: undefined,
          })

          queryClient.invalidateQueries({
            queryKey: getListCarrerasDepartamentoQueryKey(activeDepartamento?.departamentoId)
          });

          router.push('/carreras'); 
        },
        onError: (error: Error) => {
          toast({
            title: "✗ Error",
            description: error instanceof Error ? error.message : "Error desconocido",
            variant: "destructive",
          })
        },
      }
  });


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate({ 
      deptId: activeDepartamento!.departamentoId!,
      data: formData 
    }); 
  }

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


  if (!activeDepartamento || !activeDepartamento.departamentoId) {
    return(
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-yellow-700">Cargando...</p>
        </div>
      </div>
    )
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
              value={formData.planAnio}
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
              value={activeDepartamento.departamentoId.toString()}
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
            {isPending ? "Creando..." : "Crear"}
          </Button>
        </div>
      </div>
    </form>
  )
}
