"use client"

import type React from "react"
import { useState, useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  AlertCircle,
  Check,
  X,
} from "lucide-react"
import { useSetPasswordFlow } from "@/hooks/use-set-password"

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "Mínimo 8 caracteres", test: (p) => p.length >= 8 },
  { label: "Al menos una mayúscula", test: (p) => /[A-Z]/.test(p) },
  { label: "Al menos una minúscula", test: (p) => /[a-z]/.test(p) },
  { label: "Al menos un número", test: (p) => /[0-9]/.test(p) },
  { label: "Al menos un carácter especial", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
]

export default function SetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { setPassword, success } = useSetPasswordFlow()

  const requirementsMet = useMemo(() => {
    return passwordRequirements.map((req) => ({
      ...req,
      met: req.test(newPassword),
    }))
  }, [newPassword])

  const allRequirementsMet = requirementsMet.every((r) => r.met)
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0
  const canSubmit = allRequirementsMet && passwordsMatch && !isLoading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!allRequirementsMet) {
      setError("La contraseña no cumple con todos los requisitos")
      return
    }

    if (!passwordsMatch) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)

    try {
      await setPassword({ token: token!, password: newPassword })
    } catch (err) {
      setError("Error al procesar la solicitud. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-b from-background to-muted/30">
        <div className="w-full max-w-md">
          <Card className="border-2 border-green-200 bg-linear-to-b from-green-50 to-white shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-green-100 to-green-200 border-2 border-green-300">
                    <CheckCircle size={40} className="text-green-600" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-2xl text-green-800">Contraseña Establecida</CardTitle>
              <CardDescription className="text-green-600">
                Su cuenta ha sido configurada exitosamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Ya puede iniciar sesión.
              </p>
              <Link href="/login">
                <Button className="w-full" size="lg">
                  Iniciar Sesión
                </Button>
              </Link>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Universidad Nacional del Sur. Todos los derechos reservados.
          </p>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-b from-background to-muted/30">
        <div className="w-full max-w-md">
          <Card className="border-2 border-destructive/30 bg-linear-to-b from-destructive/5 to-white shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 border-2 border-destructive/20">
                  <AlertCircle size={32} className="text-destructive" />
                </div>
              </div>
              <CardTitle className="text-xl text-destructive">Enlace Invalido</CardTitle>
              <CardDescription>
                El enlace que utilizaste no es valido o ha expirado.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Volver al Inicio
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-b from-background to-muted/30">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Volver al inicio
          </Link>
        </div>

        {/* Main Card */}
        <Card className="border-2 border-primary/20 shadow-lg overflow-hidden">
          {/* Header with linear */}
          <div className="bg-linear-to-r from-primary to-primary/80 px-6 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                <ShieldCheck size={32} className="text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Establecer Contraseña</h1>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Crea una contraseña segura para activar tu cuenta
            </p>
          </div>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu nueva contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    className="border-2 pl-10 pr-10"
                  />
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              {newPassword.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4 border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Requisitos:
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {requirementsMet.map((req, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 text-xs transition-colors ${
                          req.met ? "text-green-600" : "text-muted-foreground"
                        }`}
                      >
                        {req.met ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <X size={14} className="text-muted-foreground/50" />
                        )}
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirmar Contrasña
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    className={`border-2 pl-10 pr-10 ${
                      confirmPassword.length > 0
                        ? passwordsMatch
                          ? "border-green-400 focus:ring-green-400"
                          : "border-destructive focus:ring-destructive"
                        : ""
                    }`}
                  />
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <p
                    className={`text-xs flex items-center gap-1 ${
                      passwordsMatch ? "text-green-600" : "text-destructive"
                    }`}
                  >
                    {passwordsMatch ? (
                      <>
                        <Check size={12} />
                        Las contraseñas coinciden
                      </>
                    ) : (
                      <>
                        <X size={12} />
                        Las contraseñas no coinciden
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20 flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={!canSubmit}
                size="lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Estableciendo...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShieldCheck size={18} />
                    Establecer Contraseña
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 Universidad Nacional del Sur.
        </p>
      </div>
    </div>
  )
}
