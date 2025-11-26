"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { ProgramaCarreraBlock } from "./programa-carrera-block"
import type { SyllabusCreateDTO, ProgramaCarreraDTO, Carrera, Materia, Profesor } from "@/lib/types"

interface SyllabusFormProps {
  onSubmit: (data: SyllabusCreateDTO) => void
  onCancel: () => void
}

// Mock data - Reemplazar con fetches reales
const mockMaterias: Materia[] = [
  { id: 1, nombre: "Cálculo I", codigo: "MAT101" },
  { id: 2, nombre: "Álgebra Lineal", codigo: "MAT102" },
  { id: 3, nombre: "Programación", codigo: "INF101" },
  { id: 4, nombre: "Física I", codigo: "FIS101" },
]

const mockProfesores: Profesor[] = [
  { id: 1, nombre: "Dr. Juan García", email: "juan@uns.edu.ar" },
  { id: 2, nombre: "Dra. María López", email: "maria@uns.edu.ar" },
  { id: 3, nombre: "Ing. Carlos Martínez", email: "carlos@uns.edu.ar" },
]

const mockCarreras: Carrera[] = [
  { id: 1, nombre: "Ingeniería en Sistemas" },
  { id: 2, nombre: "Ingeniería Química" },
  { id: 3, nombre: "Ingeniería Civil" },
]

// Mock: materias disponibles por carrera
const mockMateriasPorCarrera: Record<number, Materia[]> = {
  1: [
    { id: 1, nombre: "Cálculo I", codigo: "MAT101" },
    { id: 2, nombre: "Álgebra Lineal", codigo: "MAT102" },
    { id: 3, nombre: "Programación", codigo: "INF101" },
  ],
  2: [
    { id: 1, nombre: "Cálculo I", codigo: "MAT101" },
    { id: 4, nombre: "Física I", codigo: "FIS101" },
  ],
  3: [
    { id: 1, nombre: "Cálculo I", codigo: "MAT101" },
    { id: 4, nombre: "Física I", codigo: "FIS101" },
    { id: 2, nombre: "Álgebra Lineal", codigo: "MAT102" },
  ],
}

