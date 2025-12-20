"use client"

import { useState, useMemo } from "react"
import { Search, ChevronUp, ChevronDown, Filter, Edit2, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CarreraResponseDTO } from "@/app/api/generated/model"
import { Button } from "../ui/button"
import { useDeleteCarrera } from "@/app/api/generated/client"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface CarrerasListProps {
  carreras?: CarreraResponseDTO[]
}


export function CarrerasList({ carreras = [] }: CarrerasListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCarrera, setSelectedCarrera] = useState<CarreraResponseDTO | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Filter and sort data
  const filteredCarreras = useMemo(() => {
    const filtered = carreras.filter((carrera) => {
      return (
        !searchTerm ||
        carrera.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })

    return filtered
  }, [carreras, searchTerm,])


  const handleDeleteClick = (carrera: CarreraResponseDTO) => {
    setSelectedCarrera(carrera)
    setDeleteDialogOpen(true)
  }


  const { mutate, isPending } = useDeleteCarrera({
    mutation: {
      onSuccess: () => { alert("Éxito"); },
      onError: (err: Error) => alert("Error: " + err.message)
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


  return (
    <div className="w-full bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-8 rounded-b-2xl shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Carreras Departamentales</h1>
        <p className="text-primary-foreground/80">Gestiona y consulta todas las carreras del departamento</p>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        {/* Search and Filters Section */}
        <div className="space-y-6 mb-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-3 text-base border-2 border-border rounded-xl"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">{filteredCarreras.length}</span> de{" "}
          <span className="font-semibold text-foreground">{carreras.length}</span> carrera
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
                    Plan
                </th>
                <th className="px-6 py-4 text-left">
                    Duración
                </th>
                <th className="px-6 py-4 text-left">
                    Cantidad de Materias
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
              {filteredCarreras.length > 0 ? (
                filteredCarreras.map((carrera) => (
                  <tr
                    key={carrera.id}
                    className="hover:bg-muted transition-colors cursor-pointer border-b border-border last:border-b-0"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">{carrera.nombre}</td>
                    <td className="px-6 py-4 text-foreground/80">{carrera.plan}</td>
                    <td className="px-6 py-4 text-foreground/80">{carrera.duracion}</td>
                    <td className="px-6 py-4 text-foreground/80">{carrera.cantidadMaterias}</td>
                    <td className="px-6 py-4 text-foreground/80">{carrera.departamento}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/Carreras/${carrera.id}/editar`)}
                          className="border-2 hover:bg-primary hover:text-primary-foreground"
                        >
                          <Edit2 size={16} className="mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(carrera)}
                          className="border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Eliminar
                        </Button>
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
                      <Link href="/carreras/crear">
                        <Button>Crear Carrera</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
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
    </div>
  )
}
