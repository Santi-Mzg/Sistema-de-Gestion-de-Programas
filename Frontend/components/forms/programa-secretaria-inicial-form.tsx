"use client"
import { invalidarConsultasPrograma } from "@/lib/invalidacion-consultas";
import {
  getGetDraftQueryKey,
  getGetProgramaQueryKey,
  getListCarrerasQueryKey,
  getListDocentesDepartamentoQueryKey,
  getListMateriasDepartamentoQueryKey,
  useAdministrativoCarga,
  useDeleteDraft,
  useGetDraft,
  useGetPrograma,
  useListCarreras,
  useListDocentesDepartamento,
  useListMateriasDepartamento,
  useSaveDraft,
  useSecretariaCarga,
  useActualizarEstado
} from "@/app/api/generated/client";

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Check, CheckCircle2, ChevronsUpDown, FileText, Plus } from "lucide-react"
import Link from "next/link"
import { ProgramaResponseDTO, UserResponseDTO, CarreraResponseDTO, MateriaResponseDTO, ProgramaCargaDTO, ProgramaCarreraCreateDTO, EstadoPrograma, Rol } from "@/app/api/generated/model"
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
import { formComboboxStyles } from "@/lib/form-field-styles"
import { useHeader } from "@/context/header-context"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { ProgramaSecretariaInicialFormData, ProgramaSecretariaInicialFormInput, programaSecretariaInicialSchema } from "@/lib/schemas/programa"
import { FieldErrors, useFieldArray, useForm, useWatch } from "react-hook-form"
import { LabelWithTooltip } from "../ui/label-with-tooltip"
import { RechazoConCambiosDialog } from '@/components/modals/rechazo-con-cambios-dialog';
import { tieneCambiosCargaSecretaria } from '@/lib/cambios-carga-programa';
import { ProgramaCarreraCreateBlock } from "./programa-carrera-block-field"
import { MateriaProgramaSelector } from "./materia-programa-selector"
interface SyllabusFormProps {
  id: number,
}

