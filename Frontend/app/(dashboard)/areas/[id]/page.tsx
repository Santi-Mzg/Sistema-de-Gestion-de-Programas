"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Save, AlertCircle, Layers, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { AreaResponseDTO, AreaCreateDTO, UserResponseDTO, UserResponseReducedDTO } from "@/app/api/generated/model"
import { getGetAreaQueryKey, useGetArea, useUpdateArea } from "@/app/api/generated/client"
import { useDept } from "@/context/dept-context"
import { useRole } from "@/context/role-context"
import { useHeader } from "@/context/header-context"
import { toast } from "@/hooks/use-toast"


export default function EditAreaPage() {
  const { activeRole } = useRole()
  const { activeDepartamento } = useDept()
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { setHeader } = useHeader()

  const havePermissions = (activeRole === 'SYSTEM_ADMIN' || activeRole === 'DIRECCION_ADMINISTRATIVA' || activeRole === 'SECRETARIA');

  const areaQuery = useGetArea(Number(id),
    {
      query: {
        staleTime: 1000 * 60 * 5,
        queryKey: getGetAreaQueryKey(Number(id))
      }
    }
  );
  const area: AreaResponseDTO | undefined = areaQuery.data;

  useEffect(() => {
    setHeader({
      title: `Área ${area?.nombre ?? ""}`,
      subtitle: " ",
      icon: Layers,
    })
  }, [area])

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<AreaCreateDTO>({
        nombre: area?.nombre,
  })

  useEffect(() => {
    if(!area) return

    setFormData({ 
        nombre: area.nombre,
    })
  }, [area, activeDepartamento])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  
    const { mutate: mutateDpto, isPending: isPendingDpto } = useUpdateArea({
        mutation: {
          onSuccess: () => { 
            toast({
              title: "✓ Éxito",
              description: "Información actualizada exitosamente",
              variant: "success",
            })    

            router.push('/areas'); 
          },
          onError: (error: Error) => {
            toast({
              title: "✗ Error",
              description: error instanceof Error ? error.message : "Error desconocido",
              variant: "destructive",
            })
        }
        }
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if(area?.id) {
        mutateDpto({
            id: area.id, 
            data: formData
        });
        
        alert("Área actualizada exitosamente")
      }
    //   router.push("/Areas")
    } catch (error) {
      console.error("Error updating Area:", error)
      alert("Error al actualizar el Area")
    } finally {
      setIsLoading(false)
    }
  }

  if (!activeDepartamento || !activeDepartamento.departamentoId || !activeRole) {
    return(
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-yellow-700">Cargando datos del área...</p>
        </div>
      </div>
    )
  }

  if (areaQuery.isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando datos del área...</p>
        </div>
      </div>
    )
  }

  if (areaQuery.error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-600" size={24} />
          <p className="text-red-700">Error al obtener el área</p>
        </div>
      </div>
    )
  }

  if (!area || !area.id) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="text-yellow-600" size={24} />
          <p className="text-yellow-700">El área solicitada no existe o no pudo ser cargada</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form - 2 columns */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-border shadow-xl">
              <CardHeader className="bg-linear-to-r from-primary/5 to-accent/5 border-b-2 border-border">
                <CardTitle className="text-2xl text-primary flex items-center gap-2">
                  Información General
                </CardTitle>
                <CardDescription className="text-base">Datos del área</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-sm font-semibold">
                      Nombre del Área *
                    </Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ej: Area de Agronomía"
                      required
                      className="border-2 border-border focus:border-primary"
                      readOnly={!havePermissions}
                    />
                  </div>

                  {havePermissions && (   
                    <div className="flex gap-3 pt-4 border-t-2 border-border">
                      <Button
                        type="submit"
                        disabled={isLoading || !formData.nombre}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        <Save size={18} className="mr-2" />
                        {isLoading ? "Guardando..." : "Guardar Cambios"}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
