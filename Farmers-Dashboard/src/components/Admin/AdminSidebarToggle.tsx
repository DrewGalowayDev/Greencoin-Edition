import { FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarToggleProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const AdminSidebarToggle: FC<AdminSidebarToggleProps> = ({
  collapsed,
  onToggle
}) => {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "fixed top-5 bg-white/10 rounded-lg p-2 hover:bg-white/20 transition-all duration-200",
        collapsed ? "left-16" : "left-60"
      )}
    >
      {collapsed ? (
        <ChevronRight className="h-5 w-5 text-white" />
      ) : (
        <ChevronLeft className="h-5 w-5 text-white" />
      )}
    </button>
  );
};