export function SyllabusSecretariaInicialForm({ id}: SyllabusFormProps) {
  const router = useRouter();
  const { activeDepartamento } = useDept()
  const { activeRole } = useRole();
  const queryClient = useQueryClient();
  const [removeProgramaCarreraIndex, setRemoveProgramaCarreraIndex] = useState<number | null>(null)
  const [rechazoOpen, setRechazoOpen] = useState(false);
  const estadoMutation = useActualizarEstado({ mutation: {
    onSuccess: async () => {
      setRechazoOpen(false);
      await invalidarConsultasPrograma(queryClient, {
        departamentoId: activeDepartamento!.departamentoId!, programaId: id,
      });
      router.push("/");
    },
    onError: () => toast({ title: "No se pudo rechazar", description: "Revise los datos e intente nuevamente", variant: "destructive" }),
  } });
  const [showDraft, setShowDraft] = useState(false)
  const actualYear = new Date().getFullYear()
  const [openDocenteSelector, setOpenDocenteSelector] = useState(false)
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [loadingPrograma, setLoadingPrograma] = useState(false)

  const materiaButtonRef = useRef<HTMLButtonElement>(null)
  const docenteButtonRef = useRef<HTMLButtonElement>(null)
  const bloqueMultipleRef = useRef<HTMLDivElement>(null)

  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    reset,
    setFocus,
    handleSubmit,
    formState: { errors, isDirty }
  } = useForm<ProgramaSecretariaInicialFormInput, unknown, ProgramaSecretariaInicialFormData>({
      resolver: zodResolver(programaSecretariaInicialSchema),
      mode: "onSubmit",
      reValidateMode: "onChange",
      shouldFocusError: false,
      defaultValues: {
          materiaId: undefined,
          docenteResponsableId: undefined,
          bloqueMultiple: [],
          cantidadSemanas: undefined,
          cargaHorariaSemanal: undefined,
          cargaHorariaTotal: undefined,
          creditos: undefined,
          contenidosMinimos: undefined
      }
  })

  const {
    fields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "bloqueMultiple",
  })

  const materiaId = watch("materiaId");
  const bloqueMultiple = watch("bloqueMultiple");
  const semanas = watch("cantidadSemanas");
  const cargaSemanal = watch("cargaHorariaSemanal");
  const cargaTotal = watch("cargaHorariaTotal");


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
  const esRechazado = ultimoEstado?.estado === EstadoPrograma.RECHAZADO_A_SECRETARIA;

  const [selectedDocente, setSelectedDocente] = useState<UserResponseDTO | undefined>(undefined);

  const materiasQuery = useListMateriasDepartamento(deptId ?? 0,
    {
      page: 0,
      size: 1000,
      search: undefined
    },
    {
    query: {
      enabled: !!deptId,
      staleTime: 1000 * 60 * 5,
      queryKey: getListMateriasDepartamentoQueryKey(deptId,
        {
          page: 0,
          size: 1000,
          search: undefined
        },
      ),
    },
  })

  const materias: MateriaResponseDTO[] | undefined = materiasQuery.data?.content;



  const carrerasQuery = useListCarreras({
    query: {
      staleTime: 1000 * 60 * 5,
      queryKey: getListCarrerasQueryKey()
    },
  })

  const carreras: CarreraResponseDTO[] | undefined = carrerasQuery.data;


  const docentesQuery = useListDocentesDepartamento(deptId ?? 0, {
    query: {
      enabled: !!deptId,
      staleTime: 1000 * 60 * 5,
      queryKey: getListDocentesDepartamentoQueryKey(deptId),
    },
  })

  const docentes: UserResponseDTO[] | undefined = docentesQuery.data;

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

  const { mutate, isPending } = useSecretariaCarga({
    mutation: {
      onSuccess: async () => {
        toast({
          title: "✓ Éxito",
          description: "Programa cargado exitosamente",
          variant: "success",
        })

        // El backend elimina este draft junto con la transición.

        reset()

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

  const onSubmit = (data: ProgramaSecretariaInicialFormData) => {
    mutate({
      deptId: activeDepartamento!.departamentoId!,
      id,
      data: data
    });
  }

  const focusPopover = (ref: React.RefObject<HTMLButtonElement | null>) => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    })

    requestAnimationFrame(() => {
      ref.current?.focus()
    })
  }

  const onInvalid = (
    formErrors: FieldErrors<ProgramaSecretariaInicialFormInput>
  ) => {
    if (formErrors.materiaId) {
      focusPopover(materiaButtonRef)
      return
    }

    if (formErrors.docenteResponsableId) {
      focusPopover(docenteButtonRef)
      return
    }

    if (formErrors.bloqueMultiple) {
      bloqueMultipleRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
      return
    }

    if (formErrors.cantidadSemanas) {
      setFocus("cantidadSemanas")
      return
    }

    if (formErrors.cargaHorariaSemanal) {
      setFocus("cargaHorariaSemanal")
      return
    }

    if (formErrors.creditos) {
      setFocus("creditos")
      return
    }
  }

  const draftQuery = useGetDraft(
    activeDepartamento?.departamentoId ?? 0,
    programa?.materia?.id ?? 0,
    {
      rolActivo: activeRole as Rol, anio: programa?.anio ?? new Date().getFullYear(), programaId: id,
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
          programa?.materia?.id ?? 0,
          {
            rolActivo: activeRole as Rol, anio: programa?.anio ?? new Date().getFullYear(), programaId: id,
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
      // Compatibilidad con borradores guardados antes del cambio de terminología.
      draftData.docenteResponsableId ??= draftData.profesorResponsableId;
      delete draftData.profesorResponsableId;
      setSelectedDocente(docentes?.find((p) => p.id === draftData.docenteResponsableId))
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
    if (!isDirty || rechazoOpen || estadoMutation.isPending) return
    if (!activeDepartamento?.departamentoId) return
    if (!programa?.materia?.id) return

    const handler = setTimeout(() => {
      mutateSaveDraft({
        deptId: activeDepartamento.departamentoId!,
        materiaId: programa.materia!.id!,
        params: {
          rolActivo: activeRole as Rol, anio: programa?.anio ?? new Date().getFullYear(), programaId: id,
        },
        data: {
          payloadJson: JSON.stringify(getValues()),
        },
      })
    }, 2000)

    return () => clearTimeout(handler)
  }, [
    rechazoOpen,
    estadoMutation.isPending,
    formValues,
    isDirty,
    activeDepartamento?.departamentoId,
    programa?.materia?.id,
    activeRole,
    mutateSaveDraft,
    getValues,
  ])


 useEffect(() => {
    if (!programa) return

    setLoadingPrograma(true)
    try {
      const mappedData: ProgramaCargaDTO = {
        contenidosMinimos: programa.contenidosMinimos,
        materiaId: programa.materia?.id,
        docenteResponsableId: programa.docenteResponsable?.id,
        bloqueMultiple:
          programa.bloqueMultiple?.map((c) => ({
            key: `${Date.now()}_${Math.random()}`,
            carreraPlanId: c.plan?.id || 0,
            ubicacionEnPlan: c.ubicacionEnPlan || "",
            correlativasFuertesIds: c.correlativasFuertes?.map((cf) => cf.id).filter((id): id is number => id !== undefined) || [],
            correlativasDebilesIds: c.correlativasDebiles?.map((cd) => cd.id).filter((id): id is number => id !== undefined) || [],
            contribucion: c.contribucion || "",
          })) || [],
        cargaHorariaTotal: programa.cargaHorariaTotal || 0,
        cargaHorariaSemanal: programa.cargaHorariaSemanal || 0,
        creditos: programa.creditos || 0,
        cantidadSemanas: programa.cantidadSemanas || 0,
      }
      reset(mappedData)


      if (programa.docenteResponsable?.id) {
      const docenteEncontrado = docentes?.find(
        (p) => p.id === programa.docenteResponsable?.id
      );
      if (docenteEncontrado) {
        setSelectedDocente(docenteEncontrado);
      }
    }

    } catch (error) {
      console.error("Error loading previous program:", error)
    } finally {
      setLoadingPrograma(false)
    }

  }, [programa, docentes]);


  const {setHeader} = useHeader();

  useEffect(() => {
    setHeader({
      title: programa ? `Programa de ${programa?.materia?.nombre} (${programa?.materia?.codigo}) - ${programa?.anio}` : "Nuevo programa académico",
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
                  <span className="font-semibold text-amber-700">Requiere correcciones</span>
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
      (Number.isFinite(semanas) ? semanas : 0) *
      (Number.isFinite(cargaSemanal)
        ? cargaSemanal
        : 0)

    setValue("cargaHorariaTotal", total)
  }, [semanas, cargaSemanal, setValue]);

  const handleAddProgramaCarrera = () => {
    append({
        carreraPlanId: 0,
        ubicacionEnPlan: "",
        correlativasFuertesIds: [],
        correlativasDebilesIds: [],
        contribucion: "",
    })
  }

  const handleRemoveProgramaCarrera = () => {
    if(removeProgramaCarreraIndex == null) return

    remove(removeProgramaCarreraIndex)

    setRemoveProgramaCarreraIndex(null)
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
              <Button>Crear materia</Button>
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

    if (docentesQuery.isLoading) {
      return (
        <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando docentes disponibles...</p>
            </div>
        </div>
      )
    }

    if (docentesQuery.error) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">Error al obtener los docentes</p>
          </div>
        </div>
      )
    }

    if (!docentes || docentes.length === 0) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="text-yellow-600" size={24} />
            <p className="text-yellow-700">No hay docentes registrados. Deben haber docentes registrados para poder crear programas.</p>
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
          <h2 className="text-lg font-bold text-primary mb-6">Información básica</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 [&>*]:min-w-0">
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
                value={programa.anio ?? actualYear}
                className="border-border focus:border-primary bg-background"
                disabled
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 [&>*]:min-w-0">
            <div className="space-y-2">
              <Label htmlFor="materia" className="text-sm font-semibold text-foreground">
                Materia
              </Label>
              <MateriaProgramaSelector materias={materias} value={materiaId} buttonRef={materiaButtonRef}
                error={errors.materiaId?.message}
                onChange={materia => setValue('materiaId', materia.id!, { shouldDirty: true, shouldValidate: true })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo" className="text-sm font-semibold text-foreground">
                Código
              </Label>
              <Input
                id="codigo"
                type="text"
                value={materias.find(m => m.id === materiaId)?.codigo ?? programa.materia?.codigo ?? ""}
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
                value={materias.find(m => m.id === materiaId)?.area ?? programa.materia?.area ?? ""}
                className="border-border focus:border-primary bg-background"
                disabled
                required
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <Label className="text-sm font-semibold">Docente responsable *</Label>
            <Popover open={openDocenteSelector} onOpenChange={setOpenDocenteSelector}>
              <PopoverTrigger asChild>
                <Button
                  ref={docenteButtonRef}
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={openDocenteSelector}
                  aria-invalid={!!errors.docenteResponsableId}
                  aria-describedby={
                    errors.docenteResponsableId
                      ? "docente-error"
                      : undefined
                  }
                  className={cn(formComboboxStyles, "border-border")}
                >
                  <span
                    className="min-w-0 flex-1 truncate text-left"
                    title={selectedDocente ? `${selectedDocente.apellido}, ${selectedDocente.nombre} (Legajo: ${selectedDocente.legajo})` : undefined}
                  >
                    {selectedDocente?.id
                      ? `${selectedDocente.apellido}, ${selectedDocente.nombre} (Legajo: ${selectedDocente.legajo})`
                      : "Seleccionar docente..."}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) max-w-[calc(100vw-2rem)] p-0" onCloseAutoFocus={(e) => e.preventDefault()}>
                <Command>
                  <CommandInput placeholder="Buscar..." />
                  <CommandList className="pointer-events-auto">
                    <CommandEmpty>No se encontró la materia.</CommandEmpty>
                    <CommandGroup>
                      {docentes.map((docente) => (
                        <CommandItem
                          key={docente.id}
                          value={docente.nombre + " " + docente.apellido + " " + docente.legajo}
                          onSelect={() => {
                            setSelectedDocente(docente)
                            setValue("docenteResponsableId", docente.id!, {
                                shouldDirty: true,
                                shouldValidate: true,
                            })
                            setOpenDocenteSelector(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedDocente?.id === docente.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {docente.apellido}, {docente.nombre} (Legajo: {docente.legajo})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="min-h-5">
              {errors.docenteResponsableId && (
                <p className="text-sm text-red-500">
                  {errors.docenteResponsableId.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* BLOQUE MÚLTIPLE */}
        <div ref={bloqueMultipleRef} className="border-l-4 border-accent p-6 py-4 bg-accent/5 rounded-r-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-accent">Información por carrera</h2>
            <Button type="button" onClick={handleAddProgramaCarrera}
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2" size="sm">
              <Plus size={18} /> Agregar carrera
            </Button>
          </div>
          {errors.bloqueMultiple?.message && <p className="text-red-500">{errors.bloqueMultiple.message}</p>}
          {bloqueMultiple.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-background rounded-lg border-2 border-dashed border-accent/20">
              <p>No hay carreras agregadas aún</p><p className="text-sm">Haz clic en &quot;Agregar carrera&quot; para comenzar</p>
            </div>
          ) : (
            <div className={bloqueMultiple.length > 3 ? "space-y-6 max-h-[600px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-accent/20" : "space-y-6"}>
              {fields.map((block, index) => <ProgramaCarreraCreateBlock key={block.id} materiaId={materiaId || 0}
                index={index} carreras={carreras} carreraPlanIdsSeleccionados={bloqueMultiple.map(b => b.carreraPlanId).filter((id): id is number => !!id)}
                control={control} register={register} setValue={setValue} errors={errors} onRemove={setRemoveProgramaCarreraIndex} />)}
            </div>
          )}
        </div>

        {/* CONFIGURACIÓN GENERAL */}
        <div className="border-l-4 border-primary p-6 py-4 bg-primary/5 rounded-r-lg space-y-6">
          <h2 className="text-lg font-bold text-primary">Cargas horarias y créditos</h2>

          {/* Carga Horaria */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 [&>*]:min-w-0">
            <div className="space-y-2">
              <Label htmlFor="semanas" className="text-sm font-semibold text-foreground">
                Cantidad de semanas *
              </Label>
              <Input
                id="semanas"
                type="number"
                {...register("cantidadSemanas", {
                  valueAsNumber: true,
                })}
                placeholder="ej: 16"
                className={`border-2 focus:border-primary ${
                  errors.cantidadSemanas
                    ? "border-red-500"
                    : "border-border"
                }`}
              />
              <div className="min-h-5">
                {errors.cantidadSemanas && (
                  <p className="text-sm text-red-500">
                    {errors.cantidadSemanas.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargaSemanal" className="text-sm font-semibold text-foreground">
                Carga horaria semanal *
              </Label>
              <Input
                id="cargaSemanal"
                type="number"
                {...register("cargaHorariaSemanal", {
                  valueAsNumber: true,
                })}
                placeholder="ej: 8"
                className={`border-2 focus:border-primary ${
                  errors.cargaHorariaSemanal
                    ? "border-red-500"
                    : "border-border"
                }`}
              />
              <div className="min-h-5">
                {errors.cargaHorariaSemanal && (
                  <p className="text-sm text-red-500">
                    {errors.cargaHorariaSemanal.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargaTotal" className="text-sm font-semibold text-foreground">
                Carga horaria total
              </Label>
              <Input
                id="cargaTotal"
                type="number"
                value={cargaTotal ?? 0}
                placeholder="ej: 128"
                className="border-border focus:border-primary bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                disabled
              />
              <div className="min-h-5">
                {errors.cargaHorariaTotal && <span className="text-red-500 text-sm">{errors.cargaHorariaTotal.message}</span>}
              </div>
            </div>
            <div className="space-y-2">
              <LabelWithTooltip
                label="Créditos *"
                htmlFor="creditos"
                tooltip={
                  <>
                    <p>Ingrese la cantidad de créditos de la asignatura conforme a la normativa vigente y su carga horaria.</p>
                  </>
                }
              />
              <Input
                id="creditos"
                type="number"
                {...register("creditos", {
                  valueAsNumber: true,
                })}
                placeholder="ej: 4"
                className={`border-2 focus:border-primary ${
                  errors.creditos
                    ? "border-red-500"
                    : "border-border"
                }`}
              />
              <div className="min-h-5">
                {errors.creditos && <span className="text-red-500 text-sm">{errors.creditos.message}</span>}
              </div>
            </div>
          </div>

          {/* Carga Práctica */}
          <div className="space-y-2">
            <Label htmlFor="cargaPractica" className="text-sm font-semibold text-foreground">
              Carga horaria práctica
            </Label>
            <Input
              id="cargaPractica"
              type="number"
              value={programa.cargaHorariaPractica}
              placeholder="ej: 64"
              className="border-border focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              disabled
            />
          </div>
        </div>

        {/* Campos de texto largo */}
        <div className="border-l-4 border-primary p-6 py-4 bg-primary/5 rounded-r-lg space-y-6">
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
            <Textarea
              id="fundamentacion"
              value={programa.fundamentacion}
              placeholder="Justifica la importancia de esta materia..."
              className="border-border focus:border-primary min-h-20 resize-none"
              disabled
            />
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
            <Textarea
              id="objetivos"
              value={programa.objetivos}
              placeholder="Define los objetivos de aprendizaje..."
              className="border-border focus:border-primary min-h-20 resize-none"
              disabled
            />
          </div>
            
          <div className="space-y-2">
            <LabelWithTooltip
              label="Contenidos mínimos *"
              htmlFor="contenidosMinimos"
              tooltip={
                <>
                  <p>Indique los contenidos mínimos que tiene que tener el programa de la materia</p>
                </>
              }
            />
            <Textarea
              id="contenidosMinimos"
              {...register("contenidosMinimos")}
              className={`border-border focus:border-primary min-h-24 resize-none bg-background ${
                errors.contenidosMinimos
                ? "border-red-500"
                : "border-border"
              }`}
              placeholder="Detalla los contenidos mínimo del curso..."
            />
            <div className="min-h-5">
              {errors.contenidosMinimos && (
                <p className="text-sm text-red-500">
                  {errors.contenidosMinimos.message}
                </p>
              )}
            </div>
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
            <Textarea
              id="programa"
              value={programa.programaAnalitico}
              placeholder="Detalla el contenido temático del curso..."
              className="border-border focus:border-primary min-h-20 resize-none"
              disabled
            />
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
            <Textarea
              id="metodologia"
              value={programa.metodologia}
              placeholder="Describe los métodos de enseñanza..."
              className="border-border focus:border-primary min-h-20 resize-none"
              disabled
            />
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
            <Textarea
              id="evaluacion"
              value={programa.modalidadEvaluacion}
              placeholder="Especifica cómo se evaluará el aprendizaje..."
              className="border-border focus:border-primary min-h-20 resize-none"
              disabled
            />
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
            <Textarea
              id="bibliografia"
              value={programa.bibliografia}
              placeholder="Referencias bibliográficas recomendadas..."
              className="border-border focus:border-primary min-h-20 resize-none"
              disabled
            />
          </div>
        </div>

        {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              onClick={handleSubmit(onSubmit, onInvalid)}
              disabled={isPending || estadoMutation.isPending}
              className="flex-1 bg-primary hover:bg-accent text-primary-foreground font-medium"
            >
              {isPending ? "Cargando..." : "Enviar al docente"}
            </Button>
          {
            <Button
              type="button"
              onClick={() => setRechazoOpen(true)}
              disabled={isPending || estadoMutation.isPending}
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
      </form>

      <RechazoConCambiosDialog hayCambios={tieneCambiosCargaSecretaria(getValues(), programa)} open={rechazoOpen} onOpenChange={setRechazoOpen} isLoading={estadoMutation.isPending}
        onConfirm={(destino, justificacion, guardarCambios) => estadoMutation.mutate({ deptId: deptId!, id,
          params: { rolActivo: activeRole! }, data: { accion: 'RECHAZAR', destinoRechazo: destino, justificacion, guardarCambios, cambios: guardarCambios ? getValues() : undefined } })} />
      <Dialog open={!!showDraft} onOpenChange={(open: boolean) => !open && setShowDraft(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-accent flex items-center gap-2">
              <FileText size={24} />
              Borrador encontrado
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

      <Dialog open={removeProgramaCarreraIndex !== null} onOpenChange={(open: boolean) => !open && setRemoveProgramaCarreraIndex(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-destructive flex items-center gap-2">
              <AlertCircle size={24} />
              Confirmar eliminación
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
