"use client"

import { useListUsersByDepartamento } from "@/app/api/generated/client";
import { UserResponseDTO } from "@/app/api/generated/model";
import { UsuariosList } from "@/components/pages/usuarios-list";
import { useDept } from "@/context/dept-context";
import { AlertCircle } from "lucide-react";

export default function Usuarios() {
    const { activeDepartamento, isLoading } = useDept()
    
    if (!activeDepartamento || !activeDepartamento.departamentoId) {
      return(
        <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-yellow-700">Cargando departamento...</p>
          </div>
        </div>
      )
    }


    const usuariosQuery = useListUsersByDepartamento(activeDepartamento?.departamentoId);
    const usuarios: UserResponseDTO[] | undefined = usuariosQuery.data;

    if (usuariosQuery.isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando datos de los usuarios...</p>
                </div>
            </div>
        )
    }

    if (usuariosQuery.error) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">Error al obtener los usuarios</p>
          </div>
        </div>
      )
    }

    return (
      <UsuariosList usuarios={usuarios} />
    )
}
