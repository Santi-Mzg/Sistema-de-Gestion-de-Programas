"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ProgramaResponseDTO, ProgramaCargaDTO, UserResponseDTO, CarreraResponseDTO, MateriaResponseDTO, EstadoHistoricoResponseDTOEstado, EstadoUpdateDTOAccion, EstadoUpdateDTO, EstadoUpdateDTODestinoRechazo, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"
import { getGetDraftQueryKey, getGetProgramaQueryKey, getGetProgramaVigenteQueryKey, getListProgramasQueryKey, useActualizarEstado, useDeleteDraft, useFormatearAPA, useGetDraft, useGetPrograma, useGetProgramaVigente, useProfesorCarga, useSaveDraft } from "@/app/api/generated/client"
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
import { cn } from "@/lib/utils"
import { useHeader } from "@/context/header-context"
import axios from "axios"

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
  const [isDirty, setIsDirty] = useState(false);
  
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

  // const programaVigenteQuery = useGetProgramaVigente(id, {
  //   query: {
  //     enabled: !!id,
  //     staleTime: Infinity,
  //     queryKey: getGetProgramaVigenteQueryKey(id),
  //   },
  // });
  
  // const programaVigente: ProgramaResponseDTO | undefined = programaVigenteQuery.data;

  const ultimoEstado = programa?.historialEstados?.at(-1);
  const esRechazado = ultimoEstado?.estado === EstadoHistoricoResponseDTOEstado.RECHAZADO_A_PROFESOR;
  
  const [formData, setFormData] = useState<ProgramaCargaDTO>({
      cargaHorariaPractica: undefined,
      fundamentacion: undefined,
      objetivos: undefined,
      programaAnalitico: undefined,
      metodologia: undefined,
      modalidadEvaluacion: undefined,
      bibliografia: undefined,
  })

  const [rechazDialogOpen, setRechazDialogOpen] = useState(false)

  const { mutate: mutateSaveDraft } = useSaveDraft()
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

        setFormData({
          cargaHorariaPractica: undefined,
          fundamentacion: undefined,
          objetivos: undefined,
          programaAnalitico: undefined,
          metodologia: undefined,
          modalidadEvaluacion: undefined,
          bibliografia: undefined,
        })

        queryClient.invalidateQueries({
          queryKey: getListProgramasQueryKey(
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
          setFormData({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault() 

    if (
      formData.cargaHorariaPractica && formData.cargaHorariaTotal &&
      (
        formData.cargaHorariaPractica <= 0 ||
        formData.cargaHorariaPractica >= formData.cargaHorariaTotal
      )
     ) {
      toast({
        title: "Error",
        description:
          "La carga horaria práctica debe estar entre 0 y la carga horaria total",
        variant: "destructive",
      })
      return
    }

    mutateProfesor({
      deptId: activeDepartamento!.departamentoId!,
      data: formData,
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

  const handleSingleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    setIsDirty(true);
  }


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
        handleSingleFieldChange("bibliografia", data);
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
    if(!formData.bibliografia?.trim()) 
      return
    
    mutate({ data: formData.bibliografia })
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
              <Label className="text-sm font-semibold text-foreground">Créditos</Label>
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
              value={formData.cargaHorariaPractica}
              onChange={(e) => handleSingleFieldChange("cargaHorariaPractica", Number.parseInt(e.target.value))}
              placeholder="ej: 64"
              min={0}
              max={formData.cargaHorariaTotal}
              className="border-border focus:border-primary bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              required
            />
          </div>
        </div>

          {/* Campos de texto largo */}
        <div className="border-l-4 border-primary p-6 py-4 bg-primary/5 rounded-r-lg space-y-6">
          <h2 className="text-lg font-bold text-primary">Contenido Académico</h2>

          <div className="space-y-2">
            <Label htmlFor="fundamentacion" className="text-sm font-semibold text-foreground">
              Fundamentación *
            </Label>
            <Textarea
              id="fundamentacion"
              value={formData.fundamentacion}
              onChange={(e) => handleSingleFieldChange("fundamentacion", e.target.value)}
              placeholder="Justifica la importancia de esta Materia..."
              className="border-border focus:border-primary min-h-24 resize-none bg-background"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objetivos" className="text-sm font-semibold text-foreground">
              Objetivos *
            </Label>
            <Textarea
              id="objetivos"
              value={formData.objetivos}
              onChange={(e) => handleSingleFieldChange("objetivos", e.target.value)}
              placeholder="Define los objetivos de aprendizaje..."
              className="border-border focus:border-primary min-h-24 resize-none bg-background"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="programa" className="text-sm font-semibold text-foreground">
              Programa Analítico *
            </Label>
            <Textarea
              id="programa"
              value={formData.programaAnalitico}
              onChange={(e) => handleSingleFieldChange("programaAnalitico", e.target.value)}
              placeholder="Detalla el contenido temático del curso..."
              className="border-border focus:border-primary min-h-32 resize-none bg-background"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metodologia" className="text-sm font-semibold text-foreground">
              Metodología *
            </Label>
            <Textarea
              id="metodologia"
              value={formData.metodologia}
              onChange={(e) => handleSingleFieldChange("metodologia", e.target.value)}
              placeholder="Describe los métodos de enseñanza..."
              className="border-border focus:border-primary min-h-24 resize-none bg-background"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evaluacion" className="text-sm font-semibold text-foreground">
              Modalidad de Evaluación *
            </Label>
            <Textarea
              id="evaluacion"
              value={formData.modalidadEvaluacion}
              onChange={(e) => handleSingleFieldChange("modalidadEvaluacion", e.target.value)}
              placeholder="Especifica cómo se evaluará el aprendizaje..."
              className="border-border focus:border-primary min-h-24 resize-none bg-background"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="bibliografia" className="text-sm font-semibold text-foreground">
                Bibliografía *
              </Label>
              <Button 
                type="button" 
                onClick={handleFormatoAPA}
                disabled={isPendingFormatoAPA || !formData.bibliografia?.trim()}
                className="flex bg-primary hover:bg-accent text-primary-foreground font-medium"
                title="Formatear bibliografía al estilo APA con AI"
              >
                <Sparkles size={18} />
                {isPendingFormatoAPA ? "Formateando..." : "Formatear"}
              </Button>
            </div>
            <Textarea
              id="bibliografia"
              value={formData.bibliografia}
              onChange={(e) => handleSingleFieldChange("bibliografia", e.target.value)}
              placeholder="Referencias bibliográficas recomendadas..."
              className="border-border focus:border-primary min-h-32 resize-none bg-background"
              disabled={isPendingFormatoAPA}
              required
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button 
            type="button"
            onClick={handleSubmit}
            disabled={isPendingProfesor}
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
