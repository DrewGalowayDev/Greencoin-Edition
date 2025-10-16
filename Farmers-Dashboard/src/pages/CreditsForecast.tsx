import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  DollarSign, 
  Globe, 
  Users, 
  BarChart3, 
  Leaf,
  Target,
  ArrowUp,
  ArrowDown,
  MapPin,
  Calendar,
  Zap,
  Award,
  Activity,
  Sparkles,
  TreePine,
  Droplets,
  Sun
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock real-time data - In production, this would come from actual APIs
const generateRealTimeData = () => ({
  currentPrice: 28.89 + (Math.random() - 0.5) * 2,
  priceChange24h: (Math.random() - 0.5) * 10,
  totalCreditsIssued: 2847293 + Math.floor(Math.random() * 1000),
  activeProjects: 1247 + Math.floor(Math.random() * 10),
  marketCap: 82.3 + (Math.random() - 0.5) * 5
});

const priceHistory = [
  { date: '2023', price: 15.20, volume: 45000, demand: 35000 },
  { date: '2024', price: 22.50, volume: 89000, demand: 85000 },
  { date: '2025', price: 28.89, volume: 156000, demand: 180000 },
  { date: '2026', price: 42.50, volume: 285000, demand: 350000 },
  { date: '2027', price: 58.75, volume: 420000, demand: 580000 },
  { date: '2028', price: 76.20, volume: 650000, demand: 850000 },
  { date: '2030', price: 125.00, volume: 1200000, demand: 1800000 },
];

const regionalData = [
  { region: 'Kenya', credits: 45234, farmers: 1247, avgPrice: 29.75, growth: 11.2 },
  { region: 'Uganda', credits: 32156, farmers: 856, avgPrice: 27.85, growth: 15.8 },
  { region: 'Tanzania', credits: 28945, farmers: 742, avgPrice: 31.25, growth: 18.3 },
  { region: 'Ghana', credits: 19876, farmers: 534, avgPrice: 26.50, growth: 22.1 },
  { region: 'Nigeria', credits: 15678, farmers: 423, avgPrice: 24.75, growth: 28.5 },
];

const methodologyData = [
  { name: 'Agroforestry', value: 35, price: 32.45, color: '#10B981' },
  { name: 'No-Till', value: 25, price: 28.12, color: '#3B82F6' },
  { name: 'Cover Cropping', value: 20, price: 25.80, color: '#8B5CF6' },
  { name: 'Composting', value: 12, price: 22.50, color: '#F59E0B' },
  { name: 'Other', value: 8, price: 30.00, color: '#EF4444' },
];

const newsData = [
  {
    title: "Africa Carbon Markets Hit Record High",
    summary: "Continental carbon credit supply reaches 2.2M tonnes with average price of $28.89",
    impact: "positive",
    date: "2 hours ago",
    source: "Carbon Pulse"
  },
  {
    title: "New ACMI Partnership Announced",
    summary: "Africa Carbon Markets Initiative expands with $500M funding commitment",
    impact: "positive", 
    date: "1 day ago",
    source: "Reuters"
  },
  {
    title: "VCS Methodology Update",
    summary: "Enhanced verification standards for smallholder agriculture projects",
    impact: "neutral",
    date: "2 days ago",
    source: "Verra"
  }
];

const DashboardLayout = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
    {children}
  </div>
);

