import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Calculator, 
  TrendingUp, 
  Leaf, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  BarChart3,
  Coins,
  TreePine,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  RefreshCw,
  Download,
  Share2,
  Bell,
  Settings,
  Loader2,
  Users,
  Award
} from "lucide-react";

interface Credit {
  id: string;
  farm_id: string;
  co2_tons: number;
  greencoins: number;
  estimated_value: number;
  verification_status: string;
  verification_body: string | null;
  verification_progress: number;
  pending_credits?: number;
  in_verification_credits?: number;
  market_price?: number;
  price_change?: number;
  methodology?: string;
  confidence_score?: number;
  next_verification_date?: string;
}

interface CreditTransaction {
  id: string;
  transaction_date: string;
  credits_amount: number;
  greencoins_amount: number;
  verifier: string;
  status: string;
  transaction_type?: string;
}

interface VerificationStep {
  id: string;
  step_name?: string;
  label?: string;
  completed: boolean;
  completion_date?: string;
  expected_date?: string;
  status?: string;
}

interface CarbonCalculation {
  farm_size: number;
  soil_type?: string;
  rainfall?: string;
  implementation_level?: string;
  soil_carbon?: number;
  biomass?: number;
  emissions?: number;
  total_credits?: number;
  confidence_score?: number;
}

interface CarbonPractice {
  practice_name: string;
  practice_type: string;
  implementation_level?: string;
}

interface MarketData {
  average_price: number;
  volume_24h: number;
  change_24h: number;
  top_buyers?: string[];
}

