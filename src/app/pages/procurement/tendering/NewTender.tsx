import { useState } from "react";
import { Link, useNavigate } from "react-router"; // Note: react-router-dom is standard for v6
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate"; // Adjust path as necessary
import { Input, Button, Upload } from "antd"; // <-- Added Ant Design imports
import {
  ArrowLeft,
  CheckCircle2,
  Upload as UploadIcon, // Renamed to avoid collision with Antd's Upload
  XCircle,
  Save,
  Loader2,
} from "lucide-react";
import { cn } from "../../../../utils/utils";
import { buttonVariants } from "../../../components/ui/button";

// Document Type Mapping (ownerType is 8 for Tenders)
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

  const [basicInfo, setBasicInfo] = useState({
    organizationChain: "",
    tenderTitle: "",
    tenderRefNo: "",
    tenderCode: "",
  });

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    techBidOpening: null,
    techEvaluation: null,
    finBidOpening: null,
    finEvaluation: null,
    aoc: null,
  });

  // Works perfectly with Antd Input
  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value });
  };

  // Updated to work with Antd Upload's beforeUpload hook
  const handleFileUpload = (stageKey: string) => (file: File) => {
    setFiles((prev) => ({ ...prev, [stageKey]: file }));
    // Return false to stop Antd from trying to auto-upload the file immediately
    return false;
  };

  // ==========================================
  // MUTATIONS
  // ==========================================

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
      uploadData.append("ownerType", "15");
      uploadData.append("documentType", documentType);

      const response = await axiosPrivate.post(
        "/api/v1/Documents/upload",
        uploadData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newData: typeof basicInfo) => {
      const response = await axiosPrivate.post(
        "/api/v1/procurement-tenders",
        newData,
        { headers: { "Content-Type": "application/json" } },
      );
      return response.data;
    },
    onSuccess: async (responseData) => {
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
        }
      }

      queryClient.invalidateQueries({ queryKey: ["tenders"] });
      navigate("/procurement-tendering/tenders");
    },
    onError: (err) => {
      console.error("Failed to save tender:", err);
    },
  });

  const handleSave = () => {
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
          {/* Replaced HTML file input with Antd Upload */}
          <Upload
            beforeUpload={handleFileUpload(stageKey)}
            showUploadList={false}
            accept="*" // Adjust accepted file types if needed (e.g., ".pdf,.doc")
          >
            <Button
              icon={<UploadIcon className="size-3.5" />}
              style={{
<<<<<<< HEAD
                backgroundColor: "var(--secondary)",
                color: "var(--secondary-foreground)",
                border: "none",
              }}
              className="hover:bg-info/90 font-medium"
=======
                backgroundColor: "#1E5AA8",
                color: "white",
                border: "none",
              }}
              className="hover:bg-blue-700 font-medium"
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
            >
              Upload Document
            </Button>
          </Upload>
        </td>
        <td className="px-6 py-4 text-center">
          {isUploaded ? (
<<<<<<< HEAD
            <CheckCircle2 className="size-5 text-success mx-auto" />
          ) : (
            <XCircle className="size-5 text-destructive mx-auto" />
=======
            <CheckCircle2 className="size-5 text-green-500 mx-auto" />
          ) : (
            <XCircle className="size-5 text-red-500 mx-auto" />
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
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
<<<<<<< HEAD
          className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-primary"
=======
          className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-[#0B1F4D]"
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
<<<<<<< HEAD
          <h1 className="text-2xl font-bold text-primary">
=======
          <h1 className="text-2xl font-bold text-[#0B1F4D]">
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
            Create New Tender
          </h1>
          <p className="text-muted-foreground mt-1">
            Fill in the details to create a new tender
          </p>
        </div>
      </div>

      {/* Basic Information Section */}
<<<<<<< HEAD
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/50">
          <h2 className="text-lg font-semibold text-primary">
=======
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-gray-50/50">
          <h2 className="text-lg font-semibold text-[#0B1F4D]">
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
            Basic Information
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Organization Chain
              </label>
              {/* Replaced standard input with Antd Input */}
              <Input
                name="organizationChain"
                value={basicInfo.organizationChain}
                onChange={handleBasicInfoChange}
                placeholder="Enter organization chain"
                size="large"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Tender Title
              </label>
              <Input
                name="tenderTitle"
                value={basicInfo.tenderTitle}
                onChange={handleBasicInfoChange}
                placeholder="Enter tender title"
                size="large"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Tender Ref No
              </label>
              <Input
                name="tenderRefNo"
                value={basicInfo.tenderRefNo}
                onChange={handleBasicInfoChange}
                placeholder="Enter tender ref no"
                size="large"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Tender Code
              </label>
              <Input
                name="tenderCode"
                value={basicInfo.tenderCode}
                onChange={handleBasicInfoChange}
                placeholder="Enter tender code"
                size="large"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tender Process Table */}
<<<<<<< HEAD
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/50">
          <h2 className="text-lg font-semibold text-primary">
=======
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-gray-50/50">
          <h2 className="text-lg font-semibold text-[#0B1F4D]">
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
            Tender Process
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Stages</th>
                <th className="px-6 py-3 font-medium text-center">
                  Upload Document
                </th>
                <th className="px-6 py-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* Process 1 */}
              <tr className="bg-gray-50/30">
                <td
                  colSpan={4}
                  className="px-6 py-2 font-medium text-[#0B1F4D] text-xs uppercase tracking-wider"
                >
                  Process 1
                </td>
              </tr>
              {renderStageRow("Technical Bid Opening", "techBidOpening")}
              {renderStageRow("Technical Evaluation", "techEvaluation")}

              {/* Process 2 */}
              <tr className="bg-gray-50/30">
                <td
                  colSpan={4}
                  className="px-6 py-2 font-medium text-[#0B1F4D] text-xs uppercase tracking-wider"
                >
                  Process 2
                </td>
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
        {/* Replaced standard button with Antd Button and built-in loading state */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            buttonVariants({ variant: "default" }),
            "cursor-pointer",
          )}
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
