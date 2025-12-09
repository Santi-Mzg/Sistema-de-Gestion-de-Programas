"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Check, X, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRegister } from "@/app/api/generated/syllabusApi"
import { RegisterRequest, RegisterRequestRolesItem } from "@/app/api/generated/model"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterFormData } from "@/lib/schemas"

export default function RegisterPage() {
  const router = useRouter()
  const registerMutation = useRegister()
  const [isLoading, setIsLoading] = useState(false)
  const [backendError, setBackendError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const password = watch("password")
  const selectedRole = watch("roles");

  useEffect(() => {
      if (selectedRole && typeof selectedRole === 'string') {
          // Reemplaza el valor de "roles" en el formulario con un array
          setValue("roles", [selectedRole], { shouldValidate: true });
      }
  }, [selectedRole, setValue]);


  const onSubmit = async (formData: RegisterFormData) => {
    setIsLoading(true)

    try {
      const requestData: RegisterRequest = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        legajo: formData.legajo,
        email: formData.email,
        password: formData.password,
        roles: formData.roles as RegisterRequestRolesItem[],
      }

      await registerMutation.mutateAsync({ data: requestData })
      
      router.push("/")

    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.errors?.Error || error?.response?.data?.message || "Error al registrarse"
      setBackendError(errorMessage)
      console.error("Error al registrarse:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary mb-4">
            <span className="text-2xl font-bold text-primary-foreground">UNS</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Crear Cuenta</h1>
          <p className="text-muted-foreground mt-2">Únete a nuestro sistema de syllabus</p>
        </div>

        {/* Register Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Registro</CardTitle>
            <CardDescription>Completa el formulario para registrarte</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {backendError && (
                <div className="flex gap-3 p-3 bg-destructive/10 border-2 border-destructive rounded-lg">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">Error en el inicio de sesión</p>
                    <p className="text-xs text-destructive/90">{backendError}</p>
                  </div>
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="nombre" className="text-sm font-medium text-foreground">
                    Nombre
                  </label>
                  <Input
                    id="nombre"
                    placeholder="Juan"
                    {...register("nombre")}
                    disabled={isLoading}
                    className="border-2"
                    aria-invalid={errors.nombre ? "true" : "false"}
                    required
                  />
                  {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="apellido" className="text-sm font-medium text-foreground">
                    Apellido
                  </label>
                  <Input
                    id="apellido"
                    placeholder="Pérez"
                    {...register("apellido")}
                    disabled={isLoading}
                    className="border-2"
                    aria-invalid={errors.apellido ? "true" : "false"}
                    required
                  />
                  {errors.apellido && <p className="text-xs text-destructive">{errors.apellido.message}</p>}
                </div>
              </div>

             {/* DNI and Legajo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="dni" className="text-sm font-medium text-foreground">
                    DNI
                  </label>
                  <Input
                    id="dni"
                    placeholder="12345678"
                    {...register("dni")}
                    disabled={isLoading}
                    className="border-2"
                    aria-invalid={errors.dni ? "true" : "false"}
                  />
                  {errors.dni && <p className="text-xs text-destructive">{errors.dni.message}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="legajo" className="text-sm font-medium text-foreground">
                    Legajo
                  </label>
                  <Input
                    id="legajo"
                    placeholder="87654321"
                    {...register("legajo")}
                    disabled={isLoading}
                    className="border-2"
                    aria-invalid={errors.legajo ? "true" : "false"}
                  />
                  {errors.legajo && <p className="text-xs text-destructive">{errors.legajo.message}</p>}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Correo Electrónico
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@uns.edu.ar"
                  {...register("email")}
                  disabled={isLoading}
                  className="border-2"
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              {/* Roles Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Rol</label>
                <div className="space-y-2 bg-muted p-4 rounded-lg border-2 border-border">
                  {Object.entries(RegisterRequestRolesItem).filter(([key, value]) => value === "ADMINISTRATIVO" || value === "PROFESOR").map(([key, value]) => (
                    <div key={value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`role-${value}`}
                        value={value}
                        {...register("roles")}
                        disabled={isLoading}
                        className="w-4 h-4 rounded border-2 border-primary"
                      />
                      <label htmlFor={`role-${value}`} className="text-sm text-foreground cursor-pointer">
                        {key.charAt(0) + key.slice(1).toLowerCase()}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.roles && <p className="text-xs text-destructive">{errors.roles.message}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    disabled={isLoading}
                    className="border-2 pr-10"
                    aria-invalid={errors.password ? "true" : "false"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              {/* Password Requirements */}
              <PasswordRequirements password={password} />

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    disabled={isLoading}
                    className="border-2 pr-10"
                    aria-invalid={errors.confirmPassword ? "true" : "false"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                {isLoading ? "Registrando..." : "Crear Cuenta"}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-primary hover:text-primary/80 font-semibold underline">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2025 Universidad Nacional del Sur. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}


function PasswordRequirements({ password }: { password?: string }) {
  const requirements = {
    hasMinLength: (password?.length ?? 0) >= 8,
    hasUpperCase: /[A-Z]/.test(password ?? ""),
    hasLowerCase: /[a-z]/.test(password ?? ""),
    hasNumber: /\d/.test(password ?? ""),
    hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password ?? ""),
  }

  return (
    <div className="space-y-2 bg-muted p-4 rounded-lg">
      <p className="text-xs font-semibold text-foreground mb-3">Requisitos de contraseña:</p>
      <div className="space-y-2">
        <RequirementItem met={requirements.hasMinLength} text="Mínimo 8 caracteres" />
        <RequirementItem met={requirements.hasUpperCase} text="Una mayúscula" />
        <RequirementItem met={requirements.hasLowerCase} text="Una minúscula" />
        <RequirementItem met={requirements.hasNumber} text="Un número" />
        <RequirementItem met={requirements.hasSpecialChar} text="Un carácter especial" />
      </div>
    </div>
  )
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <Check size={16} className="text-green-600 flex-shrink-0" />
      ) : (
        <X size={16} className="text-muted-foreground flex-shrink-0" />
      )}
      <span className={`text-xs ${met ? "text-foreground" : "text-muted-foreground"}`}>{text}</span>
    </div>
  )
}

