"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Edit2, Trash2, Layers } from "lucide-react"
import { AreaResponseDTO, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"
import { Button } from "../ui/button"
import { getGetAreaQueryKey, getListAreasDepartamentoQueryKey, useDeleteArea } from "@/app/api/generated/client"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useRole } from "@/context/role-context"
import { toast } from "@/hooks/use-toast"
import { useHeader } from "@/context/header-context"
import axios from "axios"
import { useDept } from "@/context/dept-context"
import { useQueryClient } from "@tanstack/react-query";
import { PageNavigation } from "../nav/page-nav"

interface AreasListProps {
  areas?: AreaResponseDTO[]
  page: number
  pageSize: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
}


export function AreasList({ 
  areas = [],
  page,
  pageSize,
  totalPages,
  totalElements,
  onPageChange  
}: AreasListProps) {
  const { setHeader } = useHeader()
  const { activeRole } = useRole()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedArea, setSelectedArea] = useState<AreaResponseDTO | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { activeDepartamento } = useDept()
  const queryClient = useQueryClient();



  const hasPermission = (activeRole === UsuarioDepartamentoDTORolesItem.DIRECCION_ADMINISTRATIVA || 
                          activeRole === UsuarioDepartamentoDTORolesItem.SECRETARIA ||
                          activeRole === UsuarioDepartamentoDTORolesItem.SYSTEM_ADMIN)

  useEffect(() => {
    setHeader({
      title: `Áreas Departamentales`,
      subtitle: "Gestiona y consulta todas las áreas del departamento",
      icon: Layers,
    })
  }, [])

  const handleDeleteClick = (area: AreaResponseDTO) => {
    setSelectedArea(area)
    setDeleteDialogOpen(true)
  }

  const sortedAreas = useMemo(() => {
    const sorted = areas.sort((a, b) => {
      const aValue = a.nombre ?? ""
      const bValue = b.nombre ?? ""

      return aValue.localeCompare(bValue)
    })

    return sorted
  }, [areas])



  const { mutate, isPending } = useDeleteArea({
    mutation: {
        onSuccess: (_, variables) => {
          toast({
            title: "✓ Éxito",
            description: "Área eliminada exitosamente",
            variant: "success",
          })

          queryClient.invalidateQueries({
            queryKey: getListAreasDepartamentoQueryKey(
              activeDepartamento!.departamentoId!
            ),
          });

          queryClient.removeQueries({
            queryKey: getGetAreaQueryKey(variables.id)
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
    if (!selectedArea?.id) return

    setIsSubmitting(true)
    try {

      mutate({ id: selectedArea.id });

      setDeleteDialogOpen(false)
      setSelectedArea(null)
    } catch (error) {
      console.error("Error deleting area:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!activeRole) {
    return(
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-yellow-700">Cargando datos de las áreas...</p>
        </div>
      </div>
    )
  }


  return (
    <div className="w-full bg-background">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
            {sortedAreas.length > 0 && (
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
                áreas
              </span>
            )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-xl shadow-sm">
          <table className="w-full border-collapse">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-semibold"
                    colSpan={hasPermission ? 1 : 2}>
                    Nombre
                </th>
                {hasPermission && (
                  <th className="px-3 py-2 text-left w-40">
                      Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedAreas.length > 0 ? (
                sortedAreas.map((area) => (
                  <tr
                    key={area.id}
                    className="hover:bg-muted transition-colors border-b border-border last:border-b-0"
                  >
                    <td className="px-3 py-1.5 font-medium text-foreground">{area.nombre}</td>
                    <td className="px-3 py-1.5">
                      {hasPermission && (
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/areas/${area.id}`)}
                          className="border-2 hover:bg-primary hover:text-primary-foreground"
                        >
                          <Edit2 size={16} className="mr-1" />
                          Editar
                        </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(area)}
                            className="border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 size={16} className="mr-1" />
                            Eliminar
                          </Button>
                      </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-3 py-6 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <Search size={48} className="opacity-40" />
                      <p className="text-lg font-medium">No se encontraron áreas</p>
                        {hasPermission && 
                          <Link href="/areas/crear">
                            <Button>Crear Área</Button>
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
            itemLabel = "áreas"
          />
        </div>
      </div>

      {(activeRole === 'SYSTEM_ADMIN' || activeRole === 'DIRECCION_ADMINISTRATIVA' || activeRole === 'SECRETARIA') && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-destructive flex items-center gap-2">
                <Trash2 size={24} />
                Confirmar Eliminación
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                ¿Estás seguro de que deseas eliminar el área{" "}
                <span className="font-semibold text-foreground">"{selectedArea?.nombre}"</span>?
              </DialogDescription>
            </DialogHeader>

            <div className="bg-destructive/10 border-2 border-destructive/20 rounded-lg p-4 my-4">
              <p className="text-sm text-foreground">
                Esta acción no se puede deshacer. Se eliminarán todos los datos asociados al área.
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
                {isSubmitting ? "Eliminando..." : "Eliminar área"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
