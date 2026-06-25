"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { getListAreasDepartamentoQueryKey, useCreateArea } from "@/app/api/generated/client"
import { useDept } from "@/context/dept-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useHeader } from "@/context/header-context"
import { Layers } from "lucide-react"
import axios from "axios"
import { areaSchema, AreaFormData } from "@/lib/schemas/area"

export function AreaForm() {
  const { setHeader } = useHeader()
  const router = useRouter()
  const { activeDepartamento } = useDept()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AreaFormData>({
    resolver: zodResolver(areaSchema),
    defaultValues: { nombre: "" },
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
        reset()
        queryClient.invalidateQueries({
          queryKey: getListAreasDepartamentoQueryKey(activeDepartamento?.departamentoId)
        })
        router.push('/areas')
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

  const onSubmit = (data: AreaFormData) => {
    mutate({
      deptId: activeDepartamento!.departamentoId!,
      data: { nombre: data.nombre },
    })
  }

  if (!activeDepartamento || !activeDepartamento.departamentoId) {
    return (
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
      <div className="border-l-4 border-primary px-6 py-4 bg-primary/5 rounded-r-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-sm font-semibold">
              Nombre del Área *
            </Label>
            <Input
              id="nombre"
              {...register("nombre")}
              placeholder="Ej: Ciencias Básicas"
              className={`border-2 focus:border-primary ${errors.nombre ? "border-red-500" : "border-border"}`}
            />
            {errors.nombre && <span className="text-red-500 text-sm">{errors.nombre.message}</span>}
          </div>

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
