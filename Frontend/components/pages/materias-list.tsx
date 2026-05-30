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

interface MateriasListProps {
  materias?: MateriaResponseDTO[]
}


export function MateriasList({ materias = [] }: MateriasListProps) {
  const { setHeader } = useHeader()
  const { activeRole } = useRole()
  const { activeDepartamento } = useDept()
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMateria, setSelectedMateria] = useState<MateriaResponseDTO | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient();

  useEffect(() => {
    setHeader({
      title: `Materias Departamentales`,
      subtitle: "Gestiona y consulta todas las materias del departamento",
      icon: BookOpenText,
    })
  }, [])

  // Filter and sort data
  const filteredMaterias = useMemo(() => {
    const filtered = materias.filter((materia) => {
      return (
        !searchTerm ||
        materia.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        materia.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })

    return filtered
  }, [materias, searchTerm,])


  const handleDeleteClick = (materia: MateriaResponseDTO) => {
    setSelectedMateria(materia)
    setDeleteDialogOpen(true)
  }


  const { mutate, isPending } = useDeleteMateria({
    mutation: {
        onSuccess: (_, variables) => {
          toast({
            title: "✓ Éxito",
            description: "Materia eliminada exitosamente",
            variant: "success",
          })

          queryClient.removeQueries({
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
        <div className="mb-8 flex md:flex-row md:items-center md:justify-between gap-4">
          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Buscar por nombre o código..."
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
                    onClick={() => router.push(`/materias/crear`)}
                    className="border-2 hover:bg-primary hover:text-primary-foreground">
              <Plus size={16} className="mr-1" />
              Crear Materia
            </Button>
          }
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">{filteredMaterias.length}</span> de{" "}
          <span className="font-semibold text-foreground">{materias.length}</span> materia{materias.length === 1 ? "" : "s"}
        </div>

        {/* Table */}
        <div className="overflow-x-auto border-2 border-border rounded-xl shadow-sm">
          <table className="w-full border-collapse">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-6 py-4 text-left">
                    Nombre
                </th>
                <th className="px-6 py-4 text-left">
                    Código
                </th>
                <th className="px-6 py-4 text-left">
                    Área
                </th>
                <th className="px-6 py-4 text-left">
                    Departamento
                </th>
                <th className="px-6 py-4 text-left">
                    Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredMaterias.length > 0 ? (
                filteredMaterias.map((materia) => (
                  <tr
                    key={materia.id}
                    className="hover:bg-muted transition-colors border-b border-border last:border-b-0"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">{materia.nombre}</td>
                    <td className="px-6 py-4 text-foreground/80">{materia.codigo}</td>
                    <td className="px-6 py-4 text-foreground/80">{materia.area}</td>
                    <td className="px-6 py-4 text-foreground/80">{materia.departamento}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
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
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
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
