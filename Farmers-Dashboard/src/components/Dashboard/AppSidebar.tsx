import { FC, useState } from "react";
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
  X,
  ChevronDown
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const menuSections = [
  {
    title: "Main",
    items: [
      { icon: Home, label: "Dashboard", url: "/dashboard", active: true }
    ]
  },
  {
    title: "Carbon Projects",
    items: [
      { icon: Sprout, label: "My Projects", url: "/projects", badge: "3" },
      { icon: PlusCircle, label: "Register New", url: "/projects/new" },
      { icon: CheckCircle, label: "Verification", url: "/projects/verify" }
    ]
  },
  {
    title: "Land Management",
    items: [
      { icon: MapPin, label: "Land Parcels", url: "/land" },
      { icon: Recycle, label: "Sustainable Practices", url: "/practices" }
    ]
  },
  {
    title: "Carbon Credits",
    items: [
      { icon: Coins, label: "Credits Earned", url: "/credits" },
      { icon: ChartLine, label: "Future Forecast", url: "/credits/forecast" },
      { icon: Trees, label: "Retired Credits", url: "/credits/retired" }
    ]
  },
  {
    title: "Marketplace",
    items: [
      { icon: DollarSign, label: "Sell Credits", url: "/market/sell" },
      { icon: Gavel, label: "Credit Auctions", url: "/market/auctions" },
      { icon: BarChart3, label: "Market Prices", url: "/market/prices" }
    ]
  },
  {
    title: "Technology",
    items: [
      { icon: Microchip, label: "IoT Sensors", url: "/tech/iot" },
      { icon: Book, label: "Farmer Resources", url: "/tech/resources" },
      { icon: Users, label: "Farmer Network", url: "/tech/network" }
    ]
  }
];

const sidebarBase = "fixed left-0 top-0 h-[100dvh] w-64 bg-primary-dark dark:bg-gray-900 border-r border-green-700 z-30 overflow-y-auto transition-transform duration-300 ease-in-out flex flex-col";

const AppSidebar: FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<number[]>([]);
  const { signOut } = useAuth();

  const toggleSection = (index: number) => {
    setOpenSections(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

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
              <button
                onClick={() => toggleSection(index)}
                className="w-full px-4 py-3 mb-1 flex items-center justify-between text-sm capitalize tracking-wider text-white/90 dark:text-white/70 font-medium hover:bg-white/5 rounded-lg transition-colors duration-200"
              >
                <span className="font-bold">{section.title}</span>
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  openSections.includes(index) ? "transform rotate-180" : ""
                )} />
              </button>
              <ul className={cn(
                "space-y-1 overflow-hidden transition-all duration-200 pl-2",
                openSections.includes(index) ? "max-h-96 opacity-100 mb-4" : "max-h-0 opacity-0"
              )}>
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) =>
                        cn(
                          "w-full flex items-center relative group rounded-lg transition-all duration-200 border-l-4",
                          isCollapsed ? "justify-center px-2" : "gap-2 px-4",
                          "py-1.5 text-left",
                          isActive 
                            ? "bg-white/10 border-l-secondary text-green-400 dark:text-success font-semibold" 
                            : "border-l-transparent text-white/90 hover:bg-white/10 hover:border-l-secondary hover:text-success"
                        )
                      }
                    >
                      <item.icon className={cn("w-4 h-4", isCollapsed && "w-5 h-5")} />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-sm">{item.label}</span>
                          {item.badge && (
                            <span className="bg-secondary text-primary-dark px-1.5 py-0.5 rounded-full text-xs font-semibold">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 hidden group-hover:block">
                          <div className="bg-black/80 text-white text-sm rounded-md px-2 py-1 whitespace-nowrap">
                            {item.label}
                            {item.badge && (
                              <span className="ml-2 bg-secondary text-primary-dark px-1.5 py-0.5 rounded-full text-xs font-semibold">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {/* Settings & Sign Out at bottom */}
          <div className="mt-6 border-t border-white/10 pt-4">
            <div className="px-4 py-1 text-sm capitalize tracking-wider text-white/90 dark:text-white/70 font-bold mb-2">
              Account
            </div>
            <ul className="space-y-1">
              <li>
                <NavLink to="/settings" className={({ isActive }) =>
                  cn(
                    "w-full flex items-center relative group rounded-lg transition-all duration-200 border-l-4",
                    isCollapsed ? "justify-center px-2" : "gap-2 px-4",
                    "py-1.5 text-left",
                    isActive 
                      ? "bg-white/10 border-l-secondary text-green-400 dark:text-success font-semibold" 
                      : "border-l-transparent text-white/90 hover:bg-white/10 hover:border-l-secondary hover:text-success"
                  )
                }>
                  <Settings className={cn("w-4 h-4", isCollapsed && "w-5 h-5")} />
                  {!isCollapsed && <span className="flex-1 text-sm">Settings</span>}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 hidden group-hover:block">
                      <div className="bg-black/80 text-white text-sm rounded-md px-2 py-1 whitespace-nowrap">
                        Settings
                      </div>
                    </div>
                  )}
                </NavLink>
              </li>
              <li>
                <button
                  onClick={signOut}
                  className={cn(
                    "w-full flex items-center relative group rounded-lg transition-all duration-200 border-l-4",
                    isCollapsed ? "justify-center px-2" : "gap-2 px-4",
                    "py-1.5 text-left",
                    "border-l-transparent text-white/90 hover:bg-destructive/10 hover:border-l-destructive hover:text-destructive"
                  )}
                >
                  <LogOut className={cn("w-4 h-4", isCollapsed && "w-5 h-5")} />
                  {!isCollapsed && <span className="flex-1 text-sm">Sign Out</span>}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 hidden group-hover:block">
                      <div className="bg-black/80 text-white text-sm rounded-md px-2 py-1 whitespace-nowrap">
                        Sign Out
                      </div>
                    </div>
                  )}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}


export default AppSidebar;