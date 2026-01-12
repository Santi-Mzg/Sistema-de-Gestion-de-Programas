"use client"

import type React from "react"

import { act, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AreaResponseDTO, MateriaCreateDTO } from "@/app/api/generated/model"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { getListAreasDepartamentoQueryKey, getListMateriasCarreraPlanQueryKey, getListMateriasDepartamentoQueryKey, useCreateMateria, useListAreasDepartamento } from "@/app/api/generated/client"
import { useDept } from "@/context/dept-context"
import { AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useRole } from "@/context/role-context"
import { useQueryClient } from "@tanstack/react-query";


export function MateriaForm() {
  const router = useRouter();
  const { activeRole } = useRole()
  const { activeDepartamento } = useDept()
  const queryClient = useQueryClient();

  const areasQuery = useListAreasDepartamento(activeDepartamento?.departamentoId ?? 0,
    {
      query: {
        enabled: !!activeDepartamento?.departamentoId,
        staleTime: 1000 * 60 * 5,
        queryKey: getListAreasDepartamentoQueryKey(activeDepartamento?.departamentoId)
      }
    });

  const areas: AreaResponseDTO[] | undefined = areasQuery.data;

  const [formData, setFormData] = useState<MateriaCreateDTO>({
    codigo: "",
    nombre: "",
    areaId: areas?.[0]?.id,
  })

  const { mutate, isPending } = useCreateMateria({
      mutation: {
        onSuccess: () => {
          toast({
            title: "✓ Éxito",
            description: "Materia creada exitosamente",
            variant: "success",
          })
          setFormData({
            codigo: "",
            nombre: "",
            areaId: areas?.[0]?.id,
          })

          queryClient.invalidateQueries({
            queryKey: getListMateriasDepartamentoQueryKey(activeDepartamento?.departamentoId)
          });

          router.push('/materias'); 

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-l-4 border-primary pl-6 py-4 bg-primary/5 rounded-r-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <Button type="submit" disabled={isPending} className="flex-1 bg-primary hover:bg-primary/90">
            {isPending ? "Creando..." : "Crear"}
          </Button>
        </div>
      </div>
    </form>
  )
}
