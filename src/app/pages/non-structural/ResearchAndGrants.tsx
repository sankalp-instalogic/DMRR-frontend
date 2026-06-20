import { useState } from "react";
import { Plus, Eye, Download, ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

interface Grant {
  id?: string;
  grantCode: string;
  title: string;
  givenTo: string;
  issuedDate: string;
  allocatedAmount: number | string;
  utilizedAmount: number | string;
  completionDate: string;
  completionCertificate?: File | null;
}

interface PaginatedResponse {
  items: Grant[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return dateString.split("T")[0];
};

const formatCurrency = (amount: number | string) => {
  if (amount === undefined || amount === null || amount === "") return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

export function ResearchAndGrants() {
  const [activeTab, setActiveTab] = useState<"list" | "new">("list");
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  const initialFormState: Grant = {
    grantCode: "",
    title: "",
    givenTo: "",
    issuedDate: "",
    allocatedAmount: "",
    utilizedAmount: "",
    completionDate: "",
    completionCertificate: null,
  };

  const [formData, setFormData] = useState<Grant>(initialFormState);

  // --- QUERIES ---
  const { data, isLoading, isError, isFetching } = useQuery<PaginatedResponse>({
    queryKey: ["grants", page, pageSize],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/grants", {
        params: { page, pageSize },
      });
      return response.data;
    },
  });

  // Fetch Documents for selected grant
  const { data: documentsData, isLoading: isDocumentsLoading } = useQuery({
    queryKey: ["documents", selectedGrant?.id],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Documents/list", {
        params: { ownerType: "9", ownerId: selectedGrant?.id },
      });
      return response.data;
    },
    enabled: !!selectedGrant?.id,
  });

  const grants = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 0;

  const getDocumentByType = (typeName: string) => {
    const docs = Array.isArray(documentsData)
      ? documentsData
      : documentsData?.items || [];
    return docs.find((doc: any) => doc.documentTypeName === typeName);
  };

  const completionDoc = getDocumentByType("CompletionReport") || (Array.isArray(documentsData) ? documentsData[0] : documentsData?.items?.[0]);

  // --- MUTATIONS ---

  // Upload Document Mutation
  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      ownerId,
      documentType,
    }: {
      file: File;
      ownerId: string;
      documentType: string;
    }) => {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("ownerId", ownerId);
      uploadData.append("ownerType", "9");
      uploadData.append("documentType", documentType);

      const response = await axiosPrivate.post(
        "/api/v1/Documents/upload",
        uploadData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    },
  });

  // Add Grant Data Mutation
  const addMutation = useMutation({
    mutationFn: async (newData: any) => {
      const response = await axiosPrivate.post("/api/v1/grants", newData, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    },
    onSuccess: async (responseData) => {
      if (responseData?.id && formData.completionCertificate) {
        try {
          await uploadMutation.mutateAsync({
            file: formData.completionCertificate,
            ownerId: responseData.id,
            documentType: "18", 
          });
        } catch (err) {
          console.error("Document upload failed:", err);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["grants"] });
      setFormData(initialFormState);
      setActiveTab("list");
    },
    onError: (err) => {
      console.error("Failed to save grant:", err);
    },
  });

  // --- HANDLERS ---
  const handleSave = () => {
    const { completionCertificate, ...textData } = formData;

    // Formatting payload exactly as requested by the backend schema
    const payload = {
      grantCode: textData.grantCode,
      title: textData.title,
      givenTo: textData.givenTo,
      issuedDate: textData.issuedDate
        ? new Date(textData.issuedDate).toISOString()
        : null,
      allocatedAmount: Number(textData.allocatedAmount) || 0,
      utilizedAmount: Number(textData.utilizedAmount) || 0,
      completionDate: textData.completionDate
        ? new Date(textData.completionDate).toISOString()
        : null,
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
        }
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

  // ==========================
  // VIEW PAGE
  // ==========================

  if (selectedGrant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedGrant(null)}
            className="flex items-center gap-2 cursor-pointer bg-white border border-[#0B1F4D] text-[#0B1F4D] px-4 h-10 rounded-[10px] text-[14px] font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-[20px] font-semibold text-[#0B1F4D] mb-6 pb-4 border-b border-gray-200">
            Grant Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6">
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Grant Code
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {selectedGrant.grantCode}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Title
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {selectedGrant.title}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Research/Grant Given To
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {selectedGrant.givenTo}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Date of Issue
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {formatDate(selectedGrant.issuedDate)}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Allocated Amount
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {formatCurrency(selectedGrant.allocatedAmount)} Lakhs
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Utilized Amount
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {formatCurrency(selectedGrant.utilizedAmount)} Lakhs
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Date of Completion
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {formatDate(selectedGrant.completionDate)}
              </p>
            </div>

            <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-2"></div>

            <div>
              <label className="text-[16px] font-semibold text-[#0B1F4D] block mb-4">
                Completion Certificate{" "}
                {isDocumentsLoading && (
                  <span className="text-sm text-gray-400 font-normal ml-2">
                    (Loading...)
                  </span>
                )}
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload(completionDoc)}
                  disabled={!completionDoc || isDocumentsLoading}
                  className="flex cursor-pointer items-center gap-1.5 bg-[#0B1F4D] text-white px-4 h-10 rounded-[10px] text-[14px] font-medium hover:bg-[#0B1F4D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="size-4" /> Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================
  // MAIN PAGE
  // ==========================

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] font-bold text-[#0B1F4D]">
          Research & Grants
        </h1>
        <p className="text-[14px] font-medium text-gray-500 mt-1">
          Manage and monitor Research & Grants activities.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 cursor-pointer font-medium text-[14px] transition-colors rounded-[10px] ${
            activeTab === "list"
              ? "bg-[#0B1F4D] text-white"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          Grants List
        </button>

        <button
          onClick={() => setActiveTab("new")}
          className={`flex cursor-pointer items-center gap-2 px-4 py-2 font-medium text-[14px] transition-colors rounded-[10px] ${
            activeTab === "new"
              ? "bg-[#0B1F4D] text-white"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <Plus className="size-4" />
          New Grant
        </button>
      </div>

      {/* ==========================
          GRANTS LIST
      ========================== */}

      {activeTab === "list" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 flex flex-col relative">
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
                  <th className="px-4 font-semibold whitespace-nowrap">
                    Grant Code
                  </th>
                  <th className="px-4 font-semibold whitespace-nowrap">
                    Research/Grant Given To
                  </th>
                  <th className="px-4 font-semibold whitespace-nowrap">
                    Date of Issue
                  </th>
                  <th className="px-4 font-semibold whitespace-nowrap">
                    Allocated Amount
                  </th>
                  <th className="px-4 font-semibold whitespace-nowrap">
                    Utilized Amount
                  </th>
                  <th className="px-4 font-semibold whitespace-nowrap">
                    Date of Completion
                  </th>
                  <th className="px-4 font-semibold whitespace-nowrap text-center">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-500 font-medium"
                    >
                      Loading grants...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-red-500 font-medium"
                    >
                      Failed to load grants. Please try again.
                    </td>
                  </tr>
                ) : grants.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-500 font-medium"
                    >
                      No grants found. Click "New Grant" to add one.
                    </td>
                  </tr>
                ) : (
                  grants.map((grant, index) => (
                    <tr
                      key={grant.id || index}
                      className="hover:bg-blue-50/50 transition-colors h-14 even:bg-gray-50/50"
                    >
                      <td className="px-4">{grant.grantCode}</td>
                      <td className="px-4">{grant.givenTo}</td>
                      <td className="px-4">{formatDate(grant.issuedDate)}</td>
                      <td className="px-4">
                        {formatCurrency(grant.allocatedAmount)}
                      </td>
                      <td className="px-4">
                        {formatCurrency(grant.utilizedAmount)}
                      </td>
                      <td className="px-4">
                        {formatDate(grant.completionDate)}
                      </td>

                      <td className="px-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => setSelectedGrant(grant)}
                          className="inline-flex cursor-pointer items-center gap-1.5 px-4 h-10 bg-white border border-[#0B1F4D] text-[#0B1F4D] rounded-[10px] hover:bg-blue-50 transition-colors text-[14px] font-medium"
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

          {grants.length > 0 && (
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
                  <option value={50}>50 per page</option>
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

      {/* ==========================
          NEW GRANT
      ========================== */}

      {activeTab === "new" && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-[20px] font-semibold mb-6 text-[#0B1F4D]">
            Add New Grant
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Grant Code
              </label>
              <input
                type="text"
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
                value={formData.grantCode}
                onChange={(e) =>
                  setFormData({ ...formData, grantCode: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Research/Grant Given To
              </label>
              <input
                type="text"
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
                value={formData.givenTo}
                onChange={(e) =>
                  setFormData({ ...formData, givenTo: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Date of Issue
              </label>
              <input
                type="date"
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
                value={formData.issuedDate}
                onChange={(e) =>
                  setFormData({ ...formData, issuedDate: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Allocated Amount
              </label>
              <input
                type="number"
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
                value={formData.allocatedAmount}
                onChange={(e) =>
                  setFormData({ ...formData, allocatedAmount: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Utilized Amount
              </label>
              <input
                type="number"
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
                value={formData.utilizedAmount}
                onChange={(e) =>
                  setFormData({ ...formData, utilizedAmount: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Date of Completion
              </label>
              <input
                type="date"
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
                value={formData.completionDate}
                onChange={(e) =>
                  setFormData({ ...formData, completionDate: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Completion Certificate Upload
              </label>
              <input
                type="file"
                className="w-full text-[14px] file:mr-4 file:py-2 file:px-4 file:rounded-[10px] file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    completionCertificate: e.target.files?.[0] || null,
                  })
                }
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setFormData(initialFormState);
                setActiveTab("list");
              }}
              className="px-4 h-10 cursor-pointer bg-white border border-[#0B1F4D] text-[#0B1F4D] rounded-[10px] font-medium hover:bg-gray-50 transition-colors text-[14px]"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={addMutation.isPending || uploadMutation.isPending}
              className="px-4 h-10 cursor-pointer bg-[#0B1F4D] text-white rounded-[10px] font-medium hover:bg-[#0B1F4D]/90 transition-colors text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addMutation.isPending || uploadMutation.isPending
                ? "Saving..."
                : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}