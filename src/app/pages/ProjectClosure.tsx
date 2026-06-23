import React, { useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// --- Type Definitions ---

export interface Project {
  projectId: number | string;
  proposalId: number | string;
  proposalRefNo: string;
  progressPercent: number;
  projectStatus: string;
  closureStatus: string;
}

export interface CompletionData {
  completionDate: string;
  certificateDate: string;
  completionCertificate: File | null;
  socialAuditFiles: File[];
}

interface CompletionPayload {
  isCompleted: boolean;
  completionDate: string | null;
  certificateIssuedDate: string | null;
}

export function ProjectClosure() {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();

  // State typing
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCompleted, setIsCompleted] = useState<"Yes" | "No" | "">("");
  const [completionData, setCompletionData] = useState<CompletionData>({
    completionDate: "",
    certificateDate: "",
    completionCertificate: null,
    socialAuditFiles: [],
  });

  // Typed Query
  const {
    data: projects = [],
    isLoading,
    isError,
  } = useQuery<Project[]>({
    queryKey: ["closures"],
    queryFn: async () => {
      const response = await axios.get("/api/v1/closures");
      return response.data;
    },
  });

  // Helper function to handle individual document uploads
  const uploadDocument = async (file: File, documentType: number) => {
    // Ensure selectedProject exists before proceeding
    if (!selectedProject) throw new Error("No project selected");

    const formData = new FormData();
    formData.append("ownerType", "1"); // FormData values should be strings or Blobs
    formData.append("documentType", documentType.toString());
    formData.append("ownerId", selectedProject.proposalId.toString());
    formData.append("file", file);

    return axios.post("/api/v1/Documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };

  // 1. New Mutation for the Direct Closure API
  const closeProjectMutation = useMutation({
    mutationFn: async (projectId: string | number) => {
      const response = await axios.post(`/api/v1/closures/${projectId}/close`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Project status updated to Closed successfully!");
      queryClient.invalidateQueries({ queryKey: ["closures"] });
    },
    onError: (error: any) => {
      console.error("Closure API Error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to execute project closure API"
      );
    },
  });

  const saveCompletionMutation = useMutation({
    mutationFn: async (payload: CompletionPayload) => {
      if (!selectedProject) throw new Error("No project selected");
      const response = await axios.post(
        `/api/v1/closures/${selectedProject.projectId}/completion`,
        payload
      );
      return response.data;
    },
    onSuccess: async () => {
      toast.success("Project Completion Saved Successfully");

      const uploadPromises: Promise<any>[] = [];

      if (completionData.completionCertificate) {
        uploadPromises.push(
          uploadDocument(completionData.completionCertificate, 18)
        );
      }

      if (
        completionData.socialAuditFiles &&
        completionData.socialAuditFiles.length > 0
      ) {
        completionData.socialAuditFiles.forEach((file) => {
          uploadPromises.push(uploadDocument(file, 38));
        });
      }

      if (uploadPromises.length > 0) {
        const toastId = toast.loading("Uploading documents...");
        try {
          await Promise.all(uploadPromises);
          toast.success("All documents uploaded successfully!", {
            id: toastId,
          });
        } catch (uploadError) {
          console.error("Document Upload Error:", uploadError);
          toast.error("Data saved, but some documents failed to upload.", {
            id: toastId,
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ["closures"] });

      setSelectedProject(null);
      setIsCompleted("");
      setCompletionData({
        completionDate: "",
        certificateDate: "",
        completionCertificate: null,
        socialAuditFiles: [],
      });
    },
    onError: (error: any) => {
      console.error("Submission Error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to save project closure"
      );
    },
  });

  // 2. Handler to trigger the new mutation
  const handleCloseProject = (projectId: string | number) => {
    closeProjectMutation.mutate(projectId);
  };

  const handleSave = async () => {
    if (!selectedProject) {
      toast.error("Please select a project first.");
      return;
    }

    if (!isCompleted) {
      toast.error("Please select whether the project is completed.");
      return;
    }

    const formatToISO = (dateStr: string): string | null => {
      if (!dateStr) return null;
      return new Date(dateStr).toISOString();
    };

    const payload: CompletionPayload = {
      isCompleted: isCompleted === "Yes",
      completionDate: formatToISO(completionData.completionDate),
      certificateIssuedDate: formatToISO(completionData.certificateDate),
    };

    saveCompletionMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Project Completion & Closure</h1>
        <p className="text-sm text-muted-foreground">
          Final asset handover and administrative closure
        </p>
      </div>

      {/* PROJECTS TABLE */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-4 text-left text-sm">Proposal Ref No</th>
              <th className="px-6 py-4 text-left text-sm">Progress</th>
              <th className="px-6 py-4 text-left text-sm">Project Status</th>
              <th className="px-6 py-4 text-left text-sm">Closure Status</th>
              <th className="px-6 py-4 text-left text-sm">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  Loading projects...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-red-500">
                  Failed to load projects.
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  No projects ready for closure found.
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr
                  key={project.projectId}
                  className={`border-t border-border hover:bg-muted/50 cursor-pointer ${
                    selectedProject?.projectId === project.projectId
                      ? "bg-primary/5"
                      : ""
                  }`}
                  onClick={() => setSelectedProject(project)}
                >
                  <td className="px-6 py-4 text-sm font-medium">
                    {project.proposalRefNo}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-accent">
                    {project.progressPercent}%
                  </td>
                  <td className="px-6 py-4 text-sm">{project.projectStatus}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-secondary/20 text-secondary rounded-full text-xs">
                      {project.closureStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    {/* 3. New Button to call the specific /close endpoint directly */}
                    {project.closureStatus === "Ready for Closure" && (
                      <button
                        onClick={() => handleCloseProject(project.projectId)}
                        disabled={
                          closeProjectMutation.isPending &&
                          closeProjectMutation.variables === project.projectId
                        }
                        className="px-4 py-2 bg-red-600 cursor-pointer text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {closeProjectMutation.isPending &&
                        closeProjectMutation.variables === project.projectId
                          ? "Closing..."
                          : "Final Close"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FORM SECTION */}
      {selectedProject && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold border-b pb-2 text-[#0B1F4D]">
            Project Completion : {selectedProject.proposalRefNo}
          </h3>

          <div className="mb-6">
            <label className="block font-medium mb-3">
              Is Project Completed?
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setIsCompleted("Yes")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isCompleted === "Yes" ? "bg-green-600 text-white" : "border"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setIsCompleted("No")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isCompleted === "No" ? "bg-red-600 text-white" : "border"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {isCompleted === "Yes" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Date of Completion</label>
                  <input
                    type="date"
                    className="w-full border rounded-lg p-2"
                    value={completionData.completionDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCompletionData({
                        ...completionData,
                        certificateDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Upload Completion Certificate
                </label>
                <input
                  type="file"
                  className="w-full border rounded-lg p-2"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCompletionData({
                      ...completionData,
                      completionCertificate: e.target.files?.[0] || null,
                    })
                  }
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Upload Social Audit Files
                </label>
                <input
                  type="file"
                  multiple
                  className="w-full border rounded-lg p-2"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCompletionData({
                      ...completionData,
                      socialAuditFiles: Array.from(e.target.files || []),
                    })
                  }
                />
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saveCompletionMutation.isPending}
              className={`px-6 py-3 bg-green-600 text-white rounded-lg transition-colors ${
                saveCompletionMutation.isPending
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-green-700"
              }`}
            >
              {saveCompletionMutation.isPending
                ? "Saving..."
                : "Save Completion Details"}
            </button>

            {saveCompletionMutation.isPending && (
              <span className="text-sm text-muted-foreground animate-pulse">
                Submitting project data...
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}