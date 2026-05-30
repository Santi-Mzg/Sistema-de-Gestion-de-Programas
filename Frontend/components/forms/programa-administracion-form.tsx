"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Check, CheckCircle2, ChevronsUpDown, FileText, Plus } from "lucide-react"
import Link from "next/link"
import { ProgramaCarreraCreateBlock } from "./programa-carrera-block-field"
import { ProgramaResponseDTO, UserResponseDTO, CarreraResponseDTO, MateriaResponseDTO, ProgramaCargaDTO, ProgramaCarreraCreateDTO, EstadoHistoricoResponseDTOEstado, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"
import { getGetDraftQueryKey, getGetProgramaQueryKey, getListCarrerasQueryKey, getListDocentesDepartamentoQueryKey, getListMateriasDepartamentoQueryKey, getListProgramasQueryKey, useAdministrativoCarga, useDeleteDraft, useGetDraft, useGetPrograma, useListCarreras, useListDocentesDepartamento, useListMateriasDepartamento, useSaveDraft } from "@/app/api/generated/client"
import { useDept } from "@/context/dept-context"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { RejectionInfoCard } from "../ui/rejection-info-card"
import { useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/context/role-context"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useHeader } from "@/context/header-context"
import axios from "axios"
interface SyllabusFormProps {
  id: number,
}

export function SyllabusAdministrativoForm({ id }: SyllabusFormProps) {
  const router = useRouter();
  const { activeDepartamento } = useDept()
  const { activeRole } = useRole();
  const queryClient = useQueryClient();
  const [removeProgramaCarreraIndex, setRemoveProgramaCarreraIndex] = useState<number | null>(null)
  const [loadingPrograma, setLoadingPrograma] = useState(false)
  const [showDraft, setShowDraft] = useState(false)
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const actualYear = new Date().getFullYear()
  
  const [formData, setFormData] = useState<ProgramaCargaDTO>({
    profesorResponsableId: undefined,
    bloqueMultiple: [],
    cargaHorariaTotal: undefined,
    cargaHorariaSemanal: undefined,
    creditos: undefined,
    cantidadSemanas: undefined
  })

  const [openProfesorSelector, setOpenProfesorSelector] = useState(false)

  const deptId = activeDepartamento?.departamentoId
  
  const programaQuery = useGetPrograma(id,
    {
      query: {
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
        queryKey: getGetProgramaQueryKey(id)
      }
    }
  );


  const programa: ProgramaResponseDTO | undefined = programaQuery.data;

  const ultimoEstado = programa?.historialEstados?.at(-1);
  const esRechazado = ultimoEstado?.estado === EstadoHistoricoResponseDTOEstado.RECHAZADO_A_ADMINISTRACION;

  const [selectedProfesor, setSelectedProfesor] = useState<UserResponseDTO | undefined>(undefined);

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

  const { mutate: mutateSaveDraft } = useSaveDraft()
  const { mutate: mutateDeleteDraft } = useDeleteDraft()

  const { mutate, isPending } = useAdministrativoCarga({
    mutation: {
      onSuccess: () => {
        toast({
          title: "✓ Éxito",
          description: "Programa cargado exitosamente",
          variant: "success",
        })        

        mutateDeleteDraft({
          deptId: activeDepartamento!.departamentoId!,
          materiaId: programa?.materia?.id!,
          params:{
            rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
          }
        });

        setFormData({
          profesorResponsableId: undefined,
          bloqueMultiple: [],
          cargaHorariaTotal: undefined,
          cargaHorariaSemanal: undefined,
          creditos: undefined,
          cantidadSemanas: undefined,
        })

        queryClient.removeQueries({
          queryKey: getListProgramasQueryKey(
            activeDepartamento!.departamentoId!,
            { rolActivo: activeRole as UsuarioDepartamentoDTORolesItem }
          )
        });

        queryClient.removeQueries({
          queryKey: getGetProgramaQueryKey(id)
        });

        router.push('/'); 

      },
      onError: (error: unknown) => {

        let errorMessage = "Ocurrió un error inesperado";

        if (axios.isAxiosError(error)) {
          const backendError = error.response?.data;
          
            errorMessage = backendError?.errors?.Error || 
                          backendError?.message || 
                        "Ocurrió un error inesperado";
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        toast({
          title: "✗ Error",
          description: errorMessage,
          variant: "destructive",
        })
      },
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.profesorResponsableId || formData.profesorResponsableId === 0) {
      toast({
        title: "Error de validación",
        description: "Por favor, selecciona un docente responsable antes de continuar.",
        variant: "destructive",
      });
      return; // Evita que se ejecute la mutación
    }

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


    console.log("Datos a enviar:", formData)

    mutate({ 
      deptId: activeDepartamento!.departamentoId!,
      id,
      data: formData 
    });
  }

  const draftQuery = useGetDraft(
    activeDepartamento?.departamentoId ?? 0,
    programa?.materia?.id ?? 0,
    {
      rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
    },
    {
      query: {
        enabled: !!activeDepartamento?.departamentoId &&
                  !!programa?.materia?.id,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        gcTime: 0,
        retry: false, 
        queryKey: getGetDraftQueryKey(
          activeDepartamento!.departamentoId!,
          programa?.materia?.id!,
          {
            rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
          }
        )
      }
    }
  );

  useEffect(() => {
    if (draftQuery.data?.payloadJson)       
        setShowDraft(true);
  }, [draftQuery.data]); 


  const handleLoadDraft = () => {
    if (!draftQuery.data?.payloadJson) return

    setLoadingDraft(true)
    try {
      const draftData = JSON.parse(draftQuery.data.payloadJson)
      setSelectedProfesor(profesores?.find((p) => p.id === draftData.profesorResponsableId))
      setFormData(draftData)
      setShowDraft(false)

      toast({
        title: "Borrador recuperado",
        description: "Se restauró un borrador exitosamente",
        variant: "info",
      });

    } catch (error) {
      console.error("Error loading draft:", error)
    } finally {
      setLoadingDraft(false)
    }
  }


  const guardarBorrador = useCallback(() => {
  
      mutateSaveDraft({
        deptId: activeDepartamento!.departamentoId!,
        materiaId: programa?.materia?.id!,
        params: {
          rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
        },
        data: {
          payloadJson: JSON.stringify(formData),
        },
      });
  
      setIsDirty(false);
  
      toast({
        description: "✓ Guardado",
        variant: "draft",
      })    

  }, [formData, activeDepartamento, activeRole, mutateSaveDraft]);
  
  
  const debouncedSave = useCallback(() => {
      const handler = setTimeout(() => {
        guardarBorrador();
      }, 2000); // 2 segundos
  
      return () => clearTimeout(handler);
  }, [guardarBorrador]);

  
  useEffect(() => {
      if (!isDirty) return;

      const cancel = debouncedSave();

      return cancel;
  }, [isDirty, debouncedSave]);


 useEffect(() => {
    if (!programa) return

    setLoadingPrograma(true)
    try {
      const mappedData: ProgramaCargaDTO = {
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


      if (programa.profesorResponsable?.id) {
      const docenteEncontrado = profesores?.find(
        (p) => p.id === programa.profesorResponsable?.id
      );
      if (docenteEncontrado) {
        setSelectedProfesor(docenteEncontrado);
      }
    }

    } catch (error) {
      console.error("Error loading previous program:", error)
    } finally {
      setLoadingPrograma(false)
    }

  }, [programa, profesores]);


  const {setHeader} = useHeader();
  
  useEffect(() => {
    setHeader({
      title: programa ? `Programa de ${programa?.materia?.nombre} (${programa?.materia?.codigo}) - ${programa?.anio}` : "Nuevo Programa Académico",
      subtitle: "Formulario de carga de programa académico",
      badge: (
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
                  <span className="font-semibold text-primary">En proceso de carga</span>
                </>
              )}
          </div>
      ),
      icon: FileText
    })
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

    setIsDirty(true);
  }

  const handleUpdateProgramaCarrera = (index: number, block: ProgramaCarreraCreateDTO) => {
    setFormData((prev) => ({
      ...prev,
      bloqueMultiple: prev.bloqueMultiple?.map((c, i) => (i === index ? block : c)),
    }))
    setIsDirty(true);
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
    setIsDirty(true);
  }

  const handleSingleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    if(field !== "materiaId")
      setIsDirty(true);
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
      <form className="space-y-8">
        {esRechazado && (
          <RejectionInfoCard estadoHistorico={ultimoEstado} />
        )}
      

        {/* BLOQUE ÚNICO */}
        <div className="border-l-4 border-primary p-6 py-4 bg-primary/5 rounded-r-lg">
          <h2 className="text-lg font-bold text-primary mb-6">Información Básica</h2>

          <div className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="departamento" className="text-sm font-semibold text-foreground">
                Departamento
              </Label>
              <Input
                id="departamento"
                name="departamento"
                value={activeDepartamento?.departamentoNombre}
                className="border-border focus:border-primary bg-background text-lg font-medium"
                disabled
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anio" className="text-sm font-semibold text-foreground">
                Año
              </Label>
              <Input
                id="anio"
                name="anio"
                value={actualYear}
                className="border-border focus:border-primary bg-background"
                disabled
                required
              />
            </div>
          </div>

          <div className="space-y-6 grid grid-cols-1 md:grid-cols-3 gap-6">            
            <div className="space-y-2">
              <Label htmlFor="materia" className="text-sm font-semibold text-foreground">
                Materia
              </Label>
              <Input
                id="materia"
                type="text"
                defaultValue={programa.materia?.nombre}
                className="border-border focus:border-primary bg-background"
                disabled
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo" className="text-sm font-semibold text-foreground">
                Código
              </Label>
              <Input
                id="codigo"
                type="text"
                defaultValue={programa.materia?.codigo}
                className="border-border focus:border-primary bg-background"
                disabled
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area" className="text-sm font-semibold text-foreground">
                Área
              </Label>
              <Input
                id="area"
                type="text"
                defaultValue={programa.materia?.area}
                className="border-border focus:border-primary bg-background"
                disabled
                required
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <Label className="text-sm font-semibold">Docente Responsable *</Label>
            <Popover open={openProfesorSelector} onOpenChange={setOpenProfesorSelector}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openProfesorSelector}
                  className="w-full justify-between font-normal border-border"
                >
                  {selectedProfesor?.id 
                    ? `${selectedProfesor.apellido}, ${selectedProfesor.nombre} (Legajo: ${selectedProfesor.legajo})`
                    : "Seleccionar docente..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-0" onCloseAutoFocus={(e) => e.preventDefault()}>
                <Command>
                  <CommandInput placeholder="Buscar..." />
                  <CommandList className="pointer-events-auto">
                    <CommandEmpty>No se encontró la materia.</CommandEmpty>
                    <CommandGroup>
                      {profesores.map((profesor) => (
                        <CommandItem
                          key={profesor.id}
                          value={profesor.nombre + " " + profesor.apellido + " " + profesor.legajo}
                          onSelect={() => {
                            setSelectedProfesor(profesor)
                            handleSingleFieldChange("profesorResponsableId", profesor.id)
                            setOpenProfesorSelector(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedProfesor?.id === profesor.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {profesor.apellido}, {profesor.nombre} (Legajo: {profesor.legajo})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
                  // selectedCarreraPlanIds={formData.bloqueMultiple
                  //   ?.map((b) => b.carreraPlanId)
                  //   .filter((id) => id !== undefined && id !== null)
                  //   ?? []}
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
                Carga Horaria Total
              </Label>
              <Input
                id="cargaTotal"
                type="number"
                value={formData.cargaHorariaTotal}
                placeholder="ej: 128"
                className="border-border focus:border-primary bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                disabled
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
              value={programa.cargaHorariaPractica}
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
              value={programa.fundamentacion}
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
              value={programa.objetivos}
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
              value={programa.programaAnalitico}
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
              value={programa.metodologia}
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
              value={programa.modalidadEvaluacion}
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
              value={programa.bibliografia}
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
              type="button"
              onClick={handleSubmit}
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

      <Dialog open={!!showDraft} onOpenChange={(open: any) => !open && setShowDraft(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-accent flex items-center gap-2">
              <FileText size={24} />
              Borrador Encontrado
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Se encontró un borrador. ¿Desea cargarlo?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDraft(false)
              }}
              className="border-2"
            >
              Cancelar
            </Button>
            <Button
              variant="secondary"
              onClick={handleLoadDraft}
              className="bg-primary"
            >
              Cargar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={removeProgramaCarreraIndex !== null} onOpenChange={(open: any) => !open && setRemoveProgramaCarreraIndex(null)}>
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
