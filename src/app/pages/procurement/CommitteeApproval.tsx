import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Upload as UploadIcon, // Aliased to prevent conflict with Antd's Upload
  ArrowRight,
  Loader2,
} from "lucide-react";
import { DatePicker, Input, Upload as AntUpload } from "antd";
import dayjs from "dayjs";
import type { ColDef } from "ag-grid-community";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { Table } from "../../components/Table"; // Adjust the import path to where your custom Table is located

interface CommitteeItem {
  id: string;
  refNo: string;
  year: string;
  item: string;
  demandFrom: string;
  awardCost: string;
  status: string;
  rows: { qty: string; location: string }[];
}

export interface CommitteeApprovalProps {
  title: string;
  description: string;
  forwardLabel: string;
  forwardPath: string;
  items: CommitteeItem[];
  committeeType: number;
}

export function DetailScreen({
  item,
  title,
  forwardLabel,
  forwardPath,
  committeeType,
  onBack,
}: {
  item: CommitteeItem;
  title: string;
  forwardLabel: string;
  forwardPath: string;
  committeeType: number;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState<"Approve" | "Reject" | "">("");
  const [dateOfApproval, setDateOfApproval] = useState("");
  const [approvalDoc, setApprovalDoc] = useState<File | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>("");

  const axiosPrivate = useAxiosPrivate();

  // Detail Query
  const { data: detailData, isLoading: isDetailLoading } = useQuery({
    queryKey: ["procurement-detail", item.id],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        `/api/v1/Procurements/${item.id}`,
      );
      return response.data;
    },
    enabled: !!item.id,
  });

  // Helper to map Committee Enum to Document Type Enum
  const getDocumentType = (type: number) => {
    switch (type) {
      case 1:
        return "34";
      case 2:
        return "35";
      case 3:
        return "36";
      case 4:
        return "37";
      default:
        return "";
    }
  };

  // Mutation 1: Submit Text Decision
  const decisionMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await axiosPrivate.post(
        `/api/v1/Procurements/${item.id}/committees/${committeeType}/decision`,
        payload,
      );
      return response.data;
    },
  });

  // Mutation 2: Upload Document
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

  const handleSubmit = async () => {
    const e: Record<string, string> = {};
    if (!decision) {
      e.decision = "Please select a decision";
    }
    if (decision === "Approve") {
      if (!dateOfApproval) e.date = "Date of approval is required";
      if (!approvalDoc) e.doc = "Approval document is required";
    }
    if (decision === "Reject" && !rejectionReason.trim()) {
      e.reason = "Reason for rejection is required";
    }
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setApiError("");

    try {
      let uploadedDocumentId = null;

      if (decision === "Approve" && approvalDoc) {
        const docType = getDocumentType(committeeType);
        if (docType) {
          const uploadResponse = await uploadMutation.mutateAsync({
            file: approvalDoc,
            ownerId: item.id,
            documentType: docType,
          });
          uploadedDocumentId = uploadResponse?.id;
        }
      }

      const payload = {
        approved: decision === "Approve",
        decisionDate:
          decision === "Approve" && dateOfApproval
            ? new Date(dateOfApproval).toISOString()
            : null,
        reason: decision === "Reject" ? rejectionReason : "",
        documentId: uploadedDocumentId,
      };

      await decisionMutation.mutateAsync(payload);

      queryClient.invalidateQueries({
        queryKey: ["procurement-detail", item.id],
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Submission failed:", err);
      setApiError("Failed to submit decision. Please try again.");
    }
  };

  const isSubmitting = decisionMutation.isPending || uploadMutation.isPending;

  // --- Success / Rejection Views ---
  if (submitted && decision === "Approve") {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to List
        </button>
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center space-y-4">
          <CheckCircle className="size-12 text-green-600 mx-auto" />
          <h3 className="text-xl font-semibold text-green-800">
            Approved Successfully
          </h3>
          <p className="text-green-700 text-sm">
            Procurement <strong>{item.refNo}</strong> has been approved and is
            ready to be forwarded.
          </p>
          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-white border border-border text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => navigate(forwardPath)}
              className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-opacity-90 transition-colors"
            >
              <ArrowRight className="size-4" /> {forwardLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted && decision === "Reject") {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to List
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center space-y-4">
          <XCircle className="size-12 text-red-500 mx-auto" />
          <h3 className="text-xl font-semibold text-red-800">Rejected</h3>
          <p className="text-red-700 text-sm">
            Procurement <strong>{item.refNo}</strong> has been rejected. The
            initiating department will be notified.
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-white border border-border text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  // --- Main Form View ---
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <ArrowLeft className="size-4" /> Back to List
      </button>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-primary mb-4">
            Procurement Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-muted/40 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">
                Procurement ID
              </p>
              <p className="font-semibold text-primary">{item.refNo}</p>
            </div>
            <div className="bg-muted/40 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Item Name</p>
              <p className="font-semibold text-primary">{item.item}</p>
            </div>
            <div className="bg-muted/40 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Demand From</p>
              <p className="font-semibold text-primary">{item.demandFrom}</p>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-primary mb-3">
            Item Quantity & Location
          </h3>

          {isDetailLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground bg-muted/10 rounded-lg border border-border">
              Loading item details...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Sr No</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Item Quantity
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {detailData?.items && detailData.items.length > 0 ? (
                    detailData.items.map((r: any, i: number) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="px-4 py-2 text-muted-foreground">
                          {i + 1}
                        </td>
                        <td className="px-4 py-2">{r.quantity}</td>
                        <td className="px-4 py-2 capitalize">{r.location}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-4 text-center text-muted-foreground"
                      >
                        No items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">
            {title} Decision
          </h2>

          {apiError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {apiError}
            </div>
          )}

          {errors.decision && (
            <p className="text-xs text-destructive mb-3">{errors.decision}</p>
          )}

          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setDecision("Approve")}
              className={`px-5 py-2.5 rounded-lg border text-sm font-medium flex items-center gap-2 transition-colors ${
                decision === "Approve"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-700 border-border hover:bg-green-50"
              }`}
            >
              <CheckCircle className="size-4" /> Approve
            </button>
            <button
              type="button"
              onClick={() => setDecision("Reject")}
              className={`px-5 py-2.5 rounded-lg border text-sm font-medium flex items-center gap-2 transition-colors ${
                decision === "Reject"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-700 border-border hover:bg-red-50"
              }`}
            >
              <XCircle className="size-4" /> Reject
            </button>
          </div>

          {decision === "Approve" && (
            <div className="pl-4 border-l-2 border-green-500 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date of Approval <span className="text-destructive">*</span>
                  </label>
                  {/* Antd DatePicker */}
                  <DatePicker
                    className="w-full h-10"
                    status={errors.date ? "error" : ""}
                    value={dateOfApproval ? dayjs(dateOfApproval) : null}
                    onChange={(_date, dateString) =>
                      setDateOfApproval(dateString as string)
                    }
                  />
                  {errors.date && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.date}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Upload Approval Document{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  {/* Antd Upload with original visual style wrapped inside */}
                  <AntUpload
                    beforeUpload={(file) => {
                      setApprovalDoc(file as File);
                      return false; // Prevent automatic upload
                    }}
                    showUploadList={false}
                    maxCount={1}
                    className="w-full"
                  >
                    <div
                      className={`cursor-pointer flex items-center justify-center gap-2 w-full h-10 px-3 py-2 bg-input-background border border-dashed rounded-lg hover:bg-muted text-sm text-muted-foreground transition-colors ${
                        errors.doc ? "border-red-400" : "border-border"
                      }`}
                    >
                      <UploadIcon className="size-4" />
                      <span className="truncate max-w-50">
                        {approvalDoc
                          ? approvalDoc.name
                          : "Click to upload document"}
                      </span>
                    </div>
                  </AntUpload>
                  {errors.doc && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.doc}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {decision === "Reject" && (
            <div className="pl-4 border-l-2 border-red-500">
              <label className="block text-sm font-medium mb-1">
                Reason for Rejection <span className="text-destructive">*</span>
              </label>
              {/* Antd Text Area */}
              <Input.TextArea
                rows={4}
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                status={errors.reason ? "error" : ""}
              />
              {errors.reason && (
                <p className="text-xs text-destructive mt-1">{errors.reason}</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onBack}
              disabled={isSubmitting}
              className="px-6 py-2 bg-white border border-border text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            {decision && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Processing...
                  </>
                ) : (
                  "Submit Decision"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommitteeApproval({
  title,
  description,
  forwardLabel,
  forwardPath,
  items,
  committeeType,
}: CommitteeApprovalProps) {
  const [selectedItem, setSelectedItem] = useState<CommitteeItem | null>(null);

  // States for the new custom paginated table
  const [page, setPage] = useState(1);
  const pageSize = 10; // Configure as necessary
  const totalPages = Math.ceil(items.length / pageSize) || 1;

  // AG Grid Column Definitions
  const colDefs = useMemo<ColDef[]>(
    () => [
      { headerName: "Procurement ID", flex: 1, field: "refNo" },
      { headerName: "Financial Year", flex: 1, field: "year" },
      { headerName: "Item Name", flex: 1, field: "item" },
      { headerName: "Demand From", flex: 1, field: "demandFrom" },
      { headerName: "Award Cost", flex: 1, field: "awardCost" },
      {
        headerName: "Status",
        field: "status",
        flex: 1,
        cellRenderer: (params: any) => (
          <div className="flex items-center justify-center h-full">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
              {params.value}
            </span>
          </div>
        ),
      },
      {
        headerName: "Action",
        headerClass: 'center-header' ,
        cellRenderer: (params: any) => (
          <div className="flex items-center justify-center h-full">
            <button
              onClick={() => setSelectedItem(params.data)}
              className="p-2 text-muted-foreground cursor-pointer hover:text-primary hover:bg-muted rounded-md transition-colors inline-flex items-center justify-center"
              title="View Details"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg>
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  console.log("CommitteeApproval items:", items); // Debugging log

  if (selectedItem) {
    return (
      <DetailScreen
        item={selectedItem}
        title={title}
        forwardLabel={forwardLabel}
        forwardPath={forwardPath}
        committeeType={committeeType}
        onBack={() => setSelectedItem(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] font-bold text-primary">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Replaced HTML Table with your Custom Table Component */}
      <Table
        rowData={items}
        columnDefs={colDefs}
        totalCount={items.length}
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
