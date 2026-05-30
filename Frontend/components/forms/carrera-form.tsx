"use client"

import type React from "react"

import { useEffect, useState } from "react"
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
import { useHeader } from "@/context/header-context"
import { GraduationCap } from "lucide-react"
import axios from "axios"

export function CarreraForm() {
  const router = useRouter();
  const { activeDepartamento } = useDept()
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear()
  const years = Array.from(
    { length: currentYear - 2000 + 1 },
    (_, i) => currentYear - i
  )

  const { setHeader } = useHeader()

  useEffect(() => {
    setHeader({
      title: `Crear Carrera`,
      subtitle: "Formulario de creación de una nueva carrera dentro del departamento",
      icon: GraduationCap,
    })
  }, [])


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

          queryClient.removeQueries({
            queryKey: getListCarrerasDepartamentoQueryKey(activeDepartamento?.departamentoId)
          });

          router.push('/carreras'); 
        },
        onError: (error: unknown) => {

          let errorMessage = "Ocurrió un error inesperado";

          if (axios.isAxiosError(error)) {
            const backendError = error.response?.data;
            
            errorMessage = backendError?.errors?.Error || 
                          backendError?.message || 
                          "Ocurrió un error inesperado";
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }

          toast({
            title: "✗ Error",
            description: errorMessage,
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

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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
    <form className="space-y-6">
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
              onChange={(e) => handleFieldChange("nombre", e.target.value)}
              placeholder="Ej: Licenciatura en Computación"
              required
              className="border-2 border-border focus:border-primary"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Plan *
            </Label>
            <Select
              value={formData.planAnio}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, planAnio: value }))
              }
            >
              <SelectTrigger className="border-2 border-border focus:border-primary">
                <SelectValue placeholder="Seleccionar año" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="version" className="text-sm font-semibold">
              Versión *
            </Label>
            <Input
              id="version"
              name="version"
              type="number"
              value={formData.planVersion}
              onChange={(e) => handleFieldChange("planVersion", Number.parseInt(e.target.value))}
              placeholder="Ej: 1"
              required
              min="1"
              className="border-2 border-border focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duracion" className="text-sm font-semibold">
              Duración (cuatrimestres) *
            </Label>
            <Input
              id="duracion"
              name="duracion"
              value={formData.duracion}
              onChange={(e) => handleFieldChange("duracion", e.target.value)}
              placeholder="Ej: 10 Cuat."
              className="border-2 border-border focus:border-primary"
              required
            />
          </div>
        </div>


        <div className="flex gap-3 pt-4">
          <Button type="button" onClick={handleSubmit} disabled={isPending} className="flex-1 bg-primary hover:bg-primary/90">
            {isPending ? "Creando..." : "Crear"}
          </Button>
        </div>
      </div>
    </form>
  )
}
