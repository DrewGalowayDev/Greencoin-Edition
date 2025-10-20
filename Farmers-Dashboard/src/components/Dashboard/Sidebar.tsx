import { useState } from 'react';

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuSections = [
    {
      title: "MAIN",
      items: [
        { icon: "fas fa-home", label: "Dashboard", active: true }
      ]
    },
    {
      title: "CARBON PROJECTS", 
      items: [
        { icon: "fas fa-seedling", label: "My Projects", badge: "1" },
        { icon: "fas fa-plus-circle", label: "Register New" },
        { icon: "fas fa-check-circle", label: "Verification" }
      ]
    },
    {
      title: "LAND MANAGEMENT",
      items: [
        { icon: "fas fa-map-marked-alt", label: "Land Parcels" },
        { icon: "fas fa-crop-alt", label: "Crop Rotation" },
        { icon: "fas fa-recycle", label: "Sustainable Practices" }
      ]
    },
    {
      title: "CARBON CREDITS",
      items: [
        { icon: "fas fa-coins", label: "Credits Earned" },
        { icon: "fas fa-chart-line", label: "Future Forecast" },
        { icon: "fas fa-tree", label: "Retired Credits" }
      ]
    },
    {
      title: "MARKETPLACE",
      items: [
        { icon: "fas fa-dollar-sign", label: "Sell Credits" },
        { icon: "fas fa-gavel", label: "Credit Auctions" },
        { icon: "fas fa-chart-bar", label: "Market Prices" }
      ]
    },
    
    {
      title: "TECHNOLOGY",
      items: [
        { icon: "fas fa-microchip", label: "IoT Sensors" },
        { icon: "fas fa-book", label: "Farmer Resources" },
        { icon: "fas fa-users", label: "Farmer Network" }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 bg-primary/20 text-white border-none rounded-lg p-3 shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <i className="fas fa-bars text-xl"></i>
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-screen w-sidebar bg-sidebar backdrop-blur-xl border-r border-sidebar-border z-40 overflow-y-auto
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        before:absolute before:inset-0 before:bg-gradient-to-b before:from-primary/10 before:to-transparent before:pointer-events-none
      `}>
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
            <div className="w-8 h-8 bg-white/20 rounded border border-white/30"></div>
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
                    <button className={`
                      w-full flex items-center gap-3 px-5 py-3 text-left transition-all duration-200 
                      border-l-3 relative group
                      ${item.active 
                        ? 'bg-white/10 border-l-secondary text-success' 
                        : 'border-l-transparent text-white/90 hover:bg-white/10 hover:border-l-secondary hover:text-success'
                      }
                    `}>
                      <i className={`${item.icon} w-5 text-center`}></i>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="bg-secondary text-primary-dark px-2 py-1 rounded-full text-xs font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;