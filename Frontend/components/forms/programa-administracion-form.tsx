"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Plus } from "lucide-react"
import Link from "next/link"
import { ProgramaCarreraBlock } from "./programa-carrera-block"
import { ProgramaResponseDTO, ProgramaCargaAdministrativoDTO, UserResponseDTO, CarreraResponseDTO, MateriaResponseDTO, ProgramaCarreraCreateDTO, DepartamentoResponseDTO } from "@/app/api/generated/model"
import { useCreatePrograma, useListMateriasDepartamento } from "@/app/api/generated/client"
import { CargarProgramaAnteriorDialog } from "../modals/cargar-programa-dialog"

interface SyllabusFormProps {
  departamentosDisponibles: DepartamentoResponseDTO[]
  carrerasDisponibles: CarreraResponseDTO[]
  profesoresDisponibles: UserResponseDTO[]
}

export function SyllabusAdministrativoForm({ departamentosDisponibles, carrerasDisponibles, profesoresDisponibles }: SyllabusFormProps) {
  const [formData, setFormData] = useState<ProgramaCargaAdministrativoDTO>({
    materiaId: 0,
    profesorResponsableId: 0,
    bloqueMultiple: [],
    cargaHorariaTotal: 0,
    cargaHorariaSemanal: 0,
    creditos: 0,
    cantidadSemanas: 0
  })

  const [departamento, setDepartamento] = useState<DepartamentoResponseDTO | null>(null)
  const [materiasDisponibles, setMateriasDisponibles] = useState<MateriaResponseDTO[]>([])
  const [programaAnterior, setProgramaAnterior] = useState<ProgramaResponseDTO | null>(null)

  const [showProgramaAnteriorDialog, setShowProgramaAnteriorDialog] = useState(false)
  const [loadingProgramaAnterior, setLoadingProgramaAnterior] = useState(false)


  const {
    data: materias,
  } = useListMateriasDepartamento(departamento?.id!, {
    query: {
      queryKey: ["materiasPorDepartamento", departamento?.id],
      enabled: !!departamento,
    },
  })

  useEffect(() => {
    if (materias) {
      setMateriasDisponibles(materias)
    }
  }, [materias])

  // const { data: materiaDetails } = useGetMateria(formData.materiaId || 0, { // Get Programa Anterior
  //   query: {
  //     enabled: !!formData.materiaId,
  //   },
  // })


  useEffect(() => {
    if (programaAnterior && formData.materiaId && !showProgramaAnteriorDialog) {
      setShowProgramaAnteriorDialog(true)
    }
  }, [programaAnterior, formData.materiaId, showProgramaAnteriorDialog])



  const { mutate, isPending } = useCreatePrograma({
    mutation: {
      onSuccess: () => {
        alert("Programa creado exitosamente!");
        setFormData({
          materiaId: 0,
          profesorResponsableId: 0,
          bloqueMultiple: [],
          cargaHorariaTotal: 0,
          cargaHorariaSemanal: 0,
          creditos: 0,
          cantidadSemanas: 0,
        })
      },
      onError: (error: Error) => alert(`Error: ${error.message}`),
    }
  });

  const onSubmit = (data: any) => {
    mutate({ data });
  };

const handleLoadProgramaAnterior = async () => {
    if (!programaAnterior) return

    setLoadingProgramaAnterior(true)
    try {
      const mappedData: ProgramaCargaAdministrativoDTO = {
        materiaId: formData.materiaId,
        profesorResponsableId: programaAnterior.profesorResponsable
          ? profesoresDisponibles.find((p) => p.nombre === programaAnterior.profesorResponsable)?.id || 0
          : 0,
        bloqueMultiple:
          programaAnterior.bloqueMultiple?.map((c) => ({
            key: `${Date.now()}_${Math.random()}`,
            carreraId: c.carreraId || 0,
            plan: c.plan || "",
            ubicacionEnPlan: c.ubicacionEnPlan || "",
            correlativasFuertesIds: c.correlativasFuertesIds || [],
            correlativasDebilesIds: c.correlativasDebilesIds || [],
            contribucion: c.contribucion || "",
            contenidosMinimos: c.contenidosMinimos || "",
          })) || [],
        cargaHorariaTotal: programaAnterior.cargaHorariaTotal || 0,
        cargaHorariaSemanal: programaAnterior.cargaHorariaSemanal || 0,
        creditos: programaAnterior.creditos || 0,
        cantidadSemanas: programaAnterior.cantidadSemanas || 0,
      }
      setFormData(mappedData)
      setShowProgramaAnteriorDialog(false)
    } catch (error) {
      console.error("Error loading previous program:", error)
    } finally {
      setLoadingProgramaAnterior(false)
    }
  }


  const handleAddProgramaCarrera = () => {
    const newBlock: ProgramaCarreraCreateDTO = {
      key: Date.now().toString(),
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
        bloqueMultiple: [newBlock, ...(prev.bloqueMultiple || [])]
    }));
  }

  const handleUpdateProgramaCarrera = (index: number, block: ProgramaCarreraCreateDTO) => {
    setFormData((prev) => ({
      ...prev,
      bloqueMultiple: prev.bloqueMultiple?.map((c, i) => (i === index ? block : c)),
    }))
  }

  const handleRemoveProgramaCarrera = (index: number) => {
    const updatedBlocks = [...formData.bloqueMultiple || []]
    updatedBlocks.splice(index, 1)
    setFormData((prev) => ({
      ...prev,
      bloqueMultiple: updatedBlocks,
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

    if (formData.bloqueMultiple?.length === 0) {
      alert("Por favor agrega al menos una carrera")
      return
    }

    onSubmit(formData)
  }


  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* BLOQUE ÚNICO */}
        <div className="border-l-4 border-primary pl-6 py-4 bg-primary/5 rounded-r-lg">
          <h2 className="text-lg font-bold text-primary mb-6">Bloque Único</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="departamento" className="text-sm font-semibold text-foreground">
                Departamento *
              </Label>
              <select
                id="departamento"
                value={departamento?.nombre || ""}
                onChange={(e) => setDepartamento(departamentosDisponibles.find(d => d.nombre === e.target.value) || null)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Seleccionar Departamento...</option>
                {departamentosDisponibles.map((departamento) => (
                  <option key={departamento.id} value={departamento.nombre}>
                    {departamento.nombre}
                  </option>
                ))}
              </select>
            </div>

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
                <option value="">Seleccionar Materia...</option>
                {materiasDisponibles.map((materia) => (
                  <option key={materia.id} value={materia.id}>
                    {materia.nombre} ({materia.codigo})
                  </option>
                ))}
              </select>
            </div>

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
                {profesoresDisponibles.map((profesor) => (
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

          {formData.bloqueMultiple?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-background rounded-lg border-2 border-dashed border-accent/20">
              <p>No hay carreras agregadas aún</p>
              <p className="text-sm">Haz clic en "Agregar Carrera" para comenzar</p>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.bloqueMultiple?.map((block, index) => (
                <ProgramaCarreraBlock
                  key={block.key}
                  block={block}
                  index={index}
                  carreras={carrerasDisponibles}
                  onUpdate={handleUpdateProgramaCarrera}
                  onRemove={handleRemoveProgramaCarrera}
                  isDisabled={false}
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
                placeholder="ej: 128"
                className="border-border focus:border-primary bg-background"
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
                placeholder="ej: 8"
                className="border-border focus:border-primary bg-background"
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
                className="border-border focus:border-primary bg-background"
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
                placeholder="ej: 16"
                className="border-border focus:border-primary bg-background"
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
              value={programaAnterior?.cargaHorariaPractica}
              onChange={(e) => handleSingleFieldChange("cargaHorariaPractica", Number.parseInt(e.target.value))}
              placeholder="ej: 64"
              className="border-border focus:border-primary"
              disabled
            />
          </div>

          {/* Campos de texto largo */}
          <div className="space-y-2">
            <Label htmlFor="fundamentacion" className="text-sm font-semibold text-foreground">
              Fundamentación
            </Label>
            <Textarea
              id="fundamentacion"
              value={programaAnterior?.fundamentacion}
              onChange={(e) => handleSingleFieldChange("fundamentacion", e.target.value)}
              placeholder="Justifica la importancia de esta Materia..."
              className="border-border focus:border-primary min-h-20 resize-none"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objetivos" className="text-sm font-semibold text-foreground">
              Objetivos
            </Label>
            <Textarea
              id="objetivos"
              value={programaAnterior?.objetivos}
              onChange={(e) => handleSingleFieldChange("objetivos", e.target.value)}
              placeholder="Define los objetivos de aprendizaje..."
              className="border-border focus:border-primary min-h-20 resize-none"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="programa" className="text-sm font-semibold text-foreground">
              Programa Analítico
            </Label>
            <Textarea
              id="programa"
              value={programaAnterior?.programaAnalitico}
              onChange={(e) => handleSingleFieldChange("programaAnalitico", e.target.value)}
              placeholder="Detalla el contenido temático del curso..."
              className="border-border focus:border-primary min-h-20 resize-none"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metodologia" className="text-sm font-semibold text-foreground">
              Metodología
            </Label>
            <Textarea
              id="metodologia"
              value={programaAnterior?.metodologia}
              onChange={(e) => handleSingleFieldChange("metodologia", e.target.value)}
              placeholder="Describe los métodos de enseñanza..."
              className="border-border focus:border-primary min-h-20 resize-none" 
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evaluacion" className="text-sm font-semibold text-foreground">
              Modalidad de Evaluación
            </Label>
            <Textarea
              id="evaluacion"
              value={programaAnterior?.modalidadEvaluacion}
              onChange={(e) => handleSingleFieldChange("modalidadEvaluacion", e.target.value)}
              placeholder="Especifica cómo se evaluará el aprendizaje..."
              className="border-border focus:border-primary min-h-20 resize-none"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bibliografia" className="text-sm font-semibold text-foreground">
              Bibliografía
            </Label>
            <Textarea
              id="bibliografia"
              value={programaAnterior?.bibliografia}
              onChange={(e) => handleSingleFieldChange("bibliografia", e.target.value)}
              placeholder="Referencias bibliográficas recomendadas..."
              className="border-border focus:border-primary min-h-20 resize-none"
              disabled
            />
          </div>
        </div>

        {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-primary hover:bg-accent text-primary-foreground font-medium"
            >
              {isPending ? "Creando..." : "Crear Programa"}
            </Button>
            <Link href="/programas">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-border text-foreground hover:bg-muted bg-transparent"
              >
                Cancelar
              </Button>
            </Link>
          </div>
      </form>

      <CargarProgramaAnteriorDialog
        open={showProgramaAnteriorDialog}
        onOpenChange={setShowProgramaAnteriorDialog}
        programa={programaAnterior}
        onConfirm={handleLoadProgramaAnterior}
        onCancel={() => setShowProgramaAnteriorDialog(false)}
        isLoading={loadingProgramaAnterior}
      />
    </>
  )
}
