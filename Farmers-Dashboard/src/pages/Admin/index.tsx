import { FC } from 'react';
import { AdminDashboardLayout } from '@/components/Admin/AdminDashboardLayout';
import { Card } from '@/components/ui/card';

export const AdminDashboard: FC = () => {
  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Example stat cards - customize these based on your needs */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Total Farmers</h3>
            <p className="mt-2 text-2xl font-bold">0</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Total Credits</h3>
            <p className="mt-2 text-2xl font-bold">0</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Active Projects</h3>
            <p className="mt-2 text-2xl font-bold">0</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Total Land Parcels</h3>
            <p className="mt-2 text-2xl font-bold">0</p>
          </Card>
        </div>

        {/* Add more admin dashboard content here */}
      </div>
    </AdminDashboardLayout>
  );
};