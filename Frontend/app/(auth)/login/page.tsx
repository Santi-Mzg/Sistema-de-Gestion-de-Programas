"use client"

import { useContext, useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { loginSchema, type LoginFormData } from "@/lib/schemas"
import { LoginRequest } from "@/app/api/generated/model"
import { AuthContext } from "@/context/auth-context"

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [backendError, setBackendError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (formData: LoginFormData) => {
    setIsLoading(true)
    try {
      const requestData: LoginRequest = {
        legajo: formData.legajo,
        password: formData.password,
      }

      await login(requestData)

      router.push("/")
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.errors?.Error || error?.response?.data?.message || "Error al iniciar sesión"
      setBackendError(errorMessage)
      console.error("Error al iniciar sesión:", error)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="p-4 border-sidebar-border/50 shrink-0">
          <Link href="/">
            <div className=" text-center">
              <div className="flex items-center justify-center">
                <h1 className="text-5xl font-bold">SyllabUNS</h1>
                <img src="/uns_pluma_orig_bgless.png" alt="Logo UNS" className="h-18 ml-1" />
              </div>
              <p className="text-muted-foreground mt-2">Sistema de Gestión de Programas</p>
            </div>
          </Link>
        </div>

        {/* Login Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>Ingresa tus credenciales para acceder al sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {backendError && (
                <div className="flex gap-3 p-3 bg-destructive/10 border-2 border-destructive rounded-lg">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">Credenciales inválidas</p>
                    <p className="text-xs text-destructive/90">{backendError}</p>
                  </div>
                </div>
              )}
              
              {/* Legajo Field */}
              <div className="space-y-2">
                <label htmlFor="legajo" className="text-sm font-medium text-foreground">
                  Número de Legajo
                </label>
                <Input
                  id="legajo"
                  type="legajo"
                  placeholder="12345"
                  {...register("legajo")}
                  disabled={isLoading}
                  className="border-2"
                  aria-invalid={errors.legajo ? "true" : "false"}
                  required
                />
                {errors.legajo && <p className="text-xs text-destructive">{errors.legajo.message}</p>}
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
                    required
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

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <Link href="/recuperar-contraseña" className="text-sm text-primary hover:text-primary/80 underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </form>

            {/* Register Link */}
            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <Link href="/registro" className="text-primary hover:text-primary/80 font-semibold underline">
                  Regístrate aquí
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
