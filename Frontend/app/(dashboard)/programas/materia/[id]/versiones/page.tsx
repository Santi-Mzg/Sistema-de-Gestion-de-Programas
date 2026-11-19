"use client"

import { getListProgramasMateriaQueryKey, useListProgramasMateria } from "@/app/api/generated/client"
import { ProgramasList } from "@/components/pages/programas-list"
import { Button } from "@/components/ui/button"
import { useDept } from "@/context/dept-context"
import { useHeader } from "@/context/header-context"
import { useRole } from "@/context/role-context"
import { AlertCircle, FolderClock } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect } from "react"

export default function ProgramasVersiones() {
  const { id } = useParams<{ id: string }>()
  const { activeDepartamento } = useDept()
  const { activeRole } = useRole()
  const { title, subtitle, setHeader } = useHeader()
  const materiaId = Number(id)
  const idValido = Number.isSafeInteger(materiaId) && materiaId > 0
  const deptId = activeDepartamento?.departamentoId

  const programasQuery = useListProgramasMateria(idValido ? materiaId : 0, {
    query: {
      enabled: idValido && !!deptId && !!activeRole,
      staleTime: 1000 * 60 * 5,
      queryKey: [
        ...getListProgramasMateriaQueryKey(idValido ? materiaId : 0),
        { rolActivo: activeRole, departamentoId: deptId },
      ],
    },
  })
  const programas = programasQuery.data ?? []
  const nombreMateria = programas[0]?.materia?.nombre
  const titulo = nombreMateria ? `Versiones del programa de ${nombreMateria}` : "Versiones del programa por materia"
  const subtitulo = "Consulta los programas de todos los años disponibles para el rol y departamento activos"

  useEffect(() => {
    if (title === titulo && subtitle === subtitulo) return
    setHeader({ title: titulo, subtitle: subtitulo, icon: FolderClock })
  }, [titulo, subtitulo, title, subtitle, setHeader])

  if (!idValido) {
    return <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-destructive">
      La materia indicada no es válida.
    </p>
  }

  if (!deptId || !activeRole) {
    return <p className="p-4 text-muted-foreground">Seleccioná un departamento y un rol para consultar las versiones.</p>
  }

  if (programasQuery.isPending) {
    return <div role="status" className="flex min-h-48 items-center justify-center p-6">
      <div className="text-center">
        <div aria-hidden="true" className="mx-auto mb-3 size-8 animate-spin rounded-full border-b-2 border-primary" />
        <p className="text-muted-foreground">Cargando programas de la materia...</p>
      </div>
    </div>
  }

  if (programasQuery.isError) {
    return <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
      <AlertCircle aria-hidden="true" className="size-5 shrink-0 text-destructive" />
      <p className="flex-1 text-destructive">No se pudieron cargar los programas de esta materia.</p>
      <Button variant="outline" disabled={programasQuery.isFetching} onClick={() => { void programasQuery.refetch() }}>
        {programasQuery.isFetching ? "Reintentando..." : "Reintentar"}
      </Button>
    </div>
  }

  return <ProgramasList key={`${materiaId}-${deptId}-${activeRole}`} programas={programas} esVistaVersiones />
}
