"use client"

import { DepartamentoForm } from "@/components/forms/departamento-form";
import { useRole } from "@/context/role-context";
import { AlertCircle } from "lucide-react";

export default function CrearDepartamento() {
    const { activeRole } = useRole()

    if (!activeRole) {
      return(
        <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-yellow-700">Cargando...</p>
          </div>
       </div>
      )
    }

    if(activeRole !== "SYSTEM_ADMIN") {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">No tienes permisos para crear departamentos</p>
          </div>
        </div>
      )
    }
    
    return (
      <DepartamentoForm />
    );
}
