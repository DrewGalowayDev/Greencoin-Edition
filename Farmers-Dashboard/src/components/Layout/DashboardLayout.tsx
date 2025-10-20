import { SidebarProvider } from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import AppSidebar from "../Dashboard/AppSidebar"
import Header from "../Dashboard/Header"
import { cn } from "@/lib/utils"
import { useLocation } from "react-router-dom"

interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Close mobile menu on route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  if (!isMounted) {
    return null
  }

  // Handler for mobile menu toggle
  const handleMobileMenuToggle = () => {
    setIsMobileOpen(prev => !prev);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar 
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
        <div className={cn(
          "flex-1 relative flex flex-col w-full",
          "lg:ml-64", // Add margin on desktop only
          className
        )}>
          <Header className="sticky top-0 z-30" />
          <main className="flex-1 relative bg-gradient-to-br from-background via-background to-muted/10">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}