import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  Upload as UploadIcon,
  Save,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input, Upload, Button as AntdButton } from "antd";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { cn } from "../../../../utils/utils";
import { buttonVariants } from "../../../components/ui/button";

// Document Type Mapping (ownerType is 2 for this table context)
const DOCUMENT_TYPES: Record<string, string> = {
  techBidOpening: "30",
  techEvaluation: "31",
  finBidOpening: "32",
  finEvaluation: "33",
  aoc: "10",
};

export function ProcurementTenderClosureDetails() {
  const { id } = useParams();
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

  const { data: procurementData, isLoading: isProcurementLoading } = useQuery({
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

  // --- DATA PREPARATION ---

  const districts = districtsData?.items ?? [];
  const departments = deptData?.items ?? [];

  const getDemandLocationName = () => {
    if (!procurementData) return "Loading...";

    if (
      procurementData.demandFrom === "Districts" &&
      procurementData.beneficiaryDistrictId
    ) {
      const dist = districts.find(
        (d: any) => d.id === procurementData.beneficiaryDistrictId,
      );
      return dist ? dist.name : "Loading District...";
    }
    if (
      procurementData.demandFrom === "Other Departments" &&
      procurementData.beneficiaryDepartmentId
    ) {
      const dept = departments.find(
        (d: any) => d.id === procurementData.beneficiaryDepartmentId,
      );
      return dept ? dept.name : "Loading Department...";
    }
    return procurementData.demandFrom || "N/A";
  };

  // --- MUTATIONS ---

  const markForClosureMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosPrivate.post(
        `/api/v1/Procurements/${id}/committees/5/decision`,
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
      documentType,
    }: {
      file: File;
      documentType: string;
    }) => {
      if (!id) throw new Error("No ID found");
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("ownerId", id);
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

  // --- EVENT HANDLERS ---

  const handleFileUpload = (stageKey: string) => (file: File) => {
    setFiles((prev) => ({ ...prev, [stageKey]: file }));
    return false; // Prevent automatic upload by Antd
  };

  const handleSaveClosure = async () => {
    if (!id) return;

    try {
      // 1. First trigger the mark for closure API
      await markForClosureMutation.mutateAsync();

      // 2. Upload all selected documents
      const uploadPromises = Object.entries(files).map(([stageKey, file]) => {
        const documentType = DOCUMENT_TYPES[stageKey];
        if (file && documentType) {
          return uploadMutation.mutateAsync({
            file,
            documentType,
          });
        }
        return Promise.resolve();
      });

      await Promise.all(uploadPromises);

      // 3. Clear cache and redirect on success
      queryClient.invalidateQueries({ queryKey: ["procurements"] });
      navigate("/procurement-tendering/tenders");
    } catch (err) {
      console.error("Failed to complete closure or document uploads:", err);
    }
  };

  // --- RENDER HELPERS ---

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

  const isSavingClosure =
    markForClosureMutation.isPending || uploadMutation.isPending;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link
          to="/procurement-tendering/tenders"
          className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            Procurement Closure Details
            {isProcurementLoading && (
              <Loader2 className="size-5 animate-spin text-gray-400" />
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Review procurement details and upload final closure documents.
          </p>
        </div>
      </div>

      {/* Basic Information Section */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-gray-50/50">
          <h2 className="text-lg font-semibold text-primary">
            Procurement Information
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Procurement Ref No
              </label>
              <Input
                value={procurementData?.procurementRefNo || ""}
                disabled
                placeholder={isProcurementLoading ? "Loading..." : "N/A"}
                className="w-full bg-muted/30 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Financial Year
              </label>
              <Input
                value={procurementData?.financialYear || ""}
                disabled
                placeholder={isProcurementLoading ? "Loading..." : "N/A"}
                className="w-full bg-muted/30 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Item Name
              </label>
              <Input
                value={procurementData?.itemName || ""}
                disabled
                placeholder={isProcurementLoading ? "Loading..." : "N/A"}
                className="w-full bg-muted/30 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Demand From
              </label>
              <Input
                value={getDemandLocationName()}
                disabled
                placeholder={isProcurementLoading ? "Loading..." : "N/A"}
                className="w-full bg-muted/30 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Total Quantity
              </label>
              <Input
                value={procurementData?.quantity ?? ""}
                disabled
                placeholder={isProcurementLoading ? "Loading..." : "N/A"}
                className="w-full bg-muted/30 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Award Cost (Lakhs)
              </label>
              <Input
                value={
                  procurementData?.awardCostInclGstLakhs
                    ? `₹${procurementData.awardCostInclGstLakhs.toLocaleString("en-IN")}`
                    : ""
                }
                disabled
                placeholder={isProcurementLoading ? "Loading..." : "N/A"}
                className="w-full bg-muted/30 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Document Upload Tracking Table */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-gray-50/50">
          <h2 className="text-lg font-semibold text-primary">
            Closure Documents Upload
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

              {/* Process 3 */}
              <tr className="bg-gray-50/30">
                <td
                  colSpan={3}
                  className="px-6 py-2 font-medium text-primary text-xs uppercase tracking-wider"
                >
                  Process 3
                </td>
              </tr>
              {renderStageRow("AOC", "aoc")}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-white p-4 border-t border-border shadow-lg z-10 -mx-6 -mb-6 px-6">
        <button
          onClick={() => navigate("/procurement-tendering/tenders")}
          disabled={isSavingClosure}
          className="px-6 py-2 cursor-pointer bg-muted text-primary rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-70"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveClosure}
          disabled={isSavingClosure}
          className={cn(buttonVariants({ variant: "default" }))}
        >
          {isSavingClosure ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="size-4" />
              Save Closure
            </>
          )}
        </button>
      </div>
    </div>
  );
}
