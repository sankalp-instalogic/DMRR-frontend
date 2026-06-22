import { useState } from "react";
import { Link, useNavigate } from "react-router"; // Note: react-router-dom is standard for v6
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate"; // Adjust path as necessary
import { 
  ArrowLeft, 
  CheckCircle2, 
  Upload, 
  XCircle,
  Loader2,
  Save
} from "lucide-react";

// Document Type Mapping (ownerType is 8 for Tenders)
// Note: Please verify the exact document type ID for 'aoc' with your backend team
const DOCUMENT_TYPES: Record<string, string> = {
  techBidOpening: "30",
  techEvaluation: "31",
  finBidOpening: "32",
  finEvaluation: "33",
  aoc: "10", 
};

export function NewTender() {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  // Updated state to match API payload keys
  const [basicInfo, setBasicInfo] = useState({
    organizationChain: "",
    tenderTitle: "",
    tenderRefNo: "",
    tenderCode: "",
  });

  // Track file uploads for each stage
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    techBidOpening: null,
    techEvaluation: null,
    finBidOpening: null,
    finEvaluation: null,
    aoc: null,
  });

  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (stageKey: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles({ ...files, [stageKey]: e.target.files[0] });
    }
  };

  // ==========================================
  // MUTATIONS
  // ==========================================

  const uploadMutation = useMutation({
    mutationFn: async ({ file, ownerId, documentType }: { file: File; ownerId: string; documentType: string }) => {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("ownerId", ownerId);
      uploadData.append("ownerType", "15"); 
      uploadData.append("documentType", documentType);

      const response = await axiosPrivate.post(
        "/api/v1/Documents/upload",
        uploadData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newData: typeof basicInfo) => {
      const response = await axiosPrivate.post(
        "/api/v1/procurement-tenders", // Updated endpoint
        newData,
        { headers: { "Content-Type": "application/json" } }
      );
      return response.data;
    },
    onSuccess: async (responseData) => {
      // Use the returned ID (checking both standard patterns)
      const tenderId = responseData?.id || responseData?.procurementId;
      
      if (tenderId) {
        const uploadPromises = Object.entries(files).map(([stageKey, file]) => {
          const documentType = DOCUMENT_TYPES[stageKey];
          if (file && documentType) {
            return uploadMutation.mutateAsync({
              file,
              ownerId: tenderId,
              documentType,
            });
          }
          return Promise.resolve();
        });

        try {
          await Promise.all(uploadPromises);
        } catch (err) {
          console.error("One or more document uploads failed:", err);
          // You might want to show a toast notification here
        }
      }

      // Invalidate queries to refresh the lists, then navigate
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
      navigate("/procurement-tendering/tenders");
    },
    onError: (err) => {
      console.error("Failed to save tender:", err);
    },
  });

  const handleSave = () => {
    // Note: if procurementId is strictly required by your backend instead of auto-generated,
    // you may need to attach a UUID here before passing it to the mutation.
    addMutation.mutate(basicInfo);
  };

  // ==========================================
  // RENDER HELPERS
  // ==========================================

  const renderStageRow = (stageName: string, stageKey: string) => {
    const isUploaded = files[stageKey] !== null;

    return (
      <tr className="hover:bg-muted/50 transition-colors" key={stageKey}>
        <td className="px-6 py-4 pl-10">{stageName}</td>
        <td className="px-6 py-4 text-center">
          <label className="inline-flex items-center gap-2 bg-[#1E5AA8] text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-xs font-medium">
            <Upload className="size-3.5" />
            <span>Upload Document</span>
            <input type="file" className="hidden" onChange={handleFileUpload(stageKey)} />
          </label>
        </td>
        <td className="px-6 py-4 text-center">
          {isUploaded ? (
            <CheckCircle2 className="size-5 text-green-500 mx-auto" />
          ) : (
            <XCircle className="size-5 text-red-500 mx-auto" />
          )}
        </td>
      </tr>
    );
  };

  const isSaving = addMutation.isPending || uploadMutation.isPending;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link 
          to="/procurement-tendering/tenders" 
          className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-[#0B1F4D]"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F4D]">Create New Tender</h1>
          <p className="text-muted-foreground mt-1">Fill in the details to create a new tender</p>
        </div>
      </div>

      {/* Basic Information Section */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-gray-50/50">
          <h2 className="text-lg font-semibold text-[#0B1F4D]">Basic Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Organization Chain</label>
              <input 
                type="text" 
                name="organizationChain"
                value={basicInfo.organizationChain}
                onChange={handleBasicInfoChange}
                placeholder="Enter organization chain" 
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Tender Title</label>
              <input 
                type="text" 
                name="tenderTitle"
                value={basicInfo.tenderTitle}
                onChange={handleBasicInfoChange}
                placeholder="Enter tender title" 
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Tender Ref No</label>
              <input 
                type="text" 
                name="tenderRefNo"
                value={basicInfo.tenderRefNo}
                onChange={handleBasicInfoChange}
                placeholder="Enter tender ref no" 
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Tender Code</label>
              <input 
                type="text" 
                name="tenderCode"
                value={basicInfo.tenderCode}
                onChange={handleBasicInfoChange}
                placeholder="Enter tender code" 
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tender Process Table */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-gray-50/50">
          <h2 className="text-lg font-semibold text-[#0B1F4D]">Tender Process</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Stages</th>
                <th className="px-6 py-3 font-medium text-center">Upload Document</th>
                <th className="px-6 py-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* Process 1 */}
              <tr className="bg-gray-50/30">
                <td colSpan={4} className="px-6 py-2 font-medium text-[#0B1F4D] text-xs uppercase tracking-wider">Process 1</td>
              </tr>
              {renderStageRow("Technical Bid Opening", "techBidOpening")}
              {renderStageRow("Technical Evaluation", "techEvaluation")}

              {/* Process 2 */}
              <tr className="bg-gray-50/30">
                <td colSpan={4} className="px-6 py-2 font-medium text-[#0B1F4D] text-xs uppercase tracking-wider">Process 2</td>
              </tr>
              {renderStageRow("Financial Bid Opening", "finBidOpening")}
              {renderStageRow("Financial Evaluation", "finEvaluation")}
              {renderStageRow("AOC", "aoc")}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-white p-4 border-t border-border shadow-lg z-10 -mx-6 -mb-6 px-6">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2 bg-[#1E5AA8] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}