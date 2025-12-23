"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Building2, AlertCircle, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { AreaResponseDTO, AreaCreateDTO, UserResponseDTO, UserResponseReducedDTO } from "@/app/api/generated/model"
import { useGetArea, useUpdateArea } from "@/app/api/generated/client"
import { useDept } from "@/context/dept-context"
import { useRole } from "@/context/role-context"


export default function EditAreaPage() {
  const { activeRole } = useRole()
  const { activeDepartamento } = useDept()
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const areaQuery = useGetArea(Number(id));
  const area: AreaResponseDTO | undefined = areaQuery.data;

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<AreaCreateDTO>({
        nombre: area?.nombre,
        departamentoId: activeDepartamento?.departamentoId,
  })

  useEffect(() => {
    if(!area) return

    setFormData({ 
        nombre: area.nombre,
        departamentoId: activeDepartamento?.departamentoId,
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
            onSuccess: () => { alert("Éxito"); },
            onError: (err: Error) => alert("Error: " + err.message)
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
            <Layers size={40} />
            <h1 className="text-4xl font-bold text-balance">Área {area?.nombre}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form - 2 columns */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-border shadow-xl">
              <CardHeader className="bg-linear-to-r from-primary/5 to-accent/5 border-b-2 border-border">
                <CardTitle className="text-2xl text-primary flex items-center gap-2">
                  <Building2 size={24} />
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
                    />
                  </div>

                  {(activeRole === 'SYSTEM_ADMIN' || activeRole === 'DIRECCION_ADMINISTRATIVA' || activeRole === 'SECRETARIA') && (   
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
