import { useState } from "react";
import { Plus, Eye, Download, ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

interface Survey {
  id?: string;
  surveyCode: string;
  title: string;
  districtId: string;
  grIssuedDate: string;
  allocatedBudget: number | string;
  utilizedBudget: number | string;
  completionDate: string;
  grDocument?: File | null;
  completionCertificate?: File | null;
}

interface PaginatedResponse {
  items: Survey[];
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

export function RedLineBlueLineSurvey() {
  const [activeTab, setActiveTab] = useState<"list" | "new">("list");
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  const initialFormState: Survey = {
    surveyCode: "",
    title: "",
    districtId: "",
    grIssuedDate: "",
    allocatedBudget: "",
    utilizedBudget: "",
    completionDate: "",
    grDocument: null,
    completionCertificate: null,
  };

  const [formData, setFormData] = useState<Survey>(initialFormState);

  // --- QUERIES ---
  const { data, isLoading, isError, isFetching } = useQuery<PaginatedResponse>({
    queryKey: ["rlbl-surveys", page, pageSize],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/surveys/rlbl", {
        params: { page, pageSize },
      });
      return response.data;
    },
  });

  const { data: districtsData, isLoading: isDistrictsLoading } = useQuery({
    queryKey: ["districts"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/districts", {
        params: { page: 1, pageSize: 100 },
      });
      return response.data;
    },
  });

  // Fetch Documents for selected survey
  const { data: documentsData, isLoading: isDocumentsLoading } = useQuery({
    queryKey: ["documents", selectedSurvey?.id],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Documents/list", {
        params: { ownerType: "6", ownerId: selectedSurvey?.id },
      });
      return response.data;
    },
    enabled: !!selectedSurvey?.id,
  });

  const surveys = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 0;
  const districtsList = districtsData?.items || [];

  const districtMap =
    isDistrictsLoading || !districtsData?.items
      ? {}
      : Object.fromEntries(
          districtsData.items.map((district: any) => [
            district.id,
            district.name,
          ]),
        );

  // UPDATED: Helper to find document by documentTypeName
  const getDocumentByType = (typeName: string) => {
    // Check if the response is an array directly or inside an 'items' property
    const docs = Array.isArray(documentsData) ? documentsData : documentsData?.items || [];
    return docs.find((doc: any) => doc.documentTypeName === typeName);
  };

  // UPDATED: Match against the actual string names from your JSON
  const grDocument = getDocumentByType("GRCopy");
  const completionDoc = getDocumentByType("CompletionReport");

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
      uploadData.append("ownerType", "6");
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

  // Add Survey Data Mutation
  const addMutation = useMutation({
    mutationFn: async (newData: any) => {
      const response = await axiosPrivate.post(
        "/api/v1/surveys/rlbl",
        newData,
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      return response.data;
    },
    onSuccess: async (responseData) => {
      if (responseData?.id) {
        const uploadPromises = [];

        // Note: You may need to update '25' to the exact UUID (12d863df-353b-413e-84df-da0bbafccbb2) 
        // if your upload endpoint strictly requires the `documentTypeId` instead of numeric map.
        if (formData.grDocument) {
          uploadPromises.push(
            uploadMutation.mutateAsync({
              file: formData.grDocument,
              ownerId: responseData.id,
              documentType: "25", 
            }),
          );
        }

        // Note: Similarly, update '19' to (eee38b1f-47cf-49fe-adee-d047f9295110) if needed.
        if (formData.completionCertificate) {
          uploadPromises.push(
            uploadMutation.mutateAsync({
              file: formData.completionCertificate,
              ownerId: responseData.id,
              documentType: "18", 
            }),
          );
        }

        try {
          if (uploadPromises.length > 0) {
            await Promise.all(uploadPromises);
          }
        } catch (err) {
          console.error("Document upload failed:", err);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["rlbl-surveys"] });
      setFormData(initialFormState);
      setActiveTab("list");
    },
    onError: (err) => {
      console.error("Failed to save survey:", err);
    },
  });

  // --- HANDLERS ---
  const handleSave = () => {
    const { grDocument, completionCertificate, ...textData } = formData;

    const payload = {
      ...textData,
      grIssuedDate: textData.grIssuedDate
        ? new Date(textData.grIssuedDate).toISOString()
        : null,
      completionDate: textData.completionDate
        ? new Date(textData.completionDate).toISOString()
        : null,
    };

    addMutation.mutate(payload);
  };

  const handleDownload = async (doc: any) => {
    if (!doc?.id) return;
    try {
      const response = await axiosPrivate.get(`/api/v1/Documents/${doc.id}/download`, {
        responseType: "blob",
      });
      
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

  if (selectedSurvey) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedSurvey(null)}
            className="flex items-center gap-2 cursor-pointer bg-white border border-[#0B1F4D] text-[#0B1F4D] px-4 h-10 rounded-[10px] text-[14px] font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-[20px] font-semibold text-[#0B1F4D] mb-6 pb-4 border-b border-gray-200">
            Survey Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6">
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Survey Code
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {selectedSurvey.surveyCode}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                District
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {districtMap[selectedSurvey.districtId] ||
                  selectedSurvey.districtId}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Title
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {selectedSurvey.title}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Date of GR Issued
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {formatDate(selectedSurvey.grIssuedDate)}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Allocated Budget
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {formatCurrency(selectedSurvey.allocatedBudget)}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Utilized Budget
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {formatCurrency(selectedSurvey.utilizedBudget)}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Date of Completion
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {formatDate(selectedSurvey.completionDate)}
              </p>
            </div>

            <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-2"></div>

            <div>
              <label className="text-[16px] font-semibold text-[#0B1F4D] block mb-4">
                GR Issued {isDocumentsLoading && <span className="text-sm text-gray-400 font-normal ml-2">(Loading...)</span>}
              </label>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleDownload(grDocument)}
                  disabled={!grDocument || isDocumentsLoading}
                  className="flex cursor-pointer items-center gap-1.5 bg-[#0B1F4D] text-white px-4 h-10 rounded-[10px] text-[14px] font-medium hover:bg-[#0B1F4D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="size-4" /> Download
                </button>
              </div>
            </div>

            <div>
              <label className="text-[16px] font-semibold text-[#0B1F4D] block mb-4">
                Completion Certificate {isDocumentsLoading && <span className="text-sm text-gray-400 font-normal ml-2">(Loading...)</span>}
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] font-bold text-[#0B1F4D]">
          Red Line Blue Line Survey
        </h1>
        <p className="text-[14px] font-medium text-gray-500 mt-1">
          Manage and monitor Red Line Blue Line Survey activities.
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
          Survey List
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
          New Survey
        </button>
      </div>

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
                    Title
                  </th>
                  <th className="px-4 font-semibold whitespace-nowrap">
                    Survey Code
                  </th>
                  <th className="px-4 font-semibold whitespace-nowrap">
                    District
                  </th>
                  <th className="px-4 font-semibold whitespace-nowrap">
                    Date of GR Issued
                  </th>
                  <th className="px-4 font-semibold whitespace-nowrap">
                    Allocated Budget
                  </th>
                  <th className="px-4 font-semibold whitespace-nowrap">
                    Utilized Budget
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
                      colSpan={8}
                      className="px-4 py-8 text-center text-gray-500 font-medium"
                    >
                      Loading surveys...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-red-500 font-medium"
                    >
                      Failed to load surveys. Please try again.
                    </td>
                  </tr>
                ) : surveys.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-gray-500 font-medium"
                    >
                      No surveys found. Click "New Survey" to add one.
                    </td>
                  </tr>
                ) : (
                  surveys.map((survey, index) => (
                    <tr
                      key={survey.id || index}
                      className="hover:bg-blue-50/50 transition-colors h-14 even:bg-gray-50/50"
                    >
                      <td className="px-4">{survey.surveyCode}</td>
                      <td className="px-4">{survey.title}</td>
                      <td className="px-4">
                        <span
                          className="truncate max-w-25 inline-block"
                          title={
                            districtMap[survey.districtId] || survey.districtId
                          }
                        >
                          {districtMap[survey.districtId] || survey.districtId}
                        </span>
                      </td>
                      <td className="px-4">
                        {formatDate(survey.grIssuedDate)}
                      </td>
                      <td className="px-4">
                        {formatCurrency(survey.allocatedBudget)}
                      </td>
                      <td className="px-4">
                        {formatCurrency(survey.utilizedBudget)}
                      </td>
                      <td className="px-4">
                        {formatDate(survey.completionDate)}
                      </td>

                      <td className="px-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => setSelectedSurvey(survey)}
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

          {surveys.length > 0 && (
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

      {activeTab === "new" && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-[20px] font-semibold mb-6 text-[#0B1F4D]">
            Add New Survey
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Survey Code
              </label>
              <input
                type="text"
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
                value={formData.surveyCode}
                onChange={(e) =>
                  setFormData({ ...formData, surveyCode: e.target.value })
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
                District
              </label>
              <select
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 disabled:opacity-50"
                value={formData.districtId}
                onChange={(e) =>
                  setFormData({ ...formData, districtId: e.target.value })
                }
                disabled={isDistrictsLoading}
              >
                <option value="" disabled>
                  {isDistrictsLoading
                    ? "Loading districts..."
                    : "Select District"}
                </option>
                {districtsList.map((district: any) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Date of GR Issued
              </label>
              <input
                type="date"
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
                value={formData.grIssuedDate}
                onChange={(e) =>
                  setFormData({ ...formData, grIssuedDate: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Allocated Budget
              </label>
              <input
                type="number"
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
                value={formData.allocatedBudget}
                onChange={(e) =>
                  setFormData({ ...formData, allocatedBudget: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Utilized Budget
              </label>
              <input
                type="number"
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
                value={formData.utilizedBudget}
                onChange={(e) =>
                  setFormData({ ...formData, utilizedBudget: e.target.value })
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
                GR Issued Upload
              </label>
              <input
                type="file"
                className="w-full text-[14px] file:mr-4 file:py-2 file:px-4 file:rounded-[10px] file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    grDocument: e.target.files?.[0] || null,
                  })
                }
              />
            </div>

            <div className="md:col-span-2">
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