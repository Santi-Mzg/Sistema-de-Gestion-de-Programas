"use client"

import { SyllabusView } from "@/components/pages/programa-view";
import { useRole } from "@/context/role-context";
import { useParams } from "next/navigation";

  

export default function Programa() {
  const { activeRole } = useRole()
  const { id } = useParams<{ id: string }>()


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

    return (
      <SyllabusView id={Number(id)} />
    );
}
