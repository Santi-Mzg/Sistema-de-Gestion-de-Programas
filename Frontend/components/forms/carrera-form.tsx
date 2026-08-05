"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreateCarreraFormData, createCarreraSchema } from "@/lib/schemas/carrera"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useDept } from "@/context/dept-context"
import { getListCarrerasDepartamentoQueryKey, useCreateCarrera } from "@/app/api/generated/client"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query";
import { useHeader } from "@/context/header-context"
import { GraduationCap } from "lucide-react"
import axios from "axios"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

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

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset,
    setValue
  } = useForm<CreateCarreraFormData>({
    resolver: zodResolver(createCarreraSchema)
  })

  const { mutate, isPending } = useCreateCarrera({
      mutation: {
        onSuccess: () => {
          toast({
            title: "✓ Éxito",
            description: "Carrera creada exitosamente",
            variant: "success",
          })

          reset()

          queryClient.invalidateQueries({
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


  const onSubmit = (formData: CreateCarreraFormData) => {
    mutate({ 
      deptId: activeDepartamento!.departamentoId!,
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="border-l-4 border-primary px-6 py-4 bg-primary/5 rounded-r-lg space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-sm font-semibold">
              Nombre de la Carrera *
            </Label>
            <Input
              id="nombre"
              {...register("nombre")}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Plan *
            </Label>
            <Select
              onValueChange={(value) =>
                setValue("planAnio", value, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger className={`border-2 focus:border-primary ${errors.planAnio ? "border-red-500" : "border-border"}`}>
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
            {errors.planAnio && <span className="text-red-500 text-sm">{errors.planAnio.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="planVersion" className="text-sm font-semibold">
              Versión *
            </Label>
            <Input
              id="planVersion"
              type="number"
              placeholder="Ej: 1"
              min="1"
              {...register("planVersion", { valueAsNumber: true })}
              className={`border-2 focus:border-primary ${errors.planVersion ? "border-red-500" : "border-border"}`}
            />
            {errors.planVersion && <span className="text-red-500 text-sm">{errors.planVersion.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duracion" className="text-sm font-semibold">
              Duración (cuatrimestres) *
            </Label>
            <Input
              id="duracion"
              placeholder="Ej: 10"
              {...register("duracion")}
              className={`border-2 focus:border-primary ${errors.duracion ? "border-red-500" : "border-border"}`}
            />
            {errors.duracion && <span className="text-red-500 text-sm">{errors.duracion.message}</span>}
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
