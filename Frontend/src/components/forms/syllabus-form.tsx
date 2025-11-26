"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface SyllabusFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function SyllabusForm({ onSubmit, onCancel }: SyllabusFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    professor: "",
    semester: "",
    credits: "",
    description: "",
    objectives: "",
    prerequisites: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.code && formData.professor && formData.semester) {
      onSubmit(formData)
      setFormData({
        name: "",
        code: "",
        professor: "",
        semester: "",
        credits: "",
        description: "",
        objectives: "",
        prerequisites: "",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Row 1: Nombre y Código */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-semibold text-foreground">
            Nombre del Curso *
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="ej: Cálculo Diferencial"
            className="border-border focus:border-primary"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code" className="text-sm font-semibold text-foreground">
            Código del Curso *
          </Label>
          <Input
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="ej: MAT101"
            className="border-border focus:border-primary"
            required
          />
        </div>
      </div>

      {/* Row 2: Profesor y Semestre */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="professor" className="text-sm font-semibold text-foreground">
            Profesor Responsable *
          </Label>
          <Input
            id="professor"
            name="professor"
            value={formData.professor}
            onChange={handleChange}
            placeholder="ej: Dr. Juan García"
            className="border-border focus:border-primary"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="semester" className="text-sm font-semibold text-foreground">
            Semestre *
          </Label>
          <Input
            id="semester"
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            placeholder="ej: 2025-1"
            className="border-border focus:border-primary"
            required
          />
        </div>
      </div>

      {/* Row 3: Créditos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="credits" className="text-sm font-semibold text-foreground">
            Créditos
          </Label>
          <Input
            id="credits"
            name="credits"
            type="number"
            value={formData.credits}
            onChange={handleChange}
            placeholder="ej: 4"
            className="border-border focus:border-primary"
          />
        </div>
      </div>

      {/* Row 4: Descripción */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-semibold text-foreground">
          Descripción del Curso
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe el contenido general del curso..."
          className="border-border focus:border-primary min-h-24 resize-none"
        />
      </div>

      {/* Row 5: Objetivos */}
      <div className="space-y-2">
        <Label htmlFor="objectives" className="text-sm font-semibold text-foreground">
          Objetivos Generales
        </Label>
        <Textarea
          id="objectives"
          name="objectives"
          value={formData.objectives}
          onChange={handleChange}
          placeholder="Define los objetivos principales del curso..."
          className="border-border focus:border-primary min-h-24 resize-none"
        />
      </div>

      {/* Row 6: Prerrequisitos */}
      <div className="space-y-2">
        <Label htmlFor="prerequisites" className="text-sm font-semibold text-foreground">
          Prerrequisitos
        </Label>
        <Input
          id="prerequisites"
          name="prerequisites"
          value={formData.prerequisites}
          onChange={handleChange}
          placeholder="ej: MAT100, INF101"
          className="border-border focus:border-primary"
        />
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
