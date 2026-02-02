"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Edit2, Trash2, Plus, Layers } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AreaCreateDTO, AreaResponseDTO, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"
import { Button } from "../ui/button"
import { useDeleteArea } from "@/app/api/generated/client"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useRole } from "@/context/role-context"
import { toast } from "@/hooks/use-toast"
import { useHeader } from "@/context/header-context"

interface AreasListProps {
  areas?: AreaResponseDTO[]
}


export function AreasList({ areas = [] }: AreasListProps) {
  const { setHeader } = useHeader()
  const { activeRole } = useRole()
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedArea, setSelectedArea] = useState<AreaResponseDTO | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

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

  // Filter and sort data
  const filteredAreas = useMemo(() => {
    const filtered = areas.filter((area) => {
      return (
        !searchTerm ||
        area.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })

    return filtered
  }, [areas, searchTerm,])


  const handleDeleteClick = (area: AreaResponseDTO) => {
    setSelectedArea(area)
    setDeleteDialogOpen(true)
  }


  const { mutate, isPending } = useDeleteArea({
    mutation: {
        onSuccess: () => {
          toast({
            title: "✓ Éxito",
            description: "Área eliminada exitosamente",
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
          {(activeRole === UsuarioDepartamentoDTORolesItem.DIRECCION_ADMINISTRATIVA || 
            activeRole === UsuarioDepartamentoDTORolesItem.SECRETARIA ||
              activeRole === UsuarioDepartamentoDTORolesItem.SYSTEM_ADMIN) &&
            <Button size="lg"
                    variant="outline"
                    onClick={() => router.push(`/areas/crear`)}
                    className="border-2 hover:bg-primary hover:text-primary-foreground">
              <Plus size={16} className="mr-1" />
              Crear Nueva
            </Button>
          }
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">{filteredAreas.length}</span> de{" "}
          <span className="font-semibold text-foreground">{areas.length}</span> área
        </div>

        {/* Table */}
        <div className="overflow-x-auto border-2 border-border rounded-xl shadow-sm">
          <table className="w-full border-collapse">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-6 py-4 text-left"
                    colSpan={hasPermission ? 1 : 2}>
                    Nombre
                </th>
                {hasPermission && (
                  <th className="px-6 py-4 text-center">
                      Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAreas.length > 0 ? (
                filteredAreas.map((area) => (
                  <tr
                    key={area.id}
                    className="hover:bg-muted transition-colors border-b border-border last:border-b-0"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">{area.nombre}</td>
                    <td className="px-6 py-4">
                      {hasPermission && (
                      <div className="flex items-center justify-center gap-2">
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
                  <td colSpan={2} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-3">
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
