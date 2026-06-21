import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Upload,
  ArrowRight,
  Loader2,
} from "lucide-react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; // Added useQuery

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
  committeeType: number; // <-- Added this to map to your API Enums (1 for PSC, 2 for TAC, etc.)
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
        return "34"; // ProposalScrutiny (PSC) -> PCSApprovalLetter
      case 2:
        return "35"; // TechnicalAppraisal (TAC) -> PACApprovalLetter
      case 3:
        return "36"; // SEC -> SECApprovalLetter
      case 4:
        return "37"; // AdministrativeApproval -> AdministratiionApprovalLetter
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
      uploadData.append("ownerType", "2"); // Hardcoded as requested
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

      // 1. If approved, upload the document FIRST
      if (decision === "Approve" && approvalDoc) {
        const docType = getDocumentType(committeeType);
        if (docType) {
          const uploadResponse = await uploadMutation.mutateAsync({
            file: approvalDoc,
            ownerId: item.id,
            documentType: docType,
          });

          // Capture the returned ID from the upload response
          // Note: Adjust "uploadResponse.id" if your API returns the ID under a different key (e.g., uploadResponse.data.id)
          uploadedDocumentId = uploadResponse?.id;
        }
      }

      // 2. Prepare the payload, including the newly acquired documentId
      const payload = {
        approved: decision === "Approve",
        decisionDate:
          decision === "Approve" && dateOfApproval
            ? new Date(dateOfApproval).toISOString()
            : null,
        reason: decision === "Reject" ? rejectionReason : "",
        documentId: uploadedDocumentId,
      };

      // 3. Submit the text data
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
          className="flex items-center gap-2 text-sm text-[#0B1F4D] hover:underline"
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
              className="px-5 py-2 bg-[#0B1F4D] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-opacity-90 transition-colors"
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
          className="flex items-center gap-2 text-sm text-[#0B1F4D] hover:underline"
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
        className="flex items-center gap-2 text-sm text-[#0B1F4D] hover:underline"
      >
        <ArrowLeft className="size-4" /> Back to List
      </button>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-[#0B1F4D] mb-4">
            Procurement Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-muted/40 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">
                Procurement ID
              </p>
              <p className="font-semibold text-[#0B1F4D]">{item.refNo}</p>
            </div>
            <div className="bg-muted/40 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Item Name</p>
              <p className="font-semibold text-[#0B1F4D]">{item.item}</p>
            </div>
            <div className="bg-muted/40 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Demand From</p>
              <p className="font-semibold text-[#0B1F4D]">{item.demandFrom}</p>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-[#0B1F4D] mb-3">
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
          <h2 className="text-lg font-semibold text-[#0B1F4D] mb-4">
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
                  <input
                    type="date"
                    value={dateOfApproval}
                    onChange={(e) => setDateOfApproval(e.target.value)}
                    className={`w-full px-3 py-2 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.date ? "border-red-400" : "border-border"
                    }`}
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
                  <label
                    className={`cursor-pointer flex items-center justify-center gap-2 w-full px-3 py-2 bg-input-background border border-dashed rounded-lg hover:bg-muted text-sm text-muted-foreground transition-colors ${
                      errors.doc ? "border-red-400" : "border-border"
                    }`}
                  >
                    <Upload className="size-4" />
                    <span className="truncate max-w-50">
                      {approvalDoc
                        ? approvalDoc.name
                        : "Click to upload document"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        setApprovalDoc(e.target.files?.[0] ?? null)
                      }
                    />
                  </label>
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
              <textarea
                rows={4}
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className={`w-full px-3 py-2 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
                  errors.reason ? "border-red-400" : "border-border"
                }`}
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
                className="px-6 py-2 bg-[#0B1F4D] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
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
  committeeType, // <-- Destructure the new prop
}: CommitteeApprovalProps) {
  const [selectedItem, setSelectedItem] = useState<CommitteeItem | null>(null);

  console.log("CommitteeApproval items:", items); // Debugging log

  if (selectedItem) {
    return (
      <DetailScreen
        item={selectedItem}
        title={title}
        forwardLabel={forwardLabel}
        forwardPath={forwardPath}
        committeeType={committeeType} // <-- Pass it down to DetailScreen
        onBack={() => setSelectedItem(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1F4D]">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-4 font-medium whitespace-nowrap">
                  Procurement ID
                </th>
                <th className="px-4 py-4 font-medium whitespace-nowrap">
                  Financial Year
                </th>
                <th className="px-4 py-4 font-medium whitespace-nowrap">
                  Item Name
                </th>
                <th className="px-4 py-4 font-medium whitespace-nowrap">
                  Demand From
                </th>
                <th className="px-4 py-4 font-medium whitespace-nowrap">
                  Award Cost
                </th>
                <th className="px-4 py-4 font-medium whitespace-nowrap text-center">
                  Status
                </th>
                <th className="px-4 py-4 font-medium whitespace-nowrap text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-[#0B1F4D] whitespace-nowrap">
                    {row.refNo}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.year}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.item}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.demandFrom}
                  </td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    {row.awardCost}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      {row.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedItem(row)}
                      className="p-2 text-muted-foreground cursor-pointer hover:text-[#0B1F4D] hover:bg-muted rounded-md transition-colors inline-flex items-center justify-center"
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
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No pending procurements.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/20">
          <span className="text-sm text-muted-foreground">
            Showing {items.length} entries
          </span>
        </div>
      </div>
    </div>
  );
}
