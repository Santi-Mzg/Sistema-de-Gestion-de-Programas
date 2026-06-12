"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Trash2, Eye, Plus, GraduationCap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CarreraResponseDTO, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"
import { Button } from "../ui/button"
import { getGetCarreraQueryKey, getListCarrerasDepartamentoQueryKey, useDeleteCarrera } from "@/app/api/generated/client"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useRole } from "@/context/role-context"
import { toast } from "@/hooks/use-toast"
import { useHeader } from "@/context/header-context"
import { useDept } from "@/context/dept-context"
import axios from "axios"
import { useQueryClient } from "@tanstack/react-query";


interface CarrerasListProps {
  carreras?: CarreraResponseDTO[]
}


export function CarrerasList({ carreras = [] }: CarrerasListProps) {
  const { setHeader } = useHeader()
  const { activeRole } = useRole()
  const { activeDepartamento } = useDept()
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCarrera, setSelectedCarrera] = useState<CarreraResponseDTO | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient();


  useEffect(() => {
    if(activeRole === UsuarioDepartamentoDTORolesItem.COORDINACION_COMISION_CURRICULAR) {
      setHeader({
        title: `Carreras Asignadas`,
        subtitle: "Consulta las carreras asignadas como coordinador/a de comisiones curriculares",
        icon: GraduationCap,
      })
    } else {
      setHeader({
        title: `Carreras Departamentales`,
        subtitle: "Gestiona y consulta todas las carreras del departamento",
        icon: GraduationCap,
      })
    }
  }, [])

  // Filter and sort data
  const filteredCarreras = useMemo(() => {
    if(activeRole === UsuarioDepartamentoDTORolesItem.COORDINACION_COMISION_CURRICULAR) {
      return carreras.filter(carrera => 
        activeDepartamento?.carrerasComoComision?.includes(carrera.nombre!)
      )
    }
    else {
      const filtered = carreras.filter((carrera) => {
        return (
          !searchTerm ||
          carrera.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })

      return filtered
    }
  }, [carreras, searchTerm])


  const handleDeleteClick = (carrera: CarreraResponseDTO) => {
    setSelectedCarrera(carrera)
    setDeleteDialogOpen(true)
  }


  const { mutate, isPending } = useDeleteCarrera({
    mutation: {
        onSuccess: (_, variables) => {
          toast({
            title: "✓ Éxito",
            description: "Carrera eliminada exitosamente",
            variant: "success",
          })

          queryClient.invalidateQueries({
            queryKey: getListCarrerasDepartamentoQueryKey(
              activeDepartamento!.departamentoId!
            ),
          });

          queryClient.removeQueries({
            queryKey: getGetCarreraQueryKey(variables.id)
          });
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

  const handleDeleteConfirm = async () => {
    if (!selectedCarrera?.id) return

    setIsSubmitting(true)
    try {

      mutate({ id: selectedCarrera.id });

      setDeleteDialogOpen(false)
      setSelectedCarrera(null)
    } catch (error) {
      console.error("Error deleting carrera:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!activeRole) {
    return(
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-yellow-700">Cargando datos de las carreras...</p>
        </div>
      </div>
    )
  }


  return (
    <div className="w-full bg-background">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Search and Filters Section */}
        {activeRole !== UsuarioDepartamentoDTORolesItem.COORDINACION_COMISION_CURRICULAR && (
          <>
            <div className="mb-8 flex md:flex-row md:items-center md:justify-between gap-4">
              {/* Search Bar */}
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-3 text-base border-2 border-border rounded-xl"
                />
              </div>
              {(activeRole === UsuarioDepartamentoDTORolesItem.ADMINISTRACION || 
                  activeRole === UsuarioDepartamentoDTORolesItem.SECRETARIA || 
                  activeRole === UsuarioDepartamentoDTORolesItem.DIRECCION_ADMINISTRATIVA || 
                  activeRole === UsuarioDepartamentoDTORolesItem.SYSTEM_ADMIN) &&
                <Button size="lg"
                        variant="outline"
                        onClick={() => router.push(`/carreras/crear`)}
                        className="border-2 hover:bg-primary hover:text-primary-foreground">
                  <Plus size={16} className="mr-1" />
                  Crear Carrera
                </Button>
              }
            </div>

            {/* Results Count */}
            <div className="mb-4 text-sm text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground">{filteredCarreras.length}</span> de{" "}
              <span className="font-semibold text-foreground">{carreras.length}</span> carrera{carreras.length === 1 ? "" : "s"}
            </div>
          </>
        )}

        {/* Table */}
        <div className="overflow-x-auto border-2 border-border rounded-xl shadow-sm">
          <table className="w-full border-collapse">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-6 py-4 text-left">
                    Nombre
                </th>
                <th className="px-6 py-4 text-left">
                    Duración
                </th>
                {/* <th className="px-6 py-4 text-left">
                    Cantidad de Materias
                </th> */}
                <th className="px-6 py-4 text-left">
                    Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCarreras.length > 0 ? (
                filteredCarreras.map((carrera) => (
                  <tr
                    key={carrera.id}
                    className="hover:bg-muted transition-colors border-b border-border last:border-b-0"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">{carrera.nombre}</td>
                    <td className="px-6 py-4 text-foreground/80">{carrera.duracion}</td>
                    {/* <td className="px-6 py-4 text-foreground/80">{carrera.cantidadMaterias}</td> */}

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/carreras/${carrera.id}`)}
                          className="border-2 hover:bg-primary hover:text-primary-foreground"
                        >
                          <Eye size={16} className="mr-1" />
                          Ver
                        </Button>
                        {(activeRole === UsuarioDepartamentoDTORolesItem.ADMINISTRACION || 
                          activeRole === UsuarioDepartamentoDTORolesItem.SECRETARIA || 
                          activeRole === UsuarioDepartamentoDTORolesItem.DIRECCION_ADMINISTRATIVA || 
                          activeRole === UsuarioDepartamentoDTORolesItem.SYSTEM_ADMIN) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(carrera)}
                            className="border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 size={16} className="mr-1" />
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Search size={48} className="opacity-40" />
                      <p className="text-lg font-medium">No se encontraron carreras</p>
                      {(activeRole === UsuarioDepartamentoDTORolesItem.ADMINISTRACION || 
                        activeRole === UsuarioDepartamentoDTORolesItem.SECRETARIA || 
                        activeRole === UsuarioDepartamentoDTORolesItem.DIRECCION_ADMINISTRATIVA || 
                        activeRole === UsuarioDepartamentoDTORolesItem.SYSTEM_ADMIN) &&
                        <Link href="/carreras/crear">
                          <Button>Crear Carrera</Button>
                        </Link>
                      }
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(activeRole === 'SYSTEM_ADMIN' || activeRole === 'DIRECCION_ADMINISTRATIVA' || activeRole === 'SECRETARIA' || activeRole === 'ADMINISTRACION') && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-destructive flex items-center gap-2">
                <Trash2 size={24} />
                Confirmar Eliminación
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                ¿Estás seguro de que deseas eliminar la carrera{" "}
                <span className="font-semibold text-foreground">"{selectedCarrera?.nombre}"</span>?
              </DialogDescription>
            </DialogHeader>

            <div className="bg-destructive/10 border-2 border-destructive/20 rounded-lg p-4 my-4">
              <p className="text-sm text-foreground">
                Esta acción no se puede deshacer. Se eliminarán todos los datos asociados a la carrera.
              </p>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isSubmitting}
                className="border-2"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="bg-destructive"
              >
                {isSubmitting ? "Eliminando..." : "Eliminar carrera"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
