"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, User, Building2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { MateriaResponseDTO, MateriaCreateDTO, UserResponseDTO, UserResponseReducedDTO, AreaResponseDTO } from "@/app/api/generated/model"
import { useGetMateria, useUpdateMateria, useUpdateDireccionAdministrativa, useListAreasDepartamento, getGetMateriaQueryKey } from "@/app/api/generated/client"
import { UserSelectorDialog } from "@/components/modals/user-selector-dialog"
import { useDept } from "@/context/dept-context"
import { useRole } from "@/context/role-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


export default function EditMateriaPage() {
  const { activeRole } = useRole()
  const { activeDepartamento } = useDept()
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const materiaQuery = useGetMateria(Number(id),
    {
      query: {
        staleTime: 1000 * 60 * 5,
        queryKey: getGetMateriaQueryKey()
      }
    });
  const materia: MateriaResponseDTO | undefined = materiaQuery.data;
  
  const areasQuery = useListAreasDepartamento(activeDepartamento?.departamentoId ?? 0,
    {
      query: {
        enabled: !!activeDepartamento?.departamentoId,
        queryKey: useListAreasDepartamento(activeDepartamento?.departamentoId ?? 0).queryKey
      },
    }
  );
  const areas: AreaResponseDTO[] | undefined = areasQuery.data;
  
  const [formData, setFormData] = useState<MateriaCreateDTO>({
      nombre: materia?.nombre,
      codigo: materia?.codigo,
      areaId: areas?.find(a => a.nombre === materia?.area)?.id || areas?.[0]?.id,
  })

  useEffect(() => {
    if(!materia) return
    setFormData({ 
        nombre: materia.nombre,
        codigo: materia.codigo,
        areaId: areas?.find(a => a.nombre === materia.area)?.id || areas?.[0]?.id,
      })
  }, [materia, areas, activeDepartamento])
  

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  
  const { mutate: mutateDpto, isPending: isPendingDpto } = useUpdateMateria({
    mutation: {
          onSuccess: () => { alert("Éxito"); },
          onError: (err: Error) => alert("Error: " + err.message)
        }
      });
      
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if(materia?.id) {
        mutateDpto({
          id: materia.id, 
            data: formData
        });
        
        alert("Materia actualizado exitosamente")
      }
    //   router.push("/Materias")
  } catch (error) {
      console.error("Error updating materia:", error)
      alert("Error al actualizar el materia")
    } finally {
      setIsLoading(false)
    }
  }
  
  
  
  if (!activeDepartamento || !activeDepartamento.departamentoId || !activeRole) {
    return(
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-yellow-700">Cargando datos de la materia...</p>
        </div>
      </div>
    )
  }

  if (materiaQuery.isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando datos de la materia...</p>
        </div>
      </div>
    )
  }

  if (materiaQuery.error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-600" size={24} />
          <p className="text-red-700">Error al obtener la materia</p>
        </div>
      </div>
    )
  }

  if (!materia || !materia.id) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="text-yellow-600" size={24} />
          <p className="text-yellow-700">La materia solicitada no existe o no pudo ser cargada</p>
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
          <p className="text-yellow-700">No hay áreas registradas. El Director Administrativo debe crear áreas para poder crear materias.</p>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-linear-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground p-8 shadow-lg border-b-4 border-primary/20">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-primary-foreground hover:bg-primary-foreground/10 -ml-2"
          >
            <ArrowLeft size={20} className="mr-2" />
            Volver
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Building2 size={40} />
            <h1 className="text-4xl font-bold text-balance">Editar Materia</h1>
          </div>
          <p className="text-primary-foreground/90 text-lg">Modifica la información general</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Main Form - 2 columns */}
          <div>
            <Card className="border-2 border-border shadow-xl">
              <CardHeader className="bg-linear-to-r from-primary/5 to-accent/5 border-b-2 border-border">
                <CardTitle className="text-2xl text-primary flex items-center gap-2">
                  <Building2 size={24} />
                  Información General
                </CardTitle>
                <CardDescription className="text-base">Actualiza los datos básicos de la materia</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-sm font-semibold">
                      Nombre del Materia *
                    </Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ej: Análisis Matemático I"
                      required
                      className="border-2 border-border focus:border-primary"
                    />
                  </div>

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
                        placeholder="Ej: 12345"
                        className="border-2 border-border focus:border-primary"
                      />
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

                  <div className="flex gap-3 pt-4 border-t-2 border-border">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isLoading}
                      className="flex-1 border-2"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || !formData.nombre}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      <Save size={18} className="mr-2" />
                      {isLoading ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
