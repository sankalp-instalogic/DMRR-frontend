import { useState, useMemo, useRef, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { DatePicker, Input } from "antd";
import dayjs from "dayjs";
import type { ColDef } from "ag-grid-community";
import { Table } from "../components/Table";
import { cn } from "../components/ui/utils";
import { buttonVariants } from "../components/ui/button";

// --- Type Definitions ---
export interface Project {
  projectId: number | string;
  proposalId: number | string;
  proposalRefNo: string;
  progressPercent: number;
  projectStatus: string;
  closureStatus: string;
  IsChecklistCompleted?: boolean;
  isChecklistCompleted?: boolean;
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

export interface ChecklistItem {
  itemNumber: number;
  particulars: string;
  requiresDocument: boolean;
  isApplicable: boolean;
  yesNo: boolean;
  itemDate: string | null;
  documentId: string | null;
  suggestedDocumentType: string;
  remarks: string | null;
}

// --- Components ---
const YesNoField = ({
  label,
  value,
  dateValue,
  isApiRequired,
  onChange,
  onDateChange,
  onFileChange,
}: {
  label: string;
  value: string;
  dateValue?: string;
  requiresDocument: boolean;
  isApiRequired: boolean;
  onChange: (val: string) => void;
  onDateChange: (val: string) => void;
  onFileChange: (file: File | null) => void;
}) => (
  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
    <label className="block font-medium mb-3 text-sm text-[#0B1F4D]">
      {label}
      {isApiRequired && (
        <span className="text-red-500 ml-1" title="Required Document">
          *
        </span>
      )}
    </label>
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => onChange("Yes")}
        className={`px-6 py-2 rounded-lg transition-colors cursor-pointer text-sm font-medium ${
          value === "Yes"
            ? "bg-green-600 text-white shadow-sm border border-green-600"
            : "border border-border bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange("No")}
        className={`px-6 py-2 rounded-lg transition-colors cursor-pointer text-sm font-medium ${
          value === "No"
            ? "bg-red-600 text-white shadow-sm border border-red-600"
            : "border border-border bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        No
      </button>
    </div>

    {value === "Yes" && (
      <div className="mt-4 grid md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-gray-100">
        <div>
          <label className="block mb-2 font-medium text-sm text-gray-600">
            Select Date
          </label>
          <DatePicker
            className="w-full h-10 border rounded-lg cursor-pointer"
            format="YYYY-MM-DD"
            value={dateValue ? dayjs(dateValue) : null}
            onChange={(_date, dateString) => {
              const str =
                typeof dateString === "string"
                  ? dateString
                  : (dateString?.[0] ?? "");
              onDateChange(str);
            }}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium text-sm text-gray-600">
            Upload Document
          </label>
          <Input
            type="file"
            size="large"
            onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          />
        </div>
      </div>
    )}
  </div>
);

export function ProjectClosure() {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();

  // --- Refs & Effects ---
  const formContainerRef = useRef<HTMLDivElement>(null);

  // --- State ---
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeAction, setActiveAction] = useState<
    "checklist" | "completion" | null
  >(null);
  const [page, setPage] = useState(1);
  const [checklistPage, setChecklistPage] = useState(1);

  // Scroll into view whenever a form action is triggered
  useEffect(() => {
    if (activeAction && formContainerRef.current) {
      // Adding a slight timeout ensures the DOM has updated before scrolling
      setTimeout(() => {
        formContainerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [activeAction]);

  // Completion Form State
  const [isCompleted, setIsCompleted] = useState<"Yes" | "No" | "">("");
  const [completionData, setCompletionData] = useState<CompletionData>({
    completionDate: "",
    certificateDate: "",
    completionCertificate: null,
    socialAuditFiles: [],
  });

  // Checklist Form State
  const [checklistData, setChecklistData] = useState<Record<number, string>>(
    {},
  );
  const [checklistDates, setChecklistDates] = useState<Record<number, string>>(
    {},
  );
  const [checklistFiles, setChecklistFiles] = useState<
    Record<number, File | null>
  >({});

  // --- Queries & Mutations ---

  // 1. Fetch Projects
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

  // 2. Fetch Dynamic Checklist Items
  const { data: checklistResponse, isLoading: isChecklistLoading } = useQuery({
    queryKey: ["checklist", selectedProject?.projectId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/v1/closures/${selectedProject?.projectId}/checklist`,
      );
      return response.data;
    },
    enabled: !!selectedProject && activeAction === "checklist",
  });

  const checklistItems: ChecklistItem[] = checklistResponse?.items || [];

  const uploadDocument = async (file: File, documentType: number) => {
    if (!selectedProject) throw new Error("No project selected");
    const formData = new FormData();
    formData.append("ownerType", "1");
    formData.append("documentType", documentType.toString());
    formData.append("ownerId", selectedProject.proposalId.toString());
    formData.append("file", file);

    return axios.post("/api/v1/Documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const saveCompletionMutation = useMutation({
    mutationFn: async (payload: CompletionPayload) => {
      if (!selectedProject) throw new Error("No project selected");
      const response = await axios.post(
        `/api/v1/closures/${selectedProject.projectId}/completion`,
        payload,
      );
      return response.data;
    },
    onSuccess: async () => {
      toast.success("Project Completion Saved Successfully");
      const uploadPromises: Promise<any>[] = [];

      if (completionData.completionCertificate)
        uploadPromises.push(
          uploadDocument(completionData.completionCertificate, 18),
        );
      if (completionData.socialAuditFiles?.length > 0) {
        completionData.socialAuditFiles.forEach((file) =>
          uploadPromises.push(uploadDocument(file, 38)),
        );
      }

      if (uploadPromises.length > 0) {
        const toastId = toast.loading("Uploading documents...");
        try {
          await Promise.all(uploadPromises);
          toast.success("All documents uploaded successfully!", {
            id: toastId,
          });
        } catch (uploadError) {
          toast.error("Data saved, but some documents failed to upload.", {
            id: toastId,
          });
        }
      }

      resetForms();
      queryClient.invalidateQueries({ queryKey: ["closures"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to save project closure",
      );
    },
  });

  const closeProjectMutation = useMutation({
    mutationFn: async (projectId: string | number) => {
      const response = await axios.post(`/api/v1/closures/${projectId}/close`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Project Closed Successfully");
      queryClient.invalidateQueries({ queryKey: ["closures"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to close project");
    },
  });

  const getDocumentType = (itemNumber: number) => 42 + itemNumber;

  // Checklist Mutation
  const saveChecklistMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProject) throw new Error("No project selected");

      const formattedItems = await Promise.all(
        checklistItems.map(async (item) => {
          const isYes = checklistData[item.itemNumber] === "Yes";
          const file = checklistFiles[item.itemNumber];
          let documentId = item.documentId || null;

          if (isYes && file) {
            const docType = getDocumentType(item.itemNumber);

            const formData = new FormData();
            formData.append("ownerType", "1");
            formData.append("ownerId", selectedProject.proposalId.toString());
            formData.append("documentType", docType.toString());
            formData.append("file", file);

            const uploadRes = await axios.post(
              "/api/v1/Documents/upload",
              formData,
              {
                headers: { "Content-Type": "multipart/form-data" },
              },
            );

            documentId = uploadRes.data?.documentId || uploadRes.data.id;
          }

          const rawDate = checklistDates[item.itemNumber];
          const itemDate = rawDate ? new Date(rawDate).toISOString() : null;

          return {
            itemNumber: item.itemNumber,
            particulars: item.particulars,
            requiresDocument: item.requiresDocument,
            isApplicable: item.isApplicable,
            yesNo: isYes,
            itemDate: itemDate,
            documentId: documentId,
            suggestedDocumentType: item.suggestedDocumentType || null,
            remarks: item.remarks || "",
          };
        }),
      );

      const finalPayload = {
        items: formattedItems,
      };

      const response = await axios.post(
        `/api/v1/closures/${selectedProject.projectId}/checklist`,
        finalPayload,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Checklist and Documents Saved Successfully");
      resetForms();
      queryClient.invalidateQueries({ queryKey: ["closures"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to save checklist");
    },
  });

  // --- Handlers ---
  const resetForms = () => {
    setSelectedProject(null);
    setActiveAction(null);
    setIsCompleted("");
    setCompletionData({
      completionDate: "",
      certificateDate: "",
      completionCertificate: null,
      socialAuditFiles: [],
    });
    setChecklistData({});
    setChecklistDates({});
    setChecklistFiles({});
  };

  const handleSaveCompletion = () => {
    if (!selectedProject) return toast.error("Please select a project first.");
    if (!isCompleted)
      return toast.error("Please select whether the project is completed.");

    const formatToISO = (dateStr: string): string | null =>
      dateStr ? new Date(dateStr).toISOString() : null;

    const payload: CompletionPayload = {
      isCompleted: isCompleted === "Yes",
      completionDate: formatToISO(completionData.completionDate),
      certificateIssuedDate: formatToISO(completionData.certificateDate),
    };
    saveCompletionMutation.mutate(payload);
  };

  const handleSaveChecklist = () => {
    if (!selectedProject) return toast.error("Please select a project first.");
    saveChecklistMutation.mutate();
  };

  // --- AG-Grid Configurations ---
  const rowClassRules = useMemo(
    () => ({
      "bg-primary/5": (params: any) =>
        selectedProject?.projectId === params.data.projectId,
    }),
    [selectedProject],
  );

  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: "proposalRefNo", headerName: "Proposal Ref No", flex: 1 },
      {
        field: "progressPercent",
        headerName: "Progress",
        valueFormatter: (params) => `${params.value}%`,
        cellClass: "font-bold text-accent",
        flex: 1,
      },
      { field: "projectStatus", headerName: "Project Status", flex: 1 },
      {
        field: "closureStatus",
        headerName: "Closure Status",
        flex: 1,
        cellRenderer: (params: any) => (
          <span className="px-2 py-1 bg-secondary/20 text-secondary rounded-full text-xs">
            {params.value}
          </span>
        ),
      },
      {
        headerName: "Action",
        flex: 1,
        pinned: "right",
        cellRenderer: (params: any) => {
          const project = params.data;
          const checklistDone =
            project.IsChecklistCompleted || project.isChecklistCompleted;

          return (
            <div className="flex gap-2 items-center">
              {project.closureStatus === "Ready for Closure" &&
                checklistDone && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeProjectMutation.mutate(project.projectId);
                    }}
                    disabled={closeProjectMutation.isPending}
                    className={`px-4 py-2 mt-2 cursor-pointer text-white rounded-lg text-xs font-medium transition-colors ${
                      closeProjectMutation.isPending
                        ? "bg-red-400 opacity-70"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {closeProjectMutation.isPending ? "Closing..." : "Close"}
                  </button>
                )}

              {project.closureStatus === "Pending" && checklistDone && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProject(project);
                    setActiveAction("completion");
                  }}
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "cursor-pointer mt-2",
                  )}
                >
                  Add completion details
                </button>
              )}

              {(project.closureStatus === "Pending" ||
                project.closureStatus === "Ready for Closure") &&
                !checklistDone && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(project);
                      setActiveAction("checklist");
                    }}
                    className="px-4 py-2 bg-primary mt-2 cursor-pointer text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                  >
                    Checklist
                  </button>
                )}
            </div>
          );
        },
      },
    ],
    [],
  );

  const checklistColumnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: "particulars",
        headerName: "Particulars",
        flex: 2,
        wrapText: true,
        autoHeight: true,
      },
      {
        field: "yesNo",
        headerName: "Yes / No",
        width: 120,
        cellRenderer: (params: any) => (params.value ? "Yes" : "No"),
      },
      {
        field: "documentId",
        headerName: "Document Uploaded",
        width: 180,
        cellRenderer: (params: any) => (params.value ? "✅ Yes" : "❌ No"),
      },
    ],
    [],
  );

  const isChecklistValid = checklistItems.every((item) => {
    if (item.requiresDocument) {
      const hasNewFile = !!checklistFiles[item.itemNumber];
      const hasExistingDoc = !!item.documentId;
      return hasNewFile || hasExistingDoc;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1>Project Completion & Closure</h1>
        <p className="text-sm text-muted-foreground">
          Final asset handover and administrative closure
        </p>
      </div>

      {/* TABLE SECTION */}
      {isLoading ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground shadow-sm">
          Loading projects...
        </div>
      ) : isError ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-red-500 shadow-sm">
          Failed to load projects.
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground shadow-sm">
          No projects ready for closure found.
        </div>
      ) : (
        <Table
          rowData={projects}
          columnDefs={columnDefs}
          totalCount={projects.length}
          page={page}
          totalPages={1}
          onPageChange={setPage}
          rowClassRules={rowClassRules}
        />
      )}

      {/* CONDITIONAL FORMS WRAPPER (Target for smooth scrolling) */}
      <div ref={formContainerRef} className="scroll-mt-6">
        {/* CHECKLIST FORM SECTION */}
        {selectedProject && activeAction === "checklist" && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-[#0B1F4D]">
                Document Verification Checklist: {selectedProject.proposalRefNo}
              </h3>
              <button
                onClick={resetForms}
                className="text-gray-500 hover:text-gray-800 text-sm font-medium cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>

            {isChecklistLoading ? (
              <div className="py-8 text-center text-gray-500">
                Loading checklist items...
              </div>
            ) : checklistItems.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No checklist items found for this project.
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-2">
                  {checklistItems.map((item) => (
                    <YesNoField
                      key={item.itemNumber}
                      label={`${item.itemNumber}. ${item.particulars}`}
                      value={checklistData[item.itemNumber] || ""}
                      dateValue={checklistDates[item.itemNumber]}
                      requiresDocument={item.requiresDocument}
                      isApiRequired={item.requiresDocument}
                      onChange={(val) =>
                        setChecklistData((prev) => ({
                          ...prev,
                          [item.itemNumber]: val,
                        }))
                      }
                      onDateChange={(val) =>
                        setChecklistDates((prev) => ({
                          ...prev,
                          [item.itemNumber]: val,
                        }))
                      }
                      onFileChange={(file) =>
                        setChecklistFiles((prev) => ({
                          ...prev,
                          [item.itemNumber]: file,
                        }))
                      }
                    />
                  ))}
                </div>

                <div className="pt-6 border-t border-border">
                  <h4 className="text-lg font-bold text-[#0B1F4D] mb-4">
                    Existing Checklist Status
                  </h4>
                  <Table
                    rowData={checklistItems}
                    columnDefs={checklistColumnDefs}
                    totalCount={checklistItems.length}
                    page={checklistPage}
                    totalPages={1}
                    onPageChange={setChecklistPage}
                  />
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-border flex items-center gap-4">
              <button
                onClick={handleSaveChecklist}
                disabled={
                  saveChecklistMutation.isPending ||
                  isChecklistLoading ||
                  !isChecklistValid
                }
                className={`px-6 py-3 cursor-pointer text-white rounded-lg transition-colors font-medium ${
                  saveChecklistMutation.isPending ||
                  isChecklistLoading ||
                  !isChecklistValid
                    ? "bg-blue-400 opacity-70 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {saveChecklistMutation.isPending
                  ? "Saving..."
                  : "Submit Checklist"}
              </button>
            </div>
          </div>
        )}

        {/* COMPLETION FORM SECTION */}
        {selectedProject && activeAction === "completion" && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-[#0B1F4D]">
                Final Project Completion: {selectedProject.proposalRefNo}
              </h3>
              <button
                onClick={resetForms}
                className="text-gray-500 hover:text-gray-800 text-sm font-medium"
              >
                ✕ Cancel
              </button>
            </div>

            <div className="mb-6">
              <label className="block font-medium mb-3">
                Is Project Completed?
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsCompleted("Yes")}
                  className={`px-4 py-2 cursor-pointer rounded-lg transition-colors ${
                    isCompleted === "Yes" ? "bg-green-600 text-white" : "border"
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setIsCompleted("No")}
                  className={`px-4 py-2 cursor-pointer rounded-lg transition-colors ${
                    isCompleted === "No" ? "bg-red-600 text-white" : "border"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {isCompleted === "Yes" && (
              <div className="space-y-6 bg-gray-50 p-5 rounded-lg border border-gray-100">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 font-medium text-sm">
                      Date of Completion
                    </label>
                    <DatePicker
                      className="w-full h-10 border rounded-lg cursor-pointer"
                      format="YYYY-MM-DD"
                      value={
                        completionData.completionDate
                          ? dayjs(completionData.completionDate)
                          : null
                      }
                      onChange={(_date, dateString) =>
                        setCompletionData({
                          ...completionData,
                          completionDate:
                            typeof dateString === "string"
                              ? dateString
                              : Array.isArray(dateString)
                                ? (dateString[0] ?? "")
                                : "",
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-sm">
                      Date of Completion Certificate Issued
                    </label>
                    <DatePicker
                      className="w-full h-10 border rounded-lg cursor-pointer"
                      format="YYYY-MM-DD"
                      value={
                        completionData.certificateDate
                          ? dayjs(completionData.certificateDate)
                          : null
                      }
                      onChange={(_date, dateString) =>
                        setCompletionData({
                          ...completionData,
                          certificateDate:
                            typeof dateString === "string"
                              ? dateString
                              : Array.isArray(dateString)
                                ? (dateString[0] ?? "")
                                : "",
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-sm">
                    Upload Completion Certificate
                  </label>
                  <Input
                    type="file"
                    size="large"
                    className="w-full border rounded-lg p-2 cursor-pointer bg-white"
                    onChange={(e) =>
                      setCompletionData({
                        ...completionData,
                        completionCertificate: e.target.files?.[0] || null,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-sm">
                    Upload Social Audit Files
                  </label>
                  <Input
                    type="file"
                    size="large"
                    multiple
                    className="w-full border rounded-lg p-2 cursor-pointer bg-white"
                    onChange={(e) =>
                      setCompletionData({
                        ...completionData,
                        socialAuditFiles: Array.from(e.target.files || []),
                      })
                    }
                  />
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-border flex items-center gap-4">
              <button
                onClick={handleSaveCompletion}
                disabled={saveCompletionMutation.isPending}
                className={`px-6 py-3 cursor-pointer bg-green-600 text-white rounded-lg transition-colors font-medium ${
                  saveCompletionMutation.isPending
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-green-700"
                }`}
              >
                {saveCompletionMutation.isPending
                  ? "Saving..."
                  : "Save Completion Details"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
