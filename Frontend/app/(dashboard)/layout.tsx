// app/(dashboard)/layout.tsx
import { Sidebar } from "@/components/nav/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <img 
          src="/logo_uns_v1.png" 
          alt="Logo UNS" 
          className="h-20 mx-auto mb-2 top-5 right-5 fixed" 
        />
        {children}
      </main>
    </div>
  )
}