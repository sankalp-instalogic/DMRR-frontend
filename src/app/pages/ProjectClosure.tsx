import { useState } from "react";
import { CheckCircle2, Upload, Eye, Download, FileArchive, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

const closureProjects = [
  { id: "WO/DMRR/2025/001", district: "Mumbai", stage: "Ready for Closure", progress: "100%", status: "Pending" },
  { id: "WO/DMRR/2025/034", district: "Pune", stage: "Final Inspection", progress: "100%", status: "Pending" },
];

export function ProjectClosure() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(closureProjects);
  const [selectedProject, setSelectedProject] = useState(null);

  const [isCompleted, setIsCompleted] = useState("");

const [completionData, setCompletionData] = useState({
  completionDate: "",
  certificateDate: "",
  completionCertificate: null,
  socialAuditFiles: [],
});
  
  const [uploads, setUploads] = useState({
    cert: false,
    inspection: false,
    audit: false,
    transfer: false,
    handover: false,
  });

  const handleAction = (action, item = '') => {
    alert(`Action '${action}' executed successfully ${item ? 'for ' + item : ''}`);
    if (action === 'Generate Closure') {
      const updated = projects.filter(p => p.id !== selectedProject.id);
      setProjects(updated);
      setSelectedProject(null);
    }
  };

  const docRow = (title, key) => (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card mb-3">
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm">{title}</span>
        {uploads[key] && <CheckCircle2 className="size-4 text-accent" />}
      </div>
      <div className="flex gap-2">
        <button onClick={() => { handleAction('Upload', title); setUploads(prev => ({...prev, [key]: true})); }} className="p-2 bg-primary/10 text-primary rounded hover:bg-primary/20" title="Upload"><Upload className="size-4" /></button>
        <button onClick={() => handleAction('View', title)} className="p-2 bg-secondary/10 text-secondary rounded hover:bg-secondary/20" title="View"><Eye className="size-4" /></button>
        <button onClick={() => handleAction('Download', title)} className="p-2 bg-accent/10 text-accent rounded hover:bg-accent/20" title="Download"><Download className="size-4" /></button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1>Project Completion & Closure</h1>
        <p className="text-sm text-muted-foreground">Final asset handover and administrative closure</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-4 text-left text-sm">Work Order ID</th>
              <th className="px-6 py-4 text-left text-sm">District</th>
              <th className="px-6 py-4 text-left text-sm">Progress</th>
              <th className="px-6 py-4 text-left text-sm">Current Stage</th>
              <th className="px-6 py-4 text-left text-sm">Status</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr 
                key={project.id} 
                className={`border-t border-border hover:bg-muted/50 cursor-pointer ${selectedProject?.id === project.id ? 'bg-primary/5' : ''}`}
                onClick={() => setSelectedProject(project)}
              >
                <td className="px-6 py-4 text-sm font-medium">{project.id}</td>
                <td className="px-6 py-4 text-sm">{project.district}</td>
                <td className="px-6 py-4 text-sm font-bold text-accent">{project.progress}</td>
                <td className="px-6 py-4 text-sm">{project.stage}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-secondary/20 text-secondary rounded-full text-xs">
                    {project.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

  {selectedProject && (
  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">

    <h3 className="mb-6 text-lg font-bold border-b pb-2 text-[#0B1F4D]">
      Project Closure : {selectedProject.id}
    </h3>

    {/* PROJECT COMPLETED */}

    <div className="mb-6">

      <label className="block font-medium mb-3">
        Is Project Completed ?
      </label>

      <div className="flex gap-3">

        <button
          onClick={() => setIsCompleted("Yes")}
          className={`px-4 py-2 rounded-lg ${
            isCompleted === "Yes"
              ? "bg-green-600 text-white"
              : "border"
          }`}
        >
          Yes
        </button>

        <button
          onClick={() => setIsCompleted("No")}
          className={`px-4 py-2 rounded-lg ${
            isCompleted === "No"
              ? "bg-red-600 text-white"
              : "border"
          }`}
        >
          No
        </button>

      </div>
    </div>

    {/* YES SECTION */}

    {isCompleted === "Yes" && (
      <div className="space-y-6">

        <div className="grid md:grid-cols-2 gap-4">

          <div>
            <label className="block mb-2">
              Date of Completion
            </label>

            <input
              type="date"
              className="w-full border rounded-lg p-2"
              value={completionData.completionDate}
              onChange={(e) =>
                setCompletionData({
                  ...completionData,
                  completionDate: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block mb-2">
              Date of Completion Certificate Issued
            </label>

            <input
              type="date"
              className="w-full border rounded-lg p-2"
              value={completionData.certificateDate}
              onChange={(e) =>
                setCompletionData({
                  ...completionData,
                  certificateDate: e.target.value,
                })
              }
            />
          </div>

        </div>

        {/* COMPLETION CERTIFICATE */}

        <div>

          <label className="block mb-2 font-medium">
            Upload Completion Certificate
          </label>

          <input
            type="file"
            className="w-full border rounded-lg p-2"
            onChange={(e) =>
              setCompletionData({
                ...completionData,
                completionCertificate:
                  e.target.files?.[0] || null,
              })
            }
          />

        </div>

        {/* SOCIAL AUDIT FILES */}

        <div>

          <label className="block mb-2 font-medium">
            Upload Social Audit Files
          </label>

          <input
            type="file"
            multiple
            className="w-full border rounded-lg p-2"
            onChange={(e) =>
              setCompletionData({
                ...completionData,
                socialAuditFiles: Array.from(
                  e.target.files || []
                ),
              })
            }
          />

        </div>

      </div>
    )}

    {/* SAVE BUTTON */}

    <div className="mt-8">

      <button
        onClick={() => {

          const updatedProjects = projects.map((p) =>
            p.id === selectedProject.id
              ? {
                  ...p,
                  status: "Completed",
                }
              : p
          );

          setProjects(updatedProjects);

          console.log({
            project: selectedProject,
            isCompleted,
            completionData,
          });

          alert("Project Closure Saved Successfully");

          setSelectedProject(null);

          setIsCompleted("");

          setCompletionData({
            completionDate: "",
            certificateDate: "",
            completionCertificate: null,
            socialAuditFiles: [],
          });
        }}
        className="px-6 py-3 bg-green-600 text-white rounded-lg"
      >
        Save
      </button>

    </div>

  </div>
)}
    </div>
  );
}