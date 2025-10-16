import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { CheckCircle, Clock, AlertCircle, UploadCloud, FileText, Phone, Mail } from "lucide-react";
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Simple error boundary for functional components
function ErrorBoundary({ children }) {
  const [error, setError] = useState(null);
  return error ? (
    <div className="bg-red-100 border border-red-300 text-red-800 rounded-lg p-4 m-4 sm:m-8">
      <h3 className="font-bold mb-2">Critical Error:</h3>
      <pre className="text-sm whitespace-pre-wrap break-words">{error.toString()}</pre>
    </div>
  ) : (
    <React.Fragment>
      {React.Children.map(children, child => {
        try {
          return child;
        } catch (err) {
          setError(err);
          return null;
        }
      })}
    </React.Fragment>
  );
}

const support = {
  hotline: "+254-700-227266",
  whatsapp: "+254-700-227266",
  email: "verify@carbonplatform.io",
};

const ProjectVerification = () => {
  const [project, setProject] = useState(null);
  const [steps, setSteps] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch project details, steps, timeline, and docs
  useEffect(() => {
    let projectId = null;
    async function fetchData() {
      setLoading(true);
      setErrors([]);
      try {
        // Fetch project
        const { data: projectData, error: projectError } = await supabase
          .from("farms")
          .select("*, profiles(full_name)")
          .order("created_at", { ascending: true })
          .limit(1);
        
        if (projectError) {
          setErrors(prev => [...prev, `Project fetch error: ${projectError.message}`]);
          console.error("Project fetch error:", projectError);
        }
        
        if (projectData && projectData.length > 0) {
          setProject({
            id: projectData[0].id,
            name: projectData[0].name,
            owner: projectData[0].profiles?.full_name || "Unknown",
            farmSize: projectData[0].size_hectares,
            location: projectData[0].location,
            practices: projectData[0].practices || [],
            verificationStatus: projectData[0].status || "pending",
          });
          projectId = projectData[0].id;
        } else {
          setErrors(prev => [...prev, "No project found for this user."]);
        }
        
        if (!projectId) {
          setSteps([]);
          setTimeline([]);
          setUploadedDocs([]);
          setLoading(false);
          return;
        }
        
        // Fetch verification steps
        const { data: stepsData, error: stepsError } = await supabase
          .from("verification_steps")
          .select("label,status")
          .eq("farm_id", projectId);
        
        if (stepsError) {
          setErrors(prev => [...prev, `Verification steps error: ${stepsError.message}`]);
          console.error("Verification steps error:", stepsError);
        }
        setSteps(stepsData || []);
        
        // Fetch timeline
        const { data: timelineData, error: timelineError } = await supabase
          .from("verification_timeline")
          .select("status,label,timestamp")
          .eq("farm_id", projectId)
          .order("timestamp", { ascending: true });
        
        if (timelineError) {
          setErrors(prev => [...prev, `Timeline fetch error: ${timelineError.message}`]);
          console.error("Timeline fetch error:", timelineError);
        }
        setTimeline(timelineData || []);
        
        // Fetch uploaded docs
        const { data: docsData, error: docsError } = await supabase
          .from("verification_documents")
          .select("filename")
          .eq("farm_id", projectId);
        
        if (docsError) {
          setErrors(prev => [...prev, `Documents fetch error: ${docsError.message}`]);
          console.error("Documents fetch error:", docsError);
        }
        setUploadedDocs(docsData ? docsData.map(d => d.filename) : []);
        
      } catch (err) {
        setErrors(prev => [...prev, `Unexpected error: ${err.message || err}`]);
        console.error("Unexpected error:", err);
      }
      setLoading(false);
    }
    
    fetchData();
    
    // Subscribe to changes for realtime updates
    const stepsSub = supabase
      .channel("verification_steps")
      .on("postgres_changes", { 
        event: "*", 
        schema: "public", 
        table: "verification_steps" 
      }, fetchData)
      .subscribe();
    
    const timelineSub = supabase
      .channel("verification_timeline")
      .on("postgres_changes", { 
        event: "*", 
        schema: "public", 
        table: "verification_timeline" 
      }, fetchData)
      .subscribe();
    
    const docsSub = supabase
      .channel("verification_documents")
      .on("postgres_changes", { 
        event: "*", 
        schema: "public", 
        table: "verification_documents" 
      }, fetchData)
      .subscribe();
    
    return () => {
      supabase.removeChannel(stepsSub);
      supabase.removeChannel(timelineSub);
      supabase.removeChannel(docsSub);
    };
  }, []);

  // Document upload handler
  const handleUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const files = Array.from(e.target.files);
    
    try {
      // Upload files to storage
      const uploadPromises = files.map(async (file: File) => {
        const filePath = `verification-docs/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage
          .from("verification-documents")
          .upload(filePath, file);
        
        if (error) throw error;
        return filePath;
      });
      
      const uploadedPaths = await Promise.all(uploadPromises);
      
      // Insert document records
      const insertPromises = uploadedPaths.map(async (path) => {
        const { error } = await supabase
          .from("verification_documents")
          .insert({
            farm_id: project.id,
            filename: path.split("/").pop(),
            path: path
          });
        
        if (error) throw error;
        return path.split("/").pop();
      });
      
      const uploadedFilenames = await Promise.all(insertPromises);
      setUploadedDocs(prev => [...prev, ...uploadedFilenames]);
      
    } catch (err) {
      setErrors(prev => [...prev, `Upload error: ${err.message || err}`]);
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  // Submit for Verification handler
  const handleSubmitVerification = async () => {
    if (!project || !project.id) return;
    
    setSubmitLoading(true);
    setSubmitSuccess(false);
    setErrors([]);
    
    try {
      // Define all steps for the workflow
      const workflowSteps = [
        { label: "Submitted", status: "completed" },
        { label: "Documents Uploaded", status: "pending" },
        { label: "QA", status: "pending" },
        { label: "Approved", status: "pending" }
      ];
      
      // Insert steps
      const { error: stepsError } = await supabase
        .from("verification_steps")
        .insert(workflowSteps.map(step => ({ ...step, farm_id: project.id })));
      
      if (stepsError) throw new Error(`Verification steps error: ${stepsError.message}`);
      
      // Add to timeline
      const { error: timelineError } = await supabase
        .from("verification_timeline")
        .insert({ 
          farm_id: project.id, 
          label: "Submitted for Verification", 
          status: "submitted", 
          timestamp: new Date().toISOString() 
        });
      
      if (timelineError) throw new Error(`Timeline error: ${timelineError.message}`);
      
      // Update project status
      const { error: projectError } = await supabase
        .from("farms")
        .update({ status: "active" })
        .eq("id", project.id);
      
      if (projectError) throw new Error(`Project update error: ${projectError.message}`);
      
      // Update local state
      setProject(prev => ({ ...prev, verificationStatus: "submitted" }));
      setSubmitSuccess(true);
      
    } catch (err) {
      setErrors(prev => [...prev, err.message || `Unexpected error: ${err}`]);
      console.error("Verification submit error:", err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const verificationSteps = [
    { 
      label: "Internal QA/QC", 
      desc: "Automated data validation, outlier detection, and consistency checks.",
    },
    { 
      label: "Field Verification", 
      desc: "Random sampling of 10% of farms for independent verification.",
    },
    { 
      label: "Satellite Cross-Check", 
      desc: "Remote sensing validation using satellite imagery and AI.",
    },
    { 
      label: "Third-Party Audit", 
      desc: "Annual audits by VVBs for final credit issuance.",
    }
  ];

  const vvbData = [
    {
      name: "SCS Global Services",
      specialization: "Agriculture & Forestry",
      accreditation: "VCS, Gold Standard, ISO 14065",
      coverage: "Global"
    },
    {
      name: "Bureau Veritas",
      specialization: "Land Use & Agriculture", 
      accreditation: "VCS, CDM, ISO 14065",
      coverage: "Africa, Europe"
    },
    {
      name: "SGS",
      specialization: "Environmental Services",
      accreditation: "VCS, Gold Standard",
      coverage: "Global"
    },
    {
      name: "Control Union",
      specialization: "Sustainable Agriculture",
      accreditation: "VCS, Fairtrade, Organic",
      coverage: "Developing Countries"
    }
  ];

  try {
    return (
      <ErrorBoundary>
        <DashboardLayout>
          <div className="py-4 sm:py-6 lg:py-10 px-3 sm:px-4 max-w-6xl mx-auto">
            <div className="bg-card border-2 border-primary/30 rounded-2xl shadow-lg sm:shadow-2xl p-3 sm:p-6 md:p-8">
              {/* Error Display */}
              {errors.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <div className="bg-red-100 border border-red-300 text-red-800 rounded-lg p-3 sm:p-4">
                    <h3 className="font-bold mb-1 sm:mb-2 text-sm sm:text-base">Errors:</h3>
                    <ul className="list-disc pl-4 text-xs sm:text-sm space-y-1">
                      {errors.map((err, idx) => <li key={idx} className="break-words">{err}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="mb-4 sm:mb-6">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center gap-2 flex-wrap">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-primary flex-shrink-0" /> 
                  <span className="break-words">Project Verification</span>
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed">
                  Track your project's verification progress and submit required documents for carbon credit approval.
                </p>
              </div>

              {/* Project Details Card */}
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary mr-2" /> 
                  <span className="text-sm sm:text-base">Loading project...</span>
                </div>
              ) : project ? (
                <div className="bg-card border rounded-xl shadow p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8">
                  <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center">
                    <div className="flex-1 w-full space-y-2">
                      <h2 className="text-base sm:text-lg lg:text-xl font-semibold break-words">{project.name}</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                        <div className="text-muted-foreground">
                          Owner: <span className="font-medium text-foreground break-words">{project.owner}</span>
                        </div>
                        <div className="text-muted-foreground">
                          Farm Size: <span className="font-medium text-foreground">{project.farmSize} hectares</span>
                        </div>
                        <div className="text-muted-foreground sm:col-span-2">
                          Location: <span className="font-medium text-foreground break-words">{project.location}</span>
                        </div>
                        <div className="text-muted-foreground sm:col-span-2">
                          Practices: <span className="font-medium text-foreground break-words">
                            {Array.isArray(project.practices) ? project.practices.join(", ") : project.practices}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full lg:w-auto flex justify-center lg:justify-end">
                      <span className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap ${
                        project.verificationStatus === "pending" 
                          ? "bg-yellow-100 text-yellow-800" 
                          : project.verificationStatus === "verified" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {project.verificationStatus.charAt(0).toUpperCase() + project.verificationStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-32 text-muted-foreground text-sm sm:text-base">
                  No project found.
                </div>
              )}

              {/* Enhanced Verification Progress */}
              <div className="mb-4 sm:mb-6 lg:mb-8">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4">Verification Progress</h3>
                
                {/* Mobile card layout */}
                <div className="sm:hidden space-y-3">
                  {verificationSteps.map((step, idx) => {
                    const dbStep = steps.find(s => s.label === step.label);
                    let status = dbStep ? dbStep.status : "pending";
                    let bgColor = status === "completed" ? "bg-green-50" : status === "pending" ? "bg-yellow-50" : "bg-red-50";
                    let borderColor = status === "completed" ? "border-green-200" : status === "pending" ? "border-yellow-200" : "border-red-200";
                    let textColor = status === "completed" ? "text-green-700" : status === "pending" ? "text-yellow-700" : "text-red-700";
                    let icon = status === "completed" ? <CheckCircle className="h-4 w-4 text-green-600" /> : status === "pending" ? <Clock className="h-4 w-4 text-yellow-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />;
                    
                    return (
                      <div key={step.label} className={`${bgColor} ${borderColor} border rounded-lg p-3`}>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">{icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground text-sm break-words">{step.label}</div>
                            <div className={`text-xs ${textColor} mt-1`}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-2 leading-relaxed">
                              {step.desc}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Tablet layout */}
                <div className="hidden sm:block lg:hidden">
                  <div className="overflow-x-auto pb-2">
                    <div className="flex gap-4 min-w-max">
                      {verificationSteps.map((step, idx) => {
                        const dbStep = steps.find(s => s.label === step.label);
                        let status = dbStep ? dbStep.status : "pending";
                        let color = status === "completed" ? "bg-green-100 border-green-400 text-green-700" : status === "pending" ? "bg-yellow-100 border-yellow-400 text-yellow-700" : "bg-red-100 border-red-400 text-red-700";
                        let icon = status === "completed" ? <CheckCircle className="h-5 w-5 text-green-600" /> : status === "pending" ? <Clock className="h-5 w-5 text-yellow-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />;
                        
                        return (
                          <div key={step.label} className="flex flex-col items-center min-w-[160px] px-3 py-3">
                            <div className={`rounded-full p-2 mb-2 border-2 ${color}`}>{icon}</div>
                            <span className="text-sm font-medium text-foreground text-center mb-1 break-words w-full">
                              {step.label}
                            </span>
                            <span className={`text-xs ${color} mb-2`}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                            <span className="text-xs text-muted-foreground text-center leading-tight break-words">
                              {step.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Desktop grid layout */}
                <div className="hidden lg:grid lg:grid-cols-4 gap-6">
                  {verificationSteps.map((step, idx) => {
                    const dbStep = steps.find(s => s.label === step.label);
                    let status = dbStep ? dbStep.status : "pending";
                    let color = status === "completed" ? "bg-green-100 border-green-400 text-green-700" : status === "pending" ? "bg-yellow-100 border-yellow-400 text-yellow-700" : "bg-red-100 border-red-400 text-red-700";
                    let icon = status === "completed" ? <CheckCircle className="h-6 w-6 text-green-600" /> : status === "pending" ? <Clock className="h-6 w-6 text-yellow-600" /> : <AlertCircle className="h-6 w-6 text-red-600" />;
                    
                    return (
                      <div key={step.label} className="flex flex-col items-center text-center p-4">
                        <div className={`rounded-full p-3 mb-3 border-2 ${color}`}>{icon}</div>
                        <span className="text-sm font-medium text-foreground mb-2">{step.label}</span>
                        <span className={`text-xs ${color} mb-3`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                        <span className="text-xs text-muted-foreground leading-relaxed">{step.desc}</span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Estimated timeline */}
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-xs sm:text-sm">
                    <strong className="text-blue-900">Estimated Timeline:</strong>{" "}
                    <span className="text-blue-900 font-semibold">4-8 weeks</span>{" "}
                    <span className="text-blue-900">from data submission to credit issuance.</span>
                  </div>
                  <div className="text-xs text-blue-800 mt-1">
                    Real-time status updates are available below.
                  </div>
                </div>
              </div>

              {/* Verification Bodies Info */}
              <div className="mb-4 sm:mb-6 lg:mb-8">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4">Verification Bodies</h3>
                
                {/* Mobile card layout */}
                <div className="sm:hidden space-y-3">
                  {vvbData.map((vvb, idx) => (
                    <div key={idx} className="bg-card border rounded-lg p-3">
                      <div className="font-semibold text-sm mb-2 break-words">{vvb.name}</div>
                      <div className="space-y-1 text-xs">
                        <div><span className="font-medium">Specialization:</span> <span className="text-muted-foreground break-words">{vvb.specialization}</span></div>
                        <div><span className="font-medium">Accreditation:</span> <span className="text-muted-foreground break-words">{vvb.accreditation}</span></div>
                        <div><span className="font-medium">Coverage:</span> <span className="text-muted-foreground">{vvb.coverage}</span></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tablet and desktop table */}
                <div className="hidden sm:block">
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full bg-card">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-3 py-2 lg:px-4 lg:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">VVB Partner</th>
                          <th className="px-3 py-2 lg:px-4 lg:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">Specialization</th>
                          <th className="px-3 py-2 lg:px-4 lg:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">Accreditation</th>
                          <th className="px-3 py-2 lg:px-4 lg:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">Coverage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {vvbData.map((vvb, idx) => (
                          <tr key={idx} className="hover:bg-muted/50">
                            <td className="px-3 py-2 lg:px-4 lg:py-3 font-semibold text-xs sm:text-sm">{vvb.name}</td>
                            <td className="px-3 py-2 lg:px-4 lg:py-3 text-xs sm:text-sm">{vvb.specialization}</td>
                            <td className="px-3 py-2 lg:px-4 lg:py-3 text-xs sm:text-sm">{vvb.accreditation}</td>
                            <td className="px-3 py-2 lg:px-4 lg:py-3 text-xs sm:text-sm">{vvb.coverage}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="mb-4 sm:mb-6 lg:mb-8">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4">Upload Verification Documents</h3>
                <div className="bg-card border rounded-lg p-3 sm:p-4 lg:p-6">
                  <label className="block w-full py-3 px-4 bg-accent text-accent-foreground rounded-md cursor-pointer text-center text-sm sm:text-base hover:bg-accent/80 transition-colors">
                    <UploadCloud className="inline-block mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Select Files
                    <input 
                      type="file" 
                      multiple 
                      onChange={handleUpload} 
                      className="hidden" 
                    />
                  </label>
                  
                  {uploading && (
                    <div className="text-primary flex items-center justify-center gap-2 text-sm sm:text-base mt-3">
                      <UploadCloud className="h-4 w-4 sm:h-5 sm:w-5 animate-bounce" />
                      Uploading...
                    </div>
                  )}
                  
                  {uploadedDocs.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Uploaded Documents:</h4>
                      <div className="space-y-2">
                        {uploadedDocs.map((doc, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded text-xs sm:text-sm">
                            <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="break-all flex-1">{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline/History */}
              {timeline.length > 0 && (
                <div className="mb-4 sm:mb-6 lg:mb-8">
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4">Verification Timeline</h3>
                  <div className="bg-card border rounded-lg p-3 sm:p-4 lg:p-6">
                    <ul className="space-y-3 sm:space-y-4">
                      {timeline.map((event, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {event.status === "submitted" ? (
                              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            ) : event.status === "qa" ? (
                              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground text-sm sm:text-base break-words">
                              {event.label}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(event.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {submitSuccess && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-green-800 text-sm sm:text-base">Verification Submitted!</h3>
                      <p className="text-green-700 text-xs sm:text-sm mt-1">Your project has been submitted for verification.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6 lg:mb-8">
                <button
                  className={`w-full sm:w-auto px-4 py-3 sm:px-6 sm:py-2 rounded-md font-semibold flex items-center justify-center gap-2 text-sm sm:text-base ${
                    project?.verificationStatus === "submitted" || submitLoading
                      ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  }`}
                  onClick={handleSubmitVerification}
                  disabled={project?.verificationStatus === "submitted" || submitLoading}
                >
                  {submitLoading ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : project?.verificationStatus === "submitted" ? (
                    "Already Submitted"
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4" />
                      <span>Submit for Verification</span>
                    </>
                  )}
                </button>
                <a 
                  href={`mailto:${support.email}`} 
                  className="w-full sm:w-auto px-4 py-3 sm:px-6 sm:py-2 border rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Mail className="h-4 w-4" />
                  <span>Contact Support</span>
                </a>
              </div>

              {/* Support Info */}
              <div className="bg-card border rounded-lg p-3 sm:p-4 lg:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 text-sm sm:text-base">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="font-medium">Hotline:</span>
                      <div className="break-all text-muted-foreground">{support.hotline}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm sm:text-base">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="font-medium">Email:</span>
                      <div className="break-all text-muted-foreground">{support.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm sm:text-base sm:col-span-2 lg:col-span-1">
                    <UploadCloud className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="font-medium">WhatsApp:</span>
                      <div className="break-all text-muted-foreground">{support.whatsapp}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ErrorBoundary>
    );
  } catch (err) {
    return (
      <div className="bg-red-100 border border-red-300 text-red-800 rounded-lg p-4 m-4 sm:m-8">
        <h3 className="font-bold mb-2">Critical Render Error:</h3>
        <pre className="text-sm whitespace-pre-wrap break-words">{err.toString()}</pre>
      </div>
    );
  }
};

export default ProjectVerification;