import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "../styles/globals.css"
import { Providers } from "../providers/providers"
import { Sidebar } from "@/components/nav/sidebar"
import { RoleProvider } from "@/context/role-context"
import { AuthProvider } from "@/context/auth-context"
import { DepartamentoProvider } from "@/context/dept-context"
import { listDepartamentos } from "@/app/api/generated/server";
import { DepartamentoResponseDTO } from "./api/generated/model"


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
                  {children}
                </RoleProvider>
              </DepartamentoProvider>
            </AuthProvider>
          </Providers>
        <Analytics />
      </body>
    </html>
  )
}
