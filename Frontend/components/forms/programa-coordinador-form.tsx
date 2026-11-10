"use client"
import { invalidarConsultasPrograma } from "@/lib/invalidacion-consultas";

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Eye, FileText } from "lucide-react"
import { ProgramaResponseDTO, EstadoUpdateDTOAccion, Rol, ProgramaCarreraResponseDTO } from "@/app/api/generated/model"
import { useActualizarEstado, useGetPrograma, getGetProgramaQueryKey } from "@/app/api/generated/client"
import { RechazoConCambiosDialog } from "../modals/rechazo-con-cambios-dialog"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { useDept } from "@/context/dept-context"
import { useRole } from "@/context/role-context"
import { useQueryClient } from "@tanstack/react-query";
import { useHeader } from "@/context/header-context"
import { ProgramaCarreraBlockFieldCoord } from "./programa-carrera-block-field-coord"
import axios from "axios"
import { LabelWithTooltip } from "../ui/label-with-tooltip"

import { useGetDraft, getGetDraftQueryKey, useSaveDraft } from '@/app/api/generated/client';
import { Button as DraftButton } from '@/components/ui/button';
interface SyllabusFormProps {
  id: number,
  carreraId?: number,
}


export function SyllabusCoordinadorForm({ id, carreraId }: SyllabusFormProps) {
  const { activeDepartamento } = useDept()
  const { activeRole } = useRole()
  const router = useRouter();
  const queryClient = useQueryClient();

  const programaQuery = useGetPrograma(id,
    {
      query: {
        staleTime: 1000 * 60 * 5,
        queryKey: getGetProgramaQueryKey(id)
      }
    }
  );
  const programa: ProgramaResponseDTO | undefined = programaQuery.data;

  const [bloque, setBloque] = useState<ProgramaCarreraResponseDTO | undefined>(undefined);

  const [previousFormSources, setPreviousFormSources] = useState<[typeof programa, typeof carreraId] | null>(null)
  if (previousFormSources === null || previousFormSources[0] !== programa || previousFormSources[1] !== carreraId) {
    setPreviousFormSources([programa, carreraId])
    if (programa?.bloqueMultiple) {
      const found = programa.bloqueMultiple.find(block => block.plan?.id === carreraId);
      setBloque(found);
    }
  }

  const [rechazDialogOpen, setRechazDialogOpen] = useState(false);
  const draftParams = { rolActivo: activeRole!, anio: programa?.anio ?? new Date().getFullYear(), programaId: id, planId: carreraId ?? 0 };
  const draft = useGetDraft(activeDepartamento?.departamentoId ?? 0, programa?.materia?.id ?? 0, draftParams, {
    query: { enabled: !!programa?.materia?.id && !!carreraId && activeRole === 'COORDINACION_COMISION_CURRICULAR',
      queryKey: getGetDraftQueryKey(activeDepartamento?.departamentoId ?? 0, programa?.materia?.id ?? 0, draftParams), retry: false }
  });
  const saveDraft = useSaveDraft();
  const valorInicial = programa?.bloqueMultiple?.find(b => b.plan?.id === carreraId)?.contribucion ?? '';
  useEffect(() => {
    if (!bloque || rechazDialogOpen || (bloque.contribucion ?? '') === valorInicial || !programa?.materia?.id) return;
    const timer = setTimeout(() => saveDraft.mutate({ deptId: activeDepartamento!.departamentoId!, materiaId: programa.materia!.id!,
      params: draftParams, data: { payloadJson: JSON.stringify({ contribucion: bloque.contribucion ?? '' }) } }), 2000);
    return () => clearTimeout(timer);
  }, [bloque?.contribucion, valorInicial, rechazDialogOpen, programa?.materia?.id, activeDepartamento?.departamentoId, activeRole, carreraId]);

  const { mutate, isPending } = useActualizarEstado({
    mutation: {
      onSuccess: async (data, variables) => {
        toast({
          title: "✓ Éxito",
          description: `Programa ${variables.data.accion === EstadoUpdateDTOAccion.APROBAR ? "aprobado" : "rechazado"} exitosamente`,
          variant: "success",
        })

        await invalidarConsultasPrograma(queryClient, { departamentoId: activeDepartamento!.departamentoId!, programaId: id });

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

    const {setHeader} = useHeader();

  useEffect(() => {
    setHeader({
      title: programa ? `Programa de ${programa?.materia?.nombre} (${programa?.materia?.codigo}) - ${programa?.anio}` : "Nuevo programa académico",
      subtitle: "Revisión de programa académico",
      badge: (
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
          <Eye className="text-primary" size={20} />
          <span className="font-semibold text-primary">En revisión</span>
        </div>
      ),
      icon: FileText
    })
  }, [programa]);


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

  const handleAceptar = () => {
    const data = {
      accion: EstadoUpdateDTOAccion.APROBAR,
      contribucionCarrera: bloque?.contribucion,
    }

    mutate({
      deptId: activeDepartamento?.departamentoId ?? 0,
      id: id,
      data: data,
      params: {
        carreraId: carreraId,
        rolActivo: activeRole as Rol,
      }
    });
  }

  const handleRechazarConfirm = (destino: Rol, justificacion: string, guardarCambios: boolean) => {
    const data = {
      accion: EstadoUpdateDTOAccion.RECHAZAR,
      guardarCambios,
      contribucionCarrera: guardarCambios ? bloque?.contribucion : undefined,
      destinoRechazo: destino,
      justificacion: justificacion,
    }


    mutate({
      deptId: activeDepartamento?.departamentoId ?? 0,
      id: id,
      data: data,
      params: {
        carreraId: carreraId,
        rolActivo: activeRole as Rol,
      }
    });
  }

  return (
    <form className="space-y-8">
      {draft.data?.payloadJson && <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5 flex flex-wrap gap-3 items-center">
        <span>Hay un borrador de su contribución para este bloque.</span>
        <DraftButton type="button" variant="outline" onClick={() => {
          try { const recuperado: unknown = JSON.parse(draft.data!.payloadJson!);
            if (recuperado && typeof recuperado === 'object' && 'contribucion' in recuperado && typeof recuperado.contribucion === 'string')
              setBloque(actual => actual ? { ...actual, contribucion: recuperado.contribucion as string } : actual);
          } catch { toast({ title: 'No se pudo recuperar el borrador', variant: 'destructive' }); }
        }}>Recuperar borrador</DraftButton>
      </div>}
      {/* BLOQUE ÚNICO */}
      <div className="border-l-4 border-primary p-6 py-4 bg-primary/5 rounded-r-lg">
        <h2 className="text-lg font-bold text-primary mb-6">Información básica</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 [&>*]:min-w-0">
          <div className="space-y-2">
            <Label htmlFor="departamento" className="text-sm font-semibold text-foreground">
              Departamento
            </Label>
            <Input
              id="departamento"
              type="text"
              defaultValue={programa.materia?.departamento || ""}
              className="bg-background"
              disabled
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
              className="bg-background"
              disabled
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 [&>*]:min-w-0">
          <div className="space-y-2">
            <Label htmlFor="materia" className="text-sm font-semibold text-foreground">
              Materia
            </Label>
            <Input
              id="materia"
              type="text"
              defaultValue={programa.materia?.nombre}
              className="bg-background"
              disabled
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
              className="bg-background"
              disabled
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
              className="bg-background"
              disabled
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="docente" className="text-sm font-semibold text-foreground">
            Docente responsable
          </Label>
          <Input
            id="docente"
            type="text"
            defaultValue={programa.docenteResponsable?.apellido + " " + programa.docenteResponsable?.nombre + " (" + programa.docenteResponsable?.legajo + ")" || ""}
            className="bg-background"
            disabled
          />
        </div>
      </div>

      {/* BLOQUE MÚLTIPLE */}
      {programa.bloqueMultiple && programa.bloqueMultiple.length > 0 && (
        <div className="border-l-4 border-accent p-6 py-4 bg-accent/5 rounded-r-lg">
          <h2 className="text-lg font-bold text-accent mb-6">Información por carrera</h2>

        <div className={programa.bloqueMultiple && programa.bloqueMultiple?.length > 3 ? "space-y-6 max-h-[600px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-accent/20" : "space-y-6"}>
             {bloque &&
              <ProgramaCarreraBlockFieldCoord
                block={bloque}
                onUpdate={setBloque}
              />
             }
          </div>
        </div>
      )}

      {/* CONFIGURACIÓN GENERAL */}
      <div className="border-l-4 border-primary p-6 py-4 bg-primary/5 rounded-r-lg space-y-6">
        <h2 className="text-lg font-bold text-primary">Cargas horarias y créditos</h2>

        {/* Carga Horaria */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 [&>*]:min-w-0">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Cantidad de semanas</Label>
            <Input defaultValue={programa.cantidadSemanas || ""} disabled className="bg-background" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Carga horaria semanal</Label>
            <Input defaultValue={programa.cargaHorariaSemanal || ""} disabled className="bg-background" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Carga horaria total</Label>
            <Input defaultValue={programa.cargaHorariaTotal || ""} disabled className="bg-background" />
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
            <Input defaultValue={programa.creditos || ""} disabled className="bg-background" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Carga horaria práctica</Label>
          <Input defaultValue={programa.cargaHorariaPractica || ""} disabled className="bg-background" />
        </div>
      </div>

      {/* CONTENIDO ACADÉMICO */}
      <div className="border-l-4 border-primary p-6 py-4 bg-primary/5 rounded-r-lg space-y-6">
        <h2 className="text-lg font-bold text-primary">Contenido académico</h2>

        <div className="space-y-2">
          <LabelWithTooltip
            label="Fundamentación"
            htmlFor="fundamentacion"
            tooltip={
              <>
                  <p>Indique fundamentación de la inclusión de la asignatura en el plan de estudio teniendo en cuenta los descriptores de conocimiento.</p>
              </>
            }
          />
          <Textarea defaultValue={programa.fundamentacion || ""} disabled className="bg-background min-h-24" />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip
            label="Objetivos"
            htmlFor="objetivos"
            tooltip={
              <>
                <p>Indique los objetos de conocimiento que surgen de agrupar los contenidos que integran saberes del programa analítico.</p>
              </>
            }
          />
          <Textarea defaultValue={programa.objetivos || ""} disabled className="bg-background min-h-24" />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip
            label="Contenidos mínimos"
            htmlFor="contenidosMinimos"
            tooltip={
              <>
                <p>Indique los contenidos mínimos que tiene que tener el programa de la materia</p>
              </>
            }
          />
          <Textarea
            id="contenidosMinimos"
            defaultValue={programa.contenidosMinimos || ""}
            className="bg-background min-h-32"
            disabled
          />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip
            label="Programa analítico"
            htmlFor="programa"
            tooltip={
              <>
                <p>Indique la nómina de unidades temáticas y su desarrollo.</p>
              </>
            }
          />
          <Textarea defaultValue={programa.programaAnalitico || ""} disabled className="bg-background min-h-32" />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip
            label="Metodología de enseñanza y actividades de aprendizaje"
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
          <Textarea defaultValue={programa.metodologia || ""} disabled className="bg-background min-h-24" />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip
            label="Sistema de evaluación"
            htmlFor="modalidadEvaluacion"
            tooltip={
              <>
                <p>
                  Describa el proceso de evaluación que aplica: parciales, entregas, trabajos prácticos, presentaciones orales, trabajos integradores, proyectos, etc. Incluya el sistema de Promoción adoptado (obligatorio según CSU 546/21)
                </p>
              </>
            }
          />
          <Textarea defaultValue={programa.modalidadEvaluacion || ""} disabled className="bg-background min-h-24" />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip
            label="Bibliografía"
            htmlFor="bibliografia"
            tooltip={
              <>
                <p>La bibliografía obligatoria y complementaria de la asignatura. Puede utilizar el botón &apos;Formatear&apos; para adecuar automáticamente las referencias al formato APA.</p>
              </>
            }
          />
          <Textarea defaultValue={programa.bibliografia || ""} disabled className="bg-background min-h-32" />
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 pt-6 border-t border-border bg-background z-10 p-4 rounded-t-lg">

        <Button
          type="button"
          onClick={handleAceptar}
          disabled={isPending}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          {isPending ? "Procesando..." : "✓ Aprobar"}
        </Button>
        <Button
          type="button"
          onClick={() => setRechazDialogOpen(true)}
          disabled={isPending}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
        >
          ✕ Rechazar
        </Button>
        <Button
          type="button"
          onClick={() => router.back()}
          variant="outline"
          className="flex-1 bg-transparent"
        >
          Atrás
        </Button>
      </div>

      {/* RECHAZO DIALOG */}
      <RechazoConCambiosDialog
        hayCambios={!!bloque && (bloque.contribucion ?? '') !== valorInicial}
        open={rechazDialogOpen}
        onOpenChange={setRechazDialogOpen}
        onConfirm={handleRechazarConfirm}
        isLoading={isPending}
      />
    </form>
  )
}
