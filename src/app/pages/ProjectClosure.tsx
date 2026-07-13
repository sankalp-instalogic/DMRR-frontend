import { useState, useMemo, useRef, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "../../utils/toast";
import { DatePicker, Modal } from "antd";
import dayjs from "dayjs";
import type { ColDef } from "ag-grid-community";
import { Table } from "../components/Table";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";
import { FileUpload } from "../components/FileUpload";
import { DocumentOwnerType } from "../../../constants/documents";

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
  fileValue,
  isApiRequired,
  onChange,
  onDateChange,
  onFileChange,
}: {
  label: string;
  value: string;
  dateValue?: string;
  fileValue?: File | null;
  requiresDocument: boolean;
  isApiRequired: boolean;
  onChange: (val: string) => void;
  onDateChange: (val: string) => void;
  onFileChange: (file: File | null) => void;
}) => (
  <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
    <label className="block font-medium mb-3 text-sm text-primary">
      {label}
      {isApiRequired && (
        <span className="text-destructive ml-1" title="Required Document">
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
            ? "bg-success text-primary-foreground shadow-sm border border-success"
            : "border border-border bg-card text-muted-foreground hover:bg-muted"
        }`}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange("No")}
        className={`px-6 py-2 rounded-lg transition-colors cursor-pointer text-sm font-medium ${
          value === "No"
            ? "bg-destructive text-primary-foreground shadow-sm border border-destructive"
            : "border border-border bg-card text-muted-foreground hover:bg-muted"
        }`}
      >
        No
      </button>
    </div>

    {value === "Yes" && (
      <div className="mt-4 grid md:grid-cols-2 gap-4 bg-card p-4 rounded-lg border border-border">
        <div>
          <label className="block mb-2 font-medium text-sm text-muted-foreground">
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
          <label className="block mb-2 font-medium text-sm text-muted-foreground">
            Upload Document
          </label>
          <FileUpload
            variant="compact"
            value={fileValue ?? null}
            onChange={onFileChange}
            accept=".pdf,.doc,.docx,image/*"
            buttonText="Select File"
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
  const [projectToClose, setProjectToClose] = useState<string | number | null>(
    null,
  );
  const [activeAction, setActiveAction] = useState<"checklist" | null>(null);
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

  const closeProjectMutation = useMutation({
    mutationFn: async (projectId: string | number) => {
      const response = await axios.post(`/api/v1/closures/${projectId}/close`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Project Closed Successfully");
      queryClient.invalidateQueries({ queryKey: ["closures"] });
      setProjectToClose(null); // Clear state to close modal
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to close project");
      setProjectToClose(null); // Clear state to close modal on error too
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
            formData.append("ownerType", String(DocumentOwnerType.Proposal));
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
    setChecklistData({});
    setChecklistDates({});
    setChecklistFiles({});
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
                  <Button
                    variant="destructive"
                    className="mt-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Open the confirmation dialog instead of mutating directly
                      setProjectToClose(project.projectId);
                    }}
                    disabled={closeProjectMutation.isPending}
                  >
                    {closeProjectMutation.isPending ? (
                      <>
                        <Spinner inline iconClassName="size-4" />
                        Closing...
                      </>
                    ) : (
                      "Close"
                    )}
                  </Button>
                )}

              {(project.closureStatus === "Pending" ||
                project.closureStatus === "Ready for Closure") &&
                !checklistDone && (
                  <Button
                    className="mt-2 text-xs hover:bg-info"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(project);
                      setActiveAction("checklist");
                    }}
                  >
                    Checklist
                  </Button>
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
        <h1 className="text-[30px] font-bold text-primary">
          Project Completion & Closure
        </h1>
        <p className="text-sm text-muted-foreground">
          Final asset handover and administrative closure
        </p>
      </div>

      {/* TABLE SECTION */}
      {isLoading ? (
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <Spinner label="Loading projects..." />
        </div>
      ) : isError ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-destructive shadow-sm">
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
              <h3 className="text-xl font-bold text-primary">
                Document Verification Checklist: {selectedProject.proposalRefNo}
              </h3>
              <button
                onClick={resetForms}
                className="text-muted-foreground hover:text-foreground text-sm font-medium cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>

            {isChecklistLoading ? (
              <div className="py-8">
                <Spinner label="Loading checklist items..." iconClassName="size-6" />
              </div>
            ) : checklistItems.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
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
                      fileValue={checklistFiles[item.itemNumber] ?? null}
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
                        setChecklistFiles((prev) => {
                          if (file === null) {
                            const next = { ...prev };
                            delete next[item.itemNumber];
                            return next;
                          }
                          return { ...prev, [item.itemNumber]: file };
                        })
                      }
                    />
                  ))}
                </div>

                <div className="pt-6 border-t border-border">
                  <h4 className="text-lg font-bold text-primary mb-4">
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
                className={`px-6 py-3 cursor-pointer text-primary-foreground rounded-lg transition-colors font-medium ${
                  saveChecklistMutation.isPending ||
                  isChecklistLoading ||
                  !isChecklistValid
                    ? "bg-info opacity-70 cursor-not-allowed"
                    : "bg-info hover:bg-info"
                }`}
              >
                {saveChecklistMutation.isPending ? (
                  <>
                    <Spinner inline iconClassName="size-4" />
                    Saving...
                  </>
                ) : (
                  "Submit Checklist"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      <Modal
        open={!!projectToClose}
        title="Are you absolutely sure?"
        centered
        onCancel={() => setProjectToClose(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setProjectToClose(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              disabled={closeProjectMutation.isPending}
              onClick={() => {
                if (projectToClose) closeProjectMutation.mutate(projectToClose);
              }}
            >
              {closeProjectMutation.isPending ? (
                <>
                  <Spinner inline iconClassName="size-4" />
                  Closing...
                </>
              ) : (
                "Close Project"
              )}
            </Button>
          </div>
        }
      >
        <p>
          Are you sure you want to close this project? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
}
