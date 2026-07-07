import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { DatePicker, Input } from "antd";
import dayjs from "dayjs";
import type { ColDef } from "ag-grid-community";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { Table } from "../../components/Table"; // Adjust the import path to where your custom Table is located
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import { DocumentOwnerType, DocumentType } from "../../../../constants/documents";
import { FileUpload } from "../../components/FileUpload";

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
  const getDocumentType = (type: number): DocumentType | undefined => {
    switch (type) {
      case 1:
        return DocumentType.PCSApprovalLetter;
      case 2:
        return DocumentType.TACApprovalLetter;
      case 3:
        return DocumentType.SECApprovalLetter;
      case 4:
        return DocumentType.AdministratiionApprovalLetter;
      default:
        return undefined;
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
      documentType: DocumentType;
    }) => {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("ownerId", ownerId);
      uploadData.append("ownerType", String(DocumentOwnerType.Procurement));
      uploadData.append("documentType", String(documentType));

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
        <Button
          variant="link"
          onClick={onBack}
          className="px-0"
        >
          <ArrowLeft className="size-4" /> Back to List
        </Button>
        <div className="bg-success-muted border border-success-border rounded-xl p-8 text-center space-y-4">
          <CheckCircle className="size-12 text-success mx-auto" />
          <h3 className="text-xl font-semibold text-success-muted-foreground">
            Approved Successfully
          </h3>
          <p className="text-success-muted-foreground text-sm">
            Procurement <strong>{item.refNo}</strong> has been approved and is
            ready to be forwarded.
          </p>
          <div className="flex justify-center gap-3 mt-4">
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button onClick={() => navigate(forwardPath)}>
              <ArrowRight className="size-4" /> {forwardLabel}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted && decision === "Reject") {
    return (
      <div className="space-y-6">
        <Button
          variant="link"
          onClick={onBack}
          className="px-0"
        >
          <ArrowLeft className="size-4" /> Back to List
        </Button>
        <div className="bg-destructive-muted border border-destructive-border rounded-xl p-8 text-center space-y-4">
          <XCircle className="size-12 text-destructive mx-auto" />
          <h3 className="text-xl font-semibold text-destructive-muted-foreground">Rejected</h3>
          <p className="text-destructive-muted-foreground text-sm">
            Procurement <strong>{item.refNo}</strong> has been rejected. The
            initiating department will be notified.
          </p>
          <Button variant="outline" onClick={onBack}>
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  // --- Main Form View ---
  return (
    <div className="space-y-6">
      <Button
        variant="link"
        onClick={onBack}
        className="px-0"
      >
        <ArrowLeft className="size-4" /> Back to List
      </Button>

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
            <div className="mb-4 p-3 bg-destructive-muted text-destructive-muted-foreground text-sm rounded-lg border border-destructive-border">
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
                  ? "bg-success text-primary-foreground border-success"
                  : "bg-card text-foreground border-border hover:bg-success-muted"
              }`}
            >
              <CheckCircle className="size-4" /> Approve
            </button>
            <button
              type="button"
              onClick={() => setDecision("Reject")}
              className={`px-5 py-2.5 rounded-lg border text-sm font-medium flex items-center gap-2 transition-colors ${
                decision === "Reject"
                  ? "bg-destructive text-primary-foreground border-destructive"
                  : "bg-card text-foreground border-border hover:bg-destructive-muted"
              }`}
            >
              <XCircle className="size-4" /> Reject
            </button>
          </div>

          {decision === "Approve" && (
            <div className="pl-4 border-l-2 border-success space-y-4">
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
                  <FileUpload
                    variant="compact"
                    value={approvalDoc}
                    onChange={setApprovalDoc}
                    buttonText="Select File"
                  />
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
            <div className="pl-4 border-l-2 border-destructive">
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
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {decision && (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner inline iconClassName="size-4" /> Processing...
                  </>
                ) : (
                  "Submit Decision"
                )}
              </Button>
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
            <span className="px-3 py-1 bg-warning-muted text-warning-muted-foreground rounded-full text-xs font-medium">
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedItem(params.data)}
              className="text-muted-foreground hover:text-primary"
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
            </Button>
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
