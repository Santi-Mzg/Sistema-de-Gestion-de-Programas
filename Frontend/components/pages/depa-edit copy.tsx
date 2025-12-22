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
import type { DepartamentoResponseDTO, DepartamentoCreateDTO, UserResponseDTO, UserResponseReducedDTO } from "@/app/api/generated/model"
import { useGetDepartamento, useListUsersByDepartamento, useUpdateDepartamento, useUpdateDireccionAdministrativa } from "@/app/api/generated/client"
import { UserSelectorDialog } from "@/components/modals/user-selector-dialog"


export default function EditDepartamentoPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const departamentoQuery = useGetDepartamento(Number(id));
  const departamento: DepartamentoResponseDTO | undefined = departamentoQuery.data;

  if (departamentoQuery.isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando datos del departamento...</p>
        </div>
      </div>
    )
  }

  if (departamentoQuery.error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-600" size={24} />
          <p className="text-red-700">Error al obtener el departamento</p>
        </div>
      </div>
    )
  }

  if (!departamento || !departamento.id) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="text-yellow-600" size={24} />
          <p className="text-yellow-700">El departamento solicitado no existe o no pudo ser cargado</p>
        </div>
      </div>
    )
  }


  const [isLoading, setIsLoading] = useState(false)
  const [directorDialogOpen, setDirectorDialogOpen] = useState(false)
  const [direccionAdministrativa, setDireccionAdministrativa] = useState<UserResponseReducedDTO>()
  const [formData, setFormData] = useState<DepartamentoCreateDTO>({
        nombre: departamento.nombre,
        direccion: departamento.direccion,
        telefono: departamento.telefono,
        email: departamento.email,
        sitioWeb: departamento.sitioWeb,
  })

  const usuarios: UserResponseDTO[] = useListUsersByDepartamento(Number(id)).data || [];

  useEffect(() => {
    if(!departamento) return

    setFormData({ 
        nombre: departamento.nombre,
        direccion: departamento.direccion,
        telefono: departamento.telefono,
        email: departamento.email,
        sitioWeb: departamento.sitioWeb,
    })
    setDireccionAdministrativa(departamento.direccionAdministrativa)
  }, [departamento])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  
  const { mutate: mutateDpto, isPending: isPendingDpto } = useUpdateDepartamento({
      mutation: {
          onSuccess: () => { alert("Éxito"); },
          onError: (err: Error) => alert("Error: " + err.message)
      }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if(departamento?.id) {
        mutateDpto({
            id: departamento.id, 
            data: formData
        });
        
        alert("Departamento actualizado exitosamente")
      }
    //   router.push("/departamentos")
    } catch (error) {
      console.error("Error updating departamento:", error)
      alert("Error al actualizar el departamento")
    } finally {
      setIsLoading(false)
    }
  }

  const { mutate, isPending } = useUpdateDireccionAdministrativa({
      mutation: {
          onSuccess: () => { alert("Éxito"); },
          onError: (err: Error) => alert("Error: " + err.message)
      }
  });

  const handleDirectorChange = async (newDirector: UserResponseReducedDTO) => {
    if (!departamento?.id || !newDirector?.id) return

    setIsLoading(true)

    try {
    
      mutate({
        id: departamento.id, 
        data: { 
            usuarioId: newDirector.id 
        }
      });


      setDireccionAdministrativa(newDirector)

      alert(`Director actualizado: ${newDirector.apellido} ${newDirector.nombre}`)
    } catch (error) {
      console.error("Error updating director:", error)
      alert("Error al actualizar el director")
    } finally {
      setIsLoading(false)
    }
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
            <h1 className="text-4xl font-bold text-balance">Editar Departamento</h1>
          </div>
          <p className="text-primary-foreground/90 text-lg">Modifica la información general y gestiona el director</p>
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
                <CardDescription className="text-base">Actualiza los datos básicos del departamento</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-sm font-semibold">
                      Nombre del Departamento *
                    </Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ej: Departamento de Agronomía"
                      required
                      className="border-2 border-border focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="telefono" className="text-sm font-semibold">
                        Teléfono
                      </Label>
                      <Input
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="Ej: (0291) 459-5101"
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
                        placeholder="Ej: agronomia@uns.edu.ar"
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
                      placeholder="Ej: San Andrés 800"
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
                      type="url"
                      value={formData.sitioWeb}
                      onChange={handleChange}
                      placeholder="Ej: https://www.uns.edu.ar/agronomia"
                      className="border-2 border-border focus:border-primary"
                    />
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
              <CardHeader className="bg-linear-to-br from-primary/10 to-accent/10 border-b-2 border-primary/20">
                <CardTitle className="text-xl text-primary flex items-center gap-2">
                  <User size={22} />
                  Director Administrativo
                </CardTitle>
                <CardDescription>Gestiona el director del departamento</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {departamento?.direccionAdministrativa ? (
                  <div className="space-y-6">
                    {/* Current Director Display */}
                    <div className="bg-linear-to-br from-muted/50 to-muted/30 rounded-xl p-5 border-2 border-border">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Director Actual
                      </p>
                      <div className="flex flex-col items-center text-center gap-3">
                        {/* <Avatar className="h-20 w-20 border-4 border-primary shadow-lg">
                          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                            {getInitials(departamento?.directorAdministrativo)}
                          </AvatarFallback>
                        </Avatar> */}
                        <div>
                          <p className="font-bold text-lg text-foreground">
                            {departamento?.direccionAdministrativa.apellido} {departamento?.direccionAdministrativa.nombre}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Legajo: {departamento.direccionAdministrativa.legajo}
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
                      Cambiar Director
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-muted/30 rounded-xl p-6 text-center border-2 border-dashed border-border">
                      <User size={48} className="mx-auto text-muted-foreground mb-3 opacity-50" />
                      <p className="text-sm text-muted-foreground">No hay director asignado</p>
                    </div>
                    <Button
                      onClick={() => setDirectorDialogOpen(true)}
                      className="w-full bg-primary hover:bg-primary/90 py-6 text-base font-semibold"
                      disabled={isLoading}
                    >
                      <User size={18} className="mr-2" />
                      Asignar Director
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
        onConfirm={handleDirectorChange}
        currentUser={departamento?.direccionAdministrativa}
        availableUsers={usuarios}
        title="Seleccionar Director Administrativo"
        description="Elige un usuario para asignar como Director Administrativo"
        roleLabel="Director Actual"
        confirmLabel="Asignar Director"
        isLoading={isLoading}
      />
    </div>
  )
}
