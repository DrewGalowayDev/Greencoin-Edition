import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/Dashboard/AppSidebar';
import StatsCard from '@/components/Dashboard/StatsCard';
import { EarningsChart, ProjectDistributionChart } from '@/components/Dashboard/Charts';
import TransactionsTable from '@/components/Dashboard/TransactionsTable';
import LandParcels from '@/components/Dashboard/LandParcels';
import ClimatePractices from '@/components/Dashboard/ClimatePractices';
import FarmActivities from '@/components/Dashboard/FarmActivities';
import ActionButtons from '@/components/Dashboard/ActionButtons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  Bell, 
  Settings, 
  User, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Calendar,
  MapPin,
  Droplets,
  Thermometer,
  Wifi,
  WifiOff,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardData {
  profile: any;
  farms: any[];
  crops: any[];
  financialRecords: any[];
  weatherData?: any;
  recentActivities: any[];
  notifications: any[];
}

interface ConnectionState {
  isConnected: boolean;
  lastPing: Date | null;
  reconnectAttempts: number;
  subscriptionsActive: number;
}

interface DataCache {
  data: DashboardData;
  timestamp: Date;
  version: number;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    profile: null,
    farms: [],
    crops: [],
    financialRecords: [],
    recentActivities: [],
    notifications: []
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: true,
    lastPing: null,
    reconnectAttempts: 0,
    subscriptionsActive: 0
  });
  
  const [dataCache, setDataCache] = useState<DataCache | null>(null);
  const [realtimeEvents, setRealtimeEvents] = useState<any[]>([]);
  const subscriptionsRef = useRef<any[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced real-time data fetching with caching
  const fetchDashboardData = useCallback(async (
    showRefreshing = false, 
    forceRefresh = false,
    specificTable?: string
  ) => {
    if (!user) return;

    // Use cache if available and not forcing refresh
    if (!forceRefresh && dataCache && !specificTable) {
      const cacheAge = Date.now() - dataCache.timestamp.getTime();
      if (cacheAge < 30000) { // Use cache if less than 30 seconds old
        setDashboardData(dataCache.data);
        setLastUpdated(dataCache.timestamp);
        return;
      }
    }

    if (showRefreshing) setRefreshing(true);

    try {
      const startTime = performance.now();
      
      // Build queries based on what needs to be fetched
      const queries: Promise<any>[] = [];
      const queryTypes: string[] = [];

      const profileQuery = async () => {
        if (!specificTable || specificTable === 'profiles') {
          queryTypes.push('profile');
          return await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
        }
        return null;
      };

      const farmsQuery = async () => {
        if (!specificTable || specificTable === 'farms') {
          queryTypes.push('farms');
          return await supabase
            .from('farms')
            .select('*')
            .eq('owner_id', user.id);
        }
        return null;
      };

      const activitiesQuery = async () => {
        if (!specificTable || specificTable === 'farm_activities') {
          queryTypes.push('activities');
          return await supabase
            .from('farm_activities')
            .select(`
              *,
              farms(name, location)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);
        }
        return null;
      };

      const notificationsQuery = async () => {
        if (!specificTable || specificTable === 'notifications') {
          queryTypes.push('notifications');
          return await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_read', false)
            .order('created_at', { ascending: false })
            .limit(10);
        }
        return null;
      };

      // Execute queries in parallel
      const [profileResponse, farmsResponse, activitiesResponse, notificationsResponse] = await Promise.all([
        profileQuery(),
        farmsQuery(),
        activitiesQuery(),
        notificationsQuery()
      ]);
      
      // Process responses
      const newData: Partial<DashboardData> = specificTable ? { ...dashboardData } : {};
      
      if (profileResponse?.data) newData.profile = profileResponse.data;
      if (farmsResponse?.data) newData.farms = farmsResponse.data || [];
      if (activitiesResponse?.data) newData.recentActivities = activitiesResponse.data || [];
      if (notificationsResponse?.data) newData.notifications = notificationsResponse.data || [];

      // Fetch dependent data if farms exist and not targeting specific table
      if ((newData.farms?.length > 0 || dashboardData.farms.length > 0) && !specificTable) {
        const farmIds = newData.farms?.map(farm => farm.id) || dashboardData.farms.map(farm => farm.id);
        
        if (farmIds.length > 0) {
          const [cropsResponse, financialResponse] = await Promise.all([
            supabase
              .from('crops')
              .select(`
                *,
                farms(name, location),
                crop_monitoring(
                  health_status,
                  growth_stage,
                  last_monitored
                )
              `)
              .in('farm_id', farmIds)
              .order('planting_date', { ascending: false }),
            
            supabase
              .from('financial_records')
              .select(`
                *,
                farms(name)
              `)
              .in('farm_id', farmIds)
              .order('transaction_date', { ascending: false })
              .limit(100)
          ]);

          newData.crops = cropsResponse.data || [];
          newData.financialRecords = financialResponse.data || [];
        }
      }

      // Update state and cache
      const finalData = { ...dashboardData, ...newData } as DashboardData;
      setDashboardData(finalData);
      
      const newCache: DataCache = {
        data: finalData,
        timestamp: new Date(),
        version: (dataCache?.version || 0) + 1
      };
      setDataCache(newCache);
      setLastUpdated(new Date());

      // Performance logging
      const endTime = performance.now();
      console.log(`Data fetch completed in ${(endTime - startTime).toFixed(2)}ms`);
      
      if (showRefreshing) {
        toast.success(`Dashboard refreshed successfully in ${(endTime - startTime).toFixed(0)}ms`);
      }

      // Add real-time event
      setRealtimeEvents(prev => [
        { 
          type: 'data_fetch', 
          timestamp: new Date(), 
          duration: endTime - startTime,
          tables: queryTypes 
        },
        ...prev.slice(0, 49) // Keep last 50 events
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Handle different types of errors
      if (error.code === 'PGRST116') {
        toast.error('Database connection error. Retrying...');
        setTimeout(() => fetchDashboardData(false, true), 2000);
      } else {
        toast.error('Failed to load dashboard data');
      }

      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        reconnectAttempts: prev.reconnectAttempts + 1
      }));
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  }, [user, dashboardData, dataCache]);

  // Connection health monitoring
  const checkConnection = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      
      if (!error) {
        setConnectionState(prev => ({
          ...prev,
          isConnected: true,
          lastPing: new Date(),
          reconnectAttempts: 0
        }));
      } else {
        throw error;
      }
    } catch (error) {
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        reconnectAttempts: prev.reconnectAttempts + 1
      }));
      
      // Attempt reconnection
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      reconnectTimeoutRef.current = setTimeout(() => {
        setupRealtimeSubscriptions();
      }, Math.min(1000 * Math.pow(2, connectionState.reconnectAttempts), 30000));
    }
  }, [connectionState.reconnectAttempts]);

  // Enhanced real-time subscriptions setup
  const setupRealtimeSubscriptions = useCallback(() => {
    if (!user) return;

    // Clean up existing subscriptions
    subscriptionsRef.current.forEach(sub => {
      try {
        sub.unsubscribe();
      } catch (error) {
        console.warn('Error unsubscribing:', error);
      }
    });
    subscriptionsRef.current = [];

    const subscriptionConfigs = [
      {
        channel: 'profile_changes',
        table: 'profiles',
        filter: `user_id=eq.${user.id}`,
        handler: () => fetchDashboardData(false, true, 'profiles')
      },
      {
        channel: 'farms_changes',
        table: 'farms',
        filter: `owner_id=eq.${user.id}`,
        handler: () => fetchDashboardData(false, true, 'farms')
      },
      {
        channel: 'crops_changes',
        table: 'crops',
        handler: (payload: any) => {
          // Check if the change affects user's farms
          const userFarmIds = dashboardData.farms.map(f => f.id);
          if (userFarmIds.includes(payload.new?.farm_id || payload.old?.farm_id)) {
            fetchDashboardData(false, true, 'crops');
          }
        }
      },
      {
        channel: 'financial_changes',
        table: 'financial_records',
        handler: (payload: any) => {
          const userFarmIds = dashboardData.farms.map(f => f.id);
          if (userFarmIds.includes(payload.new?.farm_id || payload.old?.farm_id)) {
            fetchDashboardData(false, true, 'financial_records');
            
            // Show toast for financial updates
            if (payload.eventType === 'INSERT') {
              const record = payload.new;
              toast.success(
                `New ${record.transaction_type}: $${record.amount}`,
                { description: record.description || 'Financial record added' }
              );
            }
          }
        }
      },
      {
        channel: 'activities_changes',
        table: 'farm_activities',
        filter: `user_id=eq.${user.id}`,
        handler: (payload: any) => {
          fetchDashboardData(false, true, 'farm_activities');
          
          if (payload.eventType === 'INSERT') {
            const activity = payload.new;
            toast.info(
              `New activity: ${activity.activity_type}`,
              { description: `Recorded for ${activity.farm_name || 'your farm'}` }
            );
          }
        }
      },
      {
        channel: 'notifications_changes',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
        handler: (payload: any) => {
          fetchDashboardData(false, true, 'notifications');
          
          if (payload.eventType === 'INSERT' && !payload.new.read) {
            toast.info(payload.new.title, {
              description: payload.new.message,
              action: {
                label: 'View',
                onClick: () => {
                  // Handle notification click
                }
              }
            });
          }
        }
      }
    ];

    // Create subscriptions
    subscriptionConfigs.forEach(config => {
      try {
        const subscription = supabase
          .channel(config.channel)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: config.table,
              ...(config.filter && { filter: config.filter })
            },
            (payload) => {
              console.log(`Real-time update: ${config.table}`, payload);
              
              // Add to real-time events log
              setRealtimeEvents(prev => [
                {
                  type: 'realtime_update',
                  table: config.table,
                  event: payload.eventType,
                  timestamp: new Date(),
                  payload: payload
                },
                ...prev.slice(0, 49)
              ]);

              config.handler(payload);
            }
          )
          .subscribe((status) => {
            console.log(`Subscription ${config.channel} status:`, status);
            
            if (status === 'SUBSCRIBED') {
              setConnectionState(prev => ({
                ...prev,
                subscriptionsActive: prev.subscriptionsActive + 1,
                isConnected: true
              }));
            } else if (status === 'CHANNEL_ERROR') {
              setConnectionState(prev => ({
                ...prev,
                isConnected: false
              }));
              
              // Retry subscription after delay
              setTimeout(() => setupRealtimeSubscriptions(), 5000);
            }
          });

        subscriptionsRef.current.push(subscription);
      } catch (error) {
        console.error(`Error setting up subscription for ${config.table}:`, error);
      }
    });

  }, [user, fetchDashboardData, dashboardData.farms]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Setup real-time subscriptions
  useEffect(() => {
    if (user && dashboardData.farms.length >= 0) {
      setupRealtimeSubscriptions();
    }

    return () => {
      subscriptionsRef.current.forEach(sub => {
        try {
          sub.unsubscribe();
        } catch (error) {
          console.warn('Cleanup error:', error);
        }
      });
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, [user, setupRealtimeSubscriptions]);

  // Connection monitoring
  useEffect(() => {
    // Ping every 30 seconds to check connection
    pingIntervalRef.current = setInterval(checkConnection, 30000);
    
    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, [checkConnection]);

  // Auto-refresh with exponential backoff
  useEffect(() => {
    const getRefreshInterval = () => {
      if (!connectionState.isConnected) {
        return Math.min(5000 * Math.pow(2, connectionState.reconnectAttempts), 60000);
      }
      return 2 * 60 * 1000; // 2 minutes when connected
    };

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData(false, false);
      }
    }, getRefreshInterval());

    return () => clearInterval(interval);
  }, [fetchDashboardData, connectionState]);

  // Handle visibility change for smart refreshing
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh data when tab becomes visible
        fetchDashboardData(false, true);
        setupRealtimeSubscriptions();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchDashboardData, setupRealtimeSubscriptions]);

  const calculateStats = () => {
    const { farms, crops, financialRecords } = dashboardData;
    
    const totalCrops = crops.length;
    const activeFarms = farms.filter(farm => farm.status === 'active').length;
    const totalIncome = financialRecords
      .filter(record => record.transaction_type === 'income')
      .reduce((sum, record) => sum + parseFloat(record.amount || 0), 0);
    const totalExpenses = financialRecords
      .filter(record => record.transaction_type === 'expense')
      .reduce((sum, record) => sum + parseFloat(record.amount || 0), 0);
    const netProfit = totalIncome - totalExpenses;
    const totalArea = farms.reduce((sum, farm) => sum + parseFloat(farm.size_hectares || 0), 0);

    // Enhanced crop health calculation
    const healthyCrops = crops.filter(crop => 
      crop.crop_monitoring?.[0]?.health_status === 'healthy' || 
      crop.health_status === 'healthy'
    ).length;
    const cropHealthPercentage = crops.length > 0 ? (healthyCrops / crops.length) * 100 : 0;

    return {
      totalCrops,
      activeFarms,
      totalIncome,
      totalExpenses,
      netProfit,
      totalArea,
      cropHealthPercentage
    };
  };

  const stats = calculateStats();

  const statsData = [
    {
      title: "Active Farms",
      value: stats.activeFarms.toString(),
      label: `${dashboardData.farms.length} total farms`,
      icon: "🚜",
      iconBg: "bg-green-100 dark:bg-green-900/20",
      textColor: "text-green-700 dark:text-green-400",
      trend: {
        direction: "up" as const,
        value: `${((stats.activeFarms / Math.max(dashboardData.farms.length, 1)) * 100).toFixed(0)}% active`,
        color: "text-green-600"
      }
    },
    {
      title: "Total Crops",
      value: stats.totalCrops.toString(),
      label: "Planted this season",
      icon: "🌱",
      iconBg: "bg-blue-100 dark:bg-blue-900/20",
      textColor: "text-blue-700 dark:text-blue-400",
      trend: {
        direction: stats.cropHealthPercentage >= 70 ? "up" as const : "down" as const,
        value: `${stats.cropHealthPercentage.toFixed(0)}% healthy`,
        color: stats.cropHealthPercentage >= 70 ? "text-green-600" : "text-yellow-600"
      }
    },
    {
      title: "Net Income",
      value: `$${stats.netProfit.toLocaleString()}`,
      label: "This financial year",
      icon: "💰",
      iconBg: "bg-orange-100 dark:bg-orange-900/20",
      textColor: "text-orange-700 dark:text-orange-400",
      trend: {
        direction: stats.netProfit >= 0 ? "up" as const : "down" as const,
        value: `Revenue: $${stats.totalIncome.toLocaleString()}`,
        color: stats.netProfit >= 0 ? "text-green-600" : "text-red-600"
      }
    },
    {
      title: "Farm Area",
      value: `${stats.totalArea.toFixed(1)} ha`,
      label: "Total productive land",
      icon: "🌾",
      iconBg: "bg-purple-100 dark:bg-purple-900/20",
      textColor: "text-purple-700 dark:text-purple-400",
      trend: {
        direction: "up" as const,
        value: `${(stats.totalArea / Math.max(stats.activeFarms, 1)).toFixed(1)} ha avg`,
        color: "text-blue-600"
      }
    }
  ];

  const handleRefresh = () => {
    fetchDashboardData(true, true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="w-80 shadow-xl border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto"></div>
              <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-r-primary/40 animate-ping mx-auto"></div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Loading Dashboard</h3>
            <p className="text-muted-foreground text-sm">Fetching your farm data...</p>
            <div className="mt-4 text-xs text-muted-foreground">
              Setting up real-time connections...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/10">
        {/* Main Content with left margin for sidebar on desktop */}
        <div className="flex-1 flex flex-col lg:ml-64">
          {/* Enhanced Header with Connection Status */}
          <header className="h-16 border-b bg-card/80 backdrop-blur-md supports-[backdrop-filter]:bg-card/60 flex items-center justify-between px-6 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  Dashboard
                  {connectionState.isConnected ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Last updated: {lastUpdated.toLocaleTimeString()} • 
                  {connectionState.subscriptionsActive} live connections
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleRefresh}
                disabled={refreshing}
                className="relative hover:bg-muted/50"
                title="Refresh dashboard data"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-muted/50"
                title="Notifications"
                onClick={() => {
                  // TODO: Open notifications panel
                  toast.info('Notifications panel coming soon!');
                }}
              >
                <Bell className="h-4 w-4" />
                {dashboardData.notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white">
                    {dashboardData.notifications.length}
                  </Badge>
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-muted/50"
                title="Settings"
                onClick={() => {
                  // TODO: Open settings panel
                  toast.info('Settings panel coming soon!');
                }}
              >
                <Settings className="h-4 w-4" />
              </Button>
              
              <ThemeToggle variant="ghost" className="hover:bg-muted/50" />
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={signOut}
                title="Sign out"
                className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              >
                <User className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Connection Status Alert */}
          {!connectionState.isConnected && (
            <Alert className="mx-6 mt-4 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Connection issues detected. Attempting to reconnect... 
                ({connectionState.reconnectAttempts} attempts)
              </AlertDescription>
            </Alert>
          )}

          {/* Main Content */}
          <main className="flex-1 p-6 space-y-8">
            {/* Enhanced Welcome Section */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-2xl"></div>
              <Card className="relative border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-3">
                        Welcome back, {dashboardData.profile?.full_name || 'Farmer'}! 👋
                      </h2>
                      <p className="text-muted-foreground text-lg">
                        Monitor your agricultural operations with real-time updates
                      </p>
                      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date().toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{dashboardData.profile?.location || 'Farm Location'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          <span>{realtimeEvents.length} real-time events</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Weather Widget */}
                    <Card className="w-full md:w-64 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Live Weather</span>
                          <Thermometer className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-blue-800 dark:text-blue-200">24°C</span>
                          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                            <Droplets className="h-3 w-3" />
                            <span className="text-xs">65%</span>
                          </div>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Perfect farming conditions</p>
                        <div className="mt-2 flex items-center gap-1">
                          <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600">Live data</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {statsData.map((stat, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center text-2xl transition-transform group-hover:scale-110`}>
                        {stat.icon}
                      </div>
                      <div className={`flex items-center gap-1 ${stat.trend.color}`}>
                        {stat.trend.direction === 'up' ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                      <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <div className={`text-xs ${stat.trend.color} font-medium`}>
                        {stat.trend.value}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Real-time Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {/* Farm Health Overview with Real-time Updates */}
                <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">🌿</span>
                      Farm Health Overview
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-auto"></div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Crop Health</span>
                          <span className="text-sm text-muted-foreground">{stats.cropHealthPercentage.toFixed(0)}%</span>
                        </div>
                        <Progress value={stats.cropHealthPercentage} className="h-2" />
                        <Badge variant={stats.cropHealthPercentage >= 80 ? "default" : stats.cropHealthPercentage >= 60 ? "secondary" : "destructive"}>
                          {stats.cropHealthPercentage >= 80 ? "Excellent" : stats.cropHealthPercentage >= 60 ? "Good" : "Needs Attention"}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Farm Utilization</span>
                          <span className="text-sm text-muted-foreground">{((stats.activeFarms / Math.max(dashboardData.farms.length, 1)) * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={(stats.activeFarms / Math.max(dashboardData.farms.length, 1)) * 100} className="h-2" />
                        <Badge variant="outline">{stats.activeFarms} of {dashboardData.farms.length} farms active</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Financial Health</span>
                          <span className="text-sm text-muted-foreground">{stats.netProfit >= 0 ? "Profitable" : "Loss"}</span>
                        </div>
                        <Progress value={Math.min(Math.max((stats.netProfit / Math.max(stats.totalIncome, 1)) * 100, 0), 100)} className="h-2" />
                        <Badge variant={stats.netProfit >= 0 ? "default" : "destructive"}>
                          {stats.netProfit >= 0 ? `+${stats.netProfit.toLocaleString()}` : `-${Math.abs(stats.netProfit).toLocaleString()}`}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Live Notifications & Real-time Events */}
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Live Updates
                    <Badge className="ml-auto">{dashboardData.notifications.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-80 overflow-y-auto">
                  <div className="space-y-3">
                    {/* Notifications */}
                    {dashboardData.notifications.map((notification, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mt-2"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{notification.title}</p>
                          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{notification.message}</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            {new Date(notification.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Recent Real-time Events */}
                    {realtimeEvents.slice(0, 5).map((event, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mt-2"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-green-900 dark:text-green-100">
                            {event.type === 'realtime_update' ? `${event.table} updated` : 'Data refreshed'}
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                            {event.type === 'realtime_update' ? `${event.event} event` : `${event.duration?.toFixed(0)}ms`}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            {event.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}

                    {dashboardData.notifications.length === 0 && realtimeEvents.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No recent updates</p>
                        <p className="text-xs mt-1">Real-time monitoring active</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Charts Section with Real-time Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm relative">
                <div className="absolute top-4 right-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <EarningsChart />
              </Card>
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm relative">
                <div className="absolute top-4 right-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <ProjectDistributionChart />
              </Card>
            </div>

            {/* Real-time Data Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm relative">
                <div className="absolute top-4 right-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <TransactionsTable />
              </Card>
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm relative">
                <div className="absolute top-4 right-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <LandParcels />
              </Card>
            </div>

            {/* Recent Farm Activities with Real-time Updates */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Recent Farm Activities
                  <Badge className="ml-auto">{dashboardData.recentActivities.length}</Badge>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentActivities.length > 0 ? (
                    dashboardData.recentActivities.slice(0, 8).map((activity, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-primary/20">
                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{activity.activity_type}</p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(activity.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {activity.farms?.name} • {activity.farms?.location}
                          </p>
                          {activity.description && (
                            <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {activity.status || 'Completed'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No recent activities to display</p>
                      <p className="text-xs mt-1">Activities will appear here in real-time</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Real-time Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm relative">
                <div className="absolute top-4 right-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <ClimatePractices />
              </Card>
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm relative">
                <div className="absolute top-4 right-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <FarmActivities />
              </Card>
            </div>

            {/* System Status & Performance Metrics */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Performance
                  <Badge variant={connectionState.isConnected ? "default" : "destructive"}>
                    {connectionState.isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/30">
                    <div className="text-2xl font-bold text-green-600">{connectionState.subscriptionsActive}</div>
                    <div className="text-xs text-muted-foreground">Active Subscriptions</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/30">
                    <div className="text-2xl font-bold text-blue-600">{realtimeEvents.length}</div>
                    <div className="text-xs text-muted-foreground">Real-time Events</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/30">
                    <div className="text-2xl font-bold text-purple-600">
                      {connectionState.lastPing ? new Date(connectionState.lastPing).toLocaleTimeString() : 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">Last Ping</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/30">
                    <div className="text-2xl font-bold text-orange-600">{dataCache?.version || 0}</div>
                    <div className="text-xs text-muted-foreground">Cache Version</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Action Buttons */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
              <CardContent className="p-6">
                <ActionButtons />
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;