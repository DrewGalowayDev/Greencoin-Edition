import { FC, ReactNode, useState } from 'react';
import AppSidebar from '@/components/Dashboard/AppSidebar';
import Header from '@/components/Dashboard/Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      <div className="lg:ml-64">
        <Header onMobileMenuToggle={() => setIsMobileOpen(!isMobileOpen)} />
        <main className="container mx-auto p-4 pt-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;