"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, User, Building2, AlertCircle, Book, BookOpenText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { MateriaResponseDTO, MateriaCreateDTO, UserResponseDTO, UserResponseReducedDTO, AreaResponseDTO } from "@/app/api/generated/model"
import { useGetMateria, useUpdateMateria, useUpdateDireccionAdministrativa, useListAreasDepartamento, getGetMateriaQueryKey, getListAreasDepartamentoQueryKey } from "@/app/api/generated/client"
import { useDept } from "@/context/dept-context"
import { useRole } from "@/context/role-context"
import { useHeader } from "@/context/header-context"
import { toast } from "@/hooks/use-toast"
import axios from "axios"


export default function EditMateriaPage() {
  const { activeRole } = useRole()
  const { activeDepartamento } = useDept()
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const havePermissions = !(activeRole !== 'SYSTEM_ADMIN' && activeRole !== 'DIRECCION_ADMINISTRATIVA' && activeRole !== 'SECRETARIA' && activeRole !== 'ADMINISTRACION')

  const materiaQuery = useGetMateria(Number(id),
    {
      query: {
        staleTime: 1000 * 60 * 5,
        queryKey: getGetMateriaQueryKey(Number(id))
      }
    });
  const materia: MateriaResponseDTO | undefined = materiaQuery.data;
  
  const areasQuery = useListAreasDepartamento(activeDepartamento?.departamentoId ?? 0,
    {
      query: {
        enabled: !!activeDepartamento?.departamentoId,
        staleTime: 1000 * 60 * 5,
        queryKey: getListAreasDepartamentoQueryKey(activeDepartamento?.departamentoId)
      },
    }
  );
  const areas: AreaResponseDTO[] | undefined = areasQuery.data;
  
  const { setHeader } = useHeader()
  
  useEffect(() => {
    setHeader({
      title: `${materia?.nombre ?? ""}`,
      subtitle: " ",
      icon: BookOpenText,
    })
  }, [materia])

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
  
  const { mutate: mutateDpto, isPending } = useUpdateMateria({
    mutation: {
          onSuccess: () => { 
            toast({
              title: "✓ Éxito",
              description: "Información actualizada exitosamente",
              variant: "success",
            })    

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
      
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if(materia?.id) {
        mutateDpto({
          id: materia.id, 
            data: formData
        });
        
      }
  } catch (error) {
      console.error("Error updating materia:", error)
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
                <form className="space-y-6">
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
                      readOnly={!havePermissions}
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
                        readOnly={!havePermissions}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="areaId" className="text-sm font-semibold">
                        Area *
                      </Label>
                      {havePermissions ? 
                        <select
                          id="area"
                          value={formData.areaId?.toString() ?? ""}
                          onChange={(e) => setFormData((prev) => ({
                            ...prev,
                            areaId: Number(e.target.value),
                          }))}
                          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          required
                        >
                          <option value="">Seleccionar Área...</option>
                          {areas.map((area) => (
                            <option key={area.id} value={area.id}>
                              {area.nombre}
                            </option>
                          ))}
                        </select>
                        :
                        <Input
                          id="materia"
                          type="text"
                          value={materia.area}
                          className="border-border focus:border-primary"
                          readOnly
                          />
                      }
                    </div>
                  </div>


                  {havePermissions && 
                    <div className="flex gap-3 pt-4 border-t-2 border-border">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isPending}
                        className="flex-1 border-2"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isPending || !formData.nombre}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        <Save size={18} className="mr-2" />
                        {isPending ? "Guardando..." : "Guardar Cambios"}
                      </Button>
                    </div>
                  }
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
