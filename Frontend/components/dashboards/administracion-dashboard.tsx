"use client"

import { useState } from "react"
import { Plus, BookOpen, Eye, Trash2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SyllabusAdministrativoForm } from "../forms/programa-administracion-form"
import Link from "next/link"
import { ProgramasListReduced } from "../pages/programas-list-reduced"
import { useRouter } from "next/navigation"
import { CarreraResponseDTO, EstadoHistoricoResponseDTOEstado, ProgramaResponseDTO, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"
import { useRole } from "@/context/role-context"
import { useDept } from "@/context/dept-context"
import { useListProgramas } from "@/app/api/generated/client"


export function AdministracionDashboard() {
  const [showForm, setShowForm] = useState(false)
  const [syllabuses, setSyllabuses] = useState([
    {
      id: 1,
      name: "Cálculo Diferencial",
      code: "MAT101",
      professor: "Dr. Juan García",
      semester: "2025-1",
      status: "published",
    },
    {
      id: 2,
      name: "Programación I",
      code: "INF102",
      professor: "Ing. María López",
      semester: "2025-1",
      status: "draft",
    },
  ])
  const { activeDepartamento } = useDept()
  const { activeRole } = useRole();
  
    const programasQuery = useListProgramas(
      activeDepartamento!.departamentoId!,
      {
        rolActivo: activeRole as UsuarioDepartamentoDTORolesItem || UsuarioDepartamentoDTORolesItem.ADMINISTRACION,
      },
    {
      query: {
        enabled: !!activeDepartamento?.departamentoId && !!activeRole,
        queryKey: useListProgramas(
          activeDepartamento!.departamentoId!,
          {
            rolActivo: activeRole as UsuarioDepartamentoDTORolesItem || UsuarioDepartamentoDTORolesItem.ADMINISTRACION,
          }
        ).queryKey,
      }, 
    }
  );

  const programas: ProgramaResponseDTO[] = programasQuery.data || [];

  const programasVigentes = programas.filter((programa) => programa.estado === EstadoHistoricoResponseDTOEstado.APROBADO_POR_SECRETARIA);
  const programasPendientes = programas.filter((programa) => programa.estado === EstadoHistoricoResponseDTOEstado.INCOMPLETO_POR_ADMINISTRACION);


  const router = useRouter();

  const handleNavigate = (id: number) => {
    router.push(`/programas/crear/${id}`);
  };


     if (!activeDepartamento || !activeDepartamento.departamentoId || !activeRole) {
      return(
        <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-yellow-700">Cargando datos de los programas...</p>
          </div>  
        </div>
      )
    }

    if (programasQuery.isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando datos de los programas...</p>
                </div>
            </div>
        )
    }

    if (programasQuery.error) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">Error al obtener los programas</p>
          </div>
        </div>
      )
    }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Panel Administrativo</h1>
        <p className="text-muted-foreground">Gestiona todos los programa del sistema universitario</p>
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <Link href={"/programas/crear"}>
          <Button
            className="gap-2 bg-primary hover:bg-accent text-primary-foreground"
            size="lg"
          >
            <Plus size={20} />
            {showForm ? "Cancelar" : "Crear Nuevo Programa"}
          </Button>
        </Link>
      </div>

      {/* Syllabuses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {syllabuses.map((syllabus) => (
          <Card key={syllabus.id} className="hover:shadow-lg transition-shadow border-border hover:border-primary/30">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <CardTitle className="text-primary text-lg">{syllabus.name}</CardTitle>
                  <CardDescription className="text-xs font-mono">{syllabus.code}</CardDescription>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    syllabus.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {syllabus.status === "published" ? "Publicado" : "Borrador"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Profesor</p>
                <p className="text-sm font-medium text-foreground">{syllabus.professor}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Semestre</p>
                <p className="text-sm font-medium text-foreground">{syllabus.semester}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm" className="flex-1 gap-1 bg-transparent">
                  <Eye size={16} />
                  Ver
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-1 bg-transparent">
                  <BookOpen size={16} />
                  Editar
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 bg-transparent">
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {syllabuses.length === 0 && !showForm && (
        <Card className="border-dashed border-primary/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen size={48} className="text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-center">No hay programa creados aún</p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Crea uno nuevo para comenzar a gestionar contenido académico
            </p>
          </CardContent>
        </Card>
      )}


      <Card>
        <CardHeader>
          <CardTitle>Pendientes</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <ProgramasListReduced programas={programasPendientes} onRowClick={handleNavigate} />
        </CardContent>
      </Card>
    </div>
  )
}
