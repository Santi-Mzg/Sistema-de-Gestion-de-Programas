"use client"
import { invalidarCoordinacionArea, invalidarCambioArea } from "@/lib/invalidacion-consultas";

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Save, AlertCircle, Layers, Building2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { AreaResponseDTO, AreaCreateDTO, UserResponseDTO, UserResponseReducedDTO } from "@/app/api/generated/model"
import {
  getGetAreaQueryKey,
  useGetArea,
  useUpdateArea,
  getCandidatosQueryKey,
  useAsignarCoordinador,
  useCandidatos,
  useListUsersDepartamento,
} from "@/app/api/generated/client";
import { useDept } from "@/context/dept-context"
import { useRole } from "@/context/role-context"
import { useHeader } from "@/context/header-context"
import { toast } from "@/hooks/use-toast"
import axios from "axios"
import { useQueryClient } from "@tanstack/react-query";



import { UserSelectorDialog } from '@/components/modals/user-selector-dialog';

export default function EditAreaPage() {
  const { activeRole } = useRole()
  const { activeDepartamento } = useDept()
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient();


  const { setHeader } = useHeader()

  const [selectorOpen, setSelectorOpen] = useState(false);
  const deptId = activeDepartamento?.departamentoId ?? 0;
  const havePermissions = activeRole === 'SYSTEM_ADMIN' || activeRole === 'DIRECCION_ADMINISTRATIVA' || activeRole === 'SECRETARIA';
  const asignacion = useAsignarCoordinador();
  const candidatosParams = { rolActivo: activeRole! };
  const candidatos = useCandidatos(deptId, candidatosParams, { query: {
    enabled: !!deptId && havePermissions,
    queryKey: getCandidatosQueryKey(deptId, candidatosParams),
  } });
  const asignar = async (usuarioId: number | null) => {
    if (!deptId || !activeRole || !havePermissions) return;
    try {
      await asignacion.mutateAsync({ deptId, id: Number(id), params: { rolActivo: activeRole }, data: usuarioId === null ? {} : { usuarioId } });
      await invalidarCoordinacionArea(queryClient, deptId, Number(id));
      toast({ title: '✓ Éxito', description: usuarioId ? 'Coordinación asignada' : 'Coordinación desasignada', variant: 'success' });
    } catch (error) {
      toast({ title: '✗ Error', description: axios.isAxiosError(error) ? error.response?.data?.errors?.Error ?? 'No se pudo actualizar la coordinación' : 'No se pudo actualizar la coordinación', variant: 'destructive' });
    }
  };


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

  const [previousFormSources, setPreviousFormSources] = useState<[typeof area, typeof activeDepartamento] | null>(null)
  if (previousFormSources === null || previousFormSources[0] !== area || previousFormSources[1] !== activeDepartamento) {
    setPreviousFormSources([area, activeDepartamento])
    if (area) {

      setFormData({
          nombre: area.nombre,
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

    const { mutate: mutateDpto, isPending } = useUpdateArea({
        mutation: {
          onSuccess: () => {
            toast({
              title: "✓ Éxito",
              description: "Información actualizada exitosamente",
              variant: "success",
            })

            void invalidarCambioArea(queryClient, { departamentoId: activeDepartamento?.departamentoId, areaId: Number(id) });

            router.push('/areas');
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
      if(area?.id) {
        mutateDpto({
            id: area.id,
            data: formData
        });

      }
    //   router.push("/Areas")
    } catch (error) {
      console.error("Error updating Area:", error)
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
                  Información general
                </CardTitle>
                <CardDescription className="text-base">Datos del área</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-sm font-semibold">
                      Nombre del área *
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
                        type="button"
                        onClick={handleSubmit}
                        disabled={isPending || !formData.nombre}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        <Save size={18} className="mr-2" />
                        {isPending ? "Guardando..." : "Guardar cambios"}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
          {/* Coordinación de Área - 1 columna */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-primary/30 shadow-xl sticky top-8">
              <CardHeader className="bg-linear-to-br from-primary/10 to-accent/10 border-b-2 border-primary/20">
                <CardTitle className="text-xl text-primary flex items-center gap-2">
                  <User size={22} />
                  Coordinación de área
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {area.coordinador ? (
                  <div className="space-y-6">
                    {/* Current Director Display */}
                    <div className="bg-linear-to-br from-muted/50 to-muted/30 rounded-xl p-5 border-2 border-border">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Coordinador actual
                      </p>
                      <div className="flex flex-col items-center text-center gap-3">
                        <div>
                          <p className="font-bold text-lg text-foreground">
                            {area.coordinador.apellido} {area.coordinador.nombre}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Legajo: {area.coordinador.legajo}
                          </p>
                        </div>
                      </div>
                    </div>

                    {havePermissions && (
                      <div className="space-y-3"><Button
                        onClick={() => setSelectorOpen(true)}
                        className="w-full bg-primary hover:bg-primary/90 py-6 text-base font-semibold"
                        disabled={asignacion.isPending}
                      >
                        <User size={18} className="mr-2" />
                        {asignacion.isPending ? "Asignando..." : "Cambiar coordinador"}
                      </Button>
                      <Button variant="outline" className="w-full py-6 text-base font-semibold" onClick={() => asignar(null)} disabled={asignacion.isPending}>Desasignar coordinador</Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-muted/30 rounded-xl p-6 text-center border-2 border-dashed border-border">
                      <User size={48} className="mx-auto text-muted-foreground mb-3 opacity-50" />
                      <p className="text-sm text-muted-foreground">No hay coordinador asignado</p>
                    </div>
                    {havePermissions && (
                      <Button
                        onClick={() => setSelectorOpen(true)}
                        className="w-full bg-primary hover:bg-primary/90 py-6 text-base font-semibold"
                        disabled={asignacion.isPending}
                      >
                        <User size={18} className="mr-2" />
                        {asignacion.isPending ? "Asignando..." : "Asignar coordinador"}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        {havePermissions && <UserSelectorDialog open={selectorOpen} onOpenChange={setSelectorOpen}
          onConfirm={usuario => { if (usuario.id) void asignar(usuario.id); }} currentUser={area.coordinador}
          availableUsers={candidatos.data} title="Seleccionar coordinador de área"
          description="Elige un usuario del departamento para asignar la coordinación del área"
          roleLabel="Coordinador actual" confirmLabel="Asignar coordinador" isLoading={candidatos.isLoading || asignacion.isPending} />}
      </div>
    </div>
  )
}
