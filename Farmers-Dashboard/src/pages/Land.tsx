import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, RefreshCw } from "lucide-react";

interface Farm {
  id: string;
  name: string;
  size_hectares: number;
  location: string;
  status: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  soil_type?: string;
  climate_zone?: string;
  practices?: string[];
  description?: string;
}

interface Crop {
  id: string;
  crop_type: string;
  variety?: string;
  planted_area_hectares: number;
  planting_date: string;
  current_stage: string;
  health_status: string;
  expected_yield_kg?: number;
  actual_yield_kg?: number;
}

interface FarmActivity {
  id: string;
  activity_type: string;
  title: string;
  description?: string;
  activity_date: string;
  duration_hours?: number;
  cost?: number;
}

interface LandData {
  farm: Farm | null;
  crops: Crop[];
  activities: FarmActivity[];
  totalCrops: number;
  totalArea: number;
  activeActivities: number;
}

const statusColor = {
  Verified: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Active: "bg-blue-100 text-blue-800",
};

export default function Land() {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const [landData, setLandData] = useState<LandData>({
    farm: null,
    crops: [],
    activities: [],
    totalCrops: 0,
    totalArea: 0,
    activeActivities: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const subscriptionsRef = useRef<any[]>([]);

  // Fetch all land-related data
  const fetchLandData = useCallback(async (showRefreshing = false) => {
    if (!user) return;

    if (showRefreshing) setRefreshing(true);

    try {
      // Get user's farms
      const { data: farmsData } = await supabase
        .from('farms')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!farmsData || farmsData.length === 0) {
        setLandData({
          farm: null,
          crops: [],
          activities: [],
          totalCrops: 0,
          totalArea: 0,
          activeActivities: 0
        });
        setLoading(false);
        return;
      }

      const farm = farmsData[0];

      // Fetch related data in parallel
      const [cropsResponse, activitiesResponse] = await Promise.all([
        supabase
          .from('crops')
          .select('*')
          .eq('farm_id', farm.id)
          .order('planting_date', { ascending: false }),
        
        supabase
          .from('farm_activities')
          .select('*')
          .eq('farm_id', farm.id)
          .order('activity_date', { ascending: false })
          .limit(10)
      ]);

      const crops = cropsResponse.data || [];
      const activities = activitiesResponse.data || [];

      // Calculate metrics
      const totalCrops = crops.length;
      const totalArea = farm.size_hectares || 0;
      const activeActivities = activities.filter(a => 
        new Date(a.activity_date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length;

      setLandData({
        farm,
        crops,
        activities,
        totalCrops,
        totalArea,
        activeActivities
      });

      if (showRefreshing) {
        toast.success('Land data refreshed successfully');
      }
    } catch (error) {
      console.error('Error fetching land data:', error);
      toast.error('Failed to load land data');
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  }, [user]);

  // Setup real-time subscriptions
  const setupRealtimeSubscriptions = useCallback(() => {
    if (!user || !landData.farm) return;

    // Clean up existing subscriptions
    subscriptionsRef.current.forEach(sub => {
      try {
        sub.unsubscribe();
      } catch (error) {
        console.warn('Error unsubscribing:', error);
      }
    });
    subscriptionsRef.current = [];

    const farmId = landData.farm.id;

    // Farm updates
    const farmSubscription = supabase
      .channel('land_farms')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'farms',
        filter: `id=eq.${farmId}`
      }, (payload) => {
        console.log('Farm update:', payload);
        if (payload.eventType === 'UPDATE') {
          setLandData(prev => ({
            ...prev,
            farm: payload.new as Farm
          }));
          toast.info('Farm information updated');
        }
      })
      .subscribe();

    // Crops updates
    const cropsSubscription = supabase
      .channel('land_crops')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'crops',
        filter: `farm_id=eq.${farmId}`
      }, (payload) => {
        console.log('Crops update:', payload);
        fetchLandData(false); // Refresh crops data
        
        if (payload.eventType === 'INSERT') {
          toast.success(`New crop "${payload.new.crop_type}" added`);
        } else if (payload.eventType === 'UPDATE') {
          toast.info(`Crop "${payload.new.crop_type}" updated`);
        }
      })
      .subscribe();

    // Activities updates
    const activitiesSubscription = supabase
      .channel('land_activities')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'farm_activities',
        filter: `farm_id=eq.${farmId}`
      }, (payload) => {
        console.log('Activity update:', payload);
        fetchLandData(false); // Refresh activities data
        
        if (payload.eventType === 'INSERT') {
          toast.success(`New activity "${payload.new.activity_type}" recorded`);
        }
      })
      .subscribe();

    subscriptionsRef.current = [farmSubscription, cropsSubscription, activitiesSubscription];
  }, [user, landData.farm, fetchLandData]);

  // Initial data fetch
  useEffect(() => {
    fetchLandData();
  }, [fetchLandData]);

  // Setup subscriptions when farm is loaded
  useEffect(() => {
    if (landData.farm) {
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
    };
  }, [landData.farm, setupRealtimeSubscriptions]);

  const handleRefresh = () => {
    fetchLandData(true);
  };

  // Calculate practices from farm data
  const practices = landData.farm?.practices || [];
  const practicesList = practices.map((practice, index) => ({
    name: practice,
    area: (landData.totalArea / Math.max(practices.length, 1)).toFixed(1),
    status: index % 2 === 0 ? 'Active' : 'Pending',
    co2: (Math.random() * 5 + 1).toFixed(1)
  }));

  // Calculate soil data (mock for now, can be extended with real soil data table)
  const soilData = {
    soc: 2.1,
    bulkDensity: 1.3,
    ph: 6.5,
    history: [
      { date: "2024-01-10", soc: 2.0, ph: 6.4 },
      { date: "2023-01-10", soc: 1.9, ph: 6.3 },
    ],
    nextSampling: "2025-03-15",
    points: 12,
    depths: ["0-15", "15-30", "30-45"],
  };

  // Calculate carbon data
  const carbonData = {
    current: landData.totalArea * 2.2, // Rough calculation
    target: landData.totalArea * 3.0,
    byPractice: practicesList.map(p => ({
      name: p.name,
      value: parseFloat(p.co2) * parseFloat(p.area)
    })),
    confidence: 0.92,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-80 shadow-xl border-0 bg-card/50 backdrop-blur-sm">
            <div className="p-8 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Loading Land Data</h3>
              <p className="text-muted-foreground text-sm">Fetching your farm information...</p>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!landData.farm) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-96 shadow-xl border-0 bg-card/50 backdrop-blur-sm">
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🌾</div>
              <h3 className="text-lg font-semibold mb-2">No Farm Found</h3>
              <p className="text-muted-foreground text-sm mb-4">
                You need to create a farm first to view land details.
              </p>
              <Button onClick={() => window.history.back()}>
                Go Back to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
  <div className="w-full p-2 sm:p-6 space-y-4">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-card/80 backdrop-blur flex items-center justify-between py-2 px-2 border-b">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg">{landData.farm.name}</span>
            <Badge className={`${statusColor[landData.farm.status] || statusColor.Active}`}>
              {landData.farm.status}
            </Badge>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.history.back()}>
              Back
            </Button>
          </div>
        </div>

        {/* Card-based quick summary */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          <Card className="flex flex-col items-center p-4">
            <div className="text-xs text-muted-foreground">Total Area</div>
            <div className="font-bold text-xl">{landData.totalArea} ha</div>
          </Card>
          <Card className="flex flex-col items-center p-4">
            <div className="text-xs text-muted-foreground">Location</div>
            <div className="font-bold text-sm">
              {landData.farm.latitude && landData.farm.longitude 
                ? `${landData.farm.latitude.toFixed(5)}, ${landData.farm.longitude.toFixed(5)}`
                : landData.farm.location
              }
            </div>
          </Card>
          <Card className="flex flex-col items-center p-4">
            <div className="text-xs text-muted-foreground">Crops</div>
            <div className="font-bold text-xl">{landData.totalCrops}</div>
          </Card>
        </div>

        {/* Tab Navigation - Enhanced Visibility & Distribution */}
        <div className="w-full flex justify-center my-2">
          <Tabs value={tab} onValueChange={setTab} className="w-full max-w-2xl">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-muted/40 rounded-lg p-1 shadow-md">
              <TabsTrigger value="overview" className="font-semibold text-base py-3 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Overview</TabsTrigger>
              <TabsTrigger value="practices" className="font-semibold text-base py-3 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Practices</TabsTrigger>
              <TabsTrigger value="data" className="font-semibold text-base py-3 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Soil & Carbon</TabsTrigger>
              <TabsTrigger value="map" className="font-semibold text-base py-3 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Map</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Content */}
        {tab === "overview" && (
          <div className="space-y-4">
            {/* Farm Overview Section */}
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="font-semibold text-lg">{landData.farm.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Established: {new Date(landData.farm.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Location: {landData.farm.location}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">Farm ID:</span>
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {landData.farm.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary">
                  Area: {landData.totalArea} ha
                </Badge>
                <Badge variant="secondary">
                  Crops: {landData.totalCrops}
                </Badge>
                {landData.farm.soil_type && (
                  <Badge variant="outline">Soil: {landData.farm.soil_type}</Badge>
                )}
                {landData.farm.climate_zone && (
                  <Badge variant="outline">Climate: {landData.farm.climate_zone}</Badge>
                )}
              </div>
              {landData.farm.description && (
                <div className="mt-4">
                  <div className="text-sm font-medium">Description</div>
                  <p className="text-sm text-muted-foreground mt-1">{landData.farm.description}</p>
                </div>
              )}
            
              {landData.activities.length > 0 ? (
                <div className="space-y-3">
                  {landData.activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <div className="font-medium">{activity.title}</div>
                        <div className="text-sm text-muted-foreground">{activity.activity_type}</div>
                        {activity.description && (
                          <div className="text-xs text-muted-foreground mt-1">{activity.description}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {new Date(activity.activity_date).toLocaleDateString()}
                        </div>
                        {activity.duration_hours && (
                          <div className="text-xs text-muted-foreground">
                            {activity.duration_hours}h
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-2">📝</div>
                  <p>No recent activities recorded</p>
                </div>
              )}
            </Card>

            {/* Current Crops */}
            <Card className="p-6">
              <div className="font-semibold mb-4">Current Crops ({landData.totalCrops})</div>
              {landData.crops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {landData.crops.map((crop) => (
                    <div key={crop.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{crop.crop_type}</div>
                          {crop.variety && (
                            <div className="text-sm text-muted-foreground">{crop.variety}</div>
                          )}
                        </div>
                        <Badge variant={crop.health_status === 'healthy' ? 'default' : 'secondary'}>
                          {crop.health_status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Area: {crop.planted_area_hectares} ha</div>
                        <div>Planted: {new Date(crop.planting_date).toLocaleDateString()}</div>
                        <div>Stage: {crop.current_stage}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-2">🌱</div>
                  <p>No crops planted yet</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {tab === "practices" && (
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold">Farm Practices</div>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Practice
                </Button>
              </div>
              {practicesList.length > 0 ? (
                <div className="space-y-3">
                  {practicesList.map((practice, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{practice.name}</span>
                        <Badge className={statusColor[practice.status] || "bg-muted text-muted-foreground"}>
                          {practice.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2 sm:mt-0">
                        Area: {practice.area} ha | CO₂: {practice.co2} t/ha/yr
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-2">🔄</div>
                  <p>No farming practices recorded</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {tab === "data" && (
          <div className="space-y-4">
            {/* Soil Monitoring Dashboard */}
            <Card className="p-6">
              <div className="font-semibold mb-4">Soil Monitoring</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="font-bold text-lg">{soilData.soc}%</div>
                  <div className="text-muted-foreground">SOC</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="font-bold text-lg">{soilData.bulkDensity}</div>
                  <div className="text-muted-foreground">Bulk Density</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="font-bold text-lg">{soilData.ph}</div>
                  <div className="text-muted-foreground">pH</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="font-bold text-lg">{soilData.points}</div>
                  <div className="text-muted-foreground">Sample Points</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm font-medium">Next Sampling: {soilData.nextSampling}</div>
                <div className="text-sm text-muted-foreground">
                  Depths: {soilData.depths.join(", ")} cm
                </div>
              </div>
            </Card>

            {/* Carbon Performance Metrics */}
            <Card className="p-6">
              <div className="font-semibold mb-4">Carbon Sequestration Progress</div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{carbonData.current.toFixed(1)} / {carbonData.target.toFixed(1)} t CO₂e</span>
                  </div>
                  <Progress value={(carbonData.current / carbonData.target) * 100} className="h-3" />
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">By Practice:</div>
                  <div className="space-y-2">
                    {carbonData.byPractice.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span>{item.value.toFixed(1)} t</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Confidence Score: </span>
                  <span className="text-green-600">{(carbonData.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {tab === "map" && (
          <div className="space-y-4">
            <Card className="p-6 text-center">
              <div className="font-semibold mb-4">Farm Map & Remote Sensing</div>
              <div className="w-full h-64 bg-muted/30 rounded-lg flex items-center justify-center text-muted-foreground mb-4">
                <div>
                  <div className="text-4xl mb-2">🗺️</div>
                  <p>Interactive map coming soon</p>
                  <p className="text-sm">Satellite imagery and boundary tools</p>
                </div>
              </div>
              <div className="flex justify-center gap-2">
                <Button variant="outline" size="sm">Edit Boundaries</Button>
                <Button variant="outline" size="sm">View Satellite</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
