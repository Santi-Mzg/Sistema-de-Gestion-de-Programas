"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, ChevronUp, ChevronDown, Edit2, Trash2, Users } from "lucide-react"
import { UserResponseDTO, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"
import { Button } from "../ui/button"
import { getGetUserByIdQueryKey, getListUsersDepartamentoQueryKey, useDeleteUserFromDepartamento } from "@/app/api/generated/client"
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
import { PageNavigation } from "../nav/page-nav"


interface UsuariosListProps {
  usuarios?: UserResponseDTO[]
  page: number
  pageSize: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
}

type SortField = "nombre" | "apellido" | "legajo" | "email"
type SortOrder = "asc" | "desc"


export function UsuariosList({ 
  usuarios = [],
  page,
  pageSize,
  totalPages,
  totalElements,
  onPageChange  
}: UsuariosListProps) {
  const { setHeader } = useHeader()
  const { activeDepartamento } = useDept()
  const { activeRole } = useRole()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserResponseDTO | null>(null)
  const router = useRouter()
  const queryClient = useQueryClient();
  const [sortField, setSortField] = useState<SortField>("apellido")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  useEffect(() => {
    setHeader({
      title: `Usuarios Departamentales`,
      subtitle: "Gestiona y consulta todas las usuarios del departamento",
      icon: Users,
    })
  }, [])


  const handleDeleteClick = (User: UserResponseDTO) => {
    setSelectedUser(User)
    setDeleteDialogOpen(true)
  }


  const { mutate, isPending } = useDeleteUserFromDepartamento({
    mutation: {
        onSuccess: (_, variables) => {
          toast({
            title: "✓ Usuario dado de baja",
            description: "El usuario fue dado de baja del departamento correctamente.",
            variant: "success",
          })

          queryClient.invalidateQueries({
            queryKey: getListUsersDepartamentoQueryKey(
              activeDepartamento!.departamentoId!
            ),
          });

          queryClient.removeQueries({
            queryKey: getGetUserByIdQueryKey(variables.id)
          });
        },
        onError: (error: unknown) => {

          let errorMessage = "Ocurrió un error inesperado";

          if (axios.isAxiosError(error)) {
            const backendError = error.response?.data;
            
            errorMessage = backendError?.errors?.Error ?? 
                          backendError?.message ?? 
                          backendError?.error ??
                          "Ocurrió un error inesperado"
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }

          toast({
            title: "✗ No se puede dar de baja al usuario",
            description: errorMessage,
            variant: "destructive",
          })
        },
    }
  });


  const sortedUsuarios = useMemo(() => {
    const getSortValue = (usuario: UserResponseDTO, field: SortField): string => {
      switch (field) {
        case "legajo":
          return String(usuario.legajo ?? "")

        case "nombre":
          return String(usuario.nombre ?? "")

        case "apellido":
          return String(usuario.apellido ?? "")

        case "email":
          return String(usuario.departamentos?.find(dept => dept.departamentoId === activeDepartamento?.departamentoId)?.email ?? "")

        default:
          return ""
      }
    }

    const sorted = usuarios.sort((a, b) => {
      const aValue = getSortValue(a, sortField)
      const bValue = getSortValue(b, sortField)

      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    })

    return sorted
  }, [usuarios, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }


  const handleDeleteConfirm = async () => {
    if (!selectedUser?.id || !activeDepartamento?.departamentoId) return

    try {
      mutate({ deptId: activeDepartamento?.departamentoId, id: selectedUser.id});
      setDeleteDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
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
            {usuarios.length > 0 && (
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
                usuarios
              </span>
            )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-xl shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-3 py-2 font-semibold text-left">
                  <button
                    onClick={() => handleSort("legajo")}
                    className="flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Legajo
                    {sortField === "legajo" &&
                      (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
                <th className="px-3 py-2 font-semibold text-left">
                  <button
                    onClick={() => handleSort("apellido")}
                    className="flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Apellido
                    {sortField === "apellido" &&
                      (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
                <th className="px-3 py-2 font-semibold text-left">
                  <button
                    onClick={() => handleSort("nombre")}
                    className="flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Nombre
                    {sortField === "nombre" &&
                      (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
                <th className="px-3 py-2 font-semibold text-left">
                  <button
                    onClick={() => handleSort("email")}
                    className="flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Email Departamental
                    {sortField === "email" &&
                      (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
                <th className="px-3 py-2 font-semibold text-left">
                    Roles Departamentales
                </th>
                {(activeRole === 'SYSTEM_ADMIN' || activeRole === 'DIRECCION_ADMINISTRATIVA' || activeRole === 'SECRETARIA' || activeRole === 'ADMINISTRACION') && (
                  <th className="px-3 py-2 font-semibold text-left w-40">
                      Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedUsuarios.length > 0 ? (
                sortedUsuarios.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-1.5 font-medium text-foreground">{user.legajo}</td>
                    <td className="px-3 py-1.5 text-foreground/80">{user.apellido}</td>
                    <td className="px-3 py-1.5 text-foreground/80">{user.nombre}</td>
                    <td className="px-3 py-1.5 text-foreground/80">{user.departamentos?.find(dept => dept.departamentoId === activeDepartamento?.departamentoId)?.email}</td>
                    <td className="px-3 py-1.5 text-foreground/80">{user.departamentos?.find(dept => dept.departamentoId === activeDepartamento?.departamentoId)?.roles?.map(rol => getRoleLabel(rol as UsuarioDepartamentoDTORolesItem)).join(", ")}</td>
                    {(activeRole === 'SYSTEM_ADMIN' || activeRole === 'DIRECCION_ADMINISTRATIVA' || activeRole === 'SECRETARIA' || activeRole === 'ADMINISTRACION') && (
                      <td className="px-3 py-1.5">
                        <div className="flex items-center justify-center gap-1">
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
                  <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-1">
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
          <PageNavigation 
            page={page}   
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={onPageChange}
            itemLabel = "usuarios"
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-destructive flex items-center gap-2">
              <Trash2 size={24} />
              Confirmar Baja
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              ¿Estás seguro de que deseas dar de baja del departamento al usuario{" "}
              <span className="font-semibold text-foreground">{selectedUser?.apellido} {selectedUser?.nombre} (Legajo: {selectedUser?.legajo})</span>?
            </DialogDescription>
          </DialogHeader>

          <div className="bg-destructive/10 border-2 border-destructive/20 rounded-lg p-4 my-4">
            <p className="text-sm text-foreground">
              El usuario perderá sus roles y permisos dentro de este departamento.
              Su información histórica permanecerá registrada en el sistema.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isPending}
              className="border-2"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isPending}
              className="bg-destructive"
            >
              {isPending ? "Eliminando..." : "Eliminar Usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
