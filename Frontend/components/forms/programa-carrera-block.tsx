"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, X } from "lucide-react"
import { CarreraResponseDTO, MateriaResponseDTO, ProgramaCarreraDTO } from "@/app/api/generated/model"
import { useGetCarrera, useListMateriasCarrera } from "@/app/api/generated/client"
import React from "react"

interface ProgramaCarreraBlockProps {
  materiaId: number
  block: ProgramaCarreraDTO
  index: number
  carreras: CarreraResponseDTO[]
  onUpdate: (index: number, block: ProgramaCarreraDTO) => void
  onRemove: (index: number) => void
  isDisabled?: boolean
}
export const ProgramaCarreraBlock = React.memo(function ProgramaCarreraBlock({
  materiaId,
  block,
  index,
  carreras,
  onUpdate,
  onRemove,
  isDisabled
}: ProgramaCarreraBlockProps) {
  let selectedCarrera: CarreraResponseDTO | null = null;

  if(carreras.length === 0 && block.carreraId) {
    selectedCarrera = useGetCarrera(block.carreraId).data || null;
  } else {
    selectedCarrera = useMemo(
      () => carreras.find(c => c.id === block.carreraId) || null,
      [block.carreraId, carreras]
    )
  }

  const materiasQuery = useListMateriasCarrera(selectedCarrera?.id ?? 0, {
    query: {
      enabled: !!selectedCarrera?.id,
      staleTime: 5 * 60 * 1000, // 5 minutes
      queryKey: ['useListMateriasCarrera', selectedCarrera?.id ?? 0],
    },
  })

  const filteredMaterias = useMemo(() => {
    if (!materiasQuery.data) return []
    return materiasQuery.data.filter(m => m.id !== materiaId)
  }, [materiasQuery.data, materiaId])

  const handleCarreraChange = useCallback(
    (carreraId: string) => {
      onUpdate(index, {
        ...block,
        carreraId: Number(carreraId),
      })
    },
    [index, block, onUpdate]
  )

  const handleFieldChange = (field: keyof ProgramaCarreraDTO, value: any) => {
    onUpdate(index, {
      ...block,
      [field]: value,
    })
  }

  const toggleCorrelativaFuerte = useCallback(
    (id: number) => {
      const nuevosFuertes = block.correlativasFuertesIds?.includes(id)
        ? block.correlativasFuertesIds.filter(x => x !== id)
        : [...(block.correlativasFuertesIds || []), id]

      onUpdate(index, {
        ...block,
        correlativasFuertesIds: nuevosFuertes,
        correlativasDebilesIds:
          block.correlativasDebilesIds?.filter(x => x !== id),
      })
    },
    [block, index, onUpdate]
  )


  const toggleCorrelativaDebil = useCallback(
    (id: number) => {
      const nuevasDebiles = block.correlativasDebilesIds?.includes(id)
        ? block.correlativasDebilesIds.filter((x) => x !== id)
      : [...(block.correlativasDebilesIds || []), id]

    // Si se agrega como débil, remover de fuertes
    const nuevosFuertes = nuevasDebiles.includes(id)
      ? block.correlativasFuertesIds?.filter((x) => x !== id)
      : block.correlativasFuertesIds

    onUpdate(index, {
      ...block,
      correlativasFuertesIds: nuevosFuertes,
      correlativasDebilesIds: nuevasDebiles,
    })
    },
    [block, index, onUpdate]
  )
  

  return (
    <div className="relative border-2 border-primary/20 rounded-lg p-6 bg-background space-y-6">
      <button
        onClick={() => onRemove(index)}
        className={!isDisabled ? "absolute top-3 right-3 p-1 hover:bg-destructive/10 rounded text-destructive" : "hidden"}
        title="Eliminar bloque"
        disabled={isDisabled}
      >
        <X size={20} />
      </button>

      <div className="text-sm font-semibold text-primary">Programa Carrera #{index + 1}</div>

      <div className="space-y-2">
        <Label htmlFor={`carrera-${index}`} className="text-sm font-semibold text-foreground">
          Carrera *
        </Label>
        {isDisabled ? (
          <Input
            id={`carrera-${index}`}
            value={selectedCarrera?.nombre || ""}
            className="bg-background border-border"
            disabled
          />
        ) : (
          <select
            id={`carrera-${index}`}
            value={selectedCarrera?.id || ""}
            onChange={(e) => handleCarreraChange(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Seleccionar carrera...</option>
            {carreras.map((carrera) => (
              <option key={carrera.id} value={carrera.id}>
                {carrera.nombre}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`plan-${index}`} className="text-sm font-semibold text-foreground">
          Plan
        </Label>
        <Input
          id={`plan-${index}`}
          value={block.plan}
          // value={selectedCarrera?.plan || ""}
          onChange={(e) => handleFieldChange("plan", e.target.value)}
          placeholder="ej: Plan 2025 - Versión 1"
          className="border-border focus:border-primary"
          disabled={isDisabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`ubicacion-${index}`} className="text-sm font-semibold text-foreground">
          Ubicación en Plan
        </Label>
        <Input
          id={`ubicacion-${index}`}
          value={block.ubicacionEnPlan}
          onChange={(e) => handleFieldChange("ubicacionEnPlan", e.target.value)}
          placeholder="ej: Segundo semestre"
          className="border-border focus:border-primary"
          disabled={isDisabled}
        />
      </div>

      {materiasQuery.isLoading ? (
          <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando materias...</p>
          </div>
      ) : materiasQuery.error ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">Error al obtener las materias</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3 border border-primary/20 rounded-lg p-4 bg-primary/5">
            <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
              Correlativas Fuertes
              <span className="text-xs text-muted-foreground">(Requiere aprobar)</span>
            </Label>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {filteredMaterias?.map((materia) => (
                <label
                  key={materia.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-background p-2 rounded transition"
                >
                  <input
                    type="checkbox"
                    checked={block.correlativasFuertesIds?.includes(materia.id || 0)}
                    onChange={() => toggleCorrelativaFuerte(materia.id || 0)}
                    disabled={isDisabled || block.correlativasDebilesIds?.includes(materia.id || 0)}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-foreground">{materia.nombre}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3 border border-primary/20 rounded-lg p-4 bg-primary/5">
            <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
              Correlativas Débiles
              <span className="text-xs text-muted-foreground">(Recomendado)</span>
            </Label>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {filteredMaterias?.map((materia) => (
                <label
                  key={materia.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-background p-2 rounded transition"
                >
                  <input
                    type="checkbox"
                    checked={block.correlativasDebilesIds?.includes(materia.id || 0)}
                    onChange={() => toggleCorrelativaDebil(materia.id || 0)}
                    disabled={isDisabled || block.correlativasFuertesIds?.includes(materia.id || 0)}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-foreground">{materia.nombre}</span>
                </label>
              ))}
            </div>
          </div>
      </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={`contribucion-${index}`} className="text-sm font-semibold text-foreground">
          Contribución
        </Label>
        <Textarea
          id={`contribucion-${index}`}
          value={block.contribucion}
          onChange={(e) => handleFieldChange("contribucion", e.target.value)}
          placeholder="Describe la contribución de esta carrera..."
          className="border-border focus:border-primary min-h-16 resize-none"
          disabled={isDisabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`contenidos-${index}`} className="text-sm font-semibold text-foreground">
          Contenidos Mínimos
        </Label>
        <Textarea
          id={`contenidos-${index}`}
          value={block.contenidosMinimos}
          onChange={(e) => handleFieldChange("contenidosMinimos", e.target.value)}
          placeholder="Lista los contenidos mínimos requeridos..."
          className="border-border focus:border-primary min-h-16 resize-none"
          disabled={isDisabled}
        />
      </div>
    </div>
  )
})