export function SyllabusForm({ onSubmit, onCancel }: SyllabusFormProps) {
  const [formData, setFormData] = useState<SyllabusCreateDTO>({
    // Bloque único
    materiaId: 0,
    profesorResponsableId: 0,

    // Bloque múltiple
    carreras: [],
    cargaHorariaTotal: 0,
    cargaHorariaSemanal: 0,
    creditos: 0,
    cantidadSemanas: 0,
    cargaHorariaPractica: 0,
    fundamentacion: "",
    objetivos: "",
    programaAnalitico: "",
    metodologia: "",
    modalidadEvaluacion: "",
    bibliografia: "",
  })

  const handleAddProgramaCarrera = () => {
    const newBlock: ProgramaCarreraDTO = {
      carreraId: 0,
      plan: "",
      ubicacionEnPlan: "",
      correlativasFuertesIds: [],
      correlativasDebilesIds: [],
      contribucion: "",
      contenidosMinimos: "",
    }
    setFormData((prev) => ({
      ...prev,
      carreras: [...prev.carreras, newBlock],
    }))
  }

  const handleUpdateProgramaCarrera = (index: number, block: ProgramaCarreraDTO) => {
    setFormData((prev) => ({
      ...prev,
      carreras: prev.carreras.map((c, i) => (i === index ? block : c)),
    }))
  }

  const handleRemoveProgramaCarrera = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      carreras: prev.carreras.filter((_, i) => i !== index),
    }))
  }

  const handleSingleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones básicas
    if (!formData.materiaId || !formData.profesorResponsableId) {
      alert("Por favor completa los campos obligatorios del bloque único")
      return
    }

    if (formData.carreras.length === 0) {
      alert("Por favor agrega al menos una carrera")
      return
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* BLOQUE ÚNICO */}
      <div className="border-l-4 border-primary pl-6 py-4 bg-primary/5 rounded-r-lg">
        <h2 className="text-lg font-bold text-primary mb-6">Bloque Único</h2>

        <div className="space-y-4">
          {/* Materia */}
          <div className="space-y-2">
            <Label htmlFor="materia" className="text-sm font-semibold text-foreground">
              Materia *
            </Label>
            <select
              id="materia"
              value={formData.materiaId || ""}
              onChange={(e) => handleSingleFieldChange("materiaId", Number.parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Seleccionar materia...</option>
              {mockMaterias.map((materia) => (
                <option key={materia.id} value={materia.id}>
                  {materia.nombre} ({materia.codigo})
                </option>
              ))}
            </select>
          </div>

          {/* Profesor Responsable */}
          <div className="space-y-2">
            <Label htmlFor="profesor" className="text-sm font-semibold text-foreground">
              Profesor Responsable *
            </Label>
            <select
              id="profesor"
              value={formData.profesorResponsableId || ""}
              onChange={(e) => handleSingleFieldChange("profesorResponsableId", Number.parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Seleccionar profesor...</option>
              {mockProfesores.map((profesor) => (
                <option key={profesor.id} value={profesor.id}>
                  {profesor.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* BLOQUE MÚLTIPLE */}
      <div className="border-l-4 border-accent pl-6 py-4 bg-accent/5 rounded-r-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-accent">Bloques por Carrera</h2>
          <Button
            type="button"
            onClick={handleAddProgramaCarrera}
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            size="sm"
          >
            <Plus size={18} />
            Agregar Carrera
          </Button>
        </div>

        {formData.carreras.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-background rounded-lg border-2 border-dashed border-accent/20">
            <p>No hay carreras agregadas aún</p>
            <p className="text-sm">Haz clic en "Agregar Carrera" para comenzar</p>
          </div>
        ) : (
          <div className="space-y-6">
            {formData.carreras.map((block, index) => (
              <ProgramaCarreraBlock
                key={index}
                block={block}
                index={index}
                carreras={mockCarreras}
                materiasPorCarrera={mockMateriasPorCarrera}
                onUpdate={handleUpdateProgramaCarrera}
                onRemove={handleRemoveProgramaCarrera}
              />
            ))}
          </div>
        )}
      </div>

      {/* CONFIGURACIÓN GENERAL */}
      <div className="border-l-4 border-primary pl-6 py-4 bg-primary/5 rounded-r-lg space-y-6">
        <h2 className="text-lg font-bold text-primary">Configuración General</h2>

        {/* Carga Horaria */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cargaTotal" className="text-sm font-semibold text-foreground">
              Carga Horaria Total
            </Label>
            <Input
              id="cargaTotal"
              type="number"
              value={formData.cargaHorariaTotal}
              onChange={(e) => handleSingleFieldChange("cargaHorariaTotal", Number.parseInt(e.target.value))}
              placeholder="ej: 120"
              className="border-border focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cargaSemanal" className="text-sm font-semibold text-foreground">
              Carga Horaria Semanal
            </Label>
            <Input
              id="cargaSemanal"
              type="number"
              value={formData.cargaHorariaSemanal}
              onChange={(e) => handleSingleFieldChange("cargaHorariaSemanal", Number.parseInt(e.target.value))}
              placeholder="ej: 6"
              className="border-border focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="creditos" className="text-sm font-semibold text-foreground">
              Créditos
            </Label>
            <Input
              id="creditos"
              type="number"
              value={formData.creditos}
              onChange={(e) => handleSingleFieldChange("creditos", Number.parseInt(e.target.value))}
              placeholder="ej: 4"
              className="border-border focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="semanas" className="text-sm font-semibold text-foreground">
              Cantidad de Semanas
            </Label>
            <Input
              id="semanas"
              type="number"
              value={formData.cantidadSemanas}
              onChange={(e) => handleSingleFieldChange("cantidadSemanas", Number.parseInt(e.target.value))}
              placeholder="ej: 15"
              className="border-border focus:border-primary"
            />
          </div>
        </div>

        {/* Carga Práctica */}
        <div className="space-y-2">
          <Label htmlFor="cargaPractica" className="text-sm font-semibold text-foreground">
            Carga Horaria Práctica
          </Label>
          <Input
            id="cargaPractica"
            type="number"
            value={formData.cargaHorariaPractica}
            onChange={(e) => handleSingleFieldChange("cargaHorariaPractica", Number.parseInt(e.target.value))}
            placeholder="ej: 40"
            className="border-border focus:border-primary"
          />
        </div>

        {/* Campos de texto largo */}
        <div className="space-y-2">
          <Label htmlFor="fundamentacion" className="text-sm font-semibold text-foreground">
            Fundamentación
          </Label>
          <Textarea
            id="fundamentacion"
            value={formData.fundamentacion}
            onChange={(e) => handleSingleFieldChange("fundamentacion", e.target.value)}
            placeholder="Justifica la importancia de esta materia..."
            className="border-border focus:border-primary min-h-20 resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="objetivos" className="text-sm font-semibold text-foreground">
            Objetivos
          </Label>
          <Textarea
            id="objetivos"
            value={formData.objetivos}
            onChange={(e) => handleSingleFieldChange("objetivos", e.target.value)}
            placeholder="Define los objetivos de aprendizaje..."
            className="border-border focus:border-primary min-h-20 resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="programa" className="text-sm font-semibold text-foreground">
            Programa Analítico
          </Label>
          <Textarea
            id="programa"
            value={formData.programaAnalitico}
            onChange={(e) => handleSingleFieldChange("programaAnalitico", e.target.value)}
            placeholder="Detalla el contenido temático del curso..."
            className="border-border focus:border-primary min-h-20 resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="metodologia" className="text-sm font-semibold text-foreground">
            Metodología
          </Label>
          <Textarea
            id="metodologia"
            value={formData.metodologia}
            onChange={(e) => handleSingleFieldChange("metodologia", e.target.value)}
            placeholder="Describe los métodos de enseñanza..."
            className="border-border focus:border-primary min-h-20 resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="evaluacion" className="text-sm font-semibold text-foreground">
            Modalidad de Evaluación
          </Label>
          <Textarea
            id="evaluacion"
            value={formData.modalidadEvaluacion}
            onChange={(e) => handleSingleFieldChange("modalidadEvaluacion", e.target.value)}
            placeholder="Especifica cómo se evaluará el aprendizaje..."
            className="border-border focus:border-primary min-h-20 resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bibliografia" className="text-sm font-semibold text-foreground">
            Bibliografía
          </Label>
          <Textarea
            id="bibliografia"
            value={formData.bibliografia}
            onChange={(e) => handleSingleFieldChange("bibliografia", e.target.value)}
            placeholder="Referencias bibliográficas recomendadas..."
            className="border-border focus:border-primary min-h-20 resize-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button type="submit" className="flex-1 bg-primary hover:bg-accent text-primary-foreground font-medium">
          Crear Sílabus
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-border text-foreground hover:bg-muted bg-transparent"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
