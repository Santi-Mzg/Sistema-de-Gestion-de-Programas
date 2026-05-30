"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, User, Building2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserResponseDTO, UserCreateDTO, UserResponseReducedDTO, UsuarioDepartamentoDTO } from "@/app/api/generated/model"
import { useDept } from "@/context/dept-context"
import { getGetUserByIdQueryKey, useGetUserById, useUpdateUser } from "@/app/api/generated/client"
import { useHeader } from "@/context/header-context"
import { toast } from "@/hooks/use-toast"
import axios from "axios"


export default function EditUserPage() {
  const { id } = useParams<{ id: string }>()
  const { activeDepartamento } = useDept()

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


  const router = useRouter()
  const userQuery = useGetUserById(Number(id),
    {
      query: {
        staleTime: 1000 * 60 * 5,
        queryKey: getGetUserByIdQueryKey(Number(id))
      }
    });
  const user: UserResponseDTO | undefined = userQuery.data;
  const userDpto: UsuarioDepartamentoDTO | undefined = user?.departamentos?.find(depto => depto.departamentoId === activeDepartamento?.departamentoId)
  
  const { setHeader } = useHeader()
  useEffect(() => {
    setHeader({
      title: `${user?.apellido} ${user?.nombre}  (${user?.legajo ?? ""})`,
      subtitle: " ",
      icon: User,
    })
  }, [user])
  
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<UserCreateDTO>({
        nombre: user?.nombre || "",
        apellido: user?.apellido || "",
        legajo: user?.legajo || "",
        email: userDpto?.email || "",
  })


  useEffect(() => {
    if(!user) return
    setFormData({ 
        nombre: user?.nombre || "",
        apellido: user?.apellido || "",
        legajo: user?.legajo || "",
        email: userDpto?.email || "",
    })
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  
    const { mutate, isPending } = useUpdateUser({
        mutation: {
          onSuccess: () => { 
            toast({
              title: "✓ Éxito",
              description: "Información actualizada exitosamente",
              variant: "success",
            })    

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
    }});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if(user?.id) {
        mutate({
            deptId: activeDepartamento.departamentoId || 0,
            id: user.id, 
            data: formData
        });
        
      }
    } catch (error) {
      console.error("Error updating User:", error)
    } finally {
      setIsLoading(false)
    }
  }


  if (userQuery.isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando datos del usuario...</p>
        </div>
      </div>
    )
  }

  if (userQuery.error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-600" size={24} />
          <p className="text-red-700">Error al obtener el usuario</p>
        </div>
      </div>
    )
  }

  if (!user || !user.id || !userDpto) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="text-yellow-600" size={24} />
          <p className="text-yellow-700">El usuario solicitado no existe o no pudo ser cargado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form - 2 columns */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-border shadow-xl">
              <CardHeader className="bg-linear-to-r from-primary/5 to-accent/5 border-b-2 border-border">
                <CardTitle className="text-2xl text-primary flex items-center gap-2">
                  Información General
                </CardTitle>
                <CardDescription className="text-base">Actualiza los datos básicos del usuario</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-sm font-semibold">
                      Nombre *
                    </Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ej: Gonzalo"
                      required
                      className="border-2 border-border focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="apellido" className="text-sm font-semibold">
                        Apellido
                      </Label>
                      <Input
                        id="apellido"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleChange}
                        placeholder="Ej: Gonzales"
                        className="border-2 border-border focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="legajo" className="text-sm font-semibold">
                        Legajo
                      </Label>
                      <Input
                        id="legajo"
                        name="legajo"
                        value={formData.legajo}
                        onChange={handleChange}
                        placeholder="Ej: 12345"
                        className="border-2 border-border focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold">
                        Email Departamental
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Ej: ejemplo@correo.com"
                        className="border-2 border-border focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t-2 border-border">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isLoading}
                      className="flex-1 border-2"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || !formData.nombre}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      <Save size={18} className="mr-2" />
                      {isLoading ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
