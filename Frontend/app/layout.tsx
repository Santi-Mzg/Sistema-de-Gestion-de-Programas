import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "../styles/globals.css"
import { Providers } from "../providers/providers"
import { RoleProvider } from "@/context/role-context"
import { AuthProvider } from "@/context/auth-context"
import { DepartamentoProvider } from "@/context/dept-context"
import { Toaster } from "@/components/ui/toaster"
import { HeaderProvider } from "@/context/header-context"


const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sílabus-UNS",
  description: "Sistema de gestión de programas de la Universidad Nacional del Sur",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/logo_uns_v1.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/logo_uns_v1.png",
        media: "(prefers-color-scheme: dark)",
      }
    ],
  },
}


// const departamentos: DepartamentoResponseDTO[] = (await listDepartamentos()).data;


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <body className={`font-sans antialiased`}>
          <Providers>          
            <AuthProvider>
              <DepartamentoProvider >
                <RoleProvider >
                  <HeaderProvider>
                    {children}
                    <Toaster />
                  </HeaderProvider>
                </RoleProvider>
              </DepartamentoProvider>
            </AuthProvider>
          </Providers>
        <Analytics />
      </body>
    </html>
  )
}
