import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, CheckCircle, XCircle, Upload, ArrowRight } from "lucide-react";

interface CommitteeItem {
  id: string;
  year: string;
  item: string;
  demandFrom: string;
  awardCost: string;
  status: string;
  rows: { qty: string; location: string }[];
}

interface CommitteeApprovalProps {
  title: string;
  description: string;
  forwardLabel: string;
  forwardPath: string;
  items: CommitteeItem[];
}

function DetailScreen({
  item,
  title,
  forwardLabel,
  forwardPath,
  onBack,
}: {
  item: CommitteeItem;
  title: string;
  forwardLabel: string;
  forwardPath: string;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const [decision, setDecision] = useState<"Approve" | "Reject" | "">("");
  const [dateOfApproval, setDateOfApproval] = useState("");
  const [approvalDoc, setApprovalDoc] = useState<File | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const e: Record<string, string> = {};
    if (!decision) { e.decision = "Please select a decision"; }
    if (decision === "Approve") {
      if (!dateOfApproval) e.date = "Date of approval is required";
      if (!approvalDoc) e.doc = "Approval document is required";
    }
    if (decision === "Reject" && !rejectionReason.trim()) {
      e.reason = "Reason for rejection is required";
    }
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setSubmitted(true);
  };

  if (submitted && decision === "Approve") {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#0B1F4D] hover:underline">
          <ArrowLeft className="size-4" /> Back to List
        </button>
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center space-y-4">
          <CheckCircle className="size-12 text-green-600 mx-auto" />
          <h3 className="text-xl font-semibold text-green-800">Approved Successfully</h3>
          <p className="text-green-700 text-sm">
            Procurement <strong>{item.id}</strong> has been approved and is ready to be forwarded.
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
              <ArrowRight className="size-4" />
              {forwardLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted && decision === "Reject") {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#0B1F4D] hover:underline">
          <ArrowLeft className="size-4" /> Back to List
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center space-y-4">
          <XCircle className="size-12 text-red-500 mx-auto" />
          <h3 className="text-xl font-semibold text-red-800">Rejected</h3>
          <p className="text-red-700 text-sm">
            Procurement <strong>{item.id}</strong> has been rejected. The initiating department will be notified.
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

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#0B1F4D] hover:underline">
        <ArrowLeft className="size-4" /> Back to List
      </button>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Auto-generated info */}
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-[#0B1F4D] mb-4">Procurement Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-muted/40 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Procurement ID</p>
              <p className="font-semibold text-[#0B1F4D]">{item.id}</p>
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

          {/* Item Quantity and Location table */}
          <h3 className="text-sm font-semibold text-[#0B1F4D] mb-3">Item Quantity & Location</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead className="bg-muted text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Sr No</th>
                  <th className="px-4 py-3 text-left font-medium">Item Quantity</th>
                  <th className="px-4 py-3 text-left font-medium">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {item.rows.map((r, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-2">{r.qty}</td>
                    <td className="px-4 py-2">{r.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Decision */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-[#0B1F4D] mb-4">{title} Decision</h2>
          {errors.decision && <p className="text-xs text-destructive mb-3">{errors.decision}</p>}

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
                  {errors.date && <p className="text-xs text-destructive mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Upload Approval Document <span className="text-destructive">*</span>
                  </label>
                  <label
                    className={`cursor-pointer flex items-center justify-center gap-2 w-full px-3 py-2 bg-input-background border border-dashed rounded-lg hover:bg-muted text-sm text-muted-foreground transition-colors ${
                      errors.doc ? "border-red-400" : "border-border"
                    }`}
                  >
                    <Upload className="size-4" />
                    {approvalDoc ? approvalDoc.name : "Click to upload document"}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setApprovalDoc(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {errors.doc && <p className="text-xs text-destructive mt-1">{errors.doc}</p>}
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
              {errors.reason && <p className="text-xs text-destructive mt-1">{errors.reason}</p>}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onBack}
              className="px-6 py-2 bg-white border border-border text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {decision && (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-[#0B1F4D] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
              >
                Submit Decision
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
}: CommitteeApprovalProps) {
  const [selectedItem, setSelectedItem] = useState<CommitteeItem | null>(null);

  if (selectedItem) {
    return (
      <DetailScreen
        item={selectedItem}
        title={title}
        forwardLabel={forwardLabel}
        forwardPath={forwardPath}
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
                <th className="px-4 py-4 font-medium whitespace-nowrap">Procurement ID</th>
                <th className="px-4 py-4 font-medium whitespace-nowrap">Financial Year</th>
                <th className="px-4 py-4 font-medium whitespace-nowrap">Item Name</th>
                <th className="px-4 py-4 font-medium whitespace-nowrap">Demand From</th>
                <th className="px-4 py-4 font-medium whitespace-nowrap">Award Cost</th>
                <th className="px-4 py-4 font-medium whitespace-nowrap text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((row) => (
                <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-[#0B1F4D] whitespace-nowrap">{row.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.year}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.item}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.demandFrom}</td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{row.awardCost}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedItem(row)}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium hover:bg-yellow-200 transition-colors cursor-pointer"
                    >
                      {row.status}
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No pending procurements.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/20">
          <span className="text-sm text-muted-foreground">Showing {items.length} entries</span>
        </div>
      </div>
    </div>
  );
}
