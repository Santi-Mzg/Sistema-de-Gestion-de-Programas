"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, ChevronUp, ChevronDown, Filter, Edit2, Trash2, Eye, Plus, AlertCircle, BookOpen, BookOpenText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { MateriaResponseDTO, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"
import { Button } from "../ui/button"
import { getGetMateriaQueryKey, getListMateriasDepartamentoQueryKey, useDeleteMateria } from "@/app/api/generated/client"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useRole } from "@/context/role-context"
import { toast } from "@/hooks/use-toast"
import { useHeader } from "@/context/header-context"
import axios from "axios"
import { useQueryClient } from "@tanstack/react-query";
import { useDept } from "@/context/dept-context"
import { PageNavigation } from "../nav/page-nav"

interface MateriasListProps {
  materias?: MateriaResponseDTO[]
  page: number
  pageSize: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
}


type SortField = "nombre" | "codigo" | "area"
type SortOrder = "asc" | "desc"

export function MateriasList({ 
  materias = [],
  page,
  pageSize,
  totalPages,
  totalElements,
  onPageChange  
 }: MateriasListProps) {
  const { setHeader } = useHeader()
  const { activeRole } = useRole()
  const { activeDepartamento } = useDept()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMateria, setSelectedMateria] = useState<MateriaResponseDTO | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient();
  const [sortField, setSortField] = useState<SortField>("nombre")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")


  useEffect(() => {
    setHeader({
      title: `Materias Departamentales`,
      subtitle: "Gestiona y consulta todas las materias del departamento",
      icon: BookOpenText,
    })
  }, [])


  const handleDeleteClick = (materia: MateriaResponseDTO) => {
    setSelectedMateria(materia)
    setDeleteDialogOpen(true)
  }

  const sortedMaterias = useMemo(() => {
    const getSortValue = (materia: MateriaResponseDTO, field: SortField): string => {
      switch (field) {
        case "nombre":
          return String(materia.nombre ?? "")

        case "codigo":
          return materia.codigo ?? ""

        case "area":
          return materia.area ?? ""

        default:
          return ""
      }
    }

    const sorted = materias.sort((a, b) => {
      const aValue = getSortValue(a, sortField)
      const bValue = getSortValue(b, sortField)

      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    })

    return sorted
  }, [materias, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const { mutate, isPending } = useDeleteMateria({
    mutation: {
        onSuccess: (_, variables) => {
          toast({
            title: "✓ Éxito",
            description: "Materia eliminada exitosamente",
            variant: "success",
          })

          queryClient.invalidateQueries({
            queryKey: getListMateriasDepartamentoQueryKey(
              activeDepartamento!.departamentoId!
            ),
          });

          queryClient.removeQueries({
            queryKey: getGetMateriaQueryKey(variables.id)
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
    if (!selectedMateria?.id) return

    setIsSubmitting(true)
    try {

      mutate({ id: selectedMateria.id });

      setDeleteDialogOpen(false)
      setSelectedMateria(null)
    } catch (error) {
      console.error("Error deleting materia:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

    if (!activeRole) {
      return(
        <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-yellow-700">Cargando datos de las materias...</p>
          </div>
        </div>
      )
    }


  return (
    <div className="w-full bg-background">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Search and Filters Section */}

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
            {materias.length > 0 && (
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
                materias
              </span>
            )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-xl shadow-sm">
          <table className="w-full border-collapse">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">
                  <button
                    onClick={() => handleSort("nombre")}
                    className="flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Nombre
                    {sortField === "nombre" &&
                      (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
                <th className="px-3 py-2 text-left font-semibold">
                  <button
                    onClick={() => handleSort("codigo")}
                    className="flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Código
                    {sortField === "codigo" &&
                      (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
                <th className="px-3 py-2 text-left font-semibold">
                  <button
                    onClick={() => handleSort("area")}
                    className="flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Área
                    {sortField === "area" &&
                      (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
                <th className="px-3 py-2 text-left font-semibold">
                    Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedMaterias.length > 0 ? (
                sortedMaterias.map((materia) => (
                  <tr
                    key={materia.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-1.5 font-medium text-foreground">{materia.nombre}</td>
                    <td className="px-3 py-1.5 text-foreground/80">{materia.codigo}</td>
                    <td className="px-3 py-1.5 text-foreground/80">{materia.area}</td>
                    <td className="px-3 py-1.5">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/materias/${materia.id}`)}
                          className="border-2 hover:bg-primary hover:text-primary-foreground"
                        >
                          <Eye size={16} className="mr-1" />
                          Ver
                        </Button>
                        {(activeRole === 'SYSTEM_ADMIN' || activeRole === 'DIRECCION_ADMINISTRATIVA' || activeRole === 'SECRETARIA' || activeRole === 'ADMINISTRACION') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(materia)}
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
                      <p className="text-lg font-medium">No se encontraron materia</p>
                        {(activeRole === UsuarioDepartamentoDTORolesItem.ADMINISTRACION || 
                          activeRole === UsuarioDepartamentoDTORolesItem.SECRETARIA || 
                          activeRole === UsuarioDepartamentoDTORolesItem.DIRECCION_ADMINISTRATIVA || 
                          activeRole === UsuarioDepartamentoDTORolesItem.SYSTEM_ADMIN) &&
                          <Link href="/materias/crear">
                            <Button>Crear Materia</Button>
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
            itemLabel = "materias"
          />
        </div>
      </div>

      {(activeRole === 'SYSTEM_ADMIN' || activeRole === 'DIRECCION_ADMINISTRATIVA' || activeRole === 'SECRETARIA' || activeRole === 'ADMINISTRACION') && (
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-destructive flex items-center gap-2">
              <AlertCircle size={24} />
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              ¿Estás seguro de que deseas eliminar la materia{" "}
              <span className="font-semibold text-foreground">"{selectedMateria?.nombre}"</span>?
            </DialogDescription>
          </DialogHeader>

          <div className="bg-destructive/10 border-2 border-destructive/20 rounded-lg p-4 my-4">
            <p className="text-sm text-foreground">
              Esta acción no se puede deshacer. Se eliminarán todos los datos asociados a la materia.
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
              {isSubmitting ? "Eliminando..." : "Eliminar materia"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}
    </div>
  )
}
