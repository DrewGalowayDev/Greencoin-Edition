import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Clock, AlertCircle, Plus, Search, Edit, Trash2, Eye, Filter } from "lucide-react";

const statusColors = {
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  verified: "bg-blue-100 text-blue-800 border-blue-200",
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, verified: 0, pending: 0 });

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProjects([]);
        setLoading(false);
        return;
      }
      // Fetch projects/farms for user
      const { data, error } = await supabase
        .from("farms")
        .select("*, verification_steps(label,status)")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        setProjects([]);
      } else {
        setProjects(data || []);
        // Quick stats
        setStats({
          total: data.length,
          active: data.filter(p => (p.status || "").toString().toLowerCase() === "active").length,
          verified: data.filter(p => (p.status || "").toString().toLowerCase() === "verified").length,
          pending: data.filter(p => (p.status || "").toString().toLowerCase() === "pending").length,
        });
      }
      setLoading(false);
    }
    fetchProjects();
  }, []);

  // Search and filter
  const filteredProjects = projects.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus ? p.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  // Mobile Card Component
  const ProjectCard = ({ project }) => (
    <div className="bg-card border rounded-xl p-4 space-y-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{project.name}</h3>
          <p className="text-muted-foreground text-sm truncate">{project.location}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[project.status] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Size:</span>
          <p className="font-medium">{project.size_hectares} ha</p>
        </div>
        <div>
          <span className="text-muted-foreground">Practices:</span>
          <p className="font-medium text-xs leading-relaxed">
            {Array.isArray(project.practices) ? project.practices.join(", ") : project.practices}
          </p>
        </div>
      </div>

      <div>
        <span className="text-muted-foreground text-sm">Verification Progress:</span>
        <div className="flex gap-2 mt-1">
          {project.verification_steps && project.verification_steps.length > 0 ? (
            project.verification_steps.map((step, idx) => (
              <span key={idx} title={step.label}>
                {step.status === "completed" ? 
                  <CheckCircle className="h-5 w-5 text-green-600" /> : 
                  step.status === "pending" ? 
                  <Clock className="h-5 w-5 text-yellow-600" /> : 
                  <AlertCircle className="h-5 w-5 text-red-600" />
                }
              </span>
            ))
          ) : (
            <span className="text-muted-foreground text-xs">No verification steps</span>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <button className="p-2 rounded-lg hover:bg-accent transition-colors" title="View">
          <Eye className="h-4 w-4" />
        </button>
        <button className="p-2 rounded-lg hover:bg-accent transition-colors" title="Edit">
          <Edit className="h-4 w-4" />
        </button>
        <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors" title="Delete">
          <Trash2 className="h-4 w-4 text-destructive" />
        </button>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="py-6 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">My Projects</h1>
            <p className="text-muted-foreground text-sm lg:text-base">Manage all your registered farms and carbon projects.</p>
          </div>
          <button className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-semibold flex items-center justify-center gap-2 transition-colors">
            <Plus className="h-4 w-4" /> Register New Project
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <div className="bg-card border rounded-xl p-4 lg:p-6 flex flex-col items-center shadow-sm">
            <span className="text-xl lg:text-2xl font-bold">{stats.total}</span>
            <span className="text-muted-foreground text-xs lg:text-sm text-center">Total Projects</span>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 lg:p-6 flex flex-col items-center shadow-sm">
            <span className="text-xl lg:text-2xl font-bold text-green-700">{stats.active}</span>
            <span className="text-green-700 text-xs lg:text-sm">Active</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 lg:p-6 flex flex-col items-center shadow-sm">
            <span className="text-xl lg:text-2xl font-bold text-blue-700">{stats.verified}</span>
            <span className="text-blue-700 text-xs lg:text-sm">Verified</span>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 lg:p-6 flex flex-col items-center shadow-sm">
            <span className="text-xl lg:text-2xl font-bold text-yellow-700">{stats.pending}</span>
            <span className="text-yellow-700 text-xs lg:text-sm">Pending</span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 space-y-4">
          {/* Mobile Filter Toggle */}
          <div className="flex gap-3 lg:hidden">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Search projects..."
              />
            </div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="px-3 py-2 border rounded-lg focus:outline-none flex items-center gap-2 hover:bg-accent"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:flex lg:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Search by name or location"
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none min-w-32"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Mobile Filters Dropdown */}
          {showMobileFilters && (
            <div className="lg:hidden bg-card border rounded-lg p-4">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No projects found.</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="lg:hidden space-y-4">
              {filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <div className="bg-card border rounded-xl shadow-sm">
                <div className="overflow-x-auto max-w-full" style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}>
                  <table className="min-w-full w-max">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        <th className="px-6 py-4 text-left font-semibold whitespace-nowrap min-w-[150px]">Name</th>
                        <th className="px-6 py-4 text-left font-semibold whitespace-nowrap min-w-[150px]">Location</th>
                        <th className="px-6 py-4 text-left font-semibold whitespace-nowrap min-w-[100px]">Size (ha)</th>
                        <th className="px-6 py-4 text-left font-semibold whitespace-nowrap min-w-[200px]">Practices</th>
                        <th className="px-6 py-4 text-left font-semibold whitespace-nowrap min-w-[120px]">Status</th>
                        <th className="px-6 py-4 text-left font-semibold whitespace-nowrap min-w-[140px]">Verification</th>
                        <th className="px-6 py-4 text-left font-semibold whitespace-nowrap min-w-[120px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map(project => (
                        <tr key={project.id} className="border-b hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 font-semibold whitespace-nowrap">{project.name}</td>
                          <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{project.location}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{project.size_hectares}</td>
                          <td className="px-6 py-4 text-sm max-w-[200px]">
                            <div className="truncate" title={Array.isArray(project.practices) ? project.practices.join(", ") : project.practices}>
                              {Array.isArray(project.practices) ? project.practices.join(", ") : project.practices}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[project.status] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
                              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              {project.verification_steps && project.verification_steps.length > 0 ? (
                                project.verification_steps.map((step, idx) => (
                                  <span key={idx} title={step.label}>
                                    {step.status === "completed" ? 
                                      <CheckCircle className="h-5 w-5 text-green-600" /> : 
                                      step.status === "pending" ? 
                                      <Clock className="h-5 w-5 text-yellow-600" /> : 
                                      <AlertCircle className="h-5 w-5 text-red-600" />
                                    }
                                  </span>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-xs">No steps</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button className="p-2 rounded-lg hover:bg-accent transition-colors" title="View">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="p-2 rounded-lg hover:bg-accent transition-colors" title="Edit">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="p-2 rounded-lg hover:bg-accent transition-colors" title="Delete">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Projects;