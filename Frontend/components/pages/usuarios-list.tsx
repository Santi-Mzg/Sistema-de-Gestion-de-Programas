"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, ChevronUp, ChevronDown, Filter, Edit2, Trash2, Plus, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { UserResponseDTO, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"
import { Button } from "../ui/button"
import { getGetUserByIdQueryKey, getListUsersDepartamentoQueryKey, useDeleteUser } from "@/app/api/generated/client"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { useRouter } from "next/navigation"
import { useDept } from "@/context/dept-context"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { useRole } from "@/context/role-context"
import { useHeader } from "@/context/header-context"
import { getRoleLabel } from "@/lib/utils"
import axios from "axios"
import { useQueryClient } from "@tanstack/react-query";


interface UsuariosListProps {
  usuarios?: UserResponseDTO[]
}


export function UsuariosList({ usuarios = [] }: UsuariosListProps) {
  const { setHeader } = useHeader()
  const { activeDepartamento } = useDept()
  const { activeRole } = useRole()
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserResponseDTO | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient();


  useEffect(() => {
    setHeader({
      title: `Usuarios Departamentales`,
      subtitle: "Gestiona y consulta todas las usuarios del departamento",
      icon: Users,
    })
  }, [])

  // Filter and sort data
  const filteredUsuarios = useMemo(() => {
    const filtered = usuarios.filter((user) => {
      return (
        !searchTerm ||
        user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.legajo?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })

    return filtered
  }, [usuarios, searchTerm,])


  const handleDeleteClick = (User: UserResponseDTO) => {
    setSelectedUser(User)
    setDeleteDialogOpen(true)
  }


  const { mutate, isPending } = useDeleteUser({
    mutation: {
        onSuccess: (_, variables) => {
          toast({
            title: "✓ Éxito",
            description: "Usuario eliminado exitosamente",
            variant: "success",
          })

          queryClient.invalidateQueries({
            queryKey: getListUsersDepartamentoQueryKey(
              activeDepartamento!.departamentoId!
            ),
          });

          queryClient.invalidateQueries({
            queryKey: getGetUserByIdQueryKey(variables.id)
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
    if (!selectedUser?.id) return

    setIsSubmitting(true)
    try {

      mutate({ id: selectedUser.id });

      setDeleteDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error("Error deleting User:", error)
    } finally {
      setIsSubmitting(false)
    }
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
              placeholder="Buscar por nombre o legajo..."
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
                    onClick={() => router.push(`/usuarios/crear`)}
                    className="border-2 hover:bg-primary hover:text-primary-foreground">
              <Plus size={16} className="mr-1" />
              Crear Nuevo
            </Button>
          }
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">{filteredUsuarios.length}</span> de {" "}
          <span className="font-semibold text-foreground">{usuarios.length}</span> usuario{usuarios.length === 1 ? "" : "s"}
        </div>

        {/* Table */}
        <div className="overflow-x-auto border-2 border-border rounded-xl shadow-sm">
          <table className="w-full border-collapse">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-6 py-4 text-left">
                    Legajo
                </th>
                <th className="px-6 py-4 text-left">
                    Apellido
                </th>
                <th className="px-6 py-4 text-left">
                    Nombre
                </th>
                <th className="px-6 py-4 text-left">
                    Email Departamental
                </th>
                <th className="px-6 py-4 text-left">
                    Roles Departamentales
                </th>
                {(activeRole === 'SYSTEM_ADMIN' || activeRole === 'DIRECCION_ADMINISTRATIVA' || activeRole === 'SECRETARIA' || activeRole === 'ADMINISTRACION') && (
                  <th className="px-6 py-4 text-left">
                      Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsuarios.length > 0 ? (
                filteredUsuarios.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-muted transition-colors border-b border-border last:border-b-0"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">{user.legajo}</td>
                    <td className="px-6 py-4 text-foreground/80">{user.apellido}</td>
                    <td className="px-6 py-4 text-foreground/80">{user.nombre}</td>
                    <td className="px-6 py-4 text-foreground/80">{user.departamentos?.find(dept => dept.departamentoId === activeDepartamento?.departamentoId)?.email}</td>
                    <td className="px-6 py-4 text-foreground/80">{user.departamentos?.find(dept => dept.departamentoId === activeDepartamento?.departamentoId)?.roles?.map(rol => getRoleLabel(rol as UsuarioDepartamentoDTORolesItem)).join(", ")}</td>
                    {(activeRole === 'SYSTEM_ADMIN' || activeRole === 'DIRECCION_ADMINISTRATIVA' || activeRole === 'SECRETARIA' || activeRole === 'ADMINISTRACION') && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/usuarios/${user.id}`)}
                            className="border-2 hover:bg-primary hover:text-primary-foreground"
                          >
                            <Edit2 size={16} className="mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(user)}
                            className="border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 size={16} className="mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Search size={48} className="opacity-40" />
                      <p className="text-lg font-medium">No se encontraron usuarios</p>
                        {(activeRole === UsuarioDepartamentoDTORolesItem.ADMINISTRACION || 
                          activeRole === UsuarioDepartamentoDTORolesItem.SECRETARIA || 
                          activeRole === UsuarioDepartamentoDTORolesItem.DIRECCION_ADMINISTRATIVA || 
                          activeRole === UsuarioDepartamentoDTORolesItem.SYSTEM_ADMIN) &&
                          <Link href="/usuarios/crear">
                            <Button>Crear Usuario</Button>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-destructive flex items-center gap-2">
              <Trash2 size={24} />
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              ¿Estás seguro de que deseas eliminar al usuario{" "}
              <span className="font-semibold text-foreground">{selectedUser?.apellido} {selectedUser?.nombre} (Legajo: {selectedUser?.legajo})</span>?
            </DialogDescription>
          </DialogHeader>

          <div className="bg-destructive/10 border-2 border-destructive/20 rounded-lg p-4 my-4">
            <p className="text-sm text-foreground">
              Esta acción no se puede deshacer. Se eliminarán todos los datos asociados al usuario.
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
              {isSubmitting ? "Eliminando..." : "Eliminar Usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
