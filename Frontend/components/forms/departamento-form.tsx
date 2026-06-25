"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getListDepartamentosQueryKey, useCreateDepartamento } from "@/app/api/generated/client"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useHeader } from "@/context/header-context"
import { Building2 } from "lucide-react"
import axios from "axios"
import { departamentoSchema, DepartamentoFormData } from "@/lib/schemas/departamento"

export function DepartamentoForm() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setHeader } = useHeader()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DepartamentoFormData>({
    resolver: zodResolver(departamentoSchema),
    defaultValues: {
      nombre: "",
      email: "",
      direccion: "",
      telefono: "",
      sitioWeb: "",
    },
  })

  useEffect(() => {
    setHeader({
      title: `Crear Departamento`,
      subtitle: "Formulario de creación de un nuevo departamento",
      icon: Building2,
    })
  }, [])

  const { mutate, isPending } = useCreateDepartamento({
    mutation: {
      onSuccess: () => {
        toast({
          title: "✓ Éxito",
          description: "Departamento creado exitosamente",
          variant: "success",
        })

        reset()
        
        queryClient.invalidateQueries({
          queryKey: getListDepartamentosQueryKey()
        })
        
        router.push('/departamentos')
      },
      onError: (error: unknown) => {
        let errorMessage = "Ocurrió un error inesperado"
        if (axios.isAxiosError(error)) {
          const backendError = error.response?.data
          errorMessage = backendError?.errors?.Error ||
                        backendError?.message ||
                        "Ocurrió un error inesperado"
        } else if (error instanceof Error) {
          errorMessage = error.message
        }

        toast({
          title: "✗ Error",
          description: errorMessage,
          variant: "destructive",
        })
      },
    }
  })

  const onSubmit = (data: DepartamentoFormData) => {
    mutate({ data })
  }

  return (
    <form className="space-y-6">
      <div className="border-l-4 border-primary px-6 py-4 bg-primary/5 rounded-r-lg space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-sm font-semibold">
              Nombre del Departamento *
            </Label>
            <Input
              id="nombre"
              {...register("nombre")}
              placeholder="Ej: Departamento de Ingeniería"
              className={`border-2 focus:border-primary ${errors.nombre ? "border-red-500" : "border-border"}`}
            />
            {errors.nombre && <span className="text-red-500 text-sm">{errors.nombre.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="contacto@departamento.edu"
              className={`border-2 focus:border-primary ${errors.email ? "border-red-500" : "border-border"}`}
            />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="direccion" className="text-sm font-semibold">
            Dirección
          </Label>
          <Input
            id="direccion"
            {...register("direccion")}
            placeholder="Dirección física del departamento"
            className={`border-2 focus:border-primary ${errors.direccion ? "border-red-500" : "border-border"}`}
          />
          {errors.direccion && <span className="text-red-500 text-sm">{errors.direccion.message}</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefono" className="text-sm font-semibold">
            Teléfono
          </Label>
          <Input
            id="telefono"
            {...register("telefono")}
            placeholder="Teléfono del departamento"
            className={`border-2 focus:border-primary ${errors.telefono ? "border-red-500" : "border-border"}`}
          />
          {errors.telefono && <span className="text-red-500 text-sm">{errors.telefono.message}</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sitioWeb" className="text-sm font-semibold">
            Sitio Web
          </Label>
          <Input
            id="sitioWeb"
            {...register("sitioWeb")}
            placeholder="https://departamento.uns.edu.ar"
            className={`border-2 focus:border-primary ${errors.sitioWeb ? "border-red-500" : "border-border"}`}
          />
          {errors.sitioWeb && <span className="text-red-500 text-sm">{errors.sitioWeb.message}</span>}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isPending} className="flex-1 bg-primary hover:bg-primary/90">
            {isPending ? "Creando..." : "Crear"}
          </Button>
        </div>
      </div>
    </form>
  )
}
