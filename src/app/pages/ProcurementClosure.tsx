import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate"; // Adjust path as needed
import toast from "react-hot-toast";

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
      // Invalidate the 'procurements' query so the table refetches automatically
      queryClient.invalidateQueries({ queryKey: ["procurements"] });
    },
    onError: (error) => {
      console.error("Error marking procurement for closure:", error);
      // You can also add a toast notification here
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ file, ownerId, ownerType, documentType }: { file: File, ownerId: string, ownerType: number, documentType: number }) => {
      const formData = new FormData();
      // "file" is the standard key, but adjust if your backend expects "File" or "Document"
      formData.append("file", file); 
      formData.append("ownerId", ownerId);
      formData.append("ownerType", ownerType.toString());
      formData.append("documentType", documentType.toString());

      const response = await axiosPrivate.post("/api/v1/Documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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
      return "bg-green-100 text-green-700 border-green-200";
    }
    if (
      s.includes("closed") ||
      s.includes("rejected") ||
      s.includes("cancelled")
    ) {
      return "bg-red-100 text-red-700 border-red-200";
    }
    if (s.includes("draft") || s.includes("pending")) {
      return "bg-amber-100 text-amber-700 border-amber-200";
    }
    return "bg-blue-50 text-blue-700 border-blue-200";
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
    // Reset form when a new item is clicked
    setIsCompleted("");
    setCompletionData({
      completionCertificate: null,
      socialAuditFiles: [],
    });
  };

