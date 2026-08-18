"use client"

import type React from "react"

import { act, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AreaResponseDTO, MateriaCreateDTO } from "@/app/api/generated/model"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { getListAreasDepartamentoQueryKey, getListMateriasCarreraPlanQueryKey, getListMateriasDepartamentoQueryKey, useCreateMateria, useListAreasDepartamento } from "@/app/api/generated/client"
import { useDept } from "@/context/dept-context"
import { AlertCircle, BookOpenText } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useRole } from "@/context/role-context"
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios"
import { useHeader } from "@/context/header-context"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { CreateMateriaFormData, createMateriaSchema } from "@/lib/schemas/materia"


export function MateriaForm() {
  const router = useRouter();
  const { activeRole } = useRole()
  const { activeDepartamento } = useDept()
  const queryClient = useQueryClient();

  const { setHeader } = useHeader()

  useEffect(() => {
    setHeader({
      title: `Crear Materia`,
      subtitle: "Formulario de creación de una nueva materia dentro del departamento",
      icon: BookOpenText,
    })
  }, [])

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset,
    setValue
  } = useForm<CreateMateriaFormData>({
    resolver: zodResolver(createMateriaSchema)
  })

  const areasQuery = useListAreasDepartamento(activeDepartamento?.departamentoId ?? 0,
    {
      page: 0,
      size: 1000,
      search: undefined
    },
    {
      query: {
        enabled: !!activeDepartamento?.departamentoId,
        staleTime: 1000 * 60 * 5,
        queryKey: getListAreasDepartamentoQueryKey(activeDepartamento?.departamentoId,
          {
            page: 0,
            size: 1000,
            search: undefined
          },
        )
      }
    });

  const areas: AreaResponseDTO[] | undefined = areasQuery.data?.content;

  const { mutate, isPending } = useCreateMateria({
      mutation: {
        onSuccess: () => {
          toast({
            title: "✓ Éxito",
            description: "Materia creada exitosamente",
            variant: "success",
          })

          reset()

          queryClient.invalidateQueries({
            queryKey: getListMateriasDepartamentoQueryKey(activeDepartamento?.departamentoId)
          });

          router.push('/materias'); 

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
  
  const onSubmit = (formData: CreateMateriaFormData) => {
    mutate({ 
      data: formData
    }); 
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

  if (areasQuery.isLoading) {
      return (
        <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando áreas para la materias...</p>
            </div>
        </div>
      )
  }

  if (areasQuery.error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-600" size={24} />
          <p className="text-red-700">Error al obtener las áreas</p>
        </div>
      </div>
    )
  }

  if (!areas || areas.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="text-yellow-600" size={24} />
          <p className="text-yellow-700">No hay áreas registradas. Deben haber áreas registradas para poder crear materias.</p>
          {(activeRole === 'SYSTEM_ADMIN' || activeRole === 'DIRECCION_ADMINISTRATIVA' || activeRole === 'SECRETARIA') &&
            <Link href="/areas/crear">
              <Button>Crear Área</Button>
            </Link>
          }
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="border-l-4 border-primary px-6 py-4 bg-primary/5 rounded-r-lg space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-sm font-semibold">
              Nombre de la Materia
            </Label>
            <Input
              id="nombre"
              {...register("nombre")}
              className={`border-2 focus:border-primary ${errors.nombre ? "border-red-500" : "border-border"}`}
            />
            {errors.nombre && <span className="text-red-500 text-sm">{errors.nombre.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigo" className="text-sm font-semibold">
              Código
            </Label>
            <Input
              id="codigo"
              {...register("codigo")}
              placeholder="1234"
              className={`border-2 focus:border-primary ${errors.codigo ? "border-red-500" : "border-border"}`}
            />
            {errors.codigo && <span className="text-red-500 text-sm">{errors.codigo.message}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="departamento" className="text-sm font-semibold">
              Departamento
            </Label>
            <Input
              id="departamento"
              name="departamento"
              value={activeDepartamento?.departamentoNombre}
              className="border-border focus:border-primary bg-background text-lg font-medium"
              disabled
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="areaId" className="text-sm font-semibold">
              Area *
            </Label>
            <Select
              onValueChange={(value) => setValue("areaId", Number(value))}
            >
              <SelectTrigger className={`border-2 focus:border-primary ${errors.areaId ? "border-red-500" : "border-border"}`}>
                <SelectValue placeholder="Seleccionar área..." />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id?.toString() || ''}>
                    {area.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.areaId && <span className="text-red-500 text-sm">{errors.areaId.message}</span>}
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
