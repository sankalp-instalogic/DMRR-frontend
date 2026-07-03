import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate"; // Adjust path as needed
import toast from "react-hot-toast";
import { Table } from "../components/Table";
import type { ColDef } from "ag-grid-community"; // Added for typing
import { cn } from "../components/ui/utils";
import { buttonVariants } from "../components/ui/button";

export function ProcurementClosure() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  // --- Table States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // --- Closure Form States ---
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState("");
  const closureFormRef = useRef<HTMLDivElement>(null);

  interface CompletionDataState {
    completionCertificate: File | null;
    socialAuditFiles: File[];
  }

  // Cleaned up state: only keeping certificate and audit files
  const [completionData, setCompletionData] = useState<CompletionDataState>({
    completionCertificate: null,
    socialAuditFiles: [],
  });

  // --- API Queries ---
  const {
    data: tenders = [],
    isLoading: isTendersLoading,
    isError: isTendersError,
  } = useQuery({
    queryKey: ["procurement-tenders"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/procurement-tenders");
      return response.data;
    },
  });

  const {
    data: procurementResponse,
    isLoading: isProcurementLoading,
    isError: isProcurementError,
  } = useQuery({
    queryKey: ["procurements", page],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Procurements", {
        params: {
          Page: page,
          PageSize: pageSize,
          status: "Completed",
        },
      });
      return response.data;
    },
  });

  const { data: districtsData } = useQuery({
    queryKey: ["districts-dropdown"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/districts", {
        params: { page: 1, pageSize: 100 },
      });
      return response.data;
    },
  });

  const { data: deptData } = useQuery({
    queryKey: ["departments-dropdown"],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        "/api/v1/masters/line-departments",
        {
          params: { page: 1, pageSize: 100 },
        },
      );
      return response.data;
    },
  });

  // Mutations remain identical...
  const completeStageMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosPrivate.post(
        `/api/v1/procurement-tenders/${id}/stages/complete`,
        { stageName: "Closed", documentId: null },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Procurement closed successfully");
    },
    onError: (error) => {
      console.error("Failed to mark project for closure:", error);
    },
  });

  const markForClosureMutation = useMutation({
    mutationFn: async (procurementId: string) => {
      const response = await axiosPrivate.post(
        `/api/v1/Procurements/${procurementId}/committees/6/decision`,
        {
          approved: true,
          decisionDate: new Date().toISOString(),
          documentId: null,
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procurements"] });
    },
    onError: (error) => {
      console.error("Error marking procurement for closure:", error);
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async ({
      file,
      ownerId,
      ownerType,
      documentType,
    }: {
      file: File;
      ownerId: string;
      ownerType: number;
      documentType: number;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("ownerId", ownerId);
      formData.append("ownerType", ownerType.toString());
      formData.append("documentType", documentType.toString());

      const response = await axiosPrivate.post(
        "/api/v1/Documents/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    },
    onError: (error) => {
      console.error("Failed to upload document:", error);
      toast.error("Failed to upload a document.");
    },
  });

  // --- Data Processing ---
  const procurementItems = procurementResponse?.items ?? [];
  const totalItems = procurementResponse?.totalCount ?? 0;
  const totalPages = procurementResponse?.totalPages ?? 1;
  const districts = districtsData?.items ?? [];
  const departments = deptData?.items ?? [];

  const getDemandLocationName = (row: any) => {
    if (row.demandFrom === "Districts" && row.districtId) {
      const dist = districts.find((d: any) => d.id === row.districtId);
      return dist ? `${dist.name}` : "Loading District...";
    }
    if (row.demandFrom === "Other Departments" && row.departmentId) {
      const dept = departments.find((d: any) => d.id === row.departmentId);
      return dept ? `${dept.name}` : "Loading Department...";
    }
    return row.demandFrom || "N/A";
  };

  const getStatusStyles = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (
      s.includes("published") ||
      s.includes("active") ||
      s.includes("approved")
    ) {
      return "bg-success-muted text-success border-success-border";
    }
    if (
      s.includes("closed") ||
      s.includes("rejected") ||
      s.includes("cancelled")
    ) {
      return "bg-destructive-muted text-destructive border-destructive-border";
    }
    if (s.includes("draft") || s.includes("pending")) {
      return "bg-warning-muted text-warning border-warning-border";
    }
    return "bg-info-muted text-info border-info-border";
  };

  const filteredTenders = tenders.filter((tender: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      tender.tenderTitle?.toLowerCase().includes(searchLower) ||
      tender.tenderRefNo?.toLowerCase().includes(searchLower) ||
      tender.tenderCode?.toLowerCase().includes(searchLower) ||
      tender.organizationChain?.toLowerCase().includes(searchLower)
    );
  });

  // --- Handlers ---
  const handleSelectForClosure = (item: any, type: string) => {
    setSelectedItem({ ...item, itemType: type });
    setIsCompleted("");
    setCompletionData({
      completionCertificate: null,
      socialAuditFiles: [],
    });
  };

  const handleSaveClosure = async () => {
    if (!selectedItem) return;

    const itemId = selectedItem.id || selectedItem.procurementId;
    const isTender = selectedItem.itemType === "tender";
    const ownerType = isTender ? 15 : 2;

    try {
      if (isTender) {
        await completeStageMutation.mutateAsync(itemId);
      } else {
        await markForClosureMutation.mutateAsync(itemId);
      }

      if (isCompleted === "Yes") {
        const uploadPromises = [];

        if (completionData.completionCertificate) {
          uploadPromises.push(
            uploadDocumentMutation.mutateAsync({
              file: completionData.completionCertificate,
              ownerId: itemId,
              ownerType: ownerType,
              documentType: 38,
            }),
          );
        }

        if (
          completionData.socialAuditFiles &&
          completionData.socialAuditFiles.length > 0
        ) {
          for (const file of completionData.socialAuditFiles) {
            uploadPromises.push(
              uploadDocumentMutation.mutateAsync({
                file: file,
                ownerId: itemId,
                ownerType: ownerType,
                documentType: 18,
              }),
            );
          }
        }

        if (uploadPromises.length > 0) {
          await Promise.all(uploadPromises);
          toast.success("All documents uploaded successfully");
        }
      }

      toast.success(
        `Closure completed for ${selectedItem.tenderRefNo || selectedItem.procurementRefNo || "the selected item"}`,
      );
      setSelectedItem(null);
      setIsCompleted("");
      setCompletionData({ completionCertificate: null, socialAuditFiles: [] });

      if (isTender) {
        queryClient.invalidateQueries({ queryKey: ["procurement-tenders"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["procurements"] });
      }
    } catch (error) {
      console.error("Error during closure workflow:", error);
      toast.error("An error occurred during the closure process.");
    }
  };

  useEffect(() => {
    if (selectedItem && closureFormRef.current) {
      // Adding a tiny timeout ensures the browser has painted the new element
      // before trying to calculate its position for scrolling.
      setTimeout(() => {
        closureFormRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [selectedItem]);

  // --- AG Grid Column Definitions ---
  const tenderColumnDefs: ColDef[] = useMemo(
    () => [
      {
        field: "tenderTitle",
        headerName: "Tender Title",
        flex: 1,
        minWidth: 250,
      },
      {
        field: "tenderRefNo",
        headerName: "Tender Ref No",
        flex: 1,
        minWidth: 180,
      },
      { field: "tenderCode", headerName: "Tender ID", flex: 1, minWidth: 150 },
      {
        field: "organisationChain",
        headerName: "Organizational Chain",
        flex: 1,
        minWidth: 200,
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        minWidth: 150,
        cellRenderer: (params: any) => (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyles(params.value)}`}
          >
            {params.value || "Unknown"}
          </span>
        ),
      },
      {
        headerName: "Actions",
        flex: 1,
        minWidth: 160,
        sortable: false,
        filter: false,
        pinned: "right", // Optional: pins the action column so it's always visible when scrolling
        cellRenderer: (params: any) => (
          <button
            onClick={() => handleSelectForClosure(params.data, "tender")}
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "cursor-pointer",
            )}
          >
            Project Closure
          </button>
        ),
      },
    ],
    [handleSelectForClosure], // Best practice to include this if linting complains
  );

  const procurementColumnDefs: ColDef[] = useMemo(
    () => [
      {
        field: "procurementRefNo",
        headerName: "Procurement Ref No",
        flex: 1,
        valueGetter: (p) => p.data.procurementRefNo || "N/A",
      },
      { field: "financialYear", headerName: "Financial Year", flex: 1 },
      { field: "itemName", headerName: "Item Name", flex: 2 },
      {
        headerName: "Demand From",
        flex: 1,
        valueGetter: (params) => getDemandLocationName(params.data),
      },
      {
        field: "totalQuantity",
        headerName: "Total Quantity",
        flex: 1,
        valueGetter: (p) => p.data.totalQuantity ?? 0,
      },
      {
        field: "awardCostInclGstLakhs",
        headerName: "Award Cost (Lakhs)",
        flex: 1,
        valueFormatter: (params) =>
          `₹${params.value?.toLocaleString("en-IN") || "0"}`,
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        cellRenderer: (params: any) => (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyles(params.value)}`}
          >
            {params.value || "Unknown"}
          </span>
        ),
      },
      // New Actions Column
      {
        headerName: "Actions",
        flex: 1,
        minWidth: 160,
        sortable: false,
        filter: false,
        pinned: "right",
        cellRenderer: (params: any) => (
          <button
            onClick={() => handleSelectForClosure(params.data, "procurement")}
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "cursor-pointer",
            )}
          >
            Project Closure
          </button>
        ),
      },
    ],
    [districts, departments],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold text-primary">
            Procurement Completion & Closure
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage tenders, procurement records, and final asset handovers
          </p>
        </div>
      </div>

      {/* --- TABLE 1: ALL TENDERS --- */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/50">
          <h2 className="text-lg font-semibold text-primary">All Tenders</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tenders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
            />
          </div>
        </div>

        {isTendersLoading ? (
          <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
            <Loader2 className="size-6 animate-spin mb-2 text-secondary" />
            <p>Loading tenders...</p>
          </div>
        ) : isTendersError ? (
          <div className="p-8 text-center text-destructive">
            Failed to load tenders. Please try again later.
          </div>
        ) : filteredTenders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No tenders found.
          </div>
        ) : (
          <Table
            rowData={filteredTenders}
            columnDefs={tenderColumnDefs}
            totalCount={filteredTenders.length}
            page={1}
            totalPages={1}
            onPageChange={() => {}}
            // onRowClicked is REMOVED
            rowClassRules={{
              "bg-info-muted/80 border-l-4 border-secondary": (params) =>
                selectedItem?.id ===
                (params.data.id || params.data.procurementId),
              "hover:bg-muted/50": () => true, // Kept hover, removed cursor-pointer
            }}
          />
        )}
      </div>

      {/* --- TABLE 2: PROCUREMENT RECORDS --- */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/50">
          <h2 className="text-lg font-semibold text-primary">
            Pending Procurement Records
          </h2>
        </div>

        {isProcurementLoading ? (
          <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
            <Loader2 className="size-6 animate-spin mb-2 text-secondary" />
            <p>Loading procurement data...</p>
          </div>
        ) : isProcurementError ? (
          <div className="p-8 text-center text-destructive font-medium">
            Failed to fetch procurement records. Please try again.
          </div>
        ) : procurementItems.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No procurement records found.
          </div>
        ) : (
          <Table
            rowData={procurementItems}
            columnDefs={procurementColumnDefs}
            totalCount={totalItems}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            // onRowClicked is REMOVED
            rowClassRules={{
              "bg-info-muted/80 border-l-4 border-secondary": (params) =>
                selectedItem?.id === params.data.id,
              "hover:bg-muted/50": () => true, // Kept hover, removed cursor-pointer
            }}
          />
        )}
      </div>

      {/* --- CLOSURE FORM SECTION --- */}
      {selectedItem && (
        <div ref={closureFormRef} className="bg-card border border-border rounded-xl p-6 shadow-sm mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h3 className="mb-6 text-xl font-bold border-b pb-4 text-primary">
            Project Closure:{" "}
            <span className="text-muted-foreground font-medium">
              {selectedItem.tenderRefNo ||
                selectedItem.procurementRefNo ||
                selectedItem.id}
            </span>
          </h3>

          {/* PROJECT COMPLETED QUESTION */}
          <div className="mb-6">
            <label className="block font-semibold mb-3 text-primary">
              Is Project Completed?
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setIsCompleted("Yes")}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  isCompleted === "Yes"
                    ? "bg-success text-success-foreground shadow-md"
                    : "border border-border hover:bg-muted"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setIsCompleted("No")}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  isCompleted === "No"
                    ? "bg-destructive text-destructive-foreground shadow-md"
                    : "border border-border hover:bg-muted"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* FORM FIELDS (Visible only if YES) */}
          {isCompleted === "Yes" && (
            <div className="space-y-6 bg-gray-50/50 p-6 rounded-lg border border-border">
              <div className="grid md:grid-cols-2 gap-6">
                {/* COMPLETION CERTIFICATE */}
                <div>
                  <label className="block mb-2 font-medium text-sm text-primary">
                    Upload Completion Certificate
                  </label>
                  <input
                    type="file"
                    className="w-full border border-border rounded-lg p-2 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#1E5AA8]/10 file:text-[#1E5AA8] hover:file:bg-[#1E5AA8]/20"
                    onChange={(e) =>
                      setCompletionData({
                        ...completionData,
                        completionCertificate: e.target.files?.[0] || null,
                      })
                    }
                  />
                </div>

                {/* SOCIAL AUDIT FILES */}
                <div>
                  <label className="block mb-2 font-medium text-sm text-primary">
                    Upload Social Audit File
                  </label>
                  <input
                    type="file"
                    multiple
                    className="w-full border border-border rounded-lg p-2 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#1E5AA8]/10 file:text-[#1E5AA8] hover:file:bg-[#1E5AA8]/20"
                    onChange={(e) =>
                      setCompletionData({
                        ...completionData,
                        socialAuditFiles: Array.from(e.target.files || []),
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* SAVE BUTTON */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={() => setSelectedItem(null)}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "cursor-pointer",
              )}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveClosure}
              className={cn(
                buttonVariants({ variant: "default" }),
                "cursor-pointer",
              )}
            >
              Save Closure Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
