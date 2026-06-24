import { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Upload, CheckCircle2, XCircle, Trash2, Download } from "lucide-react";

export function ProjectExecution() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "entry" | "mpr" | "photos" | "documents"
  >("entry");

  // State specifically for the Entry Details tab
  const [entryDetails, setEntryDetails] = useState({
    entryDate: "",
    startDate: "",
    expectedCompletionDate: "",
  });

  // State specifically for the MPR tab
  const [mprDetails, setMprDetails] = useState({
    reportingMonth: "",
    reportDate: "",
    progressPercent: "" as number | string,
    remarks: "",
    file: null as File | null,
  });

  // State specifically for the Photos tab
  const [photos, setPhotos] = useState([
    {
      file: null as File | null,
      latitude: "",
      longitude: "",
      date: "",
      description: "",
    },
  ]);

  const [documents, setDocuments] = useState<{ [key: string]: File | null }>({
    siteInspectionReport: null,
    tpqaReport: null,
    utilizationCertificate: null,
    completionCertificate: null,
  });

  // 1. Fetch main projects list
  const { data, isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Projects");
      return response.data;
    },
  });

  const projects = data?.items || [];

  // 2. Fetch specific project details when a project is selected
  const { data: projectDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["project", selectedProject?.id],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        `/api/v1/Projects/${selectedProject.id}`,
      );
      return response.data;
    },
    enabled: !!selectedProject?.id,
  });

  // 2.5 Fetch MPR list for the selected project
  const { data: mprList, isLoading: isMprListLoading } = useQuery({
    queryKey: ["projectMprs", selectedProject?.id],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        `/api/v1/Projects/${selectedProject.id}/mpr`,
      );
      return response.data; // Assuming this returns the array of MPRs
    },
    enabled: !!selectedProject?.id && activeTab === "mpr",
  });

  // Determine if Entry Details have been saved on the backend
  const isEntrySaved = Boolean(projectDetails?.entryDate);

  // 3. Populate local state when project details are fetched successfully
  useEffect(() => {
    if (projectDetails) {
      setEntryDetails({
        entryDate: projectDetails.entryDate
          ? projectDetails.entryDate.split("T")[0]
          : "",
        startDate: projectDetails.startDate
          ? projectDetails.startDate.split("T")[0]
          : "",
        expectedCompletionDate: projectDetails.expectedCompletionDate
          ? projectDetails.expectedCompletionDate.split("T")[0]
          : "",
      });

      setMprDetails((prev) => ({
        ...prev,
      }));
    }
  }, [projectDetails]);

  // 4. Mutation for saving Entry Details
  const saveEntryMutation = useMutation({
    mutationFn: async (dataToSave: typeof entryDetails) => {
      const response = await axiosPrivate.post(
        `/api/v1/Projects/${selectedProject.id}/execution`,
        dataToSave,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Entry details saved successfully");
      queryClient.invalidateQueries({
        queryKey: ["project", selectedProject.id],
      });
    },
    onError: () => {
      toast.error("Failed to save entry details. Please try again.");
    },
  });

  // 5. Mutation for uploading file and saving MPR Details sequentially
  const saveMprMutation = useMutation({
    mutationFn: async (mprData: typeof mprDetails) => {
      let uploadedDocumentId = null;

      if (mprData.file) {
        const formData = new FormData();
        formData.append("file", mprData.file);
        formData.append("ownerType", "1");
        formData.append("documentType", "11");
        formData.append("ownerId", selectedProject?.proposalId || "");

        const uploadResponse = await axiosPrivate.post(
          "/api/v1/Documents/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        uploadedDocumentId = uploadResponse.data?.id;
      }

      const mprPayload = {
        reportingMonth: mprData.reportingMonth,
        reportDate: mprData.reportDate
          ? new Date(mprData.reportDate).toISOString()
          : new Date().toISOString(),
        progressPercent: Number(mprData.progressPercent),
        remarks: mprData.remarks,
        documentId: uploadedDocumentId,
      };

      const response = await axiosPrivate.post(
        `/api/v1/Projects/${selectedProject.id}/mpr`,
        mprPayload,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("MPR details saved successfully");
      queryClient.invalidateQueries({
        queryKey: ["project", selectedProject.id],
      });
      // Invalidate the MPR list to refresh the table
      queryClient.invalidateQueries({
        queryKey: ["projectMprs", selectedProject.id],
      });
      setMprDetails({
        reportingMonth: "",
        reportDate: "",
        progressPercent: "",
        remarks: "",
        file: null,
      });
    },
    onError: () => {
      toast.error("Failed to save MPR details. Please try again.");
    },
  });

  // Mutation for Ensure Billing
  const ensureBillingMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await axiosPrivate.post("/api/v1/Billing/ensure", null, {
        params: {
          proposalId: projectId,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Billing ensured successfully!");
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
    onError: () => {
      toast.error("Failed to ensure billing. Please try again.");
    },
  });

  // Document Type Enum Mapping
  const documentTypeMap: Record<string, string> = {
    tpqaReport: "13",
    utilizationCertificate: "27",
    completionCertificate: "18",
    siteInspectionReport: "42",
  };

  // 7. Mutation for uploading Supporting Documents
  const saveDocumentsMutation = useMutation({
    mutationFn: async (docsData: typeof documents) => {
      const results = [];

      for (const [docKey, file] of Object.entries(docsData)) {
        if (!file) continue;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("ownerType", "1");
        formData.append("documentType", documentTypeMap[docKey]);
        formData.append("ownerId", selectedProject?.proposalId || "");

        const uploadResponse = await axiosPrivate.post(
          "/api/v1/Documents/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        results.push({ key: docKey, data: uploadResponse.data });
      }

      return results;
    },
    onSuccess: () => {
      toast.success("Documents uploaded successfully");
      queryClient.invalidateQueries({
        queryKey: ["project", selectedProject.id],
      });
      setDocuments({
        siteInspectionReport: null,
        tpqaReport: null,
        utilizationCertificate: null,
        completionCertificate: null,
      });
    },
    onError: () => {
      toast.error("Failed to upload documents. Please try again.");
    },
  });

  // 6. Mutation for processing multiple photos
  const savePhotosMutation = useMutation({
    mutationFn: async (photosData: typeof photos) => {
      const results = [];

      for (const photo of photosData) {
        if (!photo.file) continue;

        const formData = new FormData();
        formData.append("file", photo.file);
        formData.append("ownerType", "1");
        formData.append("documentType", "12");
        formData.append("ownerId", selectedProject?.proposalId || "");

        const uploadResponse = await axiosPrivate.post(
          "/api/v1/Documents/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        const uploadedDocumentId = uploadResponse.data?.id;

        const photoPayload = {
          documentId: uploadedDocumentId,
          latitude: Number(photo.latitude) || 0,
          longitude: Number(photo.longitude) || 0,
          photoDate: photo.date
            ? new Date(photo.date).toISOString()
            : new Date().toISOString(),
          description: photo.description || "",
        };

        const response = await axiosPrivate.post(
          `/api/v1/Projects/${selectedProject.id}/photos`,
          photoPayload,
        );
        results.push(response.data);
      }

      return results;
    },
    onSuccess: () => {
      toast.success("Photos saved successfully");
      queryClient.invalidateQueries({
        queryKey: ["project", selectedProject.id],
      });
      setPhotos([
        { file: null, latitude: "", longitude: "", date: "", description: "" },
      ]);
    },
    onError: () => {
      toast.error("Failed to save photos. Please try again.");
    },
  });

  // 8. Mutation for Marking Execution as Completed
  const markAsCompletedMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        status: "Completed",
        progressPercent: selectedProject?.progressPercent || 0,
      };

      const response = await axiosPrivate.put(
        `/api/v1/Projects/${selectedProject.id}/status`,
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Execution marked as completed!");
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["project", selectedProject.id],
      });
    },
    onError: () => {
      toast.error("Failed to mark as completed. Please try again.");
    },
  });

  const addPhotoRow = () => {
    setPhotos([
      ...photos,
      { file: null, latitude: "", longitude: "", date: "", description: "" },
    ]);
  };

  const removePhotoRow = (indexToRemove: number) => {
    setPhotos(photos.filter((_, index) => index !== indexToRemove));
  };

  const updatePhotoField = (index: number, field: string, value: any) => {
    const updatedPhotos = [...photos];
    updatedPhotos[index] = { ...updatedPhotos[index], [field]: value };
    setPhotos(updatedPhotos);
  };

  const handleDocumentUpload =
    (docKey: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        setDocuments({ ...documents, [docKey]: e.target.files[0] });
      }
    };

  // Function to download document securely
  const handleDownloadDocument = async (doc: any) => {
    if (!doc?.id) return;
    try {
      // Step 1: Fetch the document metadata
      const metaResponse = await axiosPrivate.get(
        `/api/v1/Documents/${doc.documentId}`,
      );
      const { id, fileName, contentType } = metaResponse.data;

      const downloadResponse = await axiosPrivate.get(
        `/api/v1/Documents/${id}/download`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([downloadResponse.data], {
        type: contentType || "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      link.setAttribute("download", fileName || `document-${id}`);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to fetch or download document:", error);
    }
  };

  const handleSave = () => {
    if (activeTab === "entry") {
      saveEntryMutation.mutate({
        entryDate: entryDetails.entryDate,
        startDate: entryDetails.startDate,
        expectedCompletionDate: entryDetails.expectedCompletionDate,
      });
    } else if (activeTab === "mpr") {
      saveMprMutation.mutate(mprDetails);
    } else if (activeTab === "photos") {
      const hasFiles = photos.some((p) => p.file !== null);
      if (!hasFiles) {
        toast.error("Please select at least one photo to upload.");
        return;
      }
      savePhotosMutation.mutate(photos);
    } else if (activeTab === "documents") {
      const hasFiles = Object.values(documents).some((file) => file !== null);
      if (!hasFiles) {
        toast.error("Please select at least one document to upload.");
        return;
      }
      saveDocumentsMutation.mutate(documents);
    }
  };

  const renderDocumentRow = (docName: string, docKey: string) => {
    const isUploaded = documents[docKey] !== null;

    return (
      <tr className="hover:bg-gray-50/50 transition-colors" key={docKey}>
        <td className="px-6 py-4 font-medium text-gray-700">{docName}</td>
        <td className="px-6 py-4 text-center">
          <label className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity text-xs font-medium">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
            <input
              type="file"
              className="hidden"
              onChange={handleDocumentUpload(docKey)}
            />
          </label>
        </td>
        <td className="px-6 py-4 text-center">
          {isUploaded ? (
            <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500 mx-auto" />
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Project Execution & Monitoring</h1>
        <p className="text-sm text-muted-foreground">
          Manage project progress and monitoring
        </p>
      </div>

      {/* PROJECT LIST */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-4 text-left">Project ID</th>
              <th className="px-6 py-4 text-left">Proposal ID</th>
              <th className="px-6 py-4 text-left">District</th>
              <th className="px-6 py-4 text-left">Contractor</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  Loading projects...
                </td>
              </tr>
            )}

            {isError && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-red-500">
                  Failed to load projects. Please try again.
                </td>
              </tr>
            )}

            {!isLoading && !isError && projects.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  No projects found.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              projects.map((project: any) => (
                <tr key={project.id} className="border-t border-border">
                  <td className="px-6 py-4" title={project.id}>
                    {project.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4">{project.proposalRefNo}</td>
                  <td className="px-6 py-4">{project.district}</td>
                  <td className="px-6 py-4">{project.contractor}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-secondary rounded-full text-xs font-medium text-white">
                      {project.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {project.status !== "Completed" && (
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setActiveTab("entry");
                          }}
                          className="px-3 py-1.5 text-sm bg-primary cursor-pointer text-primary-foreground rounded-md transition-opacity hover:opacity-90 whitespace-nowrap"
                        >
                          Add Data
                        </button>
                      )}
                      {project.status === "In Progress" &&
                        !project.isBillingEnsured && (
                          <button
                            onClick={() =>
                              ensureBillingMutation.mutate(project.proposalId)
                            }
                            disabled={ensureBillingMutation.isPending}
                            className="px-3 py-1.5 text-sm bg-green-600 cursor-pointer text-white rounded-md transition-opacity hover:bg-green-700 disabled:opacity-50 whitespace-nowrap"
                          >
                            {ensureBillingMutation.isPending &&
                            ensureBillingMutation.variables ===
                              project.proposalId
                              ? "Processing..."
                              : "Ensure Billing"}
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* EXECUTION FORM */}
      {selectedProject && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-lg">
                Project Execution & Monitoring
              </h3>
              <p className="text-sm text-muted-foreground">
                Updating data for Proposal:{" "}
                <span className="font-semibold text-foreground">
                  {selectedProject.proposalRefNo}
                </span>
              </p>
            </div>
            <button
              onClick={() => setSelectedProject(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex space-x-4 border-b border-border mb-6 overflow-x-auto">
            {[
              { id: "entry", label: "Entry Details" },
              { id: "mpr", label: "Monthly Progress Reports (MPR)" },
              { id: "photos", label: "Geo Tagged Photos" },
              { id: "documents", label: "Supporting Documents" },
            ].map((tab) => {
              const isDisabled = tab.id !== "entry" && !isEntrySaved;

              return (
                <button
                  key={tab.id}
                  disabled={isDisabled}
                  onClick={() => {
                    if (!isDisabled) setActiveTab(tab.id as any);
                  }}
                  title={isDisabled ? "Please save Entry Details first" : ""}
                  className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : isDisabled
                        ? "border-transparent text-muted-foreground/40 cursor-not-allowed"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT */}
          <div className="min-h-62.5 relative">
            {isDetailsLoading && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                <span className="text-muted-foreground">
                  Loading details...
                </span>
              </div>
            )}

            {/* ENTRY DETAILS TAB */}
            {activeTab === "entry" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h4 className="font-semibold mb-4">Entry Details</h4>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Date of Entry into System
                    </label>
                    <input
                      type="date"
                      value={entryDetails.entryDate}
                      onChange={(e) =>
                        setEntryDetails({
                          ...entryDetails,
                          entryDate: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Project Start Date
                    </label>
                    <input
                      type="date"
                      value={entryDetails.startDate}
                      onChange={(e) =>
                        setEntryDetails({
                          ...entryDetails,
                          startDate: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Expected Completion Date
                    </label>
                    <input
                      type="date"
                      value={entryDetails.expectedCompletionDate}
                      onChange={(e) =>
                        setEntryDetails({
                          ...entryDetails,
                          expectedCompletionDate: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* MPR TAB */}
            {activeTab === "mpr" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h4 className="font-semibold mb-4">
                  Monthly Progress Reports (MPR)
                </h4>

                {/* Submit New MPR Form */}
                <div className="grid md:grid-cols-5 gap-3 mb-5 p-4 border border-border rounded-lg bg-muted/20">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Reporting Month
                    </label>
                    <input
                      type="month"
                      value={mprDetails.reportingMonth}
                      onChange={(e) =>
                        setMprDetails({
                          ...mprDetails,
                          reportingMonth: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg p-2 text-sm bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Report Date
                    </label>
                    <input
                      type="date"
                      value={mprDetails.reportDate}
                      onChange={(e) =>
                        setMprDetails({
                          ...mprDetails,
                          reportDate: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg p-2 text-sm bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Progress %
                    </label>
                    <input
                      type="number"
                      placeholder="Progress %"
                      value={mprDetails.progressPercent}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMprDetails({
                          ...mprDetails,
                          progressPercent: val === "" ? "" : Number(val),
                        });
                      }}
                      className="w-full border rounded-lg p-2 text-sm bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Remarks
                    </label>
                    <input
                      placeholder="Remarks"
                      value={mprDetails.remarks}
                      onChange={(e) =>
                        setMprDetails({
                          ...mprDetails,
                          remarks: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg p-2 text-sm bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Report File
                    </label>
                    <input
                      type="file"
                      onChange={(e) =>
                        setMprDetails({
                          ...mprDetails,
                          file: e.target.files?.[0] || null,
                        })
                      }
                      className="w-full border border-dashed rounded-lg p-1.5 text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-muted bg-background"
                    />
                  </div>
                </div>

                {/* Historic MPRs Table */}
                <div className="mt-8 border-t border-border pt-6">
                  <h5 className="font-semibold mb-4 text-sm">Submitted MPRs</h5>
                  <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">
                            Reporting Month
                          </th>
                          <th className="px-4 py-3 font-medium">Report Date</th>
                          <th className="px-4 py-3 font-medium">Progress %</th>
                          <th className="px-4 py-3 font-medium">Remarks</th>
                          <th className="px-4 py-3 font-medium text-center">
                            Document
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {isMprListLoading ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-4 text-center">
                              Loading previous MPRs...
                            </td>
                          </tr>
                        ) : mprList && mprList.length > 0 ? (
                          mprList.map((mpr: any) => (
                            <tr
                              key={mpr.id}
                              className="hover:bg-muted/50 transition-colors"
                            >
                              <td className="px-4 py-3">
                                {mpr.reportingMonth}
                              </td>
                              <td className="px-4 py-3">
                                {new Date(mpr.reportDate).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3">
                                {mpr.progressPercent}%
                              </td>
                              <td
                                className="px-4 py-3 max-w-50 truncate"
                                title={mpr.remarks}
                              >
                                {mpr.remarks}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {mpr.documentId ? (
                                  <button
                                    onClick={() => handleDownloadDocument(mpr)}
                                    className="inline-flex items-center justify-center p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors"
                                    title="Download Document"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <span className="text-muted-foreground text-xs">
                                    N/A
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-4 text-center text-muted-foreground"
                            >
                              No previous MPRs found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* GEO TAGGED PHOTOS TAB */}
            {activeTab === "photos" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold">Geo Tagged Photos</h4>
                  <button
                    onClick={addPhotoRow}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm transition-opacity hover:opacity-90"
                  >
                    + Add Photo
                  </button>
                </div>

                {photos.map((photo, index) => (
                  <div key={index} className="flex gap-2 mb-3 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        updatePhotoField(
                          index,
                          "file",
                          e.target.files?.[0] || null,
                        )
                      }
                      className="border rounded p-2 text-sm w-1/5"
                    />
                    <input
                      type="number"
                      placeholder="Latitude"
                      value={photo.latitude}
                      onChange={(e) =>
                        updatePhotoField(index, "latitude", e.target.value)
                      }
                      className="border rounded p-2 text-sm w-1/6"
                    />
                    <input
                      type="number"
                      placeholder="Longitude"
                      value={photo.longitude}
                      onChange={(e) =>
                        updatePhotoField(index, "longitude", e.target.value)
                      }
                      className="border rounded p-2 text-sm w-1/6"
                    />
                    <input
                      type="date"
                      value={photo.date}
                      onChange={(e) =>
                        updatePhotoField(index, "date", e.target.value)
                      }
                      className="border rounded p-2 text-sm w-1/6"
                    />
                    <input
                      placeholder="Site Description"
                      value={photo.description}
                      onChange={(e) =>
                        updatePhotoField(index, "description", e.target.value)
                      }
                      className="border rounded p-2 text-sm flex-1"
                    />
                    {photos.length > 1 && (
                      <button
                        onClick={() => removePhotoRow(index)}
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Remove row"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* SUPPORTING DOCUMENTS TAB */}
            {activeTab === "documents" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h4 className="font-semibold mb-4">Supporting Documents</h4>
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden mb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted text-muted-foreground border-b border-border">
                        <tr>
                          <th className="px-6 py-3 font-medium">
                            Document Name
                          </th>
                          <th className="px-6 py-3 font-medium text-center">
                            Upload Document
                          </th>
                          <th className="px-6 py-3 font-medium text-center">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {renderDocumentRow(
                          "Site Inspection Report",
                          "siteInspectionReport",
                        )}
                        {renderDocumentRow("TPQA Report", "tpqaReport")}
                        {renderDocumentRow(
                          "Utilization Certificate",
                          "utilizationCertificate",
                        )}
                        {renderDocumentRow(
                          "Completion Certificate",
                          "completionCertificate",
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SAVE & ACTION BUTTONS */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
            <button
              onClick={() => setSelectedProject(null)}
              className="px-6 py-2 cursor-pointer border border-border rounded-lg hover:bg-muted transition-colors"
              disabled={
                saveEntryMutation.isPending ||
                saveMprMutation.isPending ||
                savePhotosMutation.isPending ||
                saveDocumentsMutation.isPending ||
                markAsCompletedMutation.isPending
              }
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={
                saveEntryMutation.isPending ||
                saveMprMutation.isPending ||
                savePhotosMutation.isPending ||
                saveDocumentsMutation.isPending ||
                isDetailsLoading ||
                markAsCompletedMutation.isPending
              }
              className="px-6 py-2 cursor-pointer bg-primary text-primary-foreground rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saveEntryMutation.isPending ||
              saveMprMutation.isPending ||
              savePhotosMutation.isPending ||
              saveDocumentsMutation.isPending
                ? "Saving..."
                : "Save Details"}
            </button>

            {isEntrySaved && (
              <button
                onClick={() => markAsCompletedMutation.mutate()}
                disabled={markAsCompletedMutation.isPending}
                className="px-6 py-2 cursor-pointer bg-primary text-primary-foreground rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {markAsCompletedMutation.isPending
                  ? "Marking..."
                  : "Mark As Execution Completed"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
