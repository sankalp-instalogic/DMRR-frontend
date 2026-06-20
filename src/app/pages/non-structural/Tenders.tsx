import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import {
  Upload,
  Save,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Plus,
  Loader2,
} from "lucide-react";

// Document Type Mapping (ownerType is 8 for Tenders)
const DOCUMENT_TYPES: Record<string, string> = {
  "Technical Bid Opening": "30",
  "Technical Evaluation": "31",
  "Financial Bid Opening": "32",
  "Financial Evaluation": "33",
};

const stageList = [
  "Technical Bid Opening",
  "Technical Evaluation",
  "Financial Bid Opening",
  "Financial Evaluation",
];

interface Tender {
  id?: string;
  organizationChain: string;
  tenderTitle: string;
  tenderRefNo: string;
  tenderCode: string; // Changed from tenderId to match your API
}

interface PaginatedResponse {
  items: Tender[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export function Tenders() {
  const [activeTab, setActiveTab] = useState<"tenders" | "new">("tenders");
  const [viewTender, setViewTender] = useState<Tender | null>(null);

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  const initialFormState: Tender = {
    organizationChain: "",
    tenderTitle: "",
    tenderRefNo: "",
    tenderCode: "",
  };

  const [newTender, setNewTender] = useState<Tender>(initialFormState);

  const initialDocsState: Record<string, File | null> = {
    "Technical Bid Opening": null,
    "Technical Evaluation": null,
    "Financial Bid Opening": null,
    "Financial Evaluation": null,
  };

  const [documents, setDocuments] = useState(initialDocsState);

  // Consider all uploaded if at least the 4 mandatory ones are present
  const allUploaded =
    documents["Technical Bid Opening"] &&
    documents["Technical Evaluation"] &&
    documents["Financial Bid Opening"] &&
    documents["Financial Evaluation"];

  // ==========================================
  // QUERIES
  // ==========================================

  // Fetch Tenders List
  const { data, isLoading, isError, isFetching } = useQuery<
    PaginatedResponse | Tender[]
  >({
    queryKey: ["tenders", page, pageSize],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/data-tenders", {
        params: { page, pageSize },
      });
      return response.data;
    },
  });

  // FIX: Check if the response is an array directly, otherwise look for the 'items' property
  const tenders = Array.isArray(data) ? data : data?.items || [];

  // Update pagination fallbacks to handle the raw array
  const totalCount = Array.isArray(data) ? data.length : data?.totalCount || 0;
  const totalPages = Array.isArray(data)
    ? Math.ceil(data.length / pageSize)
    : data?.totalPages || 0;

  // Fetch Documents for selected tender (View Mode)
  const { data: documentsData, isLoading: isDocumentsLoading } = useQuery({
    queryKey: ["tenderDocuments", viewTender?.id],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Documents/list", {
        params: { ownerType: "8", ownerId: viewTender?.id },
      });
      return response.data;
    },
    enabled: !!viewTender?.id,
  });

  const getDocumentForStage = (stageName: string) => {
    const docs = Array.isArray(documentsData)
      ? documentsData
      : documentsData?.items || [];

    // Normalize the stage name by removing all spaces so "Technical Bid Opening" becomes "TechnicalBidOpening"
    const normalizedStageName = stageName.replace(/\s/g, "");

    return docs.find(
      (doc: any) =>
        doc.documentTypeName === normalizedStageName ||
        // Keeping your old fallbacks just in case
        doc.documentTypeName === stageName ||
        doc.documentType?.toString() === DOCUMENT_TYPES[stageName],
    );
  };

  // ==========================================
  // MUTATIONS
  // ==========================================

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
      uploadData.append("ownerType", "8");
      uploadData.append("documentType", documentType);

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

  // Add Tender Mutation
  const addMutation = useMutation({
    mutationFn: async (newData: Tender) => {
      const response = await axiosPrivate.post(
        "/api/v1/data-tenders",
        newData,
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      return response.data;
    },
    onSuccess: async (responseData) => {
      if (responseData?.id) {
        // Prepare array of concurrent uploads
        const uploadPromises = Object.entries(documents).map(
          ([stage, file]) => {
            const documentType = DOCUMENT_TYPES[stage];
            if (file && documentType) {
              return uploadMutation.mutateAsync({
                file,
                ownerId: responseData.id,
                documentType,
              });
            }
            return Promise.resolve();
          },
        );

        try {
          await Promise.all(uploadPromises);
        } catch (err) {
          console.error("One or more document uploads failed:", err);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["tenders"] });
      setNewTender(initialFormState);
      setDocuments(initialDocsState);
      setActiveTab("tenders");
    },
    onError: (err) => {
      console.error("Failed to save tender:", err);
    },
  });

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleSave = () => {
    addMutation.mutate(newTender);
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

  // ==========================================
  // VIEW RENDER
  // ==========================================

  if (viewTender) {
    return (
      <div className="space-y-6">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setViewTender(null)}
            className="flex items-center gap-2 cursor-pointer bg-white border border-[#0B1F4D] text-[#0B1F4D] px-4 h-10 rounded-[10px] text-[14px] font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
        </div>

        {/* Header Details */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-[20px] font-semibold text-[#0B1F4D] mb-6 pb-4 border-b border-gray-200 flex items-center gap-2">
            Tender Details
            {isDocumentsLoading && (
              <Loader2 className="size-4 animate-spin text-gray-400" />
            )}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6">
            <div className="md:col-span-2">
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Organization Chain
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {viewTender.organizationChain}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Tender Title
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {viewTender.tenderTitle}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Tender Ref No
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {viewTender.tenderRefNo}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Tender Code
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {viewTender.tenderCode}
              </p>
            </div>
          </div>
        </div>

        {/* Stage Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] text-left">
              <thead className="bg-[#F5F7FA] text-[#0B1F4D]">
                <tr className="h-14">
                  <th className="px-4 font-semibold whitespace-nowrap">
                    Stages
                  </th>
                  <th className="px-4 font-semibold whitespace-nowrap text-center">
                    Status
                  </th>
                  <th className="px-4 font-semibold whitespace-nowrap text-center">
                    Download
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* PROCESS 1 */}
                <tr className="bg-[#F5F7FA] border-y border-gray-200">
                  <td
                    colSpan={3}
                    className="px-4 py-3 font-semibold text-[#0B1F4D]"
                  >
                    Process 1
                  </td>
                </tr>
                {stageList.slice(0, 2).map((stage, index) => {
                  const doc = getDocumentForStage(stage);
                  return (
                    <tr
                      key={`p1-${index}`}
                      className="hover:bg-blue-50/50 transition-colors h-14 even:bg-gray-50/50"
                    >
                      <td className="px-8 font-medium text-[#0B1F4D] whitespace-nowrap">
                        {stage}
                      </td>
                      <td className="px-4 text-center">
                        {doc ? (
                          <CheckCircle2 className="size-5 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="size-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="px-4 text-center">
                        <button
                          onClick={() => handleDownload(doc)}
                          disabled={!doc}
                          className="text-gray-500 cursor-pointer hover:text-[#0B1F4D] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Download className="size-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* PROCESS 2 */}
                <tr className="bg-[#F5F7FA] border-y border-gray-200">
                  <td
                    colSpan={3}
                    className="px-4 py-3 font-semibold text-[#0B1F4D]"
                  >
                    Process 2
                  </td>
                </tr>
                {stageList.slice(2).map((stage, index) => {
                  const doc = getDocumentForStage(stage);
                  return (
                    <tr
                      key={`p2-${index}`}
                      className="hover:bg-blue-50/50 transition-colors h-14 even:bg-gray-50/50"
                    >
                      <td className="px-8 font-medium text-[#0B1F4D] whitespace-nowrap">
                        {stage}
                      </td>
                      <td className="px-4 text-center">
                        {doc ? (
                          <CheckCircle2 className="size-5 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="size-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="px-4 text-center">
                        <button
                          onClick={() => handleDownload(doc)}
                          disabled={!doc}
                          className="text-gray-500 hover:text-[#0B1F4D] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Download className="size-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[30px] font-bold text-[#0B1F4D]">Tendering</h1>
        <p className="text-[14px] font-medium text-gray-500 mt-1">
          Manage Tender Activities
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("tenders")}
          className={`px-4 py-2 cursor-pointer font-medium text-[14px] transition-colors rounded-[10px] ${
            activeTab === "tenders"
              ? "bg-[#0B1F4D] text-white"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          Tenders
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
          New Tender
        </button>
      </div>

      {/* TENDER LIST */}
      {activeTab === "tenders" && (
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
                    Tender Title
                  </th>
                  <th className="px-4 font-semibold whitespace-nowrap">
                    Tender Ref No
                  </th>
                  <th className="px-4 font-semibold whitespace-nowrap">
                    Tender Code
                  </th>
                  <th className="px-4 font-semibold whitespace-nowrap">
                    Organization Chain
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
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500 font-medium"
                    >
                      Loading tenders...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-red-500 font-medium"
                    >
                      Failed to load tenders.
                    </td>
                  </tr>
                ) : tenders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500 font-medium"
                    >
                      No tenders found.
                    </td>
                  </tr>
                ) : (
                  tenders.map((tender, index) => (
                    <tr
                      key={tender.id || index}
                      className="hover:bg-blue-50/50 transition-colors h-14 even:bg-gray-50/50"
                    >
                      <td className="px-4 font-medium text-[#0B1F4D]">
                        <span
                          className="truncate max-w-50 inline-block align-middle"
                          title={tender.tenderTitle}
                        >
                          {tender.tenderTitle}
                        </span>
                      </td>
                      <td className="px-4 text-[#0B1F4D] whitespace-nowrap">
                        {tender.tenderRefNo}
                      </td>
                      <td className="px-4 text-[#0B1F4D] whitespace-nowrap">
                        {tender.tenderCode}
                      </td>
                      <td className="px-4 text-[#0B1F4D]">
                        <span
                          className="truncate max-w-60 inline-block align-middle"
                          title={tender.organizationChain}
                        >
                          {tender.organizationChain}
                        </span>
                      </td>
                      <td className="px-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => setViewTender(tender)}
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

          {tenders.length > 0 && (
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

      {/* NEW TENDER */}
      {activeTab === "new" && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="text-[20px] font-semibold text-[#0B1F4D]">
            Create New Tender
          </h2>

          {/* Tender Details Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Organization Chain
              </label>
              <input
                value={newTender.organizationChain}
                onChange={(e) =>
                  setNewTender({
                    ...newTender,
                    organizationChain: e.target.value,
                  })
                }
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
                placeholder="Enter Organization Chain"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Tender Title
              </label>
              <input
                value={newTender.tenderTitle}
                onChange={(e) =>
                  setNewTender({ ...newTender, tenderTitle: e.target.value })
                }
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
                placeholder="Enter Tender Title"
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Tender Ref No
              </label>
              <input
                value={newTender.tenderRefNo}
                onChange={(e) =>
                  setNewTender({ ...newTender, tenderRefNo: e.target.value })
                }
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
                placeholder="Enter Tender Reference Number"
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Tender Code
              </label>
              <input
                value={newTender.tenderCode}
                onChange={(e) =>
                  setNewTender({ ...newTender, tenderCode: e.target.value })
                }
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
                placeholder="Enter Tender Code"
              />
            </div>
          </div>

          {/* Upload Stage Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden mt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] text-left">
                <thead className="bg-[#F5F7FA] text-[#0B1F4D]">
                  <tr className="h-14">
                    <th className="px-4 font-semibold whitespace-nowrap">
                      Stages
                    </th>
                    <th className="px-4 font-semibold whitespace-nowrap text-center">
                      Upload
                    </th>
                    <th className="px-4 font-semibold whitespace-nowrap text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stageList.map((stage, index) => (
                    <tr
                      key={index}
                      className="hover:bg-blue-50/50 transition-colors h-14 even:bg-gray-50/50"
                    >
                      <td className="px-4 font-medium text-[#0B1F4D] whitespace-nowrap">
                        {stage}
                      </td>
                      <td className="px-4 text-center">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 h-10 bg-white border border-[#0B1F4D] text-[#0B1F4D] rounded-[10px] hover:bg-blue-50 transition-colors text-[14px] font-medium">
                          <Upload className="size-4" />
                          Upload
                          <input
                            type="file"
                            hidden
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setDocuments({ ...documents, [stage]: file });
                            }}
                          />
                        </label>
                      </td>
                      <td className="px-4 text-center">
                        {documents[stage] ? (
                          <CheckCircle2 className="size-5 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="size-5 text-red-500 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setNewTender(initialFormState);
                setDocuments(initialDocsState);
                setActiveTab("tenders");
              }}
              className="px-4 h-10 cursor-pointer bg-white border border-[#0B1F4D] text-[#0B1F4D] rounded-[10px] font-medium hover:bg-gray-50 transition-colors text-[14px]"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={
                !allUploaded ||
                addMutation.isPending ||
                uploadMutation.isPending
              }
              className="flex items-center gap-1.5 px-4 h-10 cursor-pointer bg-[#0B1F4D] text-white rounded-[10px] font-medium hover:bg-[#0B1F4D]/90 transition-colors text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addMutation.isPending || uploadMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
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
