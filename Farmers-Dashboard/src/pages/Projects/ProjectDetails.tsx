import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, AlertCircle } from "lucide-react";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProject() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("farms")
        .select("*, verification_steps(label,status)")
        .eq("id", id)
        .single();
      if (error || !data) {
        setError("Project not found or you do not have access.");
        setProject(null);
      } else {
        setProject(data);
      }
      setLoading(false);
    }
    if (id) fetchProject();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">Loading project details...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-red-600 flex flex-col items-center">
          <AlertCircle className="w-8 h-8 mb-2" />
          <div>{error}</div>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-primary text-white rounded">Go Back</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </button>
        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
        <div className="mb-4 text-muted-foreground">{project.location} • {project.size_hectares} ha</div>
        <div className="mb-6">
          <span className="inline-block px-3 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold mr-2">{project.status}</span>
          {project.practices && project.practices.length > 0 && (
            <span className="inline-block px-3 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold">Practices: {project.practices.join(", ")}</span>
          )}
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Verification Steps</h2>
          {project.verification_steps && project.verification_steps.length > 0 ? (
            <ul className="space-y-2">
              {project.verification_steps.map((step, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${step.status === 'completed' ? 'bg-green-500' : step.status === 'pending' ? 'bg-yellow-400' : 'bg-gray-300'}`}></span>
                  <span>{step.label} ({step.status})</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted-foreground">No verification steps found.</div>
          )}
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <div>{project.description || 'No description provided.'}</div>
        </div>
        {/* Add more project details as needed */}
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetails;
