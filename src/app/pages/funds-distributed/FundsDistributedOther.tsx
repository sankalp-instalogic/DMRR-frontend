import { useState } from "react";
import {
  Eye,
  Download,
  ArrowLeft,
  Plus,
  FileText,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { queryClient } from "../../App";

type RecordType = {
  id: string;
  lineDepartmentId: string;
  utilizationHead?: string;
  allocatedCr: number;
  utilizedCr: number;
  issuingDate: string;
};

export function FundsDistributedOther() {
  const axiosPrivate = useAxiosPrivate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [activeTab, setActiveTab] = useState<"overview" | "new" | "view">(
    "overview",
  );
  const [viewRecord, setViewRecord] = useState<RecordType | null>(null);

  // Form states
  const [formDepartment, setFormDepartment] = useState("");
  const [formHead, setFormHead] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formAllocated, setFormAllocated] = useState("");
  const [formUtilized, setFormUtilized] = useState("");

  // --- QUERIES ---

  // 1. Fetch Departments for Dropdown and Mapping
  const { data: deptData, isLoading: isDepartmentsLoading } = useQuery({
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

  const departments = deptData?.items ?? [];
  const departmentsMap = isDepartmentsLoading
    ? {}
    : Object.fromEntries(departments.map((dept: any) => [dept.id, dept.name]));

  // 2. Fetch Utilizations
  const {
    data: utilsData,
    isLoading: isUtilsLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["utilizations"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/funds/utilizations");
      return response.data;
    },
  });

  const records: RecordType[] = utilsData?.items || utilsData || [];

  // 3. Fetch Document for View Tab
  const { data: documentsData, isLoading: isDocumentsLoading } = useQuery({
    queryKey: ["documents-other", viewRecord?.id],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Documents/list", {
        params: { ownerType: "14", ownerId: viewRecord?.id }, // Using "14" to match upload mutation
      });
      return response.data;
    },
    enabled: !!viewRecord?.id,
  });

  const getDocument = () => {
    const docs = Array.isArray(documentsData) ? documentsData : documentsData?.items || [];
    return docs.length > 0 ? docs[0] : null;
  };
  const utilDoc = getDocument();

  // --- MUTATIONS ---
  const uploadMutation = useMutation({
    mutationFn: async ({ file, ownerId }: { file: File; ownerId: string }) => {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("ownerId", ownerId);
      uploadData.append("ownerType", "14");
      uploadData.append("documentType", "27");

      return await axiosPrivate.post("/api/v1/Documents/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newData: any) => {
      const response = await axiosPrivate.post(
        "/api/v1/funds/utilizations",
        newData,
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      return response.data; 
    },
    onSuccess: async (responseData) => {
      // Trigger file upload if a file was selected and we have a new record ID
      if (responseData?.id && selectedFile) {
        try {
          await uploadMutation.mutateAsync({
            file: selectedFile,
            ownerId: responseData.id,
          });
        } catch (err) {
          console.error("Document upload failed:", err);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["utilizations"] });

      // Reset form
      setFormDepartment("");
      setFormHead("");
      setFormDate("");
      setFormAllocated("");
      setFormUtilized("");
      setSelectedFile(null); 

      setActiveTab("overview");
    },
  });

  // --- HANDLERS ---
  const handleView = (record: RecordType) => {
    setViewRecord(record);
    setActiveTab("view");
  };

  const handleSave = () => {
    const payload = {
      lineDepartmentId: formDepartment,
      utilizationHead: formHead,
      allocatedCr: Number(formAllocated),
      utilizedCr: Number(formUtilized),
      issuingDate: new Date(formDate).toISOString(),
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

  if (isUtilsLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#0B1F4D]"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <h3 className="font-semibold text-red-800">Something went wrong</h3>
          <p className="mt-1 text-sm text-red-600">
            {(error as Error).message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] font-bold text-[#0B1F4D]">
          Funds Distributed to Other Utilizations
        </h1>
        <p className="text-[14px] font-medium text-gray-500 mt-1">
          Manage and track funds allocated for various specific heads
        </p>
      </div>

      {activeTab !== "view" && (
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-medium text-[14px] transition-colors rounded-[10px] cursor-pointer ${
              activeTab === "overview"
                ? "bg-[#0B1F4D] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={`px-4 py-2 font-medium text-[14px] transition-colors rounded-[10px] cursor-pointer ${
              activeTab === "new"
                ? "bg-[#0B1F4D] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            New Utilization
          </button>
        </div>
      )}

      {activeTab === "overview" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] text-left">
              <thead className="bg-[#F5F7FA] text-[#0B1F4D]">
                <tr className="h-14">
                  <th className="px-4 font-semibold whitespace-nowrap">
                    Sr No
                  </th>
                  <th className="font-semibold">Utilization Department</th>
                  <th className="font-semibold">Utilization Head</th>
                  <th className="font-semibold">Allocated Amount</th>
                  <th className="font-semibold">Utilized Amount</th>
                  <th className="font-semibold">Date of Issuing</th>
                  <th className="px-4 font-semibold whitespace-nowrap text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.length > 0 ? (
                  records.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className="hover:bg-blue-50/50 transition-colors h-14 even:bg-gray-50/50"
                    >
                      <td className="px-4 font-medium text-[#0B1F4D] whitespace-nowrap">
                        {index + 1}
                      </td>
                      <td>
                        {departmentsMap[row.lineDepartmentId] || "Unknown Dept"}
                      </td>
                      <td>{row.utilizationHead || "-"}</td>
                      <td>₹{(row.allocatedCr || 0).toFixed(2)} Cr</td>
                      <td>₹{(row.utilizedCr || 0).toFixed(2)} Cr</td>
                      <td>{new Date(row.issuingDate).toLocaleDateString()}</td>
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
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-500">
                      No utilization records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "new" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-[20px] font-semibold text-[#0B1F4D] mb-6">
            New Utilization
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-gray-700">
                Utilization Department
              </label>
              <select
                value={formDepartment}
                onChange={(e) => setFormDepartment(e.target.value)}
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] bg-white text-[14px]"
              >
                <option value="">Select Department</option>
                {departments.map((d: any) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.code ? `(${d.code})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-medium text-gray-700">
                Utilization Head
              </label>
              <input
                type="text"
                value={formHead}
                onChange={(e) => setFormHead(e.target.value)}
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] text-[14px]"
                placeholder="Enter utilization head"
              />
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
                Budget Allocated (Cr)
              </label>
              <input
                type="number"
                value={formAllocated}
                onChange={(e) => setFormAllocated(e.target.value)}
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] text-[14px]"
                placeholder="Enter allocated amount in Cr"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-medium text-gray-700">
                Budget Utilized (Cr)
              </label>
              <input
                type="number"
                value={formUtilized}
                onChange={(e) => setFormUtilized(e.target.value)}
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] text-[14px]"
                placeholder="Enter utilized amount in Cr"
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
                  id="cert-upload"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSelectedFile(e.target.files[0]);
                    }
                    e.target.value = "";
                  }}
                />
                <label
                  htmlFor="cert-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {selectedFile ? (
                    <>
                      <FileText className="size-6 text-[#0B1F4D] mb-2" />
                      <span className="text-[14px] font-medium text-[#0B1F4D]">
                        {selectedFile.name}
                      </span>
                      <span className="text-[12px] text-gray-500 mt-1">
                        Click to change file (
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </>
                  ) : (
                    <>
                      <Plus className="size-6 text-[#0B1F4D] mb-2" />
                      <span className="text-[14px] font-medium text-[#0B1F4D]">
                        Click to upload Utilization Certificate
                      </span>
                      <span className="text-[12px] text-gray-500 mt-1">
                        Accepts PDF, DOC, DOCX
                      </span>
                    </>
                  )}
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
              className="px-4 h-10 bg-[#0B1F4D] text-white rounded-[10px] font-medium hover:bg-[#0B1F4D]/90 transition-colors text-[14px] disabled:opacity-50 cursor-pointer"
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
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-[20px] font-semibold text-[#0B1F4D] mb-6 pb-4 border-b border-gray-200">
              Utilization Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-6">
              <div>
                <p className="text-[14px] font-medium text-gray-500 mb-1">
                  Utilization Department
                </p>
                <p className="font-semibold text-[16px] text-[#0B1F4D]">
                  {departmentsMap[viewRecord.lineDepartmentId] ||
                    "Unknown Dept"}
                </p>
              </div>
              <div>
                <p className="text-[14px] font-medium text-gray-500 mb-1">
                  Utilization Head
                </p>
                <p className="font-semibold text-[16px] text-[#0B1F4D]">
                  {viewRecord.utilizationHead || "-"}
                </p>
              </div>
              <div>
                <p className="text-[14px] font-medium text-gray-500 mb-1">
                  Allocated Amount
                </p>
                <p className="font-semibold text-[16px] text-[#0B1F4D]">
                  ₹{((viewRecord.allocatedCr || 0) / 100).toFixed(2)} Cr
                </p>
              </div>
              <div>
                <p className="text-[14px] font-medium text-gray-500 mb-1">
                  Utilized Amount
                </p>
                <p className="font-semibold text-[16px] text-[#0B1F4D]">
                  ₹{((viewRecord.utilizedCr || 0) / 100).toFixed(2)} Cr
                </p>
              </div>
              <div>
                <p className="text-[14px] font-medium text-gray-500 mb-1">
                  Date of Issuing
                </p>
                <p className="font-semibold text-[16px] text-[#0B1F4D]">
                  {new Date(viewRecord.issuingDate).toLocaleDateString()}
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
                      {utilDoc.fileName || "Utilization_Certificate.pdf"}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDownload(utilDoc)}
                      className="inline-flex items-center gap-1.5 px-4 h-10 bg-[#0B1F4D] text-white rounded-[10px] transition-colors text-[14px] font-medium hover:bg-[#0B1F4D]/90 cursor-pointer"
                    >
                      <Download className="size-4" />
                      Download
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[14px] text-gray-500 italic">No document available for this utilization.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}