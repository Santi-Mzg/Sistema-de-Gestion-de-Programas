"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Trash2, Eye, GraduationCap } from "lucide-react"
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
import { PageNavigation } from "../nav/page-nav"


interface CarrerasListProps {
  carreras?: CarreraResponseDTO[]
  page: number
  pageSize: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
}


export function CarrerasList({ 
  carreras = [],
  page,
  pageSize,
  totalPages,
  totalElements,
  onPageChange  
 }: CarrerasListProps) {
  const { setHeader } = useHeader()
  const { activeRole } = useRole()
  const { activeDepartamento } = useDept()
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


  const sortedCarreras = useMemo(() => {
    const sorted = carreras.sort((a, b) => {
      const aValue = a.nombre ?? ""
      const bValue = b.nombre ?? ""

      return aValue.localeCompare(bValue)
    })

    return sorted
  }, [carreras])



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
          <div className="mb-4 text-sm text-muted-foreground">
              {sortedCarreras.length > 0 && (
                <span>
                  Mostrando{" "}
                  <span className="font-medium text-foreground">
                    {page * pageSize + 1}
                  </span>
                  {" – "}
                  <span className="font-medium text-foreground">
                    {Math.min((page + 1) * pageSize, totalElements)}
                  </span>
                  {" de "}
                  <span className="font-medium text-foreground">
                    {totalElements}
                  </span>{" "}
                  carreras
                </span>
              )}
          </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-xl shadow-sm">
          <table className="w-full border-collapse">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">
                    Nombre
                </th>
                <th className="px-3 py-2 text-left font-semibold">
                    Duración
                </th>
                {/* <th className="px-3 py-2 text-left font-semibold">
                    Cantidad de Materias
                </th> */}
                <th className="px-3 py-2 text-left font-semibold w-40">
                    Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedCarreras.length > 0 ? (
                sortedCarreras.map((carrera) => (
                  <tr
                    key={carrera.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-1.5 font-medium text-foreground">{carrera.nombre}</td>
                    <td className="px-3 py-1.5 text-foreground/80">{carrera.duracion}</td>
                    {/* <td className="px-3 py-2 text-foreground/80">{carrera.cantidadMaterias}</td> */}

                    <td className="px-3 py-1.5">
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
                  <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
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
          <PageNavigation 
            page={page}   
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={onPageChange}
            itemLabel = "carreras"
          />
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
