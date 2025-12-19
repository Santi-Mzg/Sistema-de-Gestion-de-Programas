"use client"

import { useState, useMemo } from "react"
import { Search, ChevronUp, ChevronDown, Filter, Edit2, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DepartamentoCreateDTO, DepartamentoResponseDTO } from "@/app/api/generated/model"
import { Button } from "../ui/button"
import { useDeleteDepartamento, useUpdateDepartamento } from "@/app/api/generated/client"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Textarea } from "../ui/textarea"
import { Label } from "../ui/label"
import { useRouter } from "next/navigation"

interface DepartamentosListProps {
  departamentos?: DepartamentoResponseDTO[]
}


export function DepartamentosList({ departamentos = [] }: DepartamentosListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDepartamento, setSelectedDepartamento] = useState<DepartamentoResponseDTO | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

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
      onSuccess: () => { alert("Éxito"); },
      onError: (err: Error) => alert("Error: " + err.message)
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


  return (
    <div className="w-full bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-8 rounded-b-2xl shadow-lg">
        <h1 className="text-4xl font-bold mb-2">departamentos Universitarios</h1>
        <p className="text-primary-foreground/80">Gestiona y consulta todos los departamento del sistema</p>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        {/* Search and Filters Section */}
        <div className="space-y-6 mb-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Buscar por nombre, código, profesor o departamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-3 text-base border-2 border-border rounded-xl"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">{filteredDepartamentos.length}</span> de{" "}
          <span className="font-semibold text-foreground">{departamentos.length}</span> departamento
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
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDepartamentos.length > 0 ? (
                filteredDepartamentos.map((departamento) => (
                  <tr
                    key={departamento.id}
                    className="hover:bg-muted transition-colors cursor-pointer border-b border-border last:border-b-0"
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
                          onClick={() => router.push(`/departamentos/${departamento.id}/editar`)}
                          className="border-2 hover:bg-primary hover:text-primary-foreground"
                        >
                          <Edit2 size={16} className="mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(departamento)}
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
                      <p className="text-lg font-medium">No se encontraron departamentos</p>
                      <p className="text-sm">Intenta ajustar tu búsqueda</p>
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
    </div>
  )
}
