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
import { ProgramaResponseDTO, ProgramaCargaAdministrativoDTO, UserResponseDTO, CarreraResponseDTO, MateriaResponseDTO, ProgramaCarreraDTO, DepartamentoResponseDTO, ProgramaCargaDTO } from "@/app/api/generated/model"
import { useCreatePrograma, useGetPrograma, useGetProgramaVigente, useListCarrerasDepartamento, useListDocentesDepartamento, useListMateriasDepartamento, useListUsersDepartamento } from "@/app/api/generated/client"
import { CargarProgramaVigenteDialog } from "../modals/cargar-programa-dialog"
import { useDept } from "@/context/dept-context"
import { useRouter } from "next/navigation"


export function SyllabusAdministrativoForm() {
  const router = useRouter();
  const { activeDepartamento } = useDept()
  const [showProgramaVigente, setShowProgramaVigente] = useState(false)
  const [loadingProgramaVigente, setLoadingProgramaVigente] = useState(false)
  const [formData, setFormData] = useState<ProgramaCargaDTO>({
    materiaId: 0,
    profesorResponsableId: 0,
    bloqueMultiple: [],
    cargaHorariaTotal: 0,
    cargaHorariaSemanal: 0,
    creditos: 0,
    cantidadSemanas: 0
  })

  const deptId = activeDepartamento?.departamentoId

  const materiasQuery = useListMateriasDepartamento(deptId ?? 0, {
    query: {
      enabled: !!deptId,
      queryKey: useListMateriasDepartamento(deptId || 0).queryKey,
    },
  })

  const materias: MateriaResponseDTO[] | undefined = materiasQuery.data;

  const programaVigenteQuery = useGetProgramaVigente(formData.materiaId ?? 0, {
    query: {
      enabled: !!formData.materiaId,
      queryKey: useGetProgramaVigente(formData.materiaId || 0).queryKey,
    },
  })

  const programaVigente: ProgramaResponseDTO | undefined = programaVigenteQuery.data;

  const carrerasQuery = useListCarrerasDepartamento(deptId ?? 0, {
    query: {
      enabled: !!deptId,
      queryKey: useListCarrerasDepartamento(deptId || 0).queryKey,
    },
  })

  const carreras: CarreraResponseDTO[] | undefined = carrerasQuery.data;


  const profesoresQuery = useListDocentesDepartamento(deptId ?? 0, {
    query: {
      enabled: !!deptId,
      queryKey: useListDocentesDepartamento(deptId || 0).queryKey,
    },
  })

  const profesores: UserResponseDTO[] | undefined = profesoresQuery.data;

  useEffect(() => {
    if (programaVigente && formData.materiaId && !showProgramaVigente) {
      setShowProgramaVigente(true)
    }
  }, [programaVigente, formData.materiaId])



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

    router.push('/'); 
  };

