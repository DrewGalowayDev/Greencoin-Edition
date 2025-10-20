import { FC, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import Logo from '@/assets/GreenCoin_ A Digital Revolution.png';

const menuSections = [
  {
    title: "MAIN",
    items: [
      { icon: Home, label: "Overview", url: "/admin/dashboard", active: true }
    ]
  },
  {
    title: "FARMER MANAGEMENT",
    items: [
      { icon: Users, label: "All Farmers", url: "/admin/farmers", badge: "1" },
      { icon: FileText, label: "Applications", url: "/admin/applications" }
    ]
  },
  {
    title: "FARM OPERATIONS",
    items: [
      { icon: TreePine, label: "Land Parcels", url: "/admin/land-parcels" },
      { icon: Sprout, label: "Practices", url: "/admin/practices" }
    ]   
  },
  {
    title: "CARBON MANAGEMENT",
    items: [
      { icon: Clock, label: "Verification", url: "/admin/credit-forecast" },
      { icon: Coins, label: "Carbon Credits", url: "/admin/carbon-credits" },
    ]  
  },
  {
    title: "MARKETPLACE",
    items: [
      { icon: FileText, label: "Issued Credits", url: "/admin/issued" },
      { icon: FileCheck, label: "Retired Credits", url: "/admin/retired" },
      { icon: Calendar, label: "Credit Auctions", url: "/admin/credit-auctions" }
    ]
  },
  {
    title: "REPORTS & MONITORING",
    items: [
      { icon: LineChart, label: "Analytics", url: "/admin/analytics" },
      //{ icon: Calendar, label: "Schedule", url: "/admin/calendar" }
       // { icon: BarChart3, label: "Performance", url: "/admin/reports/performance" },
     // { icon: AlertCircle, label: "Compliance", url: "/admin/reports/compliance" }
    ]
  },
 
];

const sidebarBase = (collapsed: boolean) => 
  `fixed left-0 top-0 h-screen ${collapsed ? 'w-20' : 'w-64'} bg-white dark:bg-gray-800 border-r border-green-700 z-40 overflow-y-auto transition-all duration-300 ease-in-out shadow-xl`;

import { AdminSidebarToggle } from './AdminSidebarToggle';
import { Home, Users, FileText, TreePine, Sprout, Clock, Coins, FileCheck, Calendar, LineChart, Settings, LogOut } from 'lucide-react';

export const AdminSidebar: FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut } = useAuth();

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 bg-primary/20 text-white border-none rounded-lg p-3 shadow-lg"
        onClick={() => {
          if (isMobileOpen) {
            setIsMobileOpen(false);
          } else {
            setIsMobileOpen(true);
            setIsCollapsed(false); // Always expand when opening on mobile
          }
        }}
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
      <div className={cn(
        sidebarBase(isCollapsed),
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        'transition-transform duration-300 ease-in-out'
      )}>
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <img 
            src={Logo} 
            alt="GreenCoin Logo" 
            className={cn(
              "transition-all duration-300",
              isCollapsed ? "w-10 h-10" : "w-12 h-12"
            )} 
          />
          {!isCollapsed && (
            <div className="text-white font-semibold text-lg">GreenCoin Admin</div>
          )}
        </div>
        
        {/* Menu */}   
        <div className="p-3">
          {/* Toggle Button */}
          <div className="mb-4 px-4">
            <AdminSidebarToggle 
              collapsed={isCollapsed} 
              onToggle={() => setIsCollapsed(!isCollapsed)} 
            />
          </div>

          {menuSections.map((section, index) => (
            <div key={index} className="mb-3">
              <div className="px-4 py-1 text-xs uppercase tracking-wider text-zinc-600 dark:text-white/70 font-medium">
                {section.title}
              </div>
              <ul className="space-y-0.5">
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
                            : "border-l-transparent text-dark-80 hover:bg-zinc-700/10 hover:border-l-secondary hover:text-green-400 dark:text-white/90 dark:hover:text-success"
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
          <div className="mt-4">
            <NavLink to="/admin/settings" className={({ isActive }) =>
              cn(
                "w-full flex items-center relative group rounded-lg transition-all duration-200 border-l-4",
                isCollapsed ? "justify-center px-2" : "gap-3 px-5",
                "py-3 text-left",
                isActive 
                  ? "bg-white/10 border-l-secondary text-success font-semibold" 
                  : "border-l-transparent text-white/90 hover:bg-white/10 hover:border-l-secondary hover:text-success"
              )
            }>
              <Settings className={cn("w-5 h-5", isCollapsed && "w-6 h-6")} />
              {!isCollapsed && <span className="flex-1">Settings</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 hidden group-hover:block">
                  <div className="bg-black/80 text-white text-sm rounded-md px-2 py-1 whitespace-nowrap">
                    Settings
                  </div>
                </div>
              )}
            </NavLink>
            <button
              onClick={signOut}
              className={cn(
                "w-full flex items-center relative group rounded-lg transition-all duration-200 border-l-4",
                isCollapsed ? "justify-center px-2" : "gap-3 px-5",
                "py-3 text-left mt-2",
                "border-l-transparent text-white/90 hover:bg-destructive/10 hover:border-l-destructive hover:text-destructive"
              )}
            >
              <LogOut className={cn("w-5 h-5", isCollapsed && "w-6 h-6")} />
              {!isCollapsed && <span className="flex-1">Sign Out</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 hidden group-hover:block">
                  <div className="bg-black/80 text-white text-sm rounded-md px-2 py-1 whitespace-nowrap">
                    Sign Out
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};