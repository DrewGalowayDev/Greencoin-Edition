import { useRef, useEffect } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface MenuItemProps {
  id: string;
  label: string;
  onClick: () => void;
  isActive: boolean;
}

const MenuItem = ({ id, label, onClick, isActive }: MenuItemProps) => (
  <button
    onClick={onClick}
    className={`w-full h-14 flex items-center px-6 text-left transition-colors duration-200 
      ${isActive ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50'}`}
    aria-current={isActive ? 'page' : undefined}
  >
    <span className="text-lg">{label}</span>
  </button>
);

export const NavigationDrawer = () => {
  const { isMenuOpen, closeMenu, activeSection, setActiveSection } = useNavigation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);

  // Menu items configuration
  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'features', label: 'Features' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact Us' },
  ];

  // Enhanced scroll functionality with debug logging
  const scrollToSection = (sectionId: string) => {
    console.log('Attempting to scroll to:', sectionId);
    const element = document.getElementById(sectionId);
    console.log('Element found:', element);

    if (element) {
      const headerOffset = 64; // Height of fixed header
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;

      console.log('Scrolling to position:', offsetPosition);
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      setActiveSection(sectionId);
      closeMenu();
    } else {
      console.error('Section not found:', sectionId);
      console.log('Available sections:', 
        Array.from(document.querySelectorAll('[id]')).map(el => el.id)
      );
    }
  };

  const handleItemClick = async (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 64; // Height of fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      await Haptics.impact({ style: ImpactStyle.Light });
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveSection(id);
      closeMenu();
    }
  };

  // Handle touch events for swipe to close
  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isMenuOpen) return;
      
      const touchX = e.touches[0].clientX;
      const diff = touchStartX.current - touchX;
      
      if (diff > 50) { // Threshold for closing
        closeMenu();
      }
    };

    drawer.addEventListener('touchstart', handleTouchStart);
    drawer.addEventListener('touchmove', handleTouchMove);

    return () => {
      drawer.removeEventListener('touchstart', handleTouchStart);
      drawer.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isMenuOpen, closeMenu]);

  // Handle scroll position to update active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-50% 0px -50% 0px', // Consider element in viewport when it's in the middle
      }
    );

    menuItems.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Backdrop - darker and more opaque */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-250 z-40
          ${isMenuOpen ? 'opacity-70' : 'opacity-0 pointer-events-none'}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Drawer - narrower with dark theme */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 w-1/2 max-w-[250px] h-full bg-[#1a1a1a] shadow-lg 
          transform transition-transform duration-300 ease-in-out z-50
          ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-label="Navigation menu"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={closeMenu}
          className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center text-white hover:text-green-500 transition-colors duration-150"
          aria-label="Close menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Menu Items */}
        <div className="pt-16 pb-4 h-full overflow-y-auto">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full text-left px-6 py-4 min-h-[44px] text-base
                  ${activeSection === item.id
                    ? 'bg-green-600 text-white'
                    : 'text-gray-200 hover:bg-green-600/20 hover:text-white'
                  }
                  border-b border-white/10 transition-colors duration-150`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};