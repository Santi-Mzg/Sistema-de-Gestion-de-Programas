"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, ChevronUp, ChevronDown, Filter, Edit2, Trash2, Eye, Plus, Building2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DepartamentoResponseDTO, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"
import { Button } from "../ui/button"
import { useDeleteDepartamento } from "@/app/api/generated/client"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useRole } from "@/context/role-context"
import { toast } from "@/hooks/use-toast"
import { useHeader } from "@/context/header-context"

interface DepartamentosListProps {
  departamentos?: DepartamentoResponseDTO[]
}


export function DepartamentosList({ departamentos = [] }: DepartamentosListProps) {
  const { setHeader } = useHeader()
  const { activeRole } = useRole()
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDepartamento, setSelectedDepartamento] = useState<DepartamentoResponseDTO | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setHeader({
      title: `Departamentos Universitarios`,
      subtitle: "Gestiona y consulta todos los departamentos del sistema",
      icon: Building2,
    })
  }, [])

  // Filter and sort data
  const filteredDepartamentos = useMemo(() => {
    const filtered = departamentos.filter((departamento) => {
      return (
        !searchTerm ||
        departamento.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })

    return filtered
  }, [departamentos, searchTerm,])


  const handleDeleteClick = (departamento: DepartamentoResponseDTO) => {
    setSelectedDepartamento(departamento)
    setDeleteDialogOpen(true)
  }


  const { mutate, isPending } = useDeleteDepartamento({
    mutation: {
        onSuccess: () => {
          toast({
            title: "✓ Éxito",
            description: "Departamento eliminado exitosamente",
            variant: "success",
          })
        },
        onError: (error: Error) => {
          toast({
            title: "✗ Error",
            description: error instanceof Error ? error.message : "Error desconocido",
            variant: "destructive",
          })
        },
    }
  });

  const handleDeleteConfirm = async () => {
    if (!selectedDepartamento?.id) return

    setIsSubmitting(true)
    try {

      mutate({ id: selectedDepartamento.id });

      setDeleteDialogOpen(false)
      setSelectedDepartamento(null)
    } catch (error) {
      console.error("Error deleting departamento:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!activeRole) {
    return(
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-yellow-700">Cargando datos de los departamentos...</p>
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
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-3 text-base border-2 border-border rounded-xl"
            />
          </div>
          {activeRole === UsuarioDepartamentoDTORolesItem.SYSTEM_ADMIN && 
            <Button size="lg"
                    variant="outline"
                    onClick={() => router.push(`/departamentos/crear`)}
                    className="border-2 hover:bg-primary hover:text-primary-foreground">
              <Plus size={16} className="mr-1" />
              Crear Nuevo
            </Button>
          }
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">{filteredDepartamentos.length}</span> de{" "}
          <span className="font-semibold text-foreground">{departamentos.length}</span> departamento{departamentos.length === 1 ? "" : "s"}
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

                    Dirección
                </th>
                <th className="px-6 py-4 text-left">
                    Teléfono
                </th>
                <th className="px-6 py-4 text-left">
                    Email
                </th>
                <th className="px-6 py-4 text-left">
                    Sitio Web
                </th>
                <th className="px-6 py-4 text-left">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDepartamentos.length > 0 ? (
                filteredDepartamentos.map((departamento) => (
                  <tr
                    key={departamento.id}
                    className="hover:bg-muted transition-colors border-b border-border last:border-b-0"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">{departamento.nombre}</td>
                    <td className="px-6 py-4 text-foreground/80">{departamento.direccion}</td>
                    <td className="px-6 py-4 text-foreground/80">{departamento.telefono}</td>
                    <td className="px-6 py-4 text-foreground/80">{departamento.email}</td>
                    <td className="px-6 py-4 text-foreground/80">
                      {departamento.sitioWeb ? (
                        <a
                          href={departamento.sitioWeb}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {departamento.sitioWeb}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/departamentos/${departamento.id}`)}
                          className="border-2 hover:bg-primary hover:text-primary-foreground"
                        >
                          <Eye size={16} className="mr-1" />
                          Ver
                        </Button>
                        {activeRole === UsuarioDepartamentoDTORolesItem.SYSTEM_ADMIN && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(departamento)}
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
                      <p className="text-lg font-medium">No se encontraron departamentos</p>
                        {activeRole === UsuarioDepartamentoDTORolesItem.SYSTEM_ADMIN && (
                          <Link href="/departamentos/crear">
                            <Button>Crear Departamento</Button>
                          </Link>
                        )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeRole === 'SYSTEM_ADMIN' && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-destructive flex items-center gap-2">
                <Trash2 size={24} />
                Confirmar Eliminación
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                ¿Estás seguro de que deseas eliminar el departamento{" "}
                <span className="font-semibold text-foreground">"{selectedDepartamento?.nombre}"</span>?
              </DialogDescription>
            </DialogHeader>

            <div className="bg-destructive/10 border-2 border-destructive/20 rounded-lg p-4 my-4">
              <p className="text-sm text-foreground">
                Esta acción no se puede deshacer. Se eliminarán todos los datos asociados al departamento.
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
                {isSubmitting ? "Eliminando..." : "Eliminar Departamento"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
