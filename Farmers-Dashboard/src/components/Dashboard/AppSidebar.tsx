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
  Microchip
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { NavLink } from "react-router-dom";

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

const sidebarBase = "fixed left-0 top-0 h-screen w-64 bg-grey-600 border-r border-green-700 z-40 overflow-y-auto transition-transform duration-300 ease-in-out";

function AppSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { signOut } = useAuth();

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 bg-primary/20 text-white border-none rounded-lg p-3 shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Home className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={
        `${sidebarBase} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`
      }>
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
            <Sprout className="w-8 h-8 text-white" />
          </div>
          <div className="text-white font-semibold text-lg">GreenCoin</div>
        </div>

        {/* Menu */}
        <div className="p-4">
          {menuSections.map((section, index) => (
            <div key={index} className="mb-6">
              <div className="px-5 py-2 text-xs uppercase tracking-wider text-white/70 font-medium">
                {section.title}
              </div>
              <ul className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <NavLink to={item.url} className={({ isActive }) =>
                      `w-full flex items-center gap-3 px-5 py-3 text-left transition-all duration-200 border-l-4 relative group rounded-lg ${isActive ? 'bg-white/10 border-l-secondary text-success font-semibold' : 'border-l-transparent text-white/90 hover:bg-white/10 hover:border-l-secondary hover:text-success'}`
                    }>
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="bg-secondary text-primary-dark px-2 py-1 rounded-full text-xs font-semibold">
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
          <div className="mt-10">
            <NavLink to="/settings" className={({ isActive }) =>
              `w-full flex items-center gap-3 px-5 py-3 text-left transition-all duration-200 border-l-4 relative group rounded-lg ${isActive ? 'bg-white/10 border-l-secondary text-success font-semibold' : 'border-l-transparent text-white/90 hover:bg-white/10 hover:border-l-secondary hover:text-success'}`
            }>
              <Settings className="w-5 h-5" />
              <span className="flex-1">Settings</span>
            </NavLink>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-5 py-3 text-left transition-all duration-200 border-l-4 border-l-transparent text-white/90 hover:bg-destructive/10 hover:border-l-destructive hover:text-destructive rounded-lg mt-2"
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