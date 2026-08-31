"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ProgramaResponseDTO, EstadoHistoricoResponseDTOEstado, EstadoUpdateDTOAccion, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"
import { getGetDashboardResumenQueryKey, getGetDraftQueryKey, getGetProgramaQueryKey, getListProgramasCoordinacionQueryKey, getListProgramasPendientesCoordinadorQueryKey, getListProgramasPendientesQueryKey, getListProgramasQueryKey, useActualizarEstado, useDeleteDraft, useFormatearAPA, useGetDraft, useGetPrograma, useProfesorCarga, useSaveDraft } from "@/app/api/generated/client"
import { AlertCircle, CheckCircle2, Sparkles, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { ProgramaCarreraBlockView } from "./programa-carrera-block-view"
import { RechazoDialog } from "../modals/rechazo-dialog"
import { useDept } from "@/context/dept-context"
import { useRole } from "@/context/role-context"
import { RejectionInfoCard } from "../ui/rejection-info-card"
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { useHeader } from "@/context/header-context"
import axios from "axios"
import { ProgramaDocenteFormData, programaDocenteSchema } from "@/lib/schemas/programa"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { LabelWithTooltip } from "../ui/label-with-tooltip"

interface SyllabusFormProps {
  id: number,
}


export function SyllabusProfesorForm({ id }: SyllabusFormProps) {
  const { activeDepartamento } = useDept();
  const { activeRole } = useRole();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loadingPrograma, setLoadingPrograma] = useState(false)
  const [showDraft, setShowDraft] = useState(false)
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [rechazDialogOpen, setRechazDialogOpen] = useState(false)

  const {
      register,
      control,
      setValue,
      getValues,
      reset,
      handleSubmit,
      formState: { errors, isDirty }
    } = useForm<ProgramaDocenteFormData>({
        resolver: zodResolver(programaDocenteSchema),
        defaultValues: {
            cargaHorariaPractica: undefined,
            fundamentacion: undefined,
            objetivos: undefined,
            programaAnalitico: undefined,
            metodologia: undefined,
            modalidadEvaluacion: undefined,
            bibliografia: undefined,
        }
    })

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
  const esRechazado = ultimoEstado?.estado === EstadoHistoricoResponseDTOEstado.RECHAZADO_A_PROFESOR;

  const { mutate: mutateSaveDraft } = useSaveDraft({
    mutation: {
      onSuccess: () => {
        toast({
          description: "✓ Guardado",
          variant: "draft",
        })
      },
    },
  })
  const { mutate: mutateDeleteDraft } = useDeleteDraft()

  const { mutate: mutateProfesor, isPending: isPendingProfesor } = useProfesorCarga({
    mutation: {
      onSuccess: () => {
        toast({
          title: "✓ Éxito",
          description: "Información cargada exitosamente",
          variant: "success",
        })      

        mutateDeleteDraft({
          deptId: activeDepartamento!.departamentoId!,
          materiaId: programa?.materia?.id!,
          params:{
            rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
          }
        });

        reset()

        queryClient.invalidateQueries({
          queryKey: getListProgramasQueryKey(
            activeDepartamento!.departamentoId!,
            { rolActivo: activeRole as UsuarioDepartamentoDTORolesItem }
          )
        });

        queryClient.invalidateQueries({
          queryKey: getListProgramasPendientesQueryKey(
            activeDepartamento!.departamentoId!,
            { rolActivo: activeRole as UsuarioDepartamentoDTORolesItem }
          )
        });

        queryClient.invalidateQueries({
          queryKey: getListProgramasCoordinacionQueryKey(
            activeDepartamento!.departamentoId!,
            { rolActivo: activeRole as UsuarioDepartamentoDTORolesItem }
          ),
        });
        
        queryClient.invalidateQueries({
          queryKey: getListProgramasPendientesCoordinadorQueryKey(
            activeDepartamento!.departamentoId!,
            { rolActivo: activeRole as UsuarioDepartamentoDTORolesItem }
          )
        });

        queryClient.invalidateQueries({
          queryKey: getGetDashboardResumenQueryKey(
            activeDepartamento!.departamentoId!,
            { rolActivo: activeRole as UsuarioDepartamentoDTORolesItem }
          ),
        });

        queryClient.invalidateQueries({
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


  const { mutate: mutateEstado, isPending: isPendingEstado } = useActualizarEstado({
    mutation: {
      onSuccess: (data, variables) => {
        toast({
          title: "✓ Éxito",
          description: `Programa rechazado exitosamente`,
          variant: "success",
        })      

        queryClient.invalidateQueries({
          queryKey: getListProgramasQueryKey(
            activeDepartamento!.departamentoId!,
            { rolActivo: activeRole as UsuarioDepartamentoDTORolesItem }
          )
        });

        queryClient.invalidateQueries({
          queryKey: getListProgramasPendientesQueryKey(
            activeDepartamento!.departamentoId!,
            { rolActivo: activeRole as UsuarioDepartamentoDTORolesItem }
          )
        });

        queryClient.invalidateQueries({
          queryKey: getListProgramasCoordinacionQueryKey(
            activeDepartamento!.departamentoId!,
            { rolActivo: activeRole as UsuarioDepartamentoDTORolesItem }
          ),
        });
        
        queryClient.invalidateQueries({
          queryKey: getListProgramasPendientesCoordinadorQueryKey(
            activeDepartamento!.departamentoId!,
            { rolActivo: activeRole as UsuarioDepartamentoDTORolesItem }
          )
        });

        queryClient.invalidateQueries({
          queryKey: getGetDashboardResumenQueryKey(
            activeDepartamento!.departamentoId!,
            { rolActivo: activeRole as UsuarioDepartamentoDTORolesItem }
          ),
        });

        queryClient.invalidateQueries({
          queryKey: getGetProgramaQueryKey(id)
        });

        mutateDeleteDraft({
          deptId: activeDepartamento!.departamentoId!,
          materiaId: programa?.materia?.id!,
          params:{
            rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
          }
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

  useEffect(() => {
      if (programa) {
          reset({
              cargaHorariaPractica: programa.cargaHorariaPractica || 0,
              fundamentacion: programa.fundamentacion || "",
              objetivos: programa.objetivos || "",
              programaAnalitico: programa.programaAnalitico || "",
              metodologia: programa.metodologia || "",
              modalidadEvaluacion: programa.modalidadEvaluacion || "",
              bibliografia: programa.bibliografia || "",
          });
      }
  }, [programa]); // Se ejecuta cuando 'programa' pasa de undefined a tener datos.


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

  const onSubmit = (data: ProgramaDocenteFormData) => {
    mutateProfesor({
      deptId: activeDepartamento!.departamentoId!,
      data: data,
      id: id
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
      reset(draftData)
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

  const formValues = useWatch({
    control,
  })

  useEffect(() => {
    if (!isDirty) return
    if (!activeDepartamento?.departamentoId) return
    if (!programa?.materia?.id) return

    const handler = setTimeout(() => {
      mutateSaveDraft({
        deptId: activeDepartamento.departamentoId!,
        materiaId: programa.materia!.id!,
        params: {
          rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
        },
        data: {
          payloadJson: JSON.stringify(getValues()),
        },
      })
    }, 2000)

    return () => clearTimeout(handler)
  }, [
    formValues,
    isDirty,
    activeDepartamento?.departamentoId,
    programa?.materia?.id,
    activeRole,
    mutateSaveDraft,
    getValues,
  ])  
  
  const handleRechazarConfirm = (destino: UsuarioDepartamentoDTORolesItem, justificacion: string) => {
    const data = {
      accion: EstadoUpdateDTOAccion.RECHAZAR,
      destinoRechazo: destino,
      justificacion,
    }
    setRechazDialogOpen(false)
    mutateEstado({
      deptId: activeDepartamento?.departamentoId ?? 0,
      id: id,
      data: data,
      params: {
        rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
      }
    });
  }

  const {mutate, isPending: isPendingFormatoAPA} = useFormatearAPA({
    mutation: {
      onSuccess: (data) => {
        setValue("bibliografia", data, {
          shouldDirty: true,
          shouldValidate: true,
        });       

        toast({
          title: "✓ Formateo exitoso",
          description: "Formateo APA aplicado a la bibliografía",
          variant: "info",
        })
      },
      onError: (error: Error) => {
        toast({
          title: "✗ Error",
          description: "Error al formatear bibliografía: " + (error instanceof Error ? error.message : "Error desconocido"),
          variant: "destructive",
        })
      }
    }
  })

  const handleFormatoAPA = async () => {
    const bibliografia = getValues("bibliografia");

    if(!bibliografia.trim()) 
      return
    
    mutate({ data: bibliografia })
  };

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
                type="text"
                defaultValue={programa.materia?.departamento || ""}
                className="border-border focus:border-primary"
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anio" className="text-sm font-semibold text-foreground">
                Año
              </Label>
              <Input
                id="anio"
                name="anio"
                defaultValue={programa.anio}
                className="border-border focus:border-primary"
                readOnly
              />
            </div>
          </div>

          <div className="space-y-6 grid grid-cols-2 md:grid-cols-3 gap-6">            
            <div className="space-y-2">
              <Label htmlFor="materia" className="text-sm font-semibold text-foreground">
                Materia
              </Label>
              <Input
                id="materia"
                type="text"
                defaultValue={programa.materia?.nombre}
                className="border-border focus:border-primary"
                readOnly
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
                className="border-border focus:border-primary"
                readOnly
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
                className="border-border focus:border-primary"
                readOnly
              />
            </div>
          </div>

         <div className="space-y-2">
            <Label htmlFor="profesor" className="text-sm font-semibold text-foreground">
              Docente Responsable
            </Label>
            <Input
              id="profesor"
              type="text"
              defaultValue={programa.profesorResponsable?.apellido + " " + programa.profesorResponsable?.nombre + " (Legajo: " + programa.profesorResponsable?.legajo + ")" || ""}
              className="border-border focus:border-primary"
              readOnly
            />
          </div>
        </div>

        {/* BLOQUE MÚLTIPLE */}
        <div className="border-l-4 border-accent p-6 py-4 bg-accent/5 rounded-r-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-accent">Información por Carrera</h2>
          </div>

          <div className={programa.bloqueMultiple && programa.bloqueMultiple?.length > 3 ? "space-y-6 max-h-[600px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-accent/20" : "space-y-6"}>
            {programa.bloqueMultiple?.map((block, index) => (
              <ProgramaCarreraBlockView
                key={index}
                block={block}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* CONFIGURACIÓN GENERAL */}
        <div className="border-l-4 border-primary p-6 py-4 bg-primary/5 rounded-r-lg space-y-6">
          <h2 className="text-lg font-bold text-primary">Cargas horarias y Créditos</h2>

          {/* Carga Horaria */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Cantidad de Semanas</Label>
              <Input defaultValue={programa.cantidadSemanas || ""} readOnly className="border-border focus:border-primary" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Carga Horaria Semanal</Label>
              <Input defaultValue={programa.cargaHorariaSemanal || ""} readOnly className="border-border focus:border-primary" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Carga Horaria Total</Label>
              <Input defaultValue={programa.cargaHorariaTotal || ""} readOnly className="border-border focus:border-primary" />
            </div>
            <div className="space-y-2">
              <LabelWithTooltip
                label="Créditos"
                htmlFor="creditos"
                tooltip={
                  <>
                    <p>La cantidad de créditos de la asignatura conforme a la normativa vigente y su carga horaria.</p>
                  </>
                }
              />
              <Input defaultValue={programa.creditos || ""} readOnly className="border-border focus:border-primary" />
            </div>
          </div>

          {/* Carga Práctica */}
          <div className="space-y-2">
            <Label htmlFor="cargaPractica" className="text-sm font-semibold text-foreground">
              Carga Horaria Práctica *
            </Label>
            <Input
              id="cargaPractica"
              type="number"
              {...register("cargaHorariaPractica", {
                valueAsNumber: true,
              })}
              placeholder="ej: 64"
              min={0}
              max={programa.cargaHorariaTotal}
              className={`border-2 focus:border-primary ${
                errors.cargaHorariaPractica
                  ? "border-red-500"
                  : "border-border"
              }`}  
              />
              <div className="min-h-5">
                {errors.cargaHorariaPractica && (
                  <p className="text-sm text-red-500">
                    {errors.cargaHorariaPractica.message}
                  </p>
                )}
              </div>
          </div>
        </div>

          {/* Campos de texto largo */}
        <div className="border-l-4 border-primary p-6 py-4 bg-primary/5 rounded-r-lg space-y-6">
          <h2 className="text-lg font-bold text-primary">Contenido Académico</h2>

          <div className="space-y-2">
            <LabelWithTooltip
              label="Fundamentación *"
              htmlFor="fundamentacion"
              tooltip={
                <>
                  <p>Indique fundamentación de la inclusión de la asignatura en el plan de estudio teniendo en cuenta los descriptores de conocimiento.</p>
                </>
              }
            />
            <Textarea
              id="fundamentacion"
              {...register("fundamentacion")}
              placeholder="Justifica la importancia de esta materia..."
              className={`border-border focus:border-primary min-h-24 resize-none bg-background ${
                  errors.fundamentacion
                    ? "border-red-500"
                    : "border-border"
              }`}
            />
            <div className="min-h-5">
              {errors.fundamentacion && (
                <p className="text-sm text-red-500">
                  {errors.fundamentacion.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <LabelWithTooltip
              label="Objetivos *"
              htmlFor="objetivos"
              tooltip={
                <>
                  <p>Indique los objetos de conocimiento que surgen de agrupar los contenidos que integran saberes del programa analítico.</p>
                </>
              }
            />
            <Textarea
              id="objetivos"
              {...register("objetivos")}              
              className={`border-border focus:border-primary min-h-24 resize-none bg-background ${
                errors.objetivos
                ? "border-red-500"
                : "border-border"
              }`}
              placeholder="Define los objetivos de aprendizaje..."
            />
            <div className="min-h-5">
              {errors.objetivos && (
                <p className="text-sm text-red-500">
                  {errors.objetivos.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <LabelWithTooltip
              label="Programa Analítico *"
              htmlFor="programa"
              tooltip={
                <>
                  <p>Indique la nómina de unidades temáticas y su desarrollo.</p>
                </>
              }
            />
            <Textarea
              id="programa"
              {...register("programaAnalitico")}              
              className={`border-border focus:border-primary min-h-24 resize-none bg-background ${
                errors.programaAnalitico
                ? "border-red-500"
                : "border-border"
              }`}
              placeholder="Detalla el contenido temático del curso..."
            />
            <div className="min-h-5">
              {errors.programaAnalitico && (
                <p className="text-sm text-red-500">
                  {errors.programaAnalitico.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <LabelWithTooltip
              label="Metodología *"
              htmlFor="metodologia"
              tooltip={
                <>
                  <p>
                    Indique las estrategias pedagógicas que utiliza en general y amplíe en caso de metodologías particulares. Desagregue cuando se trate de prácticas de
                    gabinete, laboratorios, trabajos transversales a diversas asignaturas, actividades remotas (sincrónicas o asincrónicas), viajes o visitas, trabajos de campo, etc.
                  </p>
                </>
              }
            />
            <Textarea
              id="metodologia"
              {...register("metodologia")}              
              className={`border-border focus:border-primary min-h-24 resize-none bg-background ${
                errors.metodologia
                ? "border-red-500"
                : "border-border"
              }`}
              placeholder="Describe los métodos de enseñanza..."
            />
            <div className="min-h-5">
              {errors.metodologia && (
                <p className="text-sm text-red-500">
                  {errors.metodologia.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <LabelWithTooltip
              label="Modalidad de Evaluación *"
              htmlFor="modalidadEvaluacion"
              tooltip={
                <>
                  <p>
                    Describa el proceso de evaluación que aplica: parciales, entregas, trabajos prácticos, presentaciones orales, trabajos integradores, proyectos, etc. Incluya el sistema de Promoción adoptado (obligatorio según CSU 546/21)
                  </p>
                </>
              }
            />
            <Textarea
              {...register("modalidadEvaluacion")}              
              className={`border-border focus:border-primary min-h-24 resize-none bg-background ${
                errors.modalidadEvaluacion
                ? "border-red-500"
                : "border-border"
              }`}
              placeholder="Especifica cómo se evaluará el aprendizaje..."
            />
            <div className="min-h-5">
              {errors.modalidadEvaluacion && (
                <p className="text-sm text-red-500">
                  {errors.modalidadEvaluacion.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <LabelWithTooltip
                label="Bibliografía *"
                htmlFor="bibliografia"
                tooltip={
                  <>
                    <p>Ingrese la bibliografía obligatoria y complementaria de la asignatura. Puede utilizar el botón 'Formatear' para adecuar automáticamente las referencias al formato APA.</p>
                  </>
                }
              />
              <Button 
                type="button" 
                onClick={handleFormatoAPA}
                disabled={isPendingFormatoAPA || !getValues('bibliografia')?.trim()}
                className="flex bg-primary hover:bg-accent text-primary-foreground font-medium"
                title="Formatear bibliografía al estilo APA con AI"
              >
                <Sparkles size={18} />
                {isPendingFormatoAPA ? "Formateando..." : "Formatear"}
              </Button>
            </div>
            <Textarea
              id="bibliografia"
              {...register("bibliografia")}              
              className={`border-border focus:border-primary min-h-24 resize-none bg-background ${
                errors.bibliografia
                ? "border-red-500"
                : "border-border"
              }`}
              placeholder="Sommerville, I. (2015)..."
              disabled={isPendingFormatoAPA}
            />
            <div className="min-h-5">
              {errors.bibliografia && (
                <p className="text-sm text-red-500">
                  {errors.bibliografia.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button 
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isPendingProfesor || isPendingFormatoAPA}
            className="flex-1 bg-primary hover:bg-accent text-primary-foreground font-medium"
          >
            {isPendingProfesor ? "Cargando..." : "Cargar Datos"}
          </Button>
          {programa?.estado !== EstadoHistoricoResponseDTOEstado.RECHAZADO_A_PROFESOR &&
            <Button
              type="button"
              onClick={() => setRechazDialogOpen(true)}
              disabled={isPendingProfesor}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              ✕ Rechazar
            </Button>
          }
          <Button
            type="button"
            onClick={() => router.back()}
            variant="outline"
            className="flex-1 border-border text-foreground hover:bg-muted bg-transparent"
          >
            Cancelar
          </Button>
        </div>

        {/* RECHAZO DIALOG */}
        <RechazoDialog
          open={rechazDialogOpen}
          onOpenChange={setRechazDialogOpen}
          onConfirm={handleRechazarConfirm}
          isLoading={isPendingEstado}
        />
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
              className="bg-destructive"
            >
              Cargar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
