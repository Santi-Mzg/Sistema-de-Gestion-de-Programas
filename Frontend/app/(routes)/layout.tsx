import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "../../styles/globals.css"
import { Providers } from "../providers/providers"
import { ThemeProvider } from "../providers/theme-provider"
import { Sidebar } from "@/components/nav/sidebar"
import { UserResponseDTO } from "../api/generated/model"
import { RoleProvider } from "../context/RoleContext"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "UNS - Syllabus Management System",
  description: "University Syllabus Management System for different roles",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

const mockUser: UserResponseDTO = {
  id: 1,
  nombre: "ad",
  apellido: "min",
  email: "admin@gmail.com",
  roles: ["ADMIN", "ADMINISTRATIVO", "PROFESOR", "SECRETARIO", "COORDINADOR"],
} 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
          <Providers>          
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <RoleProvider userRoles={mockUser.roles}>
                <div className="flex min-h-screen bg-background text-foreground">
                  <Sidebar />
                  <main className="flex-1 ml-64 p-8">
                    <img src="/logo_uns_v1.png" alt="Logo UNS" className="h-20 mx-auto mb-2 top-5 right-5 fixed" />
                    {children}
                  </main>
                </div>
             </RoleProvider>
            </ThemeProvider>
          </Providers>
        <Analytics />
      </body>
    </html>
  )
}
