"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Aquí iría la lógica de recuperación de contraseña
      console.log("Recover password for:", email)
      // TODO: Conectar con API de recuperación de contraseña
      setIsSubmitted(true)
    } catch (err) {
      setError("Error al procesar la solicitud. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Success State */}
          <Card className="border-2 border-primary/20 text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Correo Enviado</CardTitle>
              <CardDescription>Verifica tu bandeja de entrada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Hemos enviado un enlace de recuperación de contraseña a <strong>{email}</strong>. Por favor revisa tu
                bandeja de entrada (y carpeta de spam).
              </p>
              <p className="text-sm text-muted-foreground">El enlace expirará en 1 hora por motivos de seguridad.</p>

              <div className="space-y-3 pt-4">
                <Button asChild className="w-full bg-transparent" variant="outline">
                  <Link href="/login">Volver a Iniciar Sesión</Link>
                </Button>
                <Button
                  onClick={() => {
                    setIsSubmitted(false)
                    setEmail("")
                  }}
                  variant="ghost"
                  className="w-full"
                >
                  Usar otro correo
                </Button>
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium"
          >
            <ArrowLeft size={18} />
            Volver
          </Link>
        </div>

        {/* Recovery Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Recuperar Contraseña</CardTitle>
            <CardDescription>Ingresa tu correo electrónico para recibir un enlace de recuperación</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@uns.edu.ar"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    className="border-2 pl-10"
                  />
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                  {error}
                </div>
              )}

              {/* Info Message */}
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  Recibirás un correo electrónico con instrucciones para resetear tu contraseña.
                </p>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                {isLoading ? "Enviando..." : "Enviar Enlace de Recuperación"}
              </Button>
            </form>

            {/* Help Text */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                ¿Problemas?{" "}
                <Link href="#" className="text-primary hover:text-primary/80 underline">
                  Contacta a soporte
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