const handleLoadProgramaVigente = async () => {
    if (!programaVigente) return

    setLoadingProgramaVigente(true)
    try {
      const mappedData: ProgramaCargaDTO = {
        materiaId: formData.materiaId,
        profesorResponsableId: programaVigente.profesorResponsable
          ? profesores?.find((p) => p.nombre === programaVigente.profesorResponsable)?.id || 0
          : 0,
        bloqueMultiple:
          programaVigente.bloqueMultiple?.map((c) => ({
            key: `${Date.now()}_${Math.random()}`,
            carreraId: c.carreraId || 0,
            plan: c.plan || "",
            ubicacionEnPlan: c.ubicacionEnPlan || "",
            correlativasFuertesIds: c.correlativasFuertesIds || [],
            correlativasDebilesIds: c.correlativasDebilesIds || [],
            contribucion: c.contribucion || "",
            contenidosMinimos: c.contenidosMinimos || "",
          })) || [],
        cargaHorariaTotal: programaVigente.cargaHorariaTotal || 0,
        cargaHorariaSemanal: programaVigente.cargaHorariaSemanal || 0,
        creditos: programaVigente.creditos || 0,
        cantidadSemanas: programaVigente.cantidadSemanas || 0,
      }
      setFormData(mappedData)
      setShowProgramaVigente(false)
    } catch (error) {
      console.error("Error loading previous program:", error)
    } finally {
      setLoadingProgramaVigente(false)
    }
  }


  const handleAddProgramaCarrera = () => {
    const newBlock: ProgramaCarreraDTO = {
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

  const handleUpdateProgramaCarrera = (index: number, block: ProgramaCarreraDTO) => {
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


    if (!activeDepartamento || !activeDepartamento.departamentoId) {
      return(
        <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-yellow-700">Cargando...</p>
          </div>
        </div>
      )
    }
  
    if (materiasQuery.isLoading) {
        return (
          <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
              <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Cargando materias disponibles...</p>
              </div>
          </div>
        )
    }
  
    if (materiasQuery.error) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">Error al obtener las materias</p>
          </div>
        </div>
      )
    }
  
    if (!materias || materias.length === 0) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="text-yellow-600" size={24} />
            <p className="text-yellow-700">No hay materias registradas. Deben haber materias registradas para poder crear programas.</p>
          </div>
        </div>
      )
    }

    // if (programaVigenteQuery.isLoading) {
    //     return (
    //       <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
    //           <div className="text-center">
    //               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
    //               <p className="text-muted-foreground">Cargando programa vigente...</p>
    //           </div>
    //       </div>
    //     )
    // }
  
    // if (programaVigenteQuery.error) {
    //   return (
    //     <div className="p-8 max-w-7xl mx-auto">
    //       <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
    //         <AlertCircle className="text-red-600" size={24} />
    //         <p className="text-red-700">Error al obtener el programa vigente</p>
    //       </div>
    //     </div>
    //   )
    // }
  

    if (carrerasQuery.isLoading) {
      return (
        <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando carreras disponibles...</p>
            </div>
        </div>
      )
    }
  
    if (carrerasQuery.error) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">Error al obtener las carreras</p>
          </div>
        </div>
      )
    }
  
    if (!carreras || carreras.length === 0) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="text-yellow-600" size={24} />
            <p className="text-yellow-700">No hay carreras registradas. Deben haber carreras registradas para poder crear programas.</p>
          </div>
        </div>
      )
    }

    if (profesoresQuery.isLoading) {
      return (
        <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando profesores disponibles...</p>
            </div>
        </div>
      )
    }
  
    if (profesoresQuery.error) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">Error al obtener los profesores</p>
          </div>
        </div>
      )
    }
  
    if (!profesores || profesores.length === 0) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="text-yellow-600" size={24} />
            <p className="text-yellow-700">No hay profesores registrados. Deben haber profesores registrados para poder crear programas.</p>
          </div>
        </div>
      )
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
                value={activeDepartamento?.departamentoNombre}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option key={activeDepartamento.departamentoId} value={activeDepartamento.departamentoId!.toString()}>
                  {activeDepartamento?.departamentoNombre}
                </option>
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
                {materias.map((materia) => (
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
                {profesores.map((profesor) => (
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
                  materiaId={formData.materiaId || 0}
                  block={block}
                  index={index}
                  carreras={carreras}
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
              value={formData?.cargaHorariaPractica}
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
              value={formData?.fundamentacion}
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
              value={formData?.objetivos}
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
              value={formData?.programaAnalitico}
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
              value={formData?.metodologia}
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
              value={formData?.modalidadEvaluacion}
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
              value={formData?.bibliografia}
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

      <CargarProgramaVigenteDialog
        open={showProgramaVigente}
        onOpenChange={setShowProgramaVigente}
        programa={programaVigente}
        onConfirm={handleLoadProgramaVigente}
        onCancel={() => setShowProgramaVigente(false)}
        isLoading={loadingProgramaVigente}
      />
    </>
  )
}
