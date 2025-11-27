"use client"

import { useState } from "react"
import { Plus, BookOpen, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SyllabusForm } from "../forms/syllabus-form"
import { useCreatePrograma } from "@/app/api/generated/syllabusApi"

export function AdminDashboard() {
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

  const handleAddSyllabus = (data: any) => {
    const newSyllabus = {
      ...data,
      status: "INCOMPLETO_ADMINISTRACION",
    }
    useCreatePrograma(newSyllabus) // Llamada a la API para crear el sílabus
    setSyllabuses([...syllabuses, newSyllabus])
    setShowForm(false)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Panel Administrativo</h1>
        <p className="text-muted-foreground">Gestiona todos los sílabus del sistema universitario</p>
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 bg-primary hover:bg-accent text-primary-foreground"
          size="lg"
        >
          <Plus size={20} />
          {showForm ? "Cancelar" : "Crear Nuevo Sílabus"}
        </Button>
      </div>

      {/* Form Section */}
      {showForm && (
        <Card className="mb-8 border-primary/20">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-primary">Crear Nuevo Sílabus</CardTitle>
            <CardDescription>Completa los campos para crear un nuevo sílabus académico</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <SyllabusForm onSubmit={handleAddSyllabus} onCancel={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

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
            <p className="text-muted-foreground text-center">No hay sílabus creados aún</p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Crea uno nuevo para comenzar a gestionar contenido académico
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
