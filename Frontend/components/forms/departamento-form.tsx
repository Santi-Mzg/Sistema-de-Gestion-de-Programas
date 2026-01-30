"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DepartamentoCreateDTO } from "@/app/api/generated/model"
import { getListDepartamentosQueryKey, useCreateDepartamento } from "@/app/api/generated/client"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query";
import { useHeader } from "@/context/header-context"
import { Building2 } from "lucide-react"


export function DepartamentoForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<DepartamentoCreateDTO>({
    nombre: "",
    direccion: "",
    telefono: "",
    email: "",
    sitioWeb: "",
  })

  const { setHeader } = useHeader()

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
          setFormData({
            nombre: "",
            direccion: "",
            telefono: "",
            email: "",
            sitioWeb: "",
          })

          queryClient.invalidateQueries({
            queryKey: getListDepartamentosQueryKey()
          });

          router.push('/departamentos'); 
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
    mutate({ data: formData });
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-l-4 border-primary pl-6 py-4 bg-primary/5 rounded-r-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-sm font-semibold">
              Nombre del Departamento
            </Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Departamento de Ingeniería"
              required
              className="border-2 border-border focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contacto@departamento.edu"
              className="border-2 border-border focus:border-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="direccion" className="text-sm font-semibold">
            Dirección
          </Label>
          <Input
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            placeholder="Dirección física del departamento"
            className="border-2 border-border focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefono" className="text-sm font-semibold">
            Teléfono
          </Label>
          <Input
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Teléfono del departamento"
            className="border-2 border-border focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sitioWeb" className="text-sm font-semibold">
            Sitio Web
          </Label>
          <Input
            id="sitioWeb"
            name="sitioWeb"
            value={formData.sitioWeb}
            onChange={handleChange}
            placeholder="https://departamento.uns.edu.ar"
            className="border-2 border-border focus:border-primary"
          />
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
