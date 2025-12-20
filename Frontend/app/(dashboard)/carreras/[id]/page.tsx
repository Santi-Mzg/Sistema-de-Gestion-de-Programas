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
import type { CarreraResponseDTO, CarreraCreateDTO, UserResponseDTO, UserResponseReducedDTO } from "@/app/api/generated/model"
import { useGetCarrera, useListUsersByDepartamento, useUpdateCarrera, useUpdateComision } from "@/app/api/generated/client"
import { UserSelectorDialog } from "@/components/modals/user-selector-dialog"
import { useDept } from "@/context/dept-context"


export default function EditCarreraPage() {
  const { activeDepartamento } = useDept()

  if (!activeDepartamento || !activeDepartamento.departamentoId) {
    return(
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-yellow-700">Cargando departamento...</p>
        </div>
      </div>
    )
  }

  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const carreraQuery = useGetCarrera(Number(id));
  const carrera: CarreraResponseDTO | undefined = carreraQuery.data;

if (carreraQuery.isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando datos de la carrera...</p>
        </div>
      </div>
    )
  }

  if (carreraQuery.error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-600" size={24} />
          <p className="text-red-700">Error al obtener la carrera</p>
        </div>
      </div>
    )
  }

  if (!carrera || !carrera.id) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="text-yellow-600" size={24} />
          <p className="text-yellow-700">La carrera solicitada no existe o no pudo ser cargada</p>
        </div>
      </div>
    )
  }

  const [isLoading, setIsLoading] = useState(false)
  const [directorDialogOpen, setDirectorDialogOpen] = useState(false)
  const [comision, setComision] = useState<UserResponseReducedDTO>()
  const [formData, setFormData] = useState<CarreraCreateDTO>({
        nombre: carrera.nombre,
        plan: carrera.plan,
        duracion: carrera.duracion,
        departamentoId: activeDepartamento.departamentoId,
  })

  const usuarios: UserResponseDTO[] = useListUsersByDepartamento(Number(id)).data || [];

  useEffect(() => {
    if(!carrera) return

    setFormData({ 
        nombre: carrera.nombre,
        plan: carrera.plan,
        duracion: carrera.duracion,
        departamentoId: activeDepartamento.departamentoId,
    })
    setComision(carrera.comision)
  }, [carrera])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  
  const { mutate: mutateDpto, isPending: isPendingDpto } = useUpdateCarrera({
      mutation: {
          onSuccess: () => { alert("Éxito"); },
          onError: (err: Error) => alert("Error: " + err.message)
      }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if(carrera.id) {
        mutateDpto({
            id: carrera.id, 
            data: formData
        });
        
        alert("Carrera actualizado exitosamente")
      }
    //   router.push("/Carreras")
    } catch (error) {
      console.error("Error updating Carrera:", error)
      alert("Error al actualizar el Carrera")
    } finally {
      setIsLoading(false)
    }
  }

    const { mutate, isPending } = useUpdateComision({
        mutation: {
            onSuccess: () => { alert("Éxito"); },
            onError: (err: Error) => alert("Error: " + err.message)
        }
    });

  const handleComisionChange = async (newComision: UserResponseReducedDTO) => {
    if (!carrera?.id || !newComision?.id) return

    setIsLoading(true)

    try {
    
      mutate({
        id: carrera.id, 
        data: { 
            comisionId: newComision.id 
        }
      });


      setComision(newComision)

      alert(`Comisión actualizada: ${newComision.apellido} ${newComision.nombre}`)
    } catch (error) {
      console.error("Error updating comision:", error)
      alert("Error al actualizar el comision")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground p-8 shadow-lg border-b-4 border-primary/20">
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
            <h1 className="text-4xl font-bold text-balance">Editar Carrera</h1>
          </div>
          <p className="text-primary-foreground/90 text-lg">Modifica la información general y gestiona la comisión</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form - 2 columns */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-border shadow-xl">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b-2 border-border">
                <CardTitle className="text-2xl text-primary flex items-center gap-2">
                  <Building2 size={24} />
                  Información General
                </CardTitle>
                <CardDescription className="text-base">Actualiza los datos básicos de la carrera</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-sm font-semibold">
                      Nombre de la Carrera *
                    </Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ej: Abogacía"
                      required
                      className="border-2 border-border focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="plan" className="text-sm font-semibold">
                        Plan
                      </Label>
                      <Input
                        id="plan"
                        name="plan"
                        value={formData.plan}
                        onChange={handleChange}
                        placeholder="Ej: Plan 2025 - Versión 1"
                        className="border-2 border-border focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duracion" className="text-sm font-semibold">
                        Email
                      </Label>
                      <Input
                        id="duracion"
                        name="duracion"
                        type="text"
                        value={formData.duracion}
                        onChange={handleChange}
                        placeholder="Ej: 10 Cuat."
                        className="border-2 border-border focus:border-primary"
                      />
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

          {/* Director Card - 1 column */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-primary/30 shadow-xl sticky top-8">
              <CardHeader className="bg-gradient-to-br from-primary/10 to-accent/10 border-b-2 border-primary/20">
                <CardTitle className="text-xl text-primary flex items-center gap-2">
                  <User size={22} />
                  Comisión Curricular
                </CardTitle>
                <CardDescription>Gestiona la comisión curricular de la carrera</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {carrera?.comision ? (
                  <div className="space-y-6">
                    {/* Current Director Display */}
                    <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-5 border-2 border-border">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Comisión Actual
                      </p>
                      <div className="flex flex-col items-center text-center gap-3">
                        {/* <Avatar className="h-20 w-20 border-4 border-primary shadow-lg">
                          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                            {getInitials(Carrera?.directorAdministrativo)}
                          </AvatarFallback>
                        </Avatar> */}
                        <div>
                          <p className="font-bold text-lg text-foreground">
                            {carrera?.comision.apellido} {carrera?.comision.nombre}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Legajo: {carrera?.comision.legajo}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Change Director Button */}
                    <Button
                      onClick={() => setDirectorDialogOpen(true)}
                      className="w-full bg-primary hover:bg-primary/90 py-6 text-base font-semibold"
                      disabled={isLoading}
                    >
                      <User size={18} className="mr-2" />
                      Cambiar Comisión
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-muted/30 rounded-xl p-6 text-center border-2 border-dashed border-border">
                      <User size={48} className="mx-auto text-muted-foreground mb-3 opacity-50" />
                      <p className="text-sm text-muted-foreground">No hay comisión asignada</p>
                    </div>
                    <Button
                      onClick={() => setDirectorDialogOpen(true)}
                      className="w-full bg-primary hover:bg-primary/90 py-6 text-base font-semibold"
                      disabled={isLoading}
                    >
                      <User size={18} className="mr-2" />
                      Asignar Comisión
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Director Selection Modal */}
      <UserSelectorDialog
        open={directorDialogOpen}
        onOpenChange={setDirectorDialogOpen}
        onConfirm={handleComisionChange}
        currentUser={carrera?.comision}
        availableUsers={usuarios}
        title="Seleccionar Comisión"
        description="Elige un usuario para asignar como Comisión"
        roleLabel="Comisión Actual"
        confirmLabel="Asignar Comisión"
        isLoading={isLoading}
      />
    </div>
  )
}
