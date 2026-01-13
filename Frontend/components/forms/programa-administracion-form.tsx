"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2, Plus } from "lucide-react"
import Link from "next/link"
import { ProgramaCarreraCreateBlock } from "./programa-carrera-block-field"
import { ProgramaResponseDTO, UserResponseDTO, CarreraResponseDTO, MateriaResponseDTO, ProgramaCargaDTO, ProgramaCarreraCreateDTO, EstadoHistoricoResponseDTOEstado, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"
import { getGetProgramaQueryKey, getListCarrerasQueryKey, getListDocentesDepartamentoQueryKey, getListMateriasDepartamentoQueryKey, getListProgramasQueryKey, useAdministrativoCarga, useGetPrograma, useListCarreras, useListDocentesDepartamento, useListMateriasDepartamento } from "@/app/api/generated/client"
import { useDept } from "@/context/dept-context"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { RejectionInfoCard } from "../ui/rejection-info-card"
import { useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/context/role-context"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"

interface SyllabusFormProps {
  id: number,
}

export function SyllabusAdministrativoForm({ id }: SyllabusFormProps) {
  const router = useRouter();
  const { activeDepartamento } = useDept()
  const { activeRole } = useRole();
  const queryClient = useQueryClient();
  const [loadingProgramaVigente, setLoadingProgramaVigente] = useState(false)
  const [removeProgramaCarreraIndex, setRemoveProgramaCarreraIndex] = useState<number | null>(null)
  const actualYear = new Date().getFullYear()
  const [formData, setFormData] = useState<ProgramaCargaDTO>({
    anio: actualYear,
    materiaId: 0,
    profesorResponsableId: 0,
    bloqueMultiple: [],
    cargaHorariaTotal: 0,
    cargaHorariaSemanal: 0,
    creditos: 0,
    cantidadSemanas: 0
  })

  const deptId = activeDepartamento?.departamentoId
  
  const programaQuery = useGetPrograma(id,
    {
      query: {
        staleTime: 1000 * 60 * 5,
        queryKey: getGetProgramaQueryKey(id)
      }
    }
  );
  const programa: ProgramaResponseDTO | undefined = programaQuery.data;

  const ultimoEstado = programa?.historialEstados?.at(-1);
  const esRechazado = ultimoEstado?.estado === EstadoHistoricoResponseDTOEstado.RECHAZADO_A_ADMINISTRACION;
  
  
  const materiasQuery = useListMateriasDepartamento(deptId ?? 0, {
    query: {
      enabled: !!deptId,
      staleTime: 1000 * 60 * 5,
      queryKey: getListMateriasDepartamentoQueryKey(deptId),
    },
  })

  const materias: MateriaResponseDTO[] | undefined = materiasQuery.data;



  const carrerasQuery = useListCarreras({
    query: {
      staleTime: 1000 * 60 * 5,
      queryKey: getListCarrerasQueryKey()
    },
  })

  const carreras: CarreraResponseDTO[] | undefined = carrerasQuery.data;


  const profesoresQuery = useListDocentesDepartamento(deptId ?? 0, {
    query: {
      enabled: !!deptId,
      staleTime: 1000 * 60 * 5,    
      queryKey: getListDocentesDepartamentoQueryKey(deptId),
    },
  })

  const profesores: UserResponseDTO[] | undefined = profesoresQuery.data;


  const [selectedMateria, setSelectedMateria] = useState<MateriaResponseDTO | undefined>(undefined)

  const { mutate, isPending } = useAdministrativoCarga({
    mutation: {
      onSuccess: () => {
        toast({
          title: "✓ Éxito",
          description: "Programa cargado exitosamente",
          variant: "success",
        })        
        setFormData({
          anio: actualYear,
          materiaId: 0,
          profesorResponsableId: 0,
          bloqueMultiple: [],
          cargaHorariaTotal: 0,
          cargaHorariaSemanal: 0,
          creditos: 0,
          cantidadSemanas: 0,
        })

        queryClient.invalidateQueries({
          queryKey: getListProgramasQueryKey(
            activeDepartamento!.departamentoId!,
            { rolActivo: activeRole as UsuarioDepartamentoDTORolesItem }
          )
        });

        router.push('/'); 
      },
      onError: (error: Error) => {
        toast({
          title: "✗ Error",
          description: error instanceof Error ? error.message : "Error desconocido",
          variant: "destructive",
        })
      },
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.bloqueMultiple || formData.bloqueMultiple.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos una carrera",
        variant: "destructive",
      })
      return
    }

    const bloquesInvalidos = formData.bloqueMultiple?.some(
      (b) =>
        !b.carreraPlanId ||
        !b.ubicacionEnPlan ||
        !b.contribucion ||
        !b.contenidosMinimos
    )

    if (bloquesInvalidos) {
      toast({
        title: "Error",
        description: "Todos los campos de cada carrera son obligatorios",
        variant: "destructive",
      })
      return
    }

    mutate({ 
      id,
      data: formData 
    });
  }


 useEffect(() => {
    if (!programa) return

    setLoadingProgramaVigente(true)
    setSelectedMateria(programa.materia)
    try {
      const mappedData: ProgramaCargaDTO = {
        anio: programa.anio || actualYear,
        materiaId: programa.materia?.id,
        profesorResponsableId: programa.profesorResponsable?.id,
        bloqueMultiple:
          programa.bloqueMultiple?.map((c) => ({
            key: `${Date.now()}_${Math.random()}`,
            carreraPlanId: c.plan?.id || 0,
            ubicacionEnPlan: c.ubicacionEnPlan || "",
            correlativasFuertesIds: c.correlativasFuertes?.map((cf) => cf.id).filter((id): id is number => id !== undefined) || [],
            correlativasDebilesIds: c.correlativasDebiles?.map((cd) => cd.id).filter((id): id is number => id !== undefined) || [],
            contribucion: c.contribucion || "",
            contenidosMinimos: c.contenidosMinimos || "",
          })) || [],
        cargaHorariaTotal: programa.cargaHorariaTotal || 0,
        cargaHorariaSemanal: programa.cargaHorariaSemanal || 0,
        creditos: programa.creditos || 0,
        cantidadSemanas: programa.cantidadSemanas || 0,
      }
      setFormData(mappedData)
    } catch (error) {
      console.error("Error loading previous program:", error)
    } finally {
      setLoadingProgramaVigente(false)
    }

  }, [programa]);

  useEffect(() => {
    const total =
      (formData.cantidadSemanas || 0) *
      (formData.cargaHorariaSemanal || 0)

    setFormData((prev) => ({
      ...prev,
      cargaHorariaTotal: total,
    }))
  }, [formData.cantidadSemanas, formData.cargaHorariaSemanal])

  const handleAddProgramaCarrera = () => {
    const newBlock: ProgramaCarreraCreateDTO = {
      key: Date.now().toString(),
      carreraPlanId: 0,
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

  const handleRemoveProgramaCarrera = () => {
    if (removeProgramaCarreraIndex === null) return

    const updatedBlocks = [...formData.bloqueMultiple || []]
    updatedBlocks.splice(removeProgramaCarreraIndex, 1)
    setFormData((prev) => ({
      ...prev,
      bloqueMultiple: updatedBlocks,
    }))

    setRemoveProgramaCarreraIndex(null)
  }

  const handleSingleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
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
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg ">
            <AlertCircle className="text-yellow-600" size={24} />
            <p className="text-yellow-700">No hay materias registradas. Deben haber materias registradas para poder crear programas.</p>
            <Link href="/materias/crear">
              <Button>Crear Materia</Button>
            </Link>
          </div>
        </div>
      )
    }

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

    if (programaQuery.isLoading) {
      return (
        <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando datos del programa...</p>
          </div>
        </div>
      )
    }
  
    if (programaQuery.error) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">Error al obtener el programa</p>
          </div>
        </div>
      )
    }
  
    if (!programa || !programa.id) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="text-yellow-600" size={24} />
            <p className="text-yellow-700">El programa solicitado no existe o no pudo ser cargado</p>
          </div>
        </div>
      )
    }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
      {/* HEADER */}
      <div className="bg-linear-to-r from-primary/10 to-accent/10 border-l-4 border-primary rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Carga de datos de Programa Académico</h1>
            <p className="text-muted-foreground">
              {programa.materia?.nombre} ({programa.materia?.codigo})
            </p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            esRechazado 
              ? "bg-red-100 border border-amber-200" 
              : "bg-primary/10"
            }`}>            
            {esRechazado ? (
                <>
                  <AlertCircle className="text-amber-600" size={20} />
                  <span className="font-semibold text-amber-700">Requiere Correcciones</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="text-primary" size={20} />
                  <span className="font-semibold text-primary">Por completar</span>
                </>
              )}
          </div>
        </div>
      </div>

        {esRechazado && (
          <RejectionInfoCard estadoHistorico={ultimoEstado} />
        )}
      

        {/* BLOQUE ÚNICO */}
        <div className="border-l-4 border-primary p-6 py-4 bg-primary/5 rounded-r-lg">
          <h2 className="text-lg font-bold text-primary mb-6">Información Básica</h2>

          <div className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="departamento" className="text-sm font-semibold text-foreground">
                Departamento *
              </Label>
              <Input
                id="departamento"
                name="departamento"
                value={activeDepartamento?.departamentoNombre}
                className="border-border focus:border-primary bg-background text-lg font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anio" className="text-sm font-semibold text-foreground">
                Año *
              </Label>
              <Input
                id="anio"
                name="anio"
                value={formData.anio || actualYear}
                className="border-border focus:border-primary bg-background"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">            
            <div className="space-y-2">
              <Label htmlFor="materia" className="text-sm font-semibold text-foreground">
                Materia *
              </Label>
              <select
                id="materia"
                value={formData.materiaId?.toString() || ""}
                onChange={(e) => {
                  handleSingleFieldChange("materiaId", Number(e.target.value))
                  setSelectedMateria(materias.find(m => m.id === Number(e.target.value)) ?? undefined)
                }}
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Seleccionar materia...</option>
                {materias.map((materia) => (
                  <option key={materia.id} value={materia.id}>
                    {materia.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo" className="text-sm font-semibold text-foreground">
                Código *
              </Label>
              <Input
                id="codigo"
                type="text"
                value={selectedMateria?.codigo ?? ""}
                className="border-border focus:border-primary bg-background"
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area" className="text-sm font-semibold text-foreground">
                Área *
              </Label>
              <Input
                id="area"
                type="text"
                value={selectedMateria?.area ?? ""}
                className="border-border focus:border-primary bg-background"
                readOnly
              />
            </div>
          </div>

          <div className="space-y-2 pt-6">
            <Label htmlFor="profesor" className="text-sm font-semibold text-foreground">
              Profesor Responsable *
            </Label>
            <select
              id="profesor"
              value={formData.profesorResponsableId?.toString() || ""}
              onChange={(e) => handleSingleFieldChange("profesorResponsableId", Number(e.target.value))}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Seleccionar profesor...</option>
              {profesores.map((profesor) => (
                <option key={profesor.id} value={profesor.id}>
                  {profesor.apellido}, {profesor.nombre} ({profesor.legajo})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* BLOQUE MÚLTIPLE */}
        <div className="border-l-4 border-accent p-6 py-4 bg-accent/5 rounded-r-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-accent">Información por Carrera</h2>
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
            <div className={formData.bloqueMultiple && formData.bloqueMultiple?.length > 3 ? "space-y-6 max-h-[600px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-accent/20" : "space-y-6"}>
              {formData.bloqueMultiple?.map((block, index) => (
                <ProgramaCarreraCreateBlock
                  key={block.key}
                  materiaId={formData.materiaId || 0}
                  block={block}
                  index={index}
                  carreras={carreras}
                  onUpdate={handleUpdateProgramaCarrera}
                  onRemove={setRemoveProgramaCarreraIndex}
                />
              ))}
            </div>
          )}
        </div>

        {/* CONFIGURACIÓN GENERAL */}
        <div className="border-l-4 border-primary p-6 py-4 bg-primary/5 rounded-r-lg space-y-6">
          <h2 className="text-lg font-bold text-primary">Cargas horarias y Créditos</h2>

          {/* Carga Horaria */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="semanas" className="text-sm font-semibold text-foreground">
                Cantidad de Semanas *
              </Label>
              <Input
                id="semanas"
                type="number"
                value={formData.cantidadSemanas}
                onChange={(e) => handleSingleFieldChange("cantidadSemanas", Number.parseInt(e.target.value))}
                placeholder="ej: 16"
                className="border-border focus:border-primary bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargaSemanal" className="text-sm font-semibold text-foreground">
                Carga Horaria Semanal *
              </Label>
              <Input
                id="cargaSemanal"
                type="number"
                value={formData.cargaHorariaSemanal}
                onChange={(e) => handleSingleFieldChange("cargaHorariaSemanal", Number.parseInt(e.target.value))}
                placeholder="ej: 8"
                className="border-border focus:border-primary bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                required
             />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargaTotal" className="text-sm font-semibold text-foreground">
                Carga Horaria Total *
              </Label>
              <Input
                id="cargaTotal"
                type="number"
                value={formData.cargaHorariaTotal}
                placeholder="ej: 128"
                className="border-border focus:border-primary bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creditos" className="text-sm font-semibold text-foreground">
                Créditos *
              </Label>
              <Input
                id="creditos"
                type="number"
                value={formData.creditos}
                onChange={(e) => handleSingleFieldChange("creditos", Number.parseInt(e.target.value))}
                placeholder="ej: 4"
                className="border-border focus:border-primary bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                required
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
              className="border-border focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              disabled
            />
          </div>
        </div>

        {/* Campos de texto largo */}
        <div className="border-l-4 border-primary p-6 py-4 bg-primary/5 rounded-r-lg space-y-6">
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
              {isPending ? "Cargando..." : "Cargar Programa"}
            </Button>
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline"
              className="flex-1 border-border text-foreground hover:bg-muted bg-transparent"
            >
              Cancelar
            </Button>
          </div>
      </form>

      <Dialog open={!!removeProgramaCarreraIndex} onOpenChange={(open: any) => !open && setRemoveProgramaCarreraIndex(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-destructive flex items-center gap-2">
              <AlertCircle size={24} />
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              ¿Estás seguro de que deseas eliminar el bloque?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveProgramaCarreraIndex(null)}
              className="border-2"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveProgramaCarrera}
              className="bg-destructive"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