export default function Credits() {
  const [credits, setCredits] = useState<Credit | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([]);
  const [carbonCalculations, setCarbonCalculations] = useState<CarbonCalculation | null>(null);
  const [carbonPractices, setCarbonPractices] = useState<CarbonPractice[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [farmId, setFarmId] = useState<string | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) setRefreshing(true);
      else setLoading(true);

      let currentFarmId = farmId;
      if (!currentFarmId) {
        const { data: farmsData, error: farmError } = await supabase
          .from('farms')
          .select('id')
          .limit(1)
          .maybeSingle();
        if (farmError) throw farmError;
        if (!farmsData) {
          toast({ title: "No farm found", description: "Create a farm first to track credits.", variant: "destructive" });
          setLoading(false);
          return;
        }
        currentFarmId = farmsData.id;
        setFarmId(currentFarmId);
      }

      // Fetch credits data
      const { data: creditsData, error: creditsError } = await supabase
        .from('credits')
        .select('*')
        .eq('farm_id', currentFarmId)
        .maybeSingle();
      if (creditsError) throw creditsError;
      if (creditsData) setCredits(creditsData);

      // Fetch transactions
      const { data: transactionsData, error: txError } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('farm_id', currentFarmId)
        .order('transaction_date', { ascending: false });
      if (txError) throw txError;
      if (transactionsData) setTransactions(transactionsData);

      // Fetch verification steps (use existing structure)
      const { data: stepsData, error: stepsError } = await supabase
        .from('verification_steps')
        .select('*')
        .eq('farm_id', currentFarmId);
      if (stepsError) throw stepsError;
      if (stepsData && stepsData.length > 0) {
        const formattedSteps = stepsData.map(step => ({
          id: step.id,
          label: step.label,
          completed: step.status === 'completed',
          status: step.status
        }));
        setVerificationSteps(formattedSteps);
      } else {
        // Default steps if none exist
        setVerificationSteps([
          { id: '1', label: 'QA/QC', completed: true, status: 'completed' },
          { id: '2', label: 'Field Check', completed: true, status: 'completed' },
          { id: '3', label: 'Satellite', completed: true, status: 'completed' },
          { id: '4', label: 'Lab Analysis', completed: false, status: 'pending' },
          { id: '5', label: 'Final Audit', completed: false, status: 'pending' },
        ]);
      }

      // Set default market data since table doesn't exist yet
      setMarketData({
        average_price: 28.89,
        volume_24h: 2847.25,
        change_24h: 3.2,
        top_buyers: ['GreenTech Solutions', 'EcoCorpAfrica', 'CarbonNeutral Ltd']
      });

      // Set default carbon calculations since table doesn't exist yet
      setCarbonCalculations({
        farm_size: 5.5,
        soil_type: 'Clay loam',
        rainfall: '1200mm/year',
        implementation_level: 'High',
        soil_carbon: 8.2,
        biomass: 4.1,
        emissions: 4.7,
        total_credits: 17.0,
        confidence_score: 85
      });

      // Set default practices since table doesn't exist yet
      setCarbonPractices([
        { practice_name: 'No-Till Farming', practice_type: 'no-till', implementation_level: 'High' },
        { practice_name: 'Agroforestry', practice_type: 'agroforestry', implementation_level: 'Medium' },
      ]);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: "Error", description: "Failed to load credits data", variant: "destructive" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Realtime updates
  useEffect(() => {
    if (!farmId) return;
    const channel = supabase
      .channel('credits_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'credits', filter: `farm_id=eq.${farmId}` }, () => {
        fetchData(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'credit_transactions', filter: `farm_id=eq.${farmId}` }, () => {
        fetchData(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'verification_steps', filter: `farm_id=eq.${farmId}` }, () => {
        fetchData(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [farmId]);

  const verificationProgress = verificationSteps.length > 0 
    ? (verificationSteps.filter(s => s.completed || s.status === 'completed').length / verificationSteps.length) * 100 
    : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading credits data...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color = "blue" }) => (
    <Card className="p-6 transition-all duration-300 hover:shadow-lg border-l-4 border-l-primary">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
          </div>
          <div className="text-2xl font-bold mb-1">{value}</div>
          {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
        </div>
        {trend !== undefined && trend !== null && (
          <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </Card>
  );

  const VerificationTimeline = () => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Verification Progress</h3>
        <Badge variant="outline">
          {Math.round(verificationProgress)}% Complete
        </Badge>
      </div>
      
      <Progress value={verificationProgress} className="mb-6 h-3" />
      
      <div className="space-y-4">
        {verificationSteps.map((step, index) => (
          <div key={step.id || index} className="flex items-center gap-4">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              step.completed || step.status === 'completed' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              {step.completed || step.status === 'completed' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <Clock className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium">{step.step_name || step.label}</div>
              <div className="text-sm text-muted-foreground">
                {step.completed || step.status === 'completed'
                  ? `Completed ${step.completion_date || ''}`
                  : `Expected ${step.expected_date || 'TBD'}`
                }
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4 text-blue-600" />
          <span className="font-medium">
            Verified by: {credits?.verification_body || 'SCS Global Services'}
          </span>
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          Confidence Score: {Math.round((credits?.confidence_score || 0.87) * 100)}%
        </div>
      </div>
    </Card>
  );

  const CarbonCalculator = () => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Carbon Calculator
        </h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
        >
          {isCalculatorOpen ? "Hide Details" : "Show Calculator"}
        </Button>
      </div>

      {isCalculatorOpen && carbonCalculations ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Current Farm Data</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Farm Size:</span>
                  <span className="font-medium">{carbonCalculations.farm_size} ha</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Practices:</span>
                  <span className="font-medium">{carbonPractices.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Implementation:</span>
                  <span className="font-medium">{carbonCalculations.implementation_level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Soil Type:</span>
                  <span className="font-medium">{carbonCalculations.soil_type}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Estimated Results</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Soil Carbon:</span>
                  <span className="font-medium">{carbonCalculations.soil_carbon} t CO₂e</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Biomass:</span>
                  <span className="font-medium">{carbonCalculations.biomass} t CO₂e</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avoided Emissions:</span>
                  <span className="font-medium">{carbonCalculations.emissions} t CO₂e</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Total Credits:</span>
                  <span className="font-bold text-green-600">{carbonCalculations.total_credits} t CO₂e</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-green-800">Calculation Confidence</span>
              <span className="text-green-600 font-bold">{carbonCalculations.confidence_score}%</span>
            </div>
            <Progress value={carbonCalculations.confidence_score} className="h-2" />
            <p className="text-xs text-green-700 mt-2">
              Based on CarbonDocs methodology with satellite verification
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button size="sm" className="flex-1">
              <Target className="h-4 w-4 mr-2" />
              Update Calculation
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{carbonCalculations?.farm_size || 5.5}</div>
            <div className="text-sm text-muted-foreground">Farm Size (ha)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{carbonPractices.length}</div>
            <div className="text-sm text-muted-foreground">Practices</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{carbonCalculations?.total_credits || credits?.co2_tons || 0}</div>
            <div className="text-sm text-muted-foreground">Est. Credits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{Math.round((carbonCalculations?.confidence_score || 87))}%</div>
            <div className="text-sm text-muted-foreground">Confidence</div>
          </div>
        </div>
      )}
    </Card>
  );

  const TransactionHistory = () => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {transactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Date</th>
                <th className="text-left py-3">Type</th>
                <th className="text-left py-3">Credits</th>
                <th className="text-left py-3">Value</th>
                <th className="text-left py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-3">{tx.transaction_date}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>{tx.transaction_type || 'Credit Transaction'}</span>
                    </div>
                  </td>
                  <td className="py-3 font-medium">{tx.credits_amount} t CO₂e</td>
                  <td className="py-3 font-medium text-green-600">${(tx.credits_amount * (marketData?.average_price || 28.89)).toFixed(2)}</td>
                  <td className="py-3">
                    <Badge variant={tx.status === "completed" ? "default" : "secondary"}>
                      {tx.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-8">
          No transactions found. Credits will appear here once verification is complete.
        </div>
      )}
    </Card>
  );

  const MarketplaceSection = () => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Marketplace & Earnings
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Market Trends
          </Button>
          <Button size="sm">
            <DollarSign className="h-4 w-4 mr-2" />
            Sell Credits
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">${marketData?.average_price || 0}</div>
          <div className="text-sm text-muted-foreground">Market Price/Credit</div>
          <div className="text-xs text-green-600 mt-1 flex items-center justify-center gap-1">
            <ArrowUpRight className="h-3 w-3" />
            +{marketData?.change_24h || 0}% 24h
          </div>
        </div>
        
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{marketData?.volume_24h || 0}</div>
          <div className="text-sm text-muted-foreground">24h Volume</div>
          <div className="text-xs text-muted-foreground mt-1">Credits Traded</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">${credits?.estimated_value || 0}</div>
          <div className="text-sm text-muted-foreground">Portfolio Value</div>
          <div className="text-xs text-purple-600 mt-1">Your Credits</div>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
        <h4 className="font-medium mb-2">Ready to Sell?</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Your {credits?.co2_tons || 0} verified credits are ready for marketplace listing. 
          Current estimated value: ${credits?.estimated_value || 0}
        </p>
        <div className="flex gap-2">
          <Button size="sm">
            List for Sale
          </Button>
          <Button variant="outline" size="sm">
            Set Price Alert
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Leaf className="h-6 w-6 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold">Carbon Credits</h1>
              <p className="text-muted-foreground">Track and manage your carbon sequestration</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => fetchData(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Coins}
            title="Credits Earned"
            value={`${credits?.co2_tons || 0} t CO₂e`}
            subtitle={`= ${credits?.greencoins || 0} Greencoins`}
            trend={credits?.price_change}
          />
          <StatCard
            icon={Clock}
            title="In Verification"
            value={`${credits?.in_verification_credits || 0} t CO₂e`}
            subtitle={`Expected: ${credits?.next_verification_date || 'TBD'}`}
            trend={null}
            color="orange"
          />
          <StatCard
            icon={DollarSign}
            title="Portfolio Value"
            value={`$${credits?.estimated_value || 0}`}
            subtitle={`$${marketData?.average_price || 0}/credit`}
            trend={marketData?.change_24h}
            color="green"
          />
          <StatCard
            icon={TrendingUp}
            title="Total Credits"
            value={`${((credits?.co2_tons || 0) + (credits?.pending_credits || 0) + (credits?.in_verification_credits || 0)).toFixed(1)} t CO₂e`}
            subtitle="Total carbon sequestration"
            trend={22.8}
            color="purple"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <VerificationTimeline />
            <CarbonCalculator />
          </div>
          
          <div className="space-y-6">
            <MarketplaceSection />
            <TransactionHistory />
          </div>
        </div>

        {/* Educational Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50">
            <div className="flex items-center gap-3 mb-4">
              <TreePine className="h-6 w-6 text-green-600" />
              <h3 className="font-semibold">Practice Library</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Explore climate-smart practices to maximize your carbon sequestration potential.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Browse Practices
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-6 w-6 text-purple-600" />
              <h3 className="font-semibold">Farmer Network</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with other farmers, share experiences, and learn best practices.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Join Community
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50">
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-6 w-6 text-orange-600" />
              <h3 className="font-semibold">Training Hub</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Access tutorials, webinars, and certification programs to enhance your skills.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Start Learning
            </Button>
          </Card>
        </div>

        {/* Action Bar */}
        <Card className="p-6 bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Ready to Scale Your Impact?</h3>
              <p className="text-blue-100">
                Expand your practices, increase sequestration, and maximize earnings with our premium tools.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                <Calculator className="h-4 w-4 mr-2" />
                Advanced Calculator
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Target className="h-4 w-4 mr-2" />
                Set Goals
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}