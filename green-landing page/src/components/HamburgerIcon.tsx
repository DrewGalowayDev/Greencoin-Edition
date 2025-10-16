import { useNavigation } from '@/contexts/NavigationContext';

interface HamburgerIconProps {
  className?: string;
}

export const HamburgerIcon = ({ className = '' }: HamburgerIconProps) => {
  const { isMenuOpen, toggleMenu } = useNavigation();

  return (
    <button
      onClick={toggleMenu}
      className={`relative w-11 h-11 flex items-center justify-center focus:outline-none ${className}`}
      aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isMenuOpen}
    >
      <div className="w-6 h-5 flex flex-col justify-between transform transition-transform duration-300">
        <span
          className={`w-full h-0.5 bg-white transform transition-transform duration-300 ${
            isMenuOpen ? 'rotate-45 translate-y-2' : ''
          }`}
        />
        <span
          className={`w-full h-0.5 bg-white transform transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`w-full h-0.5 bg-white transform transition-transform duration-300 ${
            isMenuOpen ? '-rotate-45 -translate-y-2' : ''
          }`}
        />
      </div>
    </button>
  );
};