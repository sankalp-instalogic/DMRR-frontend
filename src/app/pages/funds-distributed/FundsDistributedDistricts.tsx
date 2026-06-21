import { useState } from "react";
import {
  Eye,
  Printer,
  Download,
  ArrowLeft,
  Plus,
  FileText,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

// Defined the shape of the payload based on your form
interface FundRecord {
  id?: string;
  districtId: string;
  issuingDate: string;
  allocatedLakhs: number; // Changed from fundsAllocated
  utilizedLakhs: number;  // Changed from fundsUtilized
}

interface PaginatedResponse {
  items: FundRecord[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// Helpers for formatting
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return dateString.split("T")[0];
};

export function FundsDistributedDistricts() {
  const [activeTab, setActiveTab] = useState<"overview" | "new" | "view">("overview");
  const [viewRecord, setViewRecord] = useState<FundRecord | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form states
  const [formFundsAllocated, setFormFundsAllocated] = useState("");
  const [formFundsUtilized, setFormFundsUtilized] = useState("");
  const [formDistrict, setFormDistrict] = useState("");
  const [formDate, setFormDate] = useState("");
  const [utilizationCertificate, setUtilizationCertificate] = useState<File | null>(null);

  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  // --- QUERIES ---

  // 1. Fetch Funds List (Replace '/api/v1/funds-distributed' with your actual endpoint)
  const { data, isLoading, isError, isFetching } = useQuery<PaginatedResponse>({
    queryKey: ["funds-distributed", page, pageSize],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/funds/districts", {
        params: { page, pageSize },
      });
      return response.data;
    },
  });

  // 2. Fetch Districts for Dropdown and Mapping
  const { data: districtsData, isLoading: isDistrictsLoading } = useQuery({
    queryKey: ["districts"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/districts", {
        params: { page: 1, pageSize: 100 },
      });
      return response.data;
    },
  });

  // 3. Fetch Document for View Tab
  const { data: documentsData, isLoading: isDocumentsLoading } = useQuery({
    queryKey: ["documents", viewRecord?.id],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Documents/list", {
        params: { ownerType: "11", ownerId: viewRecord?.id },
      });
      return response.data;
    },
    enabled: !!viewRecord?.id,
  });

  const records = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 0;
  const districtsList = districtsData?.items || [];

  // Map district IDs to District Names
  const districtMap =
    isDistrictsLoading || !districtsData?.items
      ? {}
      : Object.fromEntries(
          districtsData.items.map((district: any) => [
            district.id,
            district.name,
          ]),
        );

  // Get the Utilization Certificate document
  const getDocument = () => {
    const docs = Array.isArray(documentsData) ? documentsData : documentsData?.items || [];
    // If you have specific document type name matching you can add it here.
    // Otherwise, since there's only one upload, we can grab the first available document.
    return docs.length > 0 ? docs[0] : null;
  };
  const utilDoc = getDocument();

  // --- MUTATIONS ---

  // Upload Document Mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, ownerId }: { file: File; ownerId: string }) => {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("ownerId", ownerId);
      uploadData.append("ownerType", "11"); // Requested Owner Type
      uploadData.append("documentType", "27"); // Requested Document Type

      const response = await axiosPrivate.post(
        "/api/v1/Documents/upload",
        uploadData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    },
  });

  // Add Record Mutation
  const addMutation = useMutation({
    mutationFn: async (newData: any) => {
      const response = await axiosPrivate.post(
        "/api/v1/funds/districts",
        newData,
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      return response.data;
    },
    onSuccess: async (responseData) => {
      if (responseData?.id && utilizationCertificate) {
        try {
          await uploadMutation.mutateAsync({
            file: utilizationCertificate,
            ownerId: responseData.id,
          });
        } catch (err) {
          console.error("Document upload failed:", err);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["funds-distributed"] });
      resetForm();
      setActiveTab("overview");
    },
    onError: (err) => {
      console.error("Failed to save record:", err);
    },
  });

  // --- HANDLERS ---

  const handleView = (record: FundRecord) => {
    setViewRecord(record);
    setActiveTab("view");
  };

  const resetForm = () => {
    setFormFundsAllocated("");
    setFormFundsUtilized("");
    setUtilizationCertificate(null);
    setFormDistrict("");
    setFormDate("");
  };

  const handleSave = () => {
    const payload = {
      districtId: formDistrict,
      allocatedLakhs: Number(formFundsAllocated), // Updated key & converted to Number
      utilizedLakhs: Number(formFundsUtilized),   // Updated key & converted to Number
      issuingDate: formDate ? new Date(formDate).toISOString() : null,
    };

    addMutation.mutate(payload);
  };

  const handleDownload = async (doc: any) => {
    if (!doc?.id) return;
    try {
      const response = await axiosPrivate.get(
        `/api/v1/Documents/${doc.id}/download`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", doc.fileName || `document-${doc.id}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download document:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] font-bold text-[#0B1F4D]">
          Funds Distributed to Districts
        </h1>
        <p className="text-[14px] font-medium text-gray-500 mt-1">
          Manage and track funds allocated to districts
        </p>
      </div>

      {activeTab !== "view" && (
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-medium text-[14px] transition-colors rounded-[10px] ${
              activeTab === "overview"
                ? "bg-[#0B1F4D] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => {
              resetForm();
              setActiveTab("new");
            }}
            className={`px-4 py-2 font-medium text-[14px] transition-colors rounded-[10px] ${
              activeTab === "new"
                ? "bg-[#0B1F4D] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            New Allocation
          </button>
        </div>
      )}

      {activeTab === "overview" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 relative">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <span className="text-[#0B1F4D] font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                Updating...
              </span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-[13px] text-left">
              <thead className="bg-[#F5F7FA] text-[#0B1F4D]">
                <tr className="h-14">
                  <th className="px-4 font-semibold whitespace-nowrap">Sr No</th>
                  <th className="font-semibold">District</th>
                  <th className="font-semibold">Date of Issuing</th>
                  <th className="font-semibold">Utilized Amount</th>
                  <th className="px-4 font-semibold whitespace-nowrap text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500 font-medium"
                    >
                      Loading records...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-red-500 font-medium"
                    >
                      Failed to load records.
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500 font-medium"
                    >
                      No records found. Click "New Allocation" to add one.
                    </td>
                  </tr>
                ) : (
                  records.map((row, index) => (
                    <tr
                      key={row.id}
                      className="hover:bg-blue-50/50 transition-colors h-14 even:bg-gray-50/50"
                    >
                      <td className="px-4 font-medium text-[#0B1F4D] whitespace-nowrap">
                        {(page - 1) * pageSize + index + 1}
                      </td>
                      <td>{districtMap[row.districtId] || row.districtId}</td>
                      <td>{formatDate(row.issuingDate)}</td>
                      <td>₹{row.utilizedLakhs} Lakhs</td>
                      <td className="px-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleView(row)}
                          className="inline-flex items-center gap-1.5 px-4 h-10 bg-white border border-[#0B1F4D] text-[#0B1F4D] rounded-[10px] hover:bg-blue-50 transition-colors text-[14px] font-medium cursor-pointer"
                        >
                          <Eye className="size-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {records.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-[#F5F7FA]">
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-gray-500 font-medium">
                  Showing {(page - 1) * pageSize + 1} to{" "}
                  {Math.min(page * pageSize, totalCount)} of {totalCount}{" "}
                  entries
                </span>

                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="text-[13px] border border-gray-200 rounded px-2 py-1 bg-white outline-none focus:border-[#0B1F4D]"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading || isFetching}
                  className="px-3 py-1.5 text-[13px] font-medium border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>

                <span className="text-[13px] font-semibold text-[#0B1F4D] px-2">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || isLoading || isFetching}
                  className="px-3 py-1.5 text-[13px] font-medium border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "new" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-[20px] font-semibold text-[#0B1F4D] mb-6">
            New District Allocation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-gray-700">
                Funds Allocated (Lakhs)
              </label>
              <input
                type="number"
                value={formFundsAllocated}
                onChange={(e) => setFormFundsAllocated(e.target.value)}
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-medium text-gray-700">
                To District
              </label>
              <select
                value={formDistrict}
                onChange={(e) => setFormDistrict(e.target.value)}
                disabled={isDistrictsLoading}
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] bg-white text-[14px] disabled:opacity-50"
              >
                <option value="" disabled>
                  {isDistrictsLoading ? "Loading districts..." : "Select District"}
                </option>
                {districtsList.map((d: any) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-medium text-gray-700">
                Issuing Date
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] text-[14px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-medium text-gray-700">
                Funds Utilized (Lakhs)
              </label>
              <input
                type="number"
                value={formFundsUtilized}
                onChange={(e) => setFormFundsUtilized(e.target.value)}
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D]"
                placeholder="Enter utilized amount"
              />
            </div>

            <div className="space-y-2 md:col-span-2 mt-4">
              <label className="text-[14px] font-medium text-gray-700">
                Utilization Certificate Upload
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-[10px] p-6 text-center hover:bg-gray-50 transition-colors">
                <input
                  type="file"
                  className="hidden"
                  id="gr-upload"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setUtilizationCertificate(e.target.files?.[0] || null)}
                />
                <label
                  htmlFor="gr-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Plus className="size-6 text-[#0B1F4D] mb-2" />
                  <span className="text-[14px] font-medium text-[#0B1F4D]">
                    {utilizationCertificate
                      ? utilizationCertificate.name
                      : "Click to upload Utilization Certificate Document"}
                  </span>
                  <span className="text-[12px] text-gray-500 mt-1">
                    Accepts PDF, DOC, DOCX
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              onClick={() => setActiveTab("overview")}
              className="px-4 h-10 bg-white border border-[#0B1F4D] text-[#0B1F4D] rounded-[10px] font-medium hover:bg-gray-50 transition-colors text-[14px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={addMutation.isPending || uploadMutation.isPending}
              className="px-4 h-10 bg-[#0B1F4D] text-white rounded-[10px] font-medium hover:bg-[#0B1F4D]/90 transition-colors text-[14px] cursor-pointer disabled:opacity-50"
            >
              {addMutation.isPending || uploadMutation.isPending
                ? "Saving..."
                : "Save"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "view" && viewRecord && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveTab("overview")}
              className="inline-flex items-center gap-2 text-[14px] font-medium text-gray-600 hover:text-[#0B1F4D] transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 h-10 bg-white border border-[#0B1F4D] text-[#0B1F4D] rounded-[10px] text-[14px] font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Printer className="size-4" />
              Print
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-[20px] font-semibold text-[#0B1F4D] mb-6 pb-4 border-b border-gray-200">
              Allocation Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-6">
              <div>
                <p className="text-[14px] font-medium text-gray-500 mb-1">
                  Budget Utilized
                </p>
                <p className="font-semibold text-[16px] text-[#0B1F4D]">
                  ₹{viewRecord.utilizedLakhs} L
                </p>
              </div>
              <div>
                <p className="text-[14px] font-medium text-gray-500 mb-1">
                  Date of Issuing
                </p>
                <p className="font-semibold text-[16px] text-[#0B1F4D]">
                  {formatDate(viewRecord.issuingDate)}
                </p>
              </div>
              <div>
                <p className="text-[14px] font-medium text-gray-500 mb-1">
                  District
                </p>
                <p className="font-semibold text-[16px] text-[#0B1F4D]">
                  {districtMap[viewRecord.districtId] || viewRecord.districtId}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-[16px] font-semibold text-[#0B1F4D] mb-4">
                Utilization Certificate
                {isDocumentsLoading && (
                  <span className="text-sm text-gray-400 font-normal ml-2">
                    (Loading...)
                  </span>
                )}
              </p>
              
              {utilDoc ? (
                <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-[10px] bg-gray-50/50">
                  <FileText className="size-8 text-red-500" />
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-[#0B1F4D]">
                      {utilDoc.fileName || "Utilization Certificate.pdf"}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleDownload(utilDoc)}
                      className="inline-flex cursor-pointer items-center gap-1.5 px-4 h-10 bg-[#0B1F4D] text-white rounded-[10px] transition-colors text-[14px] font-medium hover:bg-[#0B1F4D]/90"
                    >
                      <Download className="size-4" />
                      Download
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[14px] text-gray-500 italic">No document available for this allocation.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}