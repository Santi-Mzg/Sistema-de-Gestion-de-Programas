"use client"
import { invalidarConsultasPrograma } from "@/lib/invalidacion-consultas";
import {
  useDeletePrograma
} from "@/app/api/generated/client";

import { useState, useMemo, useEffect } from "react"
import { Search, ChevronUp, ChevronDown, FileText, FolderClock, Trash2 } from "lucide-react"
import { EstadoPrograma, ProgramaResponseReducedDTO, Rol } from "@/app/api/generated/model"
import { Button } from "../ui/button"
import { ProgramaAcciones } from "./programa-acciones"
import { useRole } from "@/context/role-context"
import Link from "next/link"
import { customInstance } from "@/app/api/custom-instance"
import { toast } from "@/hooks/use-toast"
import { rutaAccionPrograma } from "@/lib/circuito-programa"
import { useHeader } from "@/context/header-context"
import { getProgramStateLabel, getProgramStateStyles } from "@/lib/utils"
import { PageNavigation } from "../nav/page-nav"
import { useRouter } from "next/navigation"
import { useDept } from "@/context/dept-context"
import { useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import axios from "axios"

interface ProgramasListProps {
  programas?: ProgramaResponseReducedDTO[]
  page: number
  pageSize: number
  totalPages: number
  totalElements: number
  esVistaVersiones: boolean
  onPageChange: (page: number) => void
}


type SortField = "anio" | "nombreMateria" | "estado" | "docenteResponsable" | "nombreDepartamento"
type SortOrder = "asc" | "desc"

export function ProgramasList({
    programas = [],
    page,
    pageSize,
    totalPages,
    totalElements,
    esVistaVersiones,
    onPageChange
  }: ProgramasListProps) {
  const { setHeader } = useHeader()
  const { activeRole } = useRole()
  const { activeDepartamento } = useDept()
  const queryClient = useQueryClient()
  const { mutateAsync: eliminarPrograma, isPending: eliminando } = useDeletePrograma()
  const [programaAEliminar, setProgramaAEliminar] = useState<ProgramaResponseReducedDTO | null>(null)
  const deptId = activeDepartamento?.departamentoId
  const puedeEliminar = activeRole === Rol.SECRETARIA
    || activeRole === Rol.SYSTEM_ADMIN
  const router = useRouter()
  const [sortField, setSortField] = useState<SortField>("nombreMateria")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  const actualYear = new Date().getFullYear()

  // Una confirmación abierta no se reutiliza después de cambiar de contexto.
  const [previousFormSources, setPreviousFormSources] = useState<[typeof activeRole, typeof deptId] | null>(null)
  if (previousFormSources === null || previousFormSources[0] !== activeRole || previousFormSources[1] !== deptId) {
    setPreviousFormSources([activeRole, deptId])
    setProgramaAEliminar(null)
  }

  const handleEliminarConfirm = async () => {
    if (!puedeEliminar || !programaAEliminar?.id || !deptId || eliminando) return
    const { id } = programaAEliminar
    try {
      await eliminarPrograma({ id })
      setProgramaAEliminar(null)
      await invalidarConsultasPrograma(queryClient, { departamentoId: deptId, programaId: id, eliminado: true })
      if (!esVistaVersiones && programas.length === 1 && page > 0) onPageChange(page - 1)
      toast({ title: "✓ Éxito", description: "Programa eliminado exitosamente", variant: "success" })
    } catch (error) {
      const mensaje = axios.isAxiosError(error)
        ? error.response?.data?.errors?.Error || error.response?.data?.message
        : undefined
      toast({ title: "✗ Error", description: mensaje || "No se pudo eliminar el programa. Intente nuevamente.", variant: "destructive" })
    }
  }

  useEffect(() => {
    if(esVistaVersiones && programas.length > 0)
        setHeader({
          title: `Versiones del Programa de ${programas[0]?.materia?.nombre}`,
          subtitle: "Consulta las versiones anteriores del programa seleccionado",
          icon: FolderClock,
        })
    else
        setHeader({
          title: `Programas - ${actualYear}`,
          subtitle: "Gestiona y consulta los programas disponibles",
          icon: FileText,
        })
  }, [])



  // Filter and sort data
  const sortedPrograms = useMemo(() => {
    const getSortValue = (programa: ProgramaResponseReducedDTO, field: SortField): string => {
      switch (field) {
        case "anio":
          return String(programa.anio ?? "")

        case "nombreMateria":
          return programa.materia?.nombre ?? ""

        case "docenteResponsable":
          return programa.docenteResponsable
            ? `${programa.docenteResponsable.apellido} ${programa.docenteResponsable.nombre}`
            : ""

        case "nombreDepartamento":
          return programa.materia?.departamento ?? ""

        case "estado":
          return getProgramStateLabel(programa.estado as EstadoPrograma) ?? ""

        default:
          return ""
      }
    }

    const sorted = programas.sort((a, b) => {
      const aValue = getSortValue(a, sortField)
      const bValue = getSortValue(b, sortField)

      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    })

    return sorted
  }, [programas, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const handleGenerarPDF = async (programaId?: number) => {
    if (!programaId) return;
    const ventana = window.open('about:blank', '_blank');
    try {
      const contenido = await customInstance<Blob>({ url: '/api/programas/' + programaId + '/pdf', responseType: 'blob' });
      const url = URL.createObjectURL(contenido);
      if (ventana) ventana.location.href = url;
      else { const enlace = document.createElement('a'); enlace.href = url; enlace.download = 'programa.pdf'; enlace.click(); }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      ventana?.close();
      toast({ title: 'No se pudo generar el PDF', description: 'Compruebe que el programa esté aprobado y su rol tenga permiso.', variant: 'destructive' });
    }
  };

  return (
    <div className="w-full bg-background">
      <div className="max-w-full mx-auto">

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
            {programas.length > 0 && (
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
                programas
              </span>
            )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-xl shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-semibold w-16">
                  <button
                    onClick={() => handleSort("anio")}
                    className="flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Año
                    {sortField === "anio" &&
                      (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
                <th className="px-3 py-2 text-left font-semibold">
                  <button
                    onClick={() => handleSort("nombreMateria")}
                    className="flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Materia
                    {sortField === "nombreMateria" &&
                      (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
                {activeRole !== Rol.DOCENTE &&
                  <th className="px-3 py-2 text-left font-semibold">
                    <button
                      onClick={() => handleSort("docenteResponsable")}
                      className="flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity"
                    >
                      Docente
                      {sortField === "docenteResponsable" &&
                        (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                    </button>
                  </th>
                }
                <th className="px-3 py-2 text-left font-semibold">
                  <button
                    onClick={() => handleSort("nombreDepartamento")}
                    className="flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Departamento
                    {sortField === "nombreDepartamento" &&
                      (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
                <th className="px-3 py-2 text-left font-semibold">
                  <button
                    onClick={() => handleSort("estado")}
                    className="flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Estado
                    {sortField === "estado" &&
                      (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
                <th className="px-3 py-2 text-center font-semibold w-40">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedPrograms.length > 0 ? (
                sortedPrograms.map((programa) => (
                  <tr
                    key={programa.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-1.5">{programa.anio}</td>
                    <td className="px-3 py-1.5">
                      <div className="font-medium leading-tight">{programa.materia?.nombre}</div>
                      <div className="text-xs text-muted-foreground uppercase">{programa.materia?.codigo}</div>
                    </td>
                    {activeRole !== Rol.DOCENTE &&
                      <td className="px-3 py-1.5 text-xs">{programa.docenteResponsable?.apellido}, {programa.docenteResponsable?.nombre} (Legajo: {programa.docenteResponsable?.legajo})</td>
                    }
                    <td className="px-3 py-1.5 text-xs text-muted-foreground">{programa.materia?.departamento}</td>
                    <td className="px-3 py-1.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-sm ${
                          getProgramStateStyles(programa.estado as EstadoPrograma) || "border-gray-300 bg-gray-50 text-gray-600"
                        }`}
                      >
                        {getProgramStateLabel(programa.estado as EstadoPrograma)}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      <ProgramaAcciones
                        descripcion={`${programa.materia?.nombre ?? 'la materia'} (${programa.anio ?? ''})`}
                        revision={(activeRole === 'SECRETARIA' && programa.estado === 'PENDIENTE_DE_SECRETARIA_FINAL') || activeRole === 'COORDINADOR_AREA'}
                        onContinuar={rutaAccionPrograma(activeRole, programa.estado, programa.id)
                          ? () => router.push(rutaAccionPrograma(activeRole, programa.estado, programa.id)!) : undefined}
                        onVer={() => router.push(`/programas/${programa.id}`)}
                        onHistorial={() => router.push(`/programas/${programa.id}/historial-estados`)}
                        onVersiones={!esVistaVersiones ? () => router.push(`/programas/materia/${programa.materia?.id}/versiones`) : undefined}
                        onPdf={(activeRole === 'SECRETARIA' || activeRole === 'SYSTEM_ADMIN') && programa.estado === 'APROBADO'
                          ? () => { void handleGenerarPDF(programa.id) } : undefined}
                        onEliminar={puedeEliminar ? () => setProgramaAEliminar(programa) : undefined}
                        eliminarDeshabilitado={eliminando || !programa.id || !deptId}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search size={32} className="opacity-40" />
                      <p className="text-base">No se encontraron programas con los filtros seleccionados</p>
                      {(activeRole === "ADMINISTRACION") && (
                        <Link href="/programas/crear">
                          <Button>Nuevo programa</Button>
                        </Link>
                      )}
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
            itemLabel = "programas"
          />
        </div>
      </div>
      {puedeEliminar && (
        <Dialog open={programaAEliminar !== null} onOpenChange={open => {
          if (!open && !eliminando) setProgramaAEliminar(null)
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-destructive flex items-center gap-2">
                <Trash2 size={24} />
                Confirmar eliminación
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                ¿Estás seguro de que deseas eliminar el programa de{" "}
                <span className="font-semibold text-foreground">{programaAEliminar?.materia?.nombre}</span>
                {" del año "}<span className="font-semibold text-foreground">{programaAEliminar?.anio}</span>?
              </DialogDescription>
            </DialogHeader>
            <div className="bg-destructive/10 border-2 border-destructive/20 rounded-lg p-4 my-4">
              <p className="text-sm text-foreground">
                Esta acción no se puede deshacer. Se eliminarán el programa, su historial y sus decisiones relacionadas.
                Los borradores se conservarán.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setProgramaAEliminar(null)}
                disabled={eliminando} className="border-2">Cancelar</Button>
              <Button type="button" variant="destructive" onClick={handleEliminarConfirm}
                disabled={eliminando} className="bg-destructive">
                {eliminando ? "Eliminando..." : "Eliminar programa"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
