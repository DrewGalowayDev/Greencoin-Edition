import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import Dashboard from "./Dashboard";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-background flex items-center justify-center p-4 relative">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-4">
          GreenCoin Farmer Dashboard
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Manage your farm operations, track crops, monitor weather, and optimize your agricultural business with our comprehensive dashboard.
        </p>
        <div className="space-x-4">
          <Button onClick={() => navigate('/auth')} size="lg">
            Get Started
          </Button>
          <Button variant="outline" onClick={() => navigate('/auth')} size="lg">
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
