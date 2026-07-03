import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Upload as UploadIcon,
  Save,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { cn } from "../../../../utils/utils";
import { buttonVariants } from "../../../components/ui/button";
import { Upload, Button as AntdButton, Input } from "antd";

const DOCUMENT_TYPES: Record<string, string> = {
  techBidOpening: "30",
  techEvaluation: "31",
  finBidOpening: "32",
  finEvaluation: "33",
  aoc: "10",
};

export function ProcurementClosure() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    techBidOpening: null,
    techEvaluation: null,
    finBidOpening: null,
    finEvaluation: null,
    aoc: null,
  });

  // --- QUERIES ---
  const { data: procurement, isLoading: isProcurementLoading } = useQuery({
    queryKey: ["procurement", id],
    queryFn: async () => {
      const response = await axiosPrivate.get(`/api/v1/Procurements/${id}`);
      return response.data;
    },
    enabled: !!id,
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
        { params: { page: 1, pageSize: 100 } },
      );
      return response.data;
    },
  });

  // --- DATA MAPPING ---
  const districts = districtsData?.items ?? [];
  const departments = deptData?.items ?? [];

  const getDemandLocationName = () => {
    if (!procurement) return "N/A";

    if (
      procurement.demandFrom === "Districts" &&
      procurement.beneficiaryDistrictId
    ) {
      const dist = districts.find(
        (d: any) => d.id === procurement.beneficiaryDistrictId,
      );
      return dist ? dist.name : "Loading District...";
    }
    if (
      procurement.demandFrom === "Other Departments" &&
      procurement.beneficiaryDepartmentId
    ) {
      const dept = departments.find(
        (d: any) => d.id === procurement.beneficiaryDepartmentId,
      );
      return dept ? dept.name : "Loading Department...";
    }
    return procurement.demandFrom || "N/A";
  };

  // --- MUTATIONS ---
  const markForClosureMutation = useMutation({
    mutationFn: async (procurementId: string) => {
      const response = await axiosPrivate.post(
        `/api/v1/Procurements/${procurementId}/committees/5/decision`,
        {
          approved: true,
          decisionDate: new Date().toISOString(),
          documentId: null,
        },
      );
      return response.data;
    },
  });

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
      uploadData.append("ownerType", "2");
      uploadData.append("documentType", documentType);

      const response = await axiosPrivate.post(
        "/api/v1/Documents/upload",
        uploadData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response.data;
    },
  });

  // --- HANDLERS ---
  const handleFileUpload = (stageKey: string) => (file: File) => {
    setFiles((prev) => ({ ...prev, [stageKey]: file }));
    return false; // Prevent auto-upload by Antd
  };

  const handleSaveClosure = async () => {
    if (!id) return;

    try {
      await markForClosureMutation.mutateAsync(id);

      const uploadPromises = Object.entries(files).map(([stageKey, file]) => {
        const documentType = DOCUMENT_TYPES[stageKey];
        if (file && documentType) {
          return uploadMutation.mutateAsync({
            file,
            ownerId: id,
            documentType,
          });
        }
        return Promise.resolve();
      });

      await Promise.all(uploadPromises);

      queryClient.invalidateQueries({ queryKey: ["procurements"] });
      navigate("/procurement-tendering"); // Adjust fallback route as needed
    } catch (err) {
      console.error("Failed to complete closure or document uploads:", err);
    }
  };

  const isSavingClosure =
    markForClosureMutation.isPending || uploadMutation.isPending;

  const renderStageRow = (stageName: string, stageKey: string) => {
    const isUploaded = files[stageKey] !== null;

    return (
      <tr className="hover:bg-muted/50 transition-colors" key={stageKey}>
        <td className="px-6 py-4 pl-10">{stageName}</td>
        <td className="px-6 py-4 text-center">
          <Upload
            beforeUpload={handleFileUpload(stageKey)}
            showUploadList={false}
            accept="*"
          >
            <AntdButton
              icon={<UploadIcon className="size-3.5" />}
              style={{
                backgroundColor: "#1E5AA8",
                color: "white",
                border: "none",
              }}
              className="hover:bg-blue-700 font-medium"
            >
              Upload Document
            </AntdButton>
          </Upload>
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

  if (isProcurementLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin text-[#1E5AA8]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Procurement Closure
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review details and upload closure documents
          </p>
        </div>
      </div>

      {/* Procurement Read-Only Details */}
      <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b pb-2">
          Procurement Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Procurement Ref No
            </label>
            <Input
              size="large"
              value={procurement?.procurementRefNo || "N/A"}
              disabled
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Financial Year
            </label>
            <Input
              size="large"
              value={procurement?.financialYear || "N/A"}
              disabled
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Item Name
            </label>
            <Input
              size="large"
              value={procurement?.itemName || "N/A"}
              disabled
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Demand From
            </label>
            <Input size="large" value={getDemandLocationName()} disabled />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Total Quantity
            </label>
            <Input size="large" value={procurement?.quantity ?? 0} disabled />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Award Cost (Lakhs)
            </label>
            <Input
              size="large"
              value={`₹${procurement?.awardCostInclGstLakhs?.toLocaleString("en-IN") || "0"}`}
              disabled
            />
          </div>
        </div>
      </div>

      {/* Document Upload Table */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-border bg-gray-50/50">
          <h2 className="text-lg font-semibold text-primary">
            Upload Documents
          </h2>
          <p className="text-sm text-muted-foreground">
            Upload relevant closure documents for the selected procurement.
          </p>
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
                  colSpan={3}
                  className="px-6 py-2 font-medium text-primary text-xs uppercase tracking-wider"
                >
                  Process 1
                </td>
              </tr>
              {renderStageRow("Technical Bid Opening", "techBidOpening")}
              {renderStageRow("Technical Evaluation", "techEvaluation")}

              {/* Process 2 */}
              <tr className="bg-gray-50/30">
                <td
                  colSpan={3}
                  className="px-6 py-2 font-medium text-primary text-xs uppercase tracking-wider"
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

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 bg-white p-4 border-t border-border px-6">
          <button
            onClick={() => navigate(-1)}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "cursor-pointer",
            )}
            disabled={isSavingClosure}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClosure}
            disabled={isSavingClosure}
            className={cn(buttonVariants({ variant: "default" }),"cursor-pointer")}
          >
            {isSavingClosure ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <Save className="size-4 mr-2" />
            )}
            {isSavingClosure ? "Saving..." : "Save Closure"}
          </button>
        </div>
      </div>
    </div>
  );
}
