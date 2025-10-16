import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Farm {
  id: string;
  name: string;
  size_hectares: number;
  location: string;
  status: string;
}

const LandParcels = () => {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef<any>(null);

  const fetchFarms = async () => {
    if (!user) return;

    try {
      const { data: farmsData } = await supabase
        .from('farms')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (farmsData) {
        setFarms(farmsData);
      }
    } catch (error) {
      console.error('Error fetching farms:', error);
      toast.error('Failed to load farms data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, [user]);

  // Setup real-time subscription
  useEffect(() => {
    if (!user) return;

    // Clean up existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    // Create new subscription for farms table
    subscriptionRef.current = supabase
      .channel('farms_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'farms',
          filter: `owner_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time farms update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setFarms(prev => [payload.new as Farm, ...prev]);
            toast.success(`New farm "${payload.new.name}" added`);
          } else if (payload.eventType === 'UPDATE') {
            setFarms(prev => prev.map(farm => 
              farm.id === payload.new.id ? payload.new as Farm : farm
            ));
            toast.info(`Farm "${payload.new.name}" updated`);
          } else if (payload.eventType === 'DELETE') {
            setFarms(prev => prev.filter(farm => farm.id !== payload.old.id));
            toast.info(`Farm "${payload.old.name}" removed`);
          }
        }
      )
      .subscribe((status) => {
        console.log('Farms subscription status:', status);
      });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [user]);

  if (loading) {
    return (
      <div className="bg-card backdrop-blur-xl border border-primary/20 rounded-2xl p-6 relative overflow-hidden group">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded mb-4 w-32"></div>
          <div className="h-72 bg-muted rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card backdrop-blur-xl border border-primary/20 rounded-2xl p-6 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h3 className="text-primary font-semibold text-lg">My Farms</h3>
        <button className="bg-white/10 border border-primary/30 text-white hover:bg-primary/20 hover:border-primary px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2">
          <span>+</span>
          Add Farm
        </button>
      </div>

      {/* Interactive Map Placeholder */}
      <div className="h-72 bg-green-100 rounded-lg flex items-center justify-center text-primary mb-4 relative z-10">
        <div className="text-center">
          <div className="text-5xl mb-4">🗺️</div>
          <p className="font-semibold">Interactive Farm Map</p>
          <p className="text-sm text-green-700">Click to view farm details</p>
        </div>
      </div>

      {/* Farms List */}
      <div className="space-y-3 relative z-10">
        {farms.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg mb-2">No farms registered yet</p>
            <p className="text-sm">Add your first farm to get started</p>
          </div>
        ) : (
          farms.map((farm) => (
            <div key={farm.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200">
              <div className="flex-1">
                <span className="text-white font-medium">{farm.name}</span>
                <div className="text-white/70 text-sm">{farm.location}</div>
              </div>
              <div className="text-right">
                <span className="text-primary font-semibold">{farm.size_hectares} ha</span>
                <div className="text-white/70 text-sm capitalize">{farm.status}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LandParcels;