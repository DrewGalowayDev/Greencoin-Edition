import { createContext, useContext, useState, useEffect } from 'react';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface NavigationContextType {
  isMenuOpen: boolean;
  activeSection: string;
  toggleMenu: () => void;
  closeMenu: () => void;
  setActiveSection: (section: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Handle back button for Android
  useEffect(() => {
    const handleBackButton = async () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
        await Haptics.impact({ style: ImpactStyle.Light });
        return;
      }
      // Show exit confirmation if menu is closed
      const shouldExit = window.confirm('Do you want to exit the app?');
      if (shouldExit) {
        App.exitApp();
      }
    };

    App.addListener('backButton', handleBackButton);

    return () => {
      App.removeAllListeners();
    };
  }, [isMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  const toggleMenu = async () => {
    setIsMenuOpen(!isMenuOpen);
    await Haptics.impact({ style: ImpactStyle.Light });
  };

  const closeMenu = async () => {
    setIsMenuOpen(false);
    await Haptics.impact({ style: ImpactStyle.Light });
  };

  return (
    <NavigationContext.Provider
      value={{
        isMenuOpen,
        activeSection,
        toggleMenu,
        closeMenu,
        setActiveSection,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};