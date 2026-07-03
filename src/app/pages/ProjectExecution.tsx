import { useState, useEffect, useMemo } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Upload, CheckCircle2, XCircle, Trash2, Download } from "lucide-react";

// Ant Design Imports (Added Tabs)
import { Input, InputNumber, DatePicker, Tabs } from "antd";
import dayjs from "dayjs";

// Import your custom Table component (adjust path as needed)
import { Table } from "../components/Table";
import { Button } from "../components/ui/button";

export function ProjectExecution() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  // Pagination state for custom Table
  const [page, setPage] = useState(1);

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
      latitude: "" as number | string,
      longitude: "" as number | string,
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
    queryKey: ["projects", page],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Projects");
      return response.data;
    },
  });

  const projects = data?.items || [];
  const totalCount = data?.totalCount || projects.length;
  const totalPages = data?.totalPages || 1;

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
      return response.data;
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

  const handleDownloadDocument = async (doc: any) => {
    if (!doc?.id) return;
    try {
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
      <tr className="hover:bg-muted/50 transition-colors" key={docKey}>
        <td className="px-6 py-4 font-medium text-foreground">{docName}</td>
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
            <CheckCircle2 className="w-5 h-5 text-success mx-auto" />
          ) : (
            <XCircle className="w-5 h-5 text-destructive mx-auto" />
          )}
        </td>
      </tr>
    );
  };

  // AG-Grid Column Definitions
  const columnDefs = useMemo(
    () => [
      {
        headerName: "Project ID",
        field: "id",
        valueFormatter: (params: any) =>
          params.value ? `${params.value.substring(0, 8)}...` : "",
        tooltipField: "id",
      },
      { headerName: "Proposal ID", field: "proposalRefNo" },
      { headerName: "District", field: "district" },
      { headerName: "Contractor", field: "contractor" },
      {
        headerName: "Status",
        field: "status",
        cellRenderer: (params: any) => (
          <span className="px-2 py-1 bg-secondary rounded-full text-xs font-medium text-primary-foreground">
            {params.value}
          </span>
        ),
      },
      {
        headerName: "Action",
        cellRenderer: (params: any) => {
          const project = params.data;
          return (
            <div className="flex items-center gap-2 h-full">
              {project.status !== "Completed" && (
                <Button
                  size="sm"
                  className="text-xs whitespace-nowrap"
                  onClick={() => {
                    setSelectedProject(project);
                    setActiveTab("entry");
                  }}
                >
                  Add Data
                </Button>
              )}
              {project.status === "In Progress" &&
                !project.isBillingEnsured && (
                  <button
                    onClick={() =>
                      ensureBillingMutation.mutate(project.proposalId)
                    }
                    disabled={ensureBillingMutation.isPending}
                    className="px-2 py-1 text-xs bg-success cursor-pointer text-primary-foreground rounded-md transition-opacity hover:bg-success disabled:opacity-50 whitespace-nowrap"
                  >
                    {ensureBillingMutation.isPending &&
                    ensureBillingMutation.variables === project.proposalId
                      ? "Processing..."
                      : "Ensure Billing"}
                  </button>
                )}
            </div>
          );
        },
      },
    ],
    [ensureBillingMutation],
  );

  // Define Ant Design Tab Items
  const tabItems = [
    {
      key: "entry",
      label: <span className="font-bold text-base">Entry Details</span>,
      children: (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h4 className="font-semibold mb-4">Entry Details</h4>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Date of Entry into System
              </label>
              <DatePicker
                value={
                  entryDetails.entryDate ? dayjs(entryDetails.entryDate) : null
                }
                onChange={(_date, dateString) =>
                  setEntryDetails({
                    ...entryDetails,
                    entryDate: dateString as string,
                  })
                }
                className="w-full rounded-lg"
                size="large"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Project Start Date
              </label>
              <DatePicker
                value={
                  entryDetails.startDate ? dayjs(entryDetails.startDate) : null
                }
                onChange={(_date, dateString) =>
                  setEntryDetails({
                    ...entryDetails,
                    startDate: dateString as string,
                  })
                }
                className="w-full rounded-lg"
                size="large"
                minDate={dayjs()}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Expected Completion Date
              </label>
              <DatePicker
                value={
                  entryDetails.expectedCompletionDate
                    ? dayjs(entryDetails.expectedCompletionDate)
                    : null
                }
                onChange={(_date, dateString) =>
                  setEntryDetails({
                    ...entryDetails,
                    expectedCompletionDate: dateString as string,
                  })
                }
                className="w-full rounded-lg"
                size="large"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "mpr",
      label: (
        <span className="font-bold text-base">
          Monthly Progress Reports (MPR)
        </span>
      ),
      disabled: !isEntrySaved,
      children: (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h4 className="font-semibold mb-4">Monthly Progress Reports (MPR)</h4>

          {/* Submit New MPR Form */}
          <div className="grid md:grid-cols-5 gap-3 mb-5 p-4 border border-border rounded-lg bg-muted/20">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Reporting Month
              </label>
              <DatePicker
                picker="month"
                value={
                  mprDetails.reportingMonth
                    ? dayjs(mprDetails.reportingMonth)
                    : null
                }
                onChange={(_date, dateString) =>
                  setMprDetails({
                    ...mprDetails,
                    reportingMonth: dateString as string,
                  })
                }
                className="w-full rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Report Date
              </label>
              <DatePicker
                value={
                  mprDetails.reportDate ? dayjs(mprDetails.reportDate) : null
                }
                onChange={(_date, dateString) =>
                  setMprDetails({
                    ...mprDetails,
                    reportDate: dateString as string,
                  })
                }
                className="w-full rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Progress %
              </label>
              <InputNumber
                placeholder="Progress %"
                min={0}
                max={100}
                style={{ width: "100%" }}
                value={mprDetails.progressPercent as number}
                onChange={(val) =>
                  setMprDetails({ ...mprDetails, progressPercent: val ?? "" })
                }
                className="w-full rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Remarks
              </label>
              <Input
                placeholder="Remarks"
                value={mprDetails.remarks}
                onChange={(e) =>
                  setMprDetails({ ...mprDetails, remarks: e.target.value })
                }
                className="w-full rounded-lg py-1.25"
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
                    <th className="px-4 py-3 font-medium">Reporting Month</th>
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
                        <td className="px-4 py-3">{mpr.reportingMonth}</td>
                        <td className="px-4 py-3">
                          {new Date(mpr.reportDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">{mpr.progressPercent}%</td>
                        <td
                          className="px-4 py-3 max-w-50 truncate"
                          title={mpr.remarks}
                        >
                          {mpr.remarks}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {mpr.documentId ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-primary hover:bg-primary/10"
                              onClick={() => handleDownloadDocument(mpr)}
                              title="Download Document"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
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
      ),
    },
    {
      key: "photos",
      label: <span className="font-bold text-base">Geo Tagged Photos</span>,
      disabled: !isEntrySaved,
      children: (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold">Geo Tagged Photos</h4>
            <Button size="sm" onClick={addPhotoRow}>
              + Add Photo
            </Button>
          </div>

          {photos.map((photo, index) => (
            <div key={index} className="flex gap-2 mb-3 items-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  updatePhotoField(index, "file", e.target.files?.[0] || null)
                }
                className="border rounded p-2 text-sm w-1/5"
              />
              <InputNumber
                placeholder="Latitude"
                value={photo.latitude as number}
                onChange={(val) =>
                  updatePhotoField(index, "latitude", val ?? "")
                }
                className="w-1/6"
              />
              <InputNumber
                placeholder="Longitude"
                value={photo.longitude as number}
                onChange={(val) =>
                  updatePhotoField(index, "longitude", val ?? "")
                }
                className="w-1/6"
              />
              <DatePicker
                value={photo.date ? dayjs(photo.date) : null}
                onChange={(_date, dateString) =>
                  updatePhotoField(index, "date", dateString)
                }
                className="w-1/6"
              />
              <Input
                placeholder="Site Description"
                value={photo.description}
                onChange={(e) =>
                  updatePhotoField(index, "description", e.target.value)
                }
                className="flex-1"
              />
              {photos.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive-muted-foreground"
                  onClick={() => removePhotoRow(index)}
                  title="Remove row"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "documents",
      label: <span className="font-bold text-base">Supporting Documents</span>,
      disabled: !isEntrySaved,
      children: (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h4 className="font-semibold mb-4">Supporting Documents</h4>
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-3 font-medium">Document Name</th>
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
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] font-bold text-primary">Project Execution & Monitoring</h1>
        <p className="text-sm text-muted-foreground">
          Manage project progress and monitoring
        </p>
      </div>

      {/* PROJECT LIST USING CUSTOM TABLE COMPONENT */}
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground bg-card border border-border rounded-xl">
          Loading projects...
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-destructive bg-card border border-border rounded-xl">
          Failed to load projects. Please try again.
        </div>
      ) : (
        <Table
          rowData={projects}
          columnDefs={columnDefs}
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}

      {/* EXECUTION FORM */}
      {selectedProject && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm mt-6">
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

          {/* ANTD TABS IMPLEMENTATION */}
          <div className="min-h-62.5 relative">
            {isDetailsLoading && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                <span className="text-muted-foreground">
                  Loading details...
                </span>
              </div>
            )}

            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as any)}
              items={tabItems}
            />
          </div>

          {/* SAVE & ACTION BUTTONS */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setSelectedProject(null)}
              disabled={
                saveEntryMutation.isPending ||
                saveMprMutation.isPending ||
                savePhotosMutation.isPending ||
                saveDocumentsMutation.isPending ||
                markAsCompletedMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                saveEntryMutation.isPending ||
                saveMprMutation.isPending ||
                savePhotosMutation.isPending ||
                saveDocumentsMutation.isPending ||
                isDetailsLoading ||
                markAsCompletedMutation.isPending
              }
            >
              {saveEntryMutation.isPending ||
              saveMprMutation.isPending ||
              savePhotosMutation.isPending ||
              saveDocumentsMutation.isPending
                ? "Saving..."
                : "Save Details"}
            </Button>

            {isEntrySaved && (
              <Button
                onClick={() => markAsCompletedMutation.mutate()}
                disabled={markAsCompletedMutation.isPending}
              >
                {markAsCompletedMutation.isPending
                  ? "Marking..."
                  : "Mark As Execution Completed"}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