export default function CreditsForecast() {
  const [realTimeData, setRealTimeData] = useState(generateRealTimeData());
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1y');
  const [farmSize, setFarmSize] = useState(5);
  const [practices, setPractices] = useState(['agroforestry']);
  
  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(generateRealTimeData());
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const calculatePotential = () => {
    const baseRate = practices.includes('agroforestry') ? 4.5 : 
                     practices.includes('no-till') ? 2.2 : 1.8;
    const credits = farmSize * baseRate;
    const revenue = credits * realTimeData.currentPrice;
    return { credits: credits.toFixed(1), revenue: Math.round(revenue) };
  };

  const potential = calculatePotential();

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                Carbon Market Forecast
              </h1>
              <p className="text-xl text-emerald-100 mb-6">
                Real-time insights into Africa's carbon credit ecosystem
              </p>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-emerald-300" />
                  <div>
                    <span className="text-2xl font-bold">${realTimeData.currentPrice.toFixed(2)}</span>
                    <span className="text-sm text-emerald-200 ml-2">per credit</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-emerald-300" />
                  <div>
                    <span className="text-2xl font-bold">+{realTimeData.priceChange24h.toFixed(1)}%</span>
                    <span className="text-sm text-emerald-200 ml-2">24h change</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-6 h-6 text-emerald-300" />
                  <div>
                    <span className="text-2xl font-bold">{realTimeData.activeProjects.toLocaleString()}</span>
                    <span className="text-sm text-emerald-200 ml-2">active projects</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:flex justify-center items-center">
              <div className="relative">
                <div className="w-64 h-64 rounded-full bg-gradient-to-r from-emerald-400/30 to-blue-400/30 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-r from-emerald-300/40 to-blue-300/40 flex items-center justify-center">
                    <img
                      src="https://drewgalowaydev.github.io/carbondocs/logo.png"
                      alt="Greencoin Logo"
                      className="w-34 h-34 animate-pulse"
                      style={{ filter: 'drop-shadow(0 2px 8px rgba(44, 133, 103, 0.25))' }}
                    />
                  </div>
                </div>
                <div className="absolute -top-4 -right-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700">Market Cap</p>
                  <p className="text-3xl font-bold text-emerald-900">${realTimeData.marketCap.toFixed(1)}B</p>
                  <p className="text-sm text-emerald-600 flex items-center gap-1 mt-1">
                    <ArrowUp className="w-3 h-3" /> +15.2% this month
                  </p>
                </div>
                <div className="p-3 bg-emerald-200 rounded-full">
                  <BarChart3 className="w-6 h-6 text-emerald-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Credits</p>
                  <p className="text-3xl font-bold text-blue-900">{(realTimeData.totalCreditsIssued / 1000000).toFixed(1)}M</p>
                  <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                    <ArrowUp className="w-3 h-3" /> +8.3% this week
                  </p>
                </div>
                <div className="p-3 bg-blue-200 rounded-full">
                  <Award className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Active Farmers</p>
                  <p className="text-3xl font-bold text-purple-900">{realTimeData.activeProjects.toLocaleString()}</p>
                  <p className="text-sm text-purple-600 flex items-center gap-1 mt-1">
                    <ArrowUp className="w-3 h-3" /> +12.7% this quarter
                  </p>
                </div>
                <div className="p-3 bg-purple-200 rounded-full">
                  <Users className="w-6 h-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Avg. Revenue/Ha</p>
                  <p className="text-3xl font-bold text-orange-900">$1,247</p>
                  <p className="text-sm text-orange-600 flex items-center gap-1 mt-1">
                    <ArrowUp className="w-3 h-3" /> +18.5% vs last year
                  </p>
                </div>
                <div className="p-3 bg-orange-200 rounded-full">
                  <Target className="w-6 h-6 text-orange-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="forecast" className="space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <TabsList className="bg-white/80 backdrop-blur-sm border shadow-lg">
              <TabsTrigger value="forecast" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                Price Forecast
              </TabsTrigger>
              <TabsTrigger value="regional" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                Regional Analysis  
              </TabsTrigger>
              <TabsTrigger value="calculator" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                Revenue Calculator
              </TabsTrigger>
              <TabsTrigger value="news" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                Market News
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-32 bg-white/80 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 Month</SelectItem>
                  <SelectItem value="3m">3 Months</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                  <SelectItem value="5y">5 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Forecast Tab */}
          <TabsContent value="forecast" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Carbon Credit Price Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={priceHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#059669' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Key Predictions:</strong>
                    </p>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Removal market projected to reach USD 4-11 billion by 2030</li>
                      <li>• Compliance market set to reach USD 458 billion by 2034</li>
                      <li>• Global market growth rate of 37.68% between 2025-2034</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Supply vs Demand Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={priceHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="volume" 
                        stackId="1"
                        stroke="#3b82f6" 
                        fill="#3b82f6"
                        fillOpacity={0.6}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="demand" 
                        stackId="2"
                        stroke="#ef4444" 
                        fill="#ef4444"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-sm text-gray-600">Supply</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span className="text-sm text-gray-600">Demand</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Methodology Breakdown */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  Market Share by Methodology
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={methodologyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                        labelLine={false}
                      >
                        {methodologyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-4">
                    {methodologyData.map((method, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: method.color }}></div>
                          <span className="font-medium">{method.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">${method.price}</div>
                          <div className="text-sm text-gray-600">{method.value}% share</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Regional Analysis Tab */}
          <TabsContent value="regional" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  Regional Performance Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={regionalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="region" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }} 
                      />
                      <Bar dataKey="credits" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Regional Insights</h4>
                    {regionalData.map((region, index) => (
                      <div key={index} className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-purple-900">{region.region}</h5>
                          <span className="text-sm bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                            +{region.growth}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Credits:</span>
                            <br />
                            <span className="font-bold text-purple-900">{region.credits.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Farmers:</span>
                            <br />
                            <span className="font-bold text-purple-900">{region.farmers.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="text-gray-600 text-sm">Avg. Price: </span>
                          <span className="font-bold text-green-600">${region.avgPrice}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                  <h4 className="font-semibold text-emerald-900 mb-2">Key Regional Trends</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-emerald-800">
                    <div>
                      • Africa has utilized only 2% of its vast nature-based solution potential
                      <br />
                      • Africa Carbon Market forecasted to grow at 26.25% CAGR from 2024-2033
                    </div>
                    <div>
                      • Target: 20 million tonnes CO2 emissions reduction by 2025
                      <br />
                      • Climate finance needs: $2.5-2.8 trillion by 2030
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    Revenue Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Farm Size (hectares)</label>
                    <Input
                      type="number"
                      min="0.5"
                      max="1000"
                      value={farmSize}
                      onChange={(e) => setFarmSize(Number(e.target.value))}
                      className="bg-white/80"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Climate-Smart Practices</label>
                    <div className="space-y-2">
                      {[
                        { id: 'agroforestry', label: 'Agroforestry (4.5 tons CO₂/ha/yr)', icon: TreePine },
                        { id: 'no-till', label: 'No-Till Farming (2.2 tons CO₂/ha/yr)', icon: Leaf },
                        { id: 'cover-crop', label: 'Cover Cropping (1.8 tons CO₂/ha/yr)', icon: Sun },
                        { id: 'composting', label: 'Composting (1.2 tons CO₂/ha/yr)', icon: Droplets },
                      ].map((practice) => (
                        <label key={practice.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={practices.includes(practice.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPractices([...practices, practice.id]);
                              } else {
                                setPractices(practices.filter(p => p !== practice.id));
                              }
                            }}
                            className="w-4 h-4 text-emerald-600"
                          />
                          <practice.icon className="w-5 h-5 text-emerald-600" />
                          <span className="text-sm">{practice.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 border-emerald-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-900">
                    <DollarSign className="w-5 h-5" />
                    Estimated Returns
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-emerald-600 mb-2">
                      {potential.credits} tons CO₂e
                    </div>
                    <div className="text-sm text-emerald-700 mb-4">Annual carbon sequestration</div>
                    
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      ${potential.revenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-700">Annual revenue potential</div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-white/80 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Revenue Range</span>
                        <span className="text-sm text-gray-600">Based on current market</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-green-600">
                          ${Math.round(potential.revenue * 0.8).toLocaleString()}
                        </span>
                        <span className="text-gray-400">-</span>
                        <span className="text-lg font-bold text-green-600">
                          ${Math.round(potential.revenue * 1.3).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-white/80 rounded-lg">
                      <h4 className="font-medium mb-2 text-gray-900">Timeline to Payment</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Registration & Baseline</span>
                          <span className="font-medium">2-3 weeks</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Implementation</span>
                          <span className="font-medium">1-6 months</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Verification & Payment</span>
                          <span className="font-medium">4-8 weeks</span>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-medium py-3">
                      Start Your Carbon Journey
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Success Stories */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Farmer Success Stories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      name: "Jane Wanjiku",
                      location: "Kiambu, Kenya",
                      practices: "Agroforestry, Cover cropping",
                      income: "+42%",
                      credits: "18.5 tons CO₂e/year",
                      quote: "The carbon program transformed my farm. My soil is healthier and crops more resilient."
                    },
                    {
                      name: "Samuel Okello", 
                      location: "Bugiri, Uganda",
                      practices: "No-till, Composting",
                      income: "+35%",
                      credits: "12.3 tons CO₂e/year",
                      quote: "Carbon credits provide stable additional income while improving my land."
                    },
                    {
                      name: "Grace Mwangi",
                      location: "Meru, Kenya", 
                      practices: "Agroforestry, Rotational grazing",
                      income: "+58%",
                      credits: "24.7 tons CO₂e/year",
                      quote: "First woman in my area to earn over $2,000 from carbon credits annually."
                    }
                  ].map((story, index) => (
                    <div key={index} className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-blue-50 border border-green-200">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{story.name}</h4>
                          <p className="text-sm text-gray-600">{story.location}</p>
                        </div>
                      </div>
                      
                      <blockquote className="text-sm italic text-gray-700 mb-4">
                        "{story.quote}"
                      </blockquote>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Income Increase:</span>
                          <span className="font-bold text-green-600">{story.income}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Annual Credits:</span>
                          <span className="font-bold text-blue-600">{story.credits}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Practices: {story.practices}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market News Tab */}
          <TabsContent value="news" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    Latest Market News
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {newsData.map((news, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                      news.impact === 'positive' ? 'border-green-400 bg-green-50' :
                      news.impact === 'negative' ? 'border-red-400 bg-red-50' :
                      'border-blue-400 bg-blue-50'
                    }`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{news.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{news.summary}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{news.date}</span>
                            <span>•</span>
                            <span>{news.source}</span>
                          </div>
                        </div>
                        <div className={`p-2 rounded-full ${
                          news.impact === 'positive' ? 'bg-green-200' :
                          news.impact === 'negative' ? 'bg-red-200' :
                          'bg-blue-200'
                        }`}>
                          {news.impact === 'positive' ? (
                            <ArrowUp className="w-4 h-4 text-green-600" />
                          ) : news.impact === 'negative' ? (
                            <ArrowDown className="w-4 h-4 text-red-600" />
                          ) : (
                            <Activity className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2">Market Intelligence</h4>
                    <div className="space-y-2 text-sm text-purple-800">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>African carbon markets expected to grow 26.25% annually through 2033</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span>Africa represents 25% of global nature-based solution potential</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        <span>Price premium for high-quality, co-benefit rich credits increasing</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Market Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                      <h4 className="font-semibold text-emerald-900 mb-2">High-Demand Sectors</h4>
                      <div className="space-y-2">
                        {[
                          { sector: "Technology", demand: 32.1, growth: "+45%" },
                          { sector: "Aviation", demand: 18.5, growth: "+67%" },
                          { sector: "Manufacturing", demand: 24.8, growth: "+23%" },
                          { sector: "Energy", demand: 14.2, growth: "+38%" }
                        ].map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm font-medium">{item.sector}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{item.demand}%</span>
                              <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full">
                                {item.growth}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Premium Opportunities</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Biodiversity co-benefits: +15-25% price premium</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Gender-inclusive projects: +10-20% premium</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Community development: +12-18% premium</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span>Technology-verified projects: +8-15% premium</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                    Explore Premium Opportunities
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom Support Section */}
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-2">Need Support?</h3>
                <p className="text-gray-300 mb-4">
                  Our 24/7 farmer support team is here to help you maximize your carbon potential.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span>WhatsApp: +254-700-227266</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                    <span>SMS: Text "HELP" to 29429</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                    <span>Email: support@carbonplatform.io</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-10 h-10 text-white" />
                </div>
                <h4 className="font-bold text-lg">Real-time Updates</h4>
                <p className="text-gray-300 text-sm">
                  Data refreshes every 30 seconds
                </p>
              </div>
              
              <div className="text-right">
                <Button className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-medium px-8 py-3">
                  Get Started Today
                </Button>
                <p className="text-gray-400 text-xs mt-2">
                  Join 5,000+ farmers already earning from carbon
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}