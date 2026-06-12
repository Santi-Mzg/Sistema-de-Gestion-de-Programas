"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { UserCreateDTO, UserCreateDTORolesItem } from "@/app/api/generated/model"
import { getListUsersDepartamentoQueryKey, useCreateUser } from "@/app/api/generated/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CreateUserFormData, createUserSchema } from "@/lib/schemas"
import { useDept } from "@/context/dept-context"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react"
import { useHeader } from "@/context/header-context"
import { Users } from "lucide-react"
import axios from "axios"

const ROLES_PERMITIDOS = [
  UserCreateDTORolesItem.ADMINISTRACION,
  UserCreateDTORolesItem.DOCENTE
];


const AVAILABLE_ROLES = ROLES_PERMITIDOS.map((value) => {
  let label = value.charAt(0) + value.slice(1).toLowerCase().replaceAll("_", " ");

  if (value === UserCreateDTORolesItem.ADMINISTRACION) {
      label = "Administración";
    }

  return { value, label };
});


export function UsuarioForm() {
  const router = useRouter();
  const { activeDepartamento } = useDept()
  const queryClient = useQueryClient(); 

  const { setHeader } = useHeader()

  useEffect(() => {
    setHeader({
      title: `Crear Usuario`,
      subtitle: "Formulario de creación de un nuevo usuario ",
      icon: Users,
    })
  }, [])

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset,
    watch,
    setValue
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { roles: [] }
  })

  const { mutate, isPending } = useCreateUser({
    mutation: {
      onSuccess: () => { 
        toast({
          title: "✓ Éxito",
          description: "Información cargada exitosamente",
          variant: "success",
        })    

        queryClient.invalidateQueries({
          queryKey: getListUsersDepartamentoQueryKey(activeDepartamento?.departamentoId)
        });

        router.push('/usuarios'); 
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

  const onSubmit = (formData: CreateUserFormData) => {
      const requestData: UserCreateDTO = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        legajo: formData.legajo,
        email: formData.email,
        roles: formData.roles as UserCreateDTORolesItem[],
      }

    mutate({ 
      deptId: activeDepartamento!.departamentoId!,
      data: requestData  
    });
  };

  const selectedRoles = watch("roles");

  if (!activeDepartamento || !activeDepartamento.departamentoId) {
    return(
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-yellow-700">Cargando departamento...</p>
        </div>
      </div>
    )
  }


  return (
   <form className="space-y-6 p-4 bg-white rounded-lg shadow">
      
      {/* INPUT ESTÁNDAR */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="apellido">Apellido</Label>
          <input 
            {...register("apellido")} 
            className={`border p-2 rounded ${errors.apellido ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.apellido && <span className="text-red-500 text-sm">{errors.apellido.message}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="nombre">Nombre</Label>
          <input 
            {...register("nombre")}
            className={`border p-2 rounded ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.nombre && <span className="text-red-500 text-sm">{errors.nombre.message}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="legajo">Legajo</Label>
          <input 
            type="text"
            inputMode="numeric"
            onKeyDown={(e) => {
              if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab" && !e.key.includes("Arrow")) {
                e.preventDefault();
              }
            }}
            {...register("legajo")}
            className={`border p-2 rounded ${errors.legajo ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.legajo && <span className="text-red-500 text-sm">{errors.legajo.message}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <input 
            type="email"
            {...register("email")}
            className="border p-2 rounded border-gray-300"
          />
          {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
        </div>
      </div>

      {/* MANEJO DE ROLES (Checkbox) */}
      <div className="space-y-3">
        <Label>Roles</Label>
        <div className="flex-col space-y-3">
          {AVAILABLE_ROLES.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={value}
                checked={selectedRoles?.includes(value)}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  const nextRoles = isChecked
                    ? [...selectedRoles, value]
                    : selectedRoles.filter((r) => r !== value);
                  
                  setValue("roles", nextRoles, { shouldValidate: true });
                }}
              />
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </label>
          ))}
        </div>
        {errors.roles && <span className="text-red-500 text-sm">{errors.roles.message}</span>}
      </div>

      <div className="flex gap-2">
        <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isPending} className="flex-1 bg-primary hover:bg-primary/90">
          {isPending ? "Creando..." : "Crear"}
        </Button>
      </div>
    </form>
  )
}
