import { FC, ReactNode } from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

interface AdminDashboardLayoutProps {
  children: ReactNode;
}

export const AdminDashboardLayout: FC<AdminDashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex flex-col lg:pl-72">
        <AdminHeader />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};