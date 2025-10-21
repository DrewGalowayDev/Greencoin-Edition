import { HamburgerIcon } from './HamburgerIcon';
import logoImage from '../assets/GreenCoin_ A Digital Revolution.png';

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#1a1a1a] shadow-lg z-50 px-4">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={logoImage}
            alt="GreenEarth Nexus Logo"
            className="h-10 w-auto object-contain"
          />
          <span className="ml-2 text-lg font-semibold text-green-400">
            GreenEarth Nexus
          </span>
        </div>
        <HamburgerIcon className="text-white" />
      </div>
    </header>
  );
};