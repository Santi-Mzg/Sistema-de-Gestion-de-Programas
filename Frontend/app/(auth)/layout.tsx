export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50"> 
        {children} {/* Aquí se renderiza tu formulario de Login o Register */}
    </div>
  );
}