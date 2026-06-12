"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AreaCreateDTO } from "@/app/api/generated/model"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { getListAreasDepartamentoQueryKey, useCreateArea } from "@/app/api/generated/client"
import { useDept } from "@/context/dept-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query";
import { useHeader } from "@/context/header-context"
import { Layers } from "lucide-react"
import axios from "axios"

export function AreaForm() {
  const { setHeader } = useHeader()
  const router = useRouter();
  const { activeDepartamento } = useDept()
  const { toast } = useToast()
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<AreaCreateDTO>({
    nombre: "",
  })

  useEffect(() => {
    setHeader({
      title: `Crear Área Departamental`,
      subtitle: "Formulario de creación de una nueva área dentro del departamento",
      icon: Layers,
    })
  }, [])

  const { mutate, isPending } = useCreateArea({
      mutation: {
        onSuccess: () => {
          toast({
            title: "✓ Éxito",
            description: "Área creada exitosamente",
            variant: "success",
          })
          setFormData({
            nombre: "",
          })

          queryClient.invalidateQueries({
            queryKey: getListAreasDepartamentoQueryKey(activeDepartamento?.departamentoId)
          });

          router.push('/areas'); 
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: name === "departamentoId" ? (value ? Number.parseInt(value) : undefined) : value,
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
              Nombre del Área *
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
          <Button type="button" onClick={handleSubmit} disabled={isPending} className="flex-1 bg-primary hover:bg-primary/90">
            {isPending ? "Creando..." : "Crear"}
          </Button>
        </div>
      </div>
    </form>
  )
}