const handleSaveClosure = async () => {
    if (!selectedItem) return;

    // Get the correct ID based on the object structure
    const itemId = selectedItem.id || selectedItem.procurementId;
    const isTender = selectedItem.itemType === "tender";
    
    // Determine the ownerType for document uploads
    const ownerType = isTender ? 15 : 2;

    try {
      // 1. Call the respective Status Change / Closure API First
      if (isTender) {
        await completeStageMutation.mutateAsync(itemId);
      } else {
        await markForClosureMutation.mutateAsync(itemId);
      }

      // 2. If Project is Completed, upload the files
      if (isCompleted === "Yes") {
        const uploadPromises = [];

        // Upload Completion Certificate (documentType: 38)
        if (completionData.completionCertificate) {
          uploadPromises.push(
            uploadDocumentMutation.mutateAsync({
              file: completionData.completionCertificate,
              ownerId: itemId,
              ownerType: ownerType,
              documentType: 38,
            })
          );
        }

        // Upload Social Audit Files (documentType: 18)
        if (completionData.socialAuditFiles && completionData.socialAuditFiles.length > 0) {
          for (const file of completionData.socialAuditFiles) {
            uploadPromises.push(
              uploadDocumentMutation.mutateAsync({
                file: file,
                ownerId: itemId,
                ownerType: ownerType,
                documentType: 18,
              })
            );
          }
        }

        // Wait for all documents to finish uploading
        if (uploadPromises.length > 0) {
          await Promise.all(uploadPromises);
          toast.success("All documents uploaded successfully");
        }
      }

      // 3. Reset form and UI states
      toast.success(
        `Closure completed for ${selectedItem.tenderRefNo || selectedItem.procurementRefNo || "the selected item"}`
      );
      setSelectedItem(null);
      setIsCompleted("");
      setCompletionData({
        completionCertificate: null,
        socialAuditFiles: [],
      });

      // 4. Invalidate specific queries based on what was closed to refresh tables
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F4D]">
            Procurement Completion & Closure
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage tenders, procurement records, and final asset handovers
          </p>
        </div>
      </div>

      {/* --- TABLE 1: ALL TENDERS --- */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-semibold text-[#0B1F4D]">All Tenders</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tenders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium">Tender Title</th>
                <th className="px-6 py-3 font-medium">Tender Ref No</th>
                <th className="px-6 py-3 font-medium">Tender ID</th>
                <th className="px-6 py-3 font-medium">Organizational Chain</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isTendersLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    <Loader2 className="size-6 animate-spin mx-auto mb-2 text-[#1E5AA8]" />
                    <p>Loading tenders...</p>
                  </td>
                </tr>
              ) : isTendersError ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-red-500"
                  >
                    Failed to load tenders. Please try again later.
                  </td>
                </tr>
              ) : filteredTenders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No tenders found.
                  </td>
                </tr>
              ) : (
                filteredTenders.map((tender: any) => (
                  <tr
                    key={tender.id || tender.procurementId}
                    onClick={() => handleSelectForClosure(tender, "tender")}
                    className={`cursor-pointer transition-colors ${
                      selectedItem?.id === (tender.id || tender.procurementId)
                        ? "bg-blue-50/80 border-l-4 border-[#1E5AA8]"
                        : "hover:bg-muted/50 border-l-4 border-transparent"
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-[#0B1F4D] whitespace-nowrap">
                      {tender.tenderTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tender.tenderRefNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tender.tenderCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tender.organisationChain}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyles(tender.status)}`}
                      >
                        {tender.status || "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- TABLE 2: PROCUREMENT RECORDS --- */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-gray-50/50">
          <h2 className="text-lg font-semibold text-[#0B1F4D]">
            Pending Procurement Records
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium">Procurement Ref No</th>
                <th className="px-6 py-3 font-medium">Financial Year</th>
                <th className="px-6 py-3 font-medium">Item Name</th>
                <th className="px-6 py-3 font-medium">Demand From</th>
                <th className="px-6 py-3 font-medium">Total Quantity</th>
                <th className="px-6 py-3 font-medium">Award Cost (Lakhs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isProcurementLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    <Loader2 className="size-6 animate-spin mx-auto mb-2 text-[#1E5AA8]" />
                    <p>Loading procurement data...</p>
                  </td>
                </tr>
              ) : isProcurementError ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-red-500 font-medium"
                  >
                    Failed to fetch procurement records. Please try again.
                  </td>
                </tr>
              ) : procurementItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No procurement records found.
                  </td>
                </tr>
              ) : (
                procurementItems.map((row: any) => (
                  <tr
                    key={row.id}
                    onClick={() => handleSelectForClosure(row, "procurement")}
                    className={`cursor-pointer transition-colors ${
                      selectedItem?.id === row.id
                        ? "bg-blue-50/80 border-l-4 border-[#1E5AA8]"
                        : "hover:bg-muted/50 border-l-4 border-transparent"
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-[#0B1F4D]">
                      {row.procurementRefNo || "N/A"}
                    </td>
                    <td className="px-6 py-4">{row.financialYear}</td>
                    <td className="px-6 py-4">{row.itemName}</td>
                    <td className="px-6 py-4">{getDemandLocationName(row)}</td>
                    <td className="px-6 py-4">{row.totalQuantity ?? 0}</td>
                    <td className="px-6 py-4 font-medium">
                      ₹
                      {row.awardCostInclGstLakhs?.toLocaleString("en-IN") ||
                        "0"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Procurements Pagination */}
        {!isProcurementLoading &&
          !isProcurementError &&
          procurementItems.length > 0 && (
            <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-gray-50/50">
              <span>
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, totalItems)} of {totalItems} records
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="px-3 py-1 border border-border rounded-md hover:bg-muted disabled:opacity-50 transition-colors bg-white"
                  disabled={page === 1}
                >
                  Previous
                </button>
                <button className="px-3 py-1 bg-[#1E5AA8] text-white rounded-md font-medium">
                  {page}
                </button>
                <button
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className="px-3 py-1 border border-border rounded-md hover:bg-muted disabled:opacity-50 transition-colors bg-white cursor-pointer"
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
      </div>

      {/* --- CLOSURE FORM SECTION --- */}
      {selectedItem && (
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h3 className="mb-6 text-xl font-bold border-b pb-4 text-[#0B1F4D]">
            Project Closure:{" "}
            <span className="text-muted-foreground font-medium">
              {selectedItem.tenderRefNo ||
                selectedItem.procurementRefNo ||
                selectedItem.id}
            </span>
          </h3>

          {/* PROJECT COMPLETED QUESTION */}
          <div className="mb-6">
            <label className="block font-semibold mb-3 text-[#0B1F4D]">
              Is Project Completed?
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setIsCompleted("Yes")}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  isCompleted === "Yes"
                    ? "bg-green-600 text-white shadow-md"
                    : "border border-border hover:bg-gray-50"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setIsCompleted("No")}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  isCompleted === "No"
                    ? "bg-red-600 text-white shadow-md"
                    : "border border-border hover:bg-gray-50"
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
                  <label className="block mb-2 font-medium text-sm text-[#0B1F4D]">
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
                  <label className="block mb-2 font-medium text-sm text-[#0B1F4D]">
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
              className="px-6 py-2.5 border border-border text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveClosure}
              className="px-6 py-2.5 bg-[#1E5AA8] hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors"
            >
              Save Closure Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
