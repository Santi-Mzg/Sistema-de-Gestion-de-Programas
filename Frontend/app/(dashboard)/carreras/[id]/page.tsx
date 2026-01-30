"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, User, Building2, AlertCircle, GraduationCap, FileText, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CarreraResponseDTO, CarreraCreateDTO, UserResponseDTO, UserResponseReducedDTO, CarreraPlanCreateDTO } from "@/app/api/generated/model"
import { getGetCarreraQueryKey, getListUsersDepartamentoQueryKey, useCreateCarreraPlan, useDeleteCarreraPlan, useGetCarrera, useListUsersDepartamento, useUpdateCarrera, useUpdateComision } from "@/app/api/generated/client"
import { UserSelectorDialog } from "@/components/modals/user-selector-dialog"
import { useDept } from "@/context/dept-context"
import { useRole } from "@/context/role-context"
import { toast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useHeader } from "@/context/header-context"

export default function EditCarreraPage() {
  const { activeRole } = useRole()
  const { activeDepartamento } = useDept()
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [directorDialogOpen, setDirectorDialogOpen] = useState(false)
  const [comision, setComision] = useState<UserResponseReducedDTO | undefined>()
  const [showNewPlanForm, setShowNewPlanForm] = useState(false)
  const [deletePlanId, setDeletePlanId] = useState<number | null>(null)
  const [newPlanData, setNewPlanData] = useState<CarreraPlanCreateDTO>({
    anio: "",
    version: 1,
  })

  const currentYear = new Date().getFullYear()
  const years = Array.from(
    { length: currentYear - 2000 + 1 },
    (_, i) => currentYear - i
  )

  const havePermissions = !(activeRole !== 'SYSTEM_ADMIN' && activeRole !== 'DIRECCION_ADMINISTRATIVA' && activeRole !== 'SECRETARIA' && activeRole !== 'ADMINISTRACION')
  
  const carreraQuery = useGetCarrera(Number(id),
    {
      query: {
        staleTime: 1000 * 60 * 5,
        queryKey: getGetCarreraQueryKey(Number(id))
      }
    }
  );
  const carrera: CarreraResponseDTO | undefined = carreraQuery.data;

  const { setHeader } = useHeader()

  useEffect(() => {
    setHeader({
      title: `${carrera?.nombre ?? ""}`,
      subtitle: " ",
      icon: GraduationCap,
    })
  }, [carrera])

  const [formData, setFormData] = useState<CarreraCreateDTO>({
    nombre: carrera?.nombre,
    duracion: carrera?.duracion,
    planAnio: carrera?.planes?.[0].anio,
    planVersion: carrera?.planes?.[0].version,
  })
  
  const deptId = activeDepartamento?.departamentoId || 0;

  const { data: usuarios = [], isLoading: isLoadingUsuarios } = useListUsersDepartamento(deptId, {
    query: {
      enabled: (activeRole === 'SYSTEM_ADMIN' || activeRole === 'DIRECCION_ADMINISTRATIVA' || activeRole === 'SECRETARIA' || activeRole === 'ADMINISTRACION'),
      queryKey: getListUsersDepartamentoQueryKey(deptId)
    },
  })


  useEffect(() => {
    if(!carrera) return

    setFormData({ 
        nombre: carrera.nombre,
        duracion: carrera.duracion,
    })

    setComision(carrera.comision)
  }, [carrera, activeDepartamento])

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
      if(carrera?.id) {
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
          onSuccess: () => {
            toast({
              title: "✓ Éxito",
              description: `Coordinación de la Comisión Curricular actualizada exitosamente`,
              variant: "success",
            })
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
    } catch (error) {
      console.error("Error updating comision:", error)
    } finally {
      setIsLoading(false)
    }
  }

    const { mutate: createPlan, isPending: isCreatingPlan } = useCreateCarreraPlan({
    mutation: {
      onSuccess: () => {
        toast({
          title: "✓ Éxito",
          description: "Plan creado exitosamente",
          variant: "success",
        })
        setNewPlanData({ anio: "", version: 1 })
        setShowNewPlanForm(false)
        queryClient.invalidateQueries({ queryKey: getGetCarreraQueryKey(Number(id)) })
      },
      onError: (error: Error) => {
        toast({
          title: "✗ Error",
          description: error.message || "Error al crear el plan",
          variant: "destructive",
        })
      },
    },
  })

  const { mutate: deletePlan, isPending: isDeletingPlan } = useDeleteCarreraPlan({
    mutation: {
      onSuccess: () => {
        toast({
          title: "✓ Éxito",
          description: "Plan eliminado exitosamente",
          variant: "success",
        })
        setDeletePlanId(null)
        queryClient.invalidateQueries({ queryKey: getGetCarreraQueryKey(Number(id)) })
      },
      onError: (error: Error) => {
        toast({
          title: "✗ Error",
          description: error.message || "Error al eliminar el plan",
          variant: "destructive",
        })
      },
    },
  })

  const handleNewPlanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewPlanData((prev) => ({
      ...prev,
      [name]: name === "version" ? Number(value) : value,
    }))
  }

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!carrera?.id) return
    createPlan({
      id: carrera.id,
      data: newPlanData,
    })
  }

  const handleDeletePlan = () => {
    if (!carrera?.id || !deletePlanId) return
    deletePlan({
      id: deletePlanId,
    })
  }


  if (!activeDepartamento || !activeDepartamento.departamentoId || !activeRole) {
    return(
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-yellow-700">Cargando datos de la carrera...</p>
        </div>
      </div>
    )
  }


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


  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form - 2 columns */}
          <div className="lg:col-span-2">
            <Card className="mb-6 border-2 border-border shadow-xl">
              <CardHeader className="bg-linear-to-r from-primary/5 to-accent/5 border-b-2 border-border">
                <CardTitle className="text-2xl text-primary flex items-center gap-2">
                  Información General
                </CardTitle>
                <CardDescription className="text-base">Datos de la carrera</CardDescription>
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
                      readOnly={!havePermissions}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duracion" className="text-sm font-semibold">
                      Duración
                    </Label>
                    <Input
                      id="duracion"
                      name="duracion"
                      type="text"
                      value={formData.duracion}
                      onChange={handleChange}
                      placeholder="Ej: 10 Cuat."
                      className="border-2 border-border focus:border-primary"
                      readOnly={!havePermissions}
                    />
                  </div>     

                  {(activeRole === 'SYSTEM_ADMIN' || activeRole === 'DIRECCION_ADMINISTRATIVA' || activeRole === 'SECRETARIA' || activeRole === 'ADMINISTRACION') &&
                    <div className="flex gap-3 pt-4 border-t-2 border-border">
                      <Button
                        type="submit"
                        disabled={isLoading || !formData.nombre}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        <Save size={18} className="mr-2" />
                        {isLoading ? "Guardando..." : "Guardar Datos"}
                      </Button>
                    </div>
                  }
                </form>
              </CardContent>
            </Card>
          <Card className="mb-6 border-2 border-border shadow-xl">
              <CardHeader className="bg-linear-to-r from-primary/5 to-accent/5 border-b-2 border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-primary flex items-center gap-2">
                      <FileText size={16} />
                      Planes de la Carrera
                    </CardTitle>
                    {/* <CardDescription className="text-base">Gestión de planes de la carrera</CardDescription> */}
                  </div>
                  {havePermissions && !showNewPlanForm && (
                    <Button
                      onClick={() => setShowNewPlanForm(true)}
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus size={16} className="mr-1" />
                      Nuevo Plan
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {showNewPlanForm && (
                  <div className="border-2 border-primary/30 rounded-lg p-4 bg-primary/5">
                    <h3 className="text-lg font-semibold mb-4 text-primary">Crear Nuevo Plan</h3>
                    <form onSubmit={handleCreatePlan} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">
                            Plan *
                          </Label>
                          <Select
                            value={newPlanData.anio}
                            onValueChange={(value) =>
                              setNewPlanData((prev) => ({ ...prev, anio: value }))
                            }
                          >
                            <SelectTrigger className="border-2 border-border focus:border-primary">
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
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="version" className="text-sm font-semibold">
                            Versión *
                          </Label>
                          <Input
                            id="version"
                            name="version"
                            type="number"
                            value={newPlanData.version}
                            onChange={(e) =>
                              setNewPlanData((prev) => ({ ...prev, version: Number.parseInt(e.target.value) }))
                            }
                            placeholder="Ej: 1"
                            required
                            min="1"
                            className="border-2 border-border focus:border-primary"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          type="submit"
                          disabled={isCreatingPlan || !newPlanData.anio}
                          className="flex-1 bg-primary hover:bg-primary/90"
                        >
                          {isCreatingPlan ? "Creando..." : "Crear Plan"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowNewPlanForm(false)
                            setNewPlanData({ anio: "", version: 1 })
                          }}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-3">
                  {carrera.planes && carrera.planes.length > 0 ? (
                    carrera.planes.map((plan) => (
                      <div
                        key={plan.id}
                        className="flex items-center justify-between p-4 border-2 border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <FileText size={20} className="text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              Plan {plan.anio} - Versión {plan.version}
                            </p>
                          </div>
                        </div>
                        {havePermissions && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeletePlanId(plan.id!)}
                            className="hover:bg-destructive/90"
                          >
                            <Trash2 size={16} className="mr-1" />
                            Eliminar
                          </Button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                      <FileText size={48} className="mx-auto mb-2 opacity-30" />
                      <p>No hay planes de estudio registrados</p>
                      {havePermissions && <p className="text-sm mt-1">Crea el primer plan usando el botón superior</p>}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Director Card - 1 column */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-primary/30 shadow-xl sticky top-8">
              <CardHeader className="bg-linear-to-br from-primary/10 to-accent/10 border-b-2 border-primary/20">
                <CardTitle className="text-xl text-primary flex items-center gap-2">
                  <User size={22} />
                  Comisión Curricular
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {comision ? (
                  <div className="space-y-6">
                    {/* Current Director Display */}
                    <div className="bg-linear-to-br from-muted/50 to-muted/30 rounded-xl p-5 border-2 border-border">
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
                            {comision.apellido} {comision.nombre}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Legajo: {comision.legajo}
                          </p>
                        </div>
                      </div>
                    </div>

                    {(activeRole === 'SYSTEM_ADMIN' || activeRole === 'DIRECCION_ADMINISTRATIVA' || activeRole === 'SECRETARIA') && (
                      <Button
                        onClick={() => setDirectorDialogOpen(true)}
                        className="w-full bg-primary hover:bg-primary/90 py-6 text-base font-semibold"
                        disabled={isLoading}
                      >
                        <User size={18} className="mr-2" />
                        Cambiar Comisión
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-muted/30 rounded-xl p-6 text-center border-2 border-dashed border-border">
                      <User size={48} className="mx-auto text-muted-foreground mb-3 opacity-50" />
                      <p className="text-sm text-muted-foreground">No hay comisión asignada</p>
                    </div>
                    {(activeRole === 'SYSTEM_ADMIN' || activeRole === 'DIRECCION_ADMINISTRATIVA' || activeRole === 'SECRETARIA' || activeRole === 'ADMINISTRACION') && (
                      <Button
                        onClick={() => setDirectorDialogOpen(true)}
                        className="w-full bg-primary hover:bg-primary/90 py-6 text-base font-semibold"
                        disabled={isLoading}
                      >
                        <User size={18} className="mr-2" />
                        Asignar Comisión
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {havePermissions && 
        <UserSelectorDialog
          open={directorDialogOpen}
          onOpenChange={setDirectorDialogOpen}
          onConfirm={handleComisionChange}
          currentUser={carrera?.comision}
          availableUsers={usuarios}
          title="Seleccionar Comisión"
          description="Elige un usuario para asignar como Coordinador/a de la Comisión Curricular"
          roleLabel="Comisión Actual"
          confirmLabel="Asignar Comisión"
          isLoading={isLoading || isPending || isLoadingUsuarios}
        />
      }

      {havePermissions && (
      <Dialog open={!!deletePlanId} onOpenChange={(open: any) => !open && setDeletePlanId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle /> Confirmar Eliminación
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              ¿Estás seguro de que deseas eliminar este plan? 
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-destructive/10 border-2 border-destructive/20 rounded-lg p-4 my-4">
            <p className="text-sm text-foreground">
              <strong>Advertencia: </strong>
              Esta acción puede eliminar programas que estén vinculados únicamente a este plan.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeletePlanId(null)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              disabled={isDeletingPlan}
              onClick={() => deletePlan({ id: deletePlanId! })}
            >
              {isDeletingPlan ? "Eliminando..." : "Eliminar Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}
    </div>
  )
}
