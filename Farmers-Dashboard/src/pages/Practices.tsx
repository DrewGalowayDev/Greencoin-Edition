import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Leaf, Calendar, MapPin, Award, TrendingUp, Filter, Search, Download, Menu, X } from "lucide-react";

const PRACTICE_TYPES = [
  { value: "cover-cropping", label: "Cover Cropping", icon: "🌱", color: "emerald" },
  { value: "no-till", label: "No-Till/Reduced Tillage", icon: "🚜", color: "blue" },
  { value: "agroforestry", label: "Agroforestry", icon: "🌳", color: "green" },
  { value: "composting", label: "Composting", icon: "♻️", color: "amber" },
  { value: "crop-rotation", label: "Crop Rotation", icon: "🔄", color: "purple" },
];

const PRACTICE_COLORS = {
  "planned": "bg-slate-100 text-slate-700 border-slate-200",
  "active": "bg-blue-50 text-blue-700 border-blue-200",
  "verified": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "pending": "bg-amber-50 text-amber-700 border-amber-200",
  "rejected": "bg-red-50 text-red-700 border-red-200",
};

const initialPractices = [
  {
    id: "1",
    type: "no-till",
    area: 3.0,
    implementationDate: "2025-06-01",
    effectiveness: 0.9,
    co2eContribution: 1.2,
    status: "active",
    evidence: [
      { type: "photo", url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=64&h=64&fit=crop", timestamp: "2025-06-01" },
      { type: "gps-track", url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=64&h=64&fit=crop", timestamp: "2025-06-01" },
    ],
    verificationStatus: "pending",
    notes: "No-till started on main field with excellent soil moisture retention."
  },
  {
    id: "2",
    type: "agroforestry",
    area: 2.5,
    implementationDate: "2025-05-10",
    effectiveness: 0.8,
    co2eContribution: 6.0,
    status: "verified",
    evidence: [
      { type: "photo", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=64&h=64&fit=crop", timestamp: "2025-05-10" },
      { type: "gps-track", url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=64&h=64&fit=crop", timestamp: "2025-05-10" },
    ],
    verificationStatus: "verified",
    notes: "Trees established in boundary rows with 95% survival rate."
  },
  {
    id: "3",
    type: "cover-cropping",
    area: 5.5,
    implementationDate: "2025-04-15",
    effectiveness: 0.7,
    co2eContribution: 0.8,
    status: "active",
    evidence: [
      { type: "photo", url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=64&h=64&fit=crop", timestamp: "2025-04-15" }
    ],
    verificationStatus: "pending",
    notes: "Cover crops planted after maize harvest showing excellent growth."
  },
];

function getPracticeLabel(type) {
  return PRACTICE_TYPES.find(p => p.value === type)?.label || type;
}

function getPracticeIcon(type) {
  return PRACTICE_TYPES.find(p => p.value === type)?.icon || "🌱";
}

function getPracticeColor(type) {
  return PRACTICE_TYPES.find(p => p.value === type)?.color || "emerald";
}

export default function Practices() {
  const [practices, setPractices] = useState(initialPractices);
  const [showAdd, setShowAdd] = useState(false);
  const [showDetails, setShowDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [form, setForm] = useState({
    type: "cover-cropping",
    area: "",
    implementationDate: "",
    notes: "",
    evidence: [],
  });

  // Add new practice
  const handleAddPractice = (e) => {
    e.preventDefault();
    setPractices([
      ...practices,
      {
        id: Date.now().toString(),
        type: form.type,
        area: parseFloat(form.area),
        implementationDate: form.implementationDate,
        effectiveness: 0.7,
        co2eContribution: 1.0,
        status: "planned",
        evidence: form.evidence,
        verificationStatus: "pending",
        notes: form.notes,
      },
    ]);
    setForm({ type: "cover-cropping", area: "", implementationDate: "", notes: "", evidence: [] });
    setShowAdd(false);
  };

  // Filter practices
  const filteredPractices = practices.filter(p => {
    const matchesSearch = getPracticeLabel(p.type).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Metrics
  const totalPractices = practices.length;
  const totalArea = practices.reduce((a, p) => a + (p.area || 0), 0);
  const totalCO2e = practices.reduce((a, p) => a + (p.co2eContribution || 0), 0);
  const verifiedCount = practices.filter(p => p.verificationStatus === "verified").length;

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 dark:from-slate-900 dark:via-green-950 dark:to-emerald-950">
      {/* Header Section */}
  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-emerald-100 dark:border-emerald-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-100 p-2 rounded-xl">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Carbon Practices</h1>
                <p className="text-sm text-slate-600 dark:text-slate-300 hidden sm:block">Manage and track your sustainable farming practices</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => setShowAdd(true)} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 dark:bg-emerald-700 dark:hover:bg-emerald-800 hidden sm:flex"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Practice
              </Button>
              <Button 
                onClick={() => setShowAdd(true)} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 dark:bg-emerald-700 dark:hover:bg-emerald-800 p-2 sm:hidden"
                size="icon"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="p-2 sm:hidden"
                variant="outline"
                size="icon"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search practices..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 dark:bg-slate-900/80 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                className="w-full pl-10 pr-8 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 dark:bg-slate-900/80 dark:text-white appearance-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      )}

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metrics Cards */}
  {/* 2x2 grid for mobile, 4 in a row for large screens */}
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Primary Gradient Card */}
          <Card
            className="p-4 sm:p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-white"
            style={{ background: 'linear-gradient(135deg, #66c7ea 0%, #764ba2 100%)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Practices</p>
                <p className="text-2xl sm:text-3xl font-bold">{totalPractices}</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </Card>
          
          {/* Secondary Gradient Card */}
          <Card
            className="p-4 sm:p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-white"
            style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Area</p>
                <p className="text-2xl sm:text-3xl font-bold">{totalArea}<span className="text-sm sm:text-lg ml-1">ha</span></p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </Card>
          
          {/* Success Gradient Card */}
          <Card
            className="p-4 sm:p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-white"
            style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">CO₂e Impact</p>
                <p className="text-2xl sm:text-3xl font-bold">{totalCO2e}<span className="text-sm sm:text-lg ml-1">t/yr</span></p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </Card>
          
          {/* Info Gradient Card */}
          <Card
            className="p-4 sm:p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-white"
            style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Verified</p>
                <p className="text-2xl sm:text-3xl font-bold">{verifiedCount}</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search - Desktop */}
        <div className="hidden sm:block">
          <Card className="p-6 bg-white/70 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search practices..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 dark:bg-slate-900/80 dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    className="pl-10 pr-8 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 dark:bg-slate-900/80 dark:text-white appearance-none min-w-[150px]"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="planned">Planned</option>
                    <option value="active">Active</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </Card>
        </div>

        {/* Filters and Search - Mobile */}
        <div className="sm:hidden mb-4">
          <Card className="p-3 bg-white/70 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search practices..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 dark:bg-slate-900/80 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative min-w-[120px]">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  className="pl-10 pr-8 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 dark:bg-slate-900/80 dark:text-white appearance-none w-full"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 w-full">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </Card>
        </div>

        {/* Practices Table */}
        <Card className="bg-white/70 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80">
                <tr>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Practice</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden xs:table-cell">Area</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden sm:table-cell">Implementation</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden md:table-cell">CO₂e Impact</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden xs:table-cell">Evidence</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden sm:table-cell">Verification</th>
                  <th className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPractices.map((practice, index) => (
                  <tr key={practice.id} className="hover:bg-white/60 dark:hover:bg-slate-700/60 transition-colors duration-200">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getPracticeIcon(practice.type)}</div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{getPracticeLabel(practice.type)}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-300 truncate max-w-[120px] xs:max-w-[200px]">{practice.notes}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden xs:table-cell">
                      <div className="font-semibold text-slate-900 dark:text-white">{practice.area} ha</div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">Hectares</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                      <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-300">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{new Date(practice.implementationDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <Badge className={`${PRACTICE_COLORS[practice.status]} border font-medium text-xs`}>
                        {practice.status}
                      </Badge>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                      <div className="font-semibold text-emerald-600 dark:text-emerald-300">{practice.co2eContribution} t/yr</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Carbon offset</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden xs:table-cell">
                      <div className="flex space-x-2">
                        {practice.evidence.map((evidence, i) => (
                          <div key={i} className="relative group">
                            <img
                              src={evidence.url}
                              alt={evidence.type}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                              title={`${evidence.type} - ${evidence.timestamp}`}
                            />
                            <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
                          </div>
                        ))}
                        {practice.evidence.length === 0 && (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <span className="text-slate-400 dark:text-slate-500 text-xs">No evidence</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                      <Badge className={`${PRACTICE_COLORS[practice.verificationStatus]} border font-medium text-xs`}>
                        {practice.verificationStatus}
                      </Badge>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowDetails(practice)}
                        className="border-slate-200 text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden xs:inline ml-1">View</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredPractices.length === 0 && (
            <div className="text-center py-12">
              <Leaf className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">No practices found matching your criteria</p>
            </div>
          )}
        </Card>

        {/* Mobile Cards View (for small screens) */}
        <div className="sm:hidden grid grid-cols-1 gap-4">
          {filteredPractices.map((practice) => (
            <Card key={practice.id} className="p-4 bg-white/70 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg w-full">
              <div className="flex flex-col items-start mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="text-2xl">{getPracticeIcon(practice.type)}</div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{getPracticeLabel(practice.type)}</div>
                    <Badge className={`${PRACTICE_COLORS[practice.status]} border font-medium text-xs mt-1`}>
                      {practice.status}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm w-full mb-3">
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Area</div>
                    <div className="font-semibold text-slate-900 dark:text-white">{practice.area} ha</div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">CO₂e Impact</div>
                    <div className="font-semibold text-emerald-600 dark:text-emerald-300">{practice.co2eContribution} t/yr</div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Implementation</div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {new Date(practice.implementationDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Verification</div>
                    <Badge className={`${PRACTICE_COLORS[practice.verificationStatus]} border font-medium text-xs`}>
                      {practice.verificationStatus}
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300 truncate mb-3 w-full">
                  {practice.notes}
                </div>
                <div className="flex space-x-2 mb-3 w-full">
                  {practice.evidence.map((evidence, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={evidence.url}
                        alt={evidence.type}
                        className="w-8 h-8 rounded-lg object-cover shadow-md"
                      />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full border-2 border-white"></div>
                    </div>
                  ))}
                  {practice.evidence.length === 0 && (
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <span className="text-slate-400 dark:text-slate-500 text-xs">No evidence</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-center w-full">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDetails(practice)}
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 mx-auto"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Guidance Section */}
  <Card className="p-6 sm:p-8 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border-0 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="bg-emerald-100 p-3 rounded-full flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Maximize Your Carbon Impact</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">Follow our guided pathways to optimize your carbon credits and farm sustainability:</p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Start with <strong>Cover Cropping</strong> or <strong>No-Till</strong> for quick wins</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Progress to <strong>Agroforestry</strong> and <strong>Composting</strong> for higher impact</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Track progress and upload evidence consistently</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Access step-by-step tutorials for every practice</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Get personalized support and field officer visits</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Monitor verification status for credit eligibility</span>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  View Tutorials
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Practice Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={() => setShowAdd(false)}></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-emerald-100 p-2 rounded-xl">
                  <Plus className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Practice</h2>
              </div>
              
              <form onSubmit={handleAddPractice} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Practice Type</label>
                  <select
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-900 dark:text-white"
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  >
                    {PRACTICE_TYPES.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.icon} {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Area (hectares)</label>
                  <input
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-900 dark:text-white"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="e.g., 2.5"
                    value={form.area}
                    onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Implementation Date</label>
                  <input
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-900 dark:text-white"
                    type="date"
                    value={form.implementationDate}
                    onChange={e => setForm(f => ({ ...f, implementationDate: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notes</label>
                  <textarea
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-900 dark:text-white"
                    rows={3}
                    placeholder="Add any additional details about this practice..."
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAdd(false)}
                    className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-800"
                  >
                    Add Practice
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Practice Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetails(null)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="text-3xl">{getPracticeIcon(showDetails.type)}</div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{getPracticeLabel(showDetails.type)}</h2>
                  <p className="text-sm text-slate-600">Practice Details</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-sm text-slate-600">Area</div>
                    <div className="text-xl font-bold text-slate-900">{showDetails.area} ha</div>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <div className="text-sm text-emerald-600">CO₂e Impact</div>
                    <div className="text-xl font-bold text-emerald-700">{showDetails.co2eContribution} t/yr</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-700 mb-2">Implementation Date</div>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(showDetails.implementationDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-slate-700 mb-2">Status</div>
                    <Badge className={`${PRACTICE_COLORS[showDetails.status]} border font-medium`}>
                      {showDetails.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-700 mb-2">Verification</div>
                    <Badge className={`${PRACTICE_COLORS[showDetails.verificationStatus]} border font-medium`}>
                      {showDetails.verificationStatus}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-700 mb-2">Notes</div>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{showDetails.notes}</p>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-700 mb-3">Evidence ({showDetails.evidence.length})</div>
                  <div className="flex space-x-2">
                    {showDetails.evidence.map((evidence, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={evidence.url}
                          alt={evidence.type}
                          className="w-16 h-16 rounded-lg object-cover shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all duration-200 flex items-center justify-center">
                          <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      </div>
                    ))}
                    {showDetails.evidence.length === 0 && (
                      <div className="text-slate-400 text-sm bg-slate-50 p-4 rounded-lg w-full text-center">
                        No evidence uploaded yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(null)}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Close
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Edit Practice
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
        </DashboardLayout>
      );
    }