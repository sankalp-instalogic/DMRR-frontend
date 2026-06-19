import { useState } from "react";
import { Plus, Eye, Download, ArrowLeft, Printer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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

// Helper to format dates from ISO string (e.g., 2026-06-01T12:09:16.871 -> 2026-06-01)
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return dateString.split("T")[0];
};

// Helper to format currency
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
  
  // --- Pagination State ---
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const axiosPrivate = useAxiosPrivate();

  const [formData, setFormData] = useState<Survey>({
    surveyCode: "",
    title: "",
    districtId: "",
    grIssuedDate: "",
    allocatedBudget: "",
    utilizedBudget: "",
    completionDate: "",
    grDocument: null,
    completionCertificate: null,
  });

  // --- GET ROUTE INTEGRATION (Updated with Pagination) ---
  const { data, isLoading, isError, isFetching } = useQuery<PaginatedResponse>({
    queryKey: ["rlbl-surveys", page, pageSize], // Re-fetch when page or pageSize changes
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/surveys/rlbl", {
        params: {
          page: page,
          pageSize: pageSize,
        },
      });
      return response.data;
    },
  });

  // Extract items from the paginated response, fallback to empty array
  const surveys = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 0;


    const { data: districtsData, isLoading: isDistrictsLoading } = useQuery({
    queryKey: ["districts"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/districts", {
        params: { page: 1, pageSize: 100 },
      });
      return response.data;
    },
  });

    const districts = districtsData ?? [];
  const districtMap = isDistrictsLoading
    ? {}
    : Object.fromEntries(
        districts.items?.map((district: any) => [district.id, district.name]),
      );

  // --- POST ROUTE (ON HOLD) ---
  const handleSave = () => {
    console.log("POST request is on hold. Form Data:", formData);
    
    // Reset form
    setFormData({
      surveyCode: "",
      title: "",
      districtId: "",
      grIssuedDate: "",
      allocatedBudget: "",
      utilizedBudget: "",
      completionDate: "",
      grDocument: null,
      completionCertificate: null,
    });

    setActiveTab("list");
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

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 cursor-pointer bg-white border border-[#0B1F4D] text-[#0B1F4D] px-4 h-10 rounded-[10px] text-[14px] font-medium hover:bg-gray-50 transition-colors"
          >
            <Printer className="size-4" />
            Print
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-[20px] font-semibold text-[#0B1F4D] mb-6 pb-4 border-b border-gray-200">
            Survey Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6">
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">Survey Code</label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">{selectedSurvey.surveyCode}</p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">District ID</label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">{districtMap[selectedSurvey.districtId]}</p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">Title</label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">{selectedSurvey.title}</p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">Date of GR Issued</label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">{formatDate(selectedSurvey.grIssuedDate)}</p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">Allocated Budget</label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">{formatCurrency(selectedSurvey.allocatedBudget)}</p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">Utilized Budget</label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">{formatCurrency(selectedSurvey.utilizedBudget)}</p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">Date of Completion</label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">{formatDate(selectedSurvey.completionDate)}</p>
            </div>

            <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-2"></div>

            <div>
              <label className="text-[16px] font-semibold text-[#0B1F4D] block mb-4">GR Issued</label>
              <div className="flex gap-3">
                <button className="flex cursor-pointer items-center gap-1.5 bg-white border border-[#0B1F4D] text-[#0B1F4D] px-4 h-10 rounded-[10px] text-[14px] font-medium hover:bg-gray-50 transition-colors">
                  <Eye className="size-4" /> View
                </button>
                <button className="flex cursor-pointer items-center gap-1.5 bg-[#0B1F4D] text-white px-4 h-10 rounded-[10px] text-[14px] font-medium hover:bg-[#0B1F4D]/90 transition-colors">
                  <Download className="size-4" /> Download
                </button>
              </div>
            </div>

            <div>
              <label className="text-[16px] font-semibold text-[#0B1F4D] block mb-4">Completion Certificate</label>
              <div className="flex gap-3">
                <button className="flex cursor-pointer items-center gap-1.5 bg-white border border-[#0B1F4D] text-[#0B1F4D] px-4 h-10 rounded-[10px] text-[14px] font-medium hover:bg-gray-50 transition-colors">
                  <Eye className="size-4" /> View
                </button>
                <button className="flex cursor-pointer items-center gap-1.5 bg-[#0B1F4D] text-white px-4 h-10 rounded-[10px] text-[14px] font-medium hover:bg-[#0B1F4D]/90 transition-colors">
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
        <h1 className="text-[30px] font-bold text-[#0B1F4D]">Red Line Blue Line Survey</h1>
        <p className="text-[14px] font-medium text-gray-500 mt-1">
          Manage and monitor Red Line Blue Line Survey activities.
        </p>
      </div>

      {/* Top Buttons as Tabs */}
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

      {/* Survey List */}
      {activeTab === "list" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 flex flex-col relative">
          
          {/* Loading Overlay for Pagination Refetching */}
          {isFetching && !isLoading && (
             <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <span className="text-[#0B1F4D] font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">Updating...</span>
             </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-[13px] text-left">
              <thead className="bg-[#F5F7FA] text-[#0B1F4D]">
                <tr className="h-14">
                  <th className="px-4 font-semibold whitespace-nowrap">Sr No</th>
                  <th className="px-4 font-semibold whitespace-nowrap">Survey Code</th>
                  <th className="px-4 font-semibold whitespace-nowrap">District ID</th>
                  <th className="px-4 font-semibold whitespace-nowrap">Date of GR Issued</th>
                  <th className="px-4 font-semibold whitespace-nowrap">Allocated Budget</th>
                  <th className="px-4 font-semibold whitespace-nowrap">Utilized Budget</th>
                  <th className="px-4 font-semibold whitespace-nowrap">Date of Completion</th>
                  <th className="px-4 font-semibold whitespace-nowrap text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500 font-medium">
                      Loading surveys...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-red-500 font-medium">
                      Failed to load surveys. Please try again.
                    </td>
                  </tr>
                ) : surveys.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500 font-medium">
                      No surveys found. Click "New Survey" to add one.
                    </td>
                  </tr>
                ) : (
                  surveys.map((survey, index) => (
                    <tr
                      key={survey.id || index}
                      className="hover:bg-blue-50/50 transition-colors h-14 even:bg-gray-50/50"
                    >
                      <td className="px-4 font-medium text-[#0B1F4D] whitespace-nowrap">
                        {/* Dynamic Serial Number Logic */}
                        {(page - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-4">{survey.surveyCode}</td>
                      <td className="px-4">
                        <span className="truncate max-w-25 inline-block" title={districtMap[survey.districtId]}>
                           {districtMap[survey.districtId]}
                        </span>
                      </td>
                      <td className="px-4">{formatDate(survey.grIssuedDate)}</td>
                      <td className="px-4">{formatCurrency(survey.allocatedBudget)}</td>
                      <td className="px-4">{formatCurrency(survey.utilizedBudget)}</td>
                      <td className="px-4">{formatDate(survey.completionDate)}</td>

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

          {/* Pagination Controls */}
          {surveys.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-[#F5F7FA]">
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-gray-500 font-medium">
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} entries
                </span>
                
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1); // Reset to page 1
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

      {/* New Survey Form */}
      {activeTab === "new" && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-[20px] font-semibold mb-6 text-[#0B1F4D]">
            Add New Survey
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">Survey Code</label>
              <input
                type="text"
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
                value={formData.surveyCode}
                onChange={(e) => setFormData({ ...formData, surveyCode: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">District ID</label>
              <input
                type="text"
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
                value={formData.districtId}
                onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">Date of GR Issued</label>
              <input
                type="date"
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
                value={formData.grIssuedDate}
                onChange={(e) => setFormData({ ...formData, grIssuedDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">Allocated Budget</label>
              <input
                type="number"
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
                value={formData.allocatedBudget}
                onChange={(e) => setFormData({ ...formData, allocatedBudget: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">Utilized Budget</label>
              <input
                type="number"
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
                value={formData.utilizedBudget}
                onChange={(e) => setFormData({ ...formData, utilizedBudget: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">Date of Completion</label>
              <input
                type="date"
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
                value={formData.completionDate}
                onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">GR Issued Upload</label>
              <input
                type="file"
                className="w-full text-[14px] file:mr-4 file:py-2 file:px-4 file:rounded-[10px] file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={(e) => setFormData({ ...formData, grDocument: e.target.files?.[0] || null })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[14px] font-medium text-gray-700 mb-1">Completion Certificate Upload</label>
              <input
                type="file"
                className="w-full text-[14px] file:mr-4 file:py-2 file:px-4 file:rounded-[10px] file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={(e) => setFormData({ ...formData, completionCertificate: e.target.files?.[0] || null })}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => setActiveTab("list")}
              className="px-4 h-10 cursor-pointer bg-white border border-[#0B1F4D] text-[#0B1F4D] rounded-[10px] font-medium hover:bg-gray-50 transition-colors text-[14px]"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-4 h-10 cursor-pointer bg-[#0B1F4D] text-white rounded-[10px] font-medium hover:bg-[#0B1F4D]/90 transition-colors text-[14px]"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}