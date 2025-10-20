import { useState } from "react";
import {
  Home,
  Sprout,
  MapPin,
  CloudSun,
  DollarSign,
  Package,
  TrendingUp,
  BarChart3,
  PlusCircle,
  CheckCircle,
  Crop,
  Recycle,
  Coins,
  ChartLine,
  Trees,
  Gavel,
  Book,
  Users,
  Settings,
  LogOut,
  Microchip,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const menuSections = [
  {
    title: "MAIN",
    items: [
      { icon: Home, label: "Dashboard", url: "/dashboard", active: true }
    ]
  },
  {
    title: "CARBON PROJECTS",
    items: [
      { icon: Sprout, label: "My Projects", url: "/projects", badge: "3" },
      { icon: PlusCircle, label: "Register New", url: "/projects/new" },
      { icon: CheckCircle, label: "Verification", url: "/projects/verify" }
    ]
  },
  {
    title: "LAND MANAGEMENT",
    items: [
      { icon: MapPin, label: "Land Parcels", url: "/land" },
     // { icon: Crop, label: "Crop Rotation", url: "/crops/rotation" },
      { icon: Recycle, label: "Sustainable Practices", url: "/practices" }
    ]
  },
  {
    title: "CARBON CREDITS",
    items: [
      { icon: Coins, label: "Credits Earned", url: "/credits" },
      { icon: ChartLine, label: "Future Forecast", url: "/credits/forecast" },
      { icon: Trees, label: "Retired Credits", url: "/credits/retired" }
    ]
  },
  {
    title: "MARKETPLACE",
    items: [
      { icon: DollarSign, label: "Sell Credits", url: "/market/sell" },
      { icon: Gavel, label: "Credit Auctions", url: "/market/auctions" },
      { icon: BarChart3, label: "Market Prices", url: "/market/prices" }
    ]
  },
  {
    title: "TECHNOLOGY",
    items: [
      { icon: Microchip, label: "IoT Sensors", url: "/tech/iot" },
      { icon: Book, label: "Farmer Resources", url: "/tech/resources" },
      { icon: Users, label: "Farmer Network", url: "/tech/network" }
    ]
  }
];

const sidebarBase = "fixed left-0 top-0 h-[100dvh] w-64 bg-primary-dark dark:bg-gray-900 border-r border-green-700 z-30 overflow-y-auto transition-transform duration-300 ease-in-out flex flex-col";

interface AppSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

function AppSidebar({ isMobileOpen, setIsMobileOpen }: AppSidebarProps) {
  const { signOut } = useAuth();

  return (
    <>
      {/* Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        sidebarBase,
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        'lg:pt-0' // Remove top padding on desktop since header is now sticky
      )}>
        {/* Fixed Menu Toggle Button for Mobile */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className={cn(
            "fixed top-4 left-4 z-[100]", // Increased z-index and adjusted position
            "lg:hidden flex items-center justify-center",
            "h-10 w-10", // Larger touch target
            "bg-green-600 hover:bg-green-500", // More visible background
            "rounded-lg shadow-lg ring-2 ring-white/20", // Added ring for better visibility
            "transition-all duration-200",
            !isMobileOpen && "hover:scale-110" // Add subtle hover animation when closed
          )}
          aria-label="Toggle Menu"
        >
          <Menu className="h-6 w-6 text-white" />
          <span className="sr-only">Toggle Menu</span>
        </button>

        {/* Header */}
        <div className="sticky top-0 bg-primary-dark dark:bg-gray-900 border-b border-white/10 z-10">
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
                <Sprout className="h-8 w-8 text-white" />
              </div>
              <div className="text-white font-semibold text-lg">GreenCoin</div>
            </div>
            {isMobileOpen && (
              <button
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden text-white hover:text-secondary transition-colors"
                aria-label="Close Menu"
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close Menu</span>
              </button>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="flex-1 p-3 overflow-y-auto">
          {menuSections.map((section, index) => (
            <div key={index} className="mb-3">
              <div className="px-4 py-1 text-xs uppercase tracking-wider text-white font-medium">
                {section.title}
              </div>
              <ul className="space-y-0.5">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <NavLink to={item.url} className={({ isActive }) =>
                      `w-full flex items-center gap-2 px-4 py-1.5 text-left transition-all duration-200 border-l-4 relative group rounded-lg ${
                        isActive 
                          ? 'bg-primary/90 dark:bg-gray-800 border-l-secondary text-white font-semibold' 
                          : 'border-l-transparent text-white hover:bg-primary/80 dark:hover:bg-gray-800 hover:border-l-secondary'
                      }`
                    }>
                      <item.icon className="w-4 h-4" />
                      <span className="flex-1 text-sm">{item.label}</span>
                      {item.badge && (
                        <span className="bg-secondary text-primary-dark px-1.5 py-0.5 rounded-full text-xs font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {/* Settings & Sign Out at bottom */}
          <div className="mt-4">
            <NavLink to="/settings" className={({ isActive }) =>
              `w-full flex items-center gap-3 px-5 py-3 text-left transition-all duration-200 border-l-4 relative group rounded-lg ${
                isActive 
                  ? 'bg-primary/90 dark:bg-gray-800 border-l-secondary text-white font-semibold' 
                  : 'border-l-transparent text-white hover:bg-primary/80 dark:hover:bg-gray-800 hover:border-l-secondary'
              }`
            }>
              <Settings className="w-5 h-5" />
              <span className="flex-1">Settings</span>
            </NavLink>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-5 py-3 text-left transition-all duration-200 border-l-4 border-l-transparent text-white hover:bg-destructive dark:hover:bg-destructive hover:border-l-destructive hover:text-white rounded-lg mt-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="flex-1">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AppSidebar;