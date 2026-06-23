import { useState } from "react";
import { Link, useParams } from "react-router"; // Note: changed to react-router-dom for standard routing
import {
  FileText,
  MapPin,
  Building2,
  Calendar,
  IndianRupee,
  User,
  Download,
  Upload,
  Eye,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

// Keeping mock data for tabs that aren't supported by the API response yet
const auditTrail = [
  {
    action: "Proposal Created",
    user: "officer@disaster-management.gov",
    timestamp: "2026-01-15 10:30 AM",
    remarks: "Initial proposal submission",
  },
  {
    action: "Document Uploaded",
    user: "officer@disaster-management.gov",
    timestamp: "2026-01-15 11:15 AM",
    remarks: "Uploaded Proposal Demand File",
  },
  {
    action: "NDMA Validation Triggered",
    user: "System",
    timestamp: "2026-01-16 09:00 AM",
    remarks: "Automated validation completed",
  },
  {
    action: "Stage Updated to PMU",
    user: "ddma.officer@gov.in",
    timestamp: "2026-01-20 02:45 PM",
    remarks: "Approved by DDMA, forwarded to PMU",
  },
  {
    action: "PMU Observation Added",
    user: "pmu.officer@gov.in",
    timestamp: "2026-02-10 04:20 PM",
    remarks: "Compliance verified",
  },
  {
    action: "Stage Updated to PAC",
    user: "pmu.officer@gov.in",
    timestamp: "2026-02-12 11:00 AM",
    remarks: "Forwarded to PAC for evaluation",
  },
  {
    action: "PAC Review Started",
    user: "pac.secretary@gov.in",
    timestamp: "2026-03-05 10:00 AM",
    remarks: "Committee review initiated",
  },
];

// Helper functions for formatting
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrencyLakhs = (amount: number) => {
  if (amount === undefined || amount === null) return "₹0";
  return `₹${amount} Lakhs`;
};

// Helper for formatting bytes
const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export function ProposalDetail() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "documents" | "timeline" | "audit"
  >("overview");
  const { id } = useParams();
  const axiosPrivate = useAxiosPrivate();

  const getStatusColor = (status: string) => {
    if (!status) return "text-gray-600 bg-gray-100";
    
    // Adjusted logic to match possible API statuses dynamically
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("completed") || lowerStatus.includes("verified") || lowerStatus.includes("approved")) {
      return "text-green-600 bg-green-100";
    }
    if (lowerStatus.includes("progress") || lowerStatus.includes("revision") || lowerStatus.includes("draft")) {
      return "text-blue-600 bg-blue-100";
    }
    if (lowerStatus.includes("pending") || lowerStatus.includes("pac")) {
      return "text-orange-600 bg-orange-100";
    }
    return "text-gray-600 bg-gray-100";
  };

  // Fetch Proposal Data
  const {
    data: proposalData,
    isLoading: isProposalLoading,
    isError: isProposalError,
  } = useQuery({
    queryKey: ["proposal", id],
    queryFn: async () => {
      const response = await axiosPrivate.get(`/api/v1/Proposals/${id}`);
      return response.data;
    },
  });

  // Fetch Documents Data
  const {
    data: documentsData,
    isLoading: isDocsLoading,
  } = useQuery({
    queryKey: ["documents", id],
    queryFn: async () => {
      const response = await axiosPrivate.get(`/api/v1/Documents/list`, {
        params: { ownerType: 1, ownerId: id }
      });
      return response.data;
    },
    enabled: !!id, 
  });

  // Fetch Timeline Data
  const {
    data: timelineData,
    isLoading: isTimelineLoading,
  } = useQuery({
    queryKey: ["timeline", id],
    queryFn: async () => {
      const response = await axiosPrivate.get(`/api/v1/Proposals/${id}/timeline`);
      return response.data;
    },
    enabled: !!id && activeTab === "timeline", // Fetch only if id exists and tab is active
  });

  // Download Handler
  const handleDownload = async (docId: string, fileName: string) => {
    try {
      const toastId = toast.loading("Downloading...");
      const response = await axiosPrivate.get(`/api/v1/Documents/${docId}/download`, {
        responseType: 'blob' 
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Download complete", { id: toastId });
    } catch (error) {
      toast.error("Failed to download document");
      console.error("Download Error:", error);
    }
  };

  if (isProposalLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        <RefreshCw className="animate-spin size-6 mr-2" /> Loading Proposal...
      </div>
    );
  }

  if (isProposalError || !proposalData) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <AlertCircle className="size-6 mr-2" /> Error loading proposal details.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{proposalData.proposalRefNo}</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(proposalData.status)}`}
            >
              {proposalData.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {proposalData.title} — {proposalData.district},{" "}
            {proposalData.taluka}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          {["overview", "documents", "timeline", "audit"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 px-2 font-medium text-sm transition-colors relative capitalize ${
                activeTab === tab
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "audit" ? "Audit Trail" : tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Proposal Metadata */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-bold mb-4 text-primary">Proposal Metadata</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Disaster Type
                  </div>
                  <div className="font-semibold">
                    {proposalData.disasterType}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <MapPin className="size-3" />
                    Location
                  </div>
                  <div className="font-semibold">
                    {proposalData.district}, {proposalData.taluka}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Building2 className="size-3" />
                    Department
                  </div>
                  <div className="font-semibold">
                    {proposalData.lineDepartment}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <User className="size-3" />
                    Elected Representative
                  </div>
                  <div className="font-semibold text-muted-foreground">
                    Not specified
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Receiving Authority
                  </div>
                  <div className="font-semibold text-muted-foreground">
                    Not specified
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Officer In Charge
                  </div>
                  <div className="font-semibold text-muted-foreground">
                    Not specified
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    NDMA Guideline
                  </div>
                  <div className="font-semibold">
                    {proposalData.ndmaGuideline}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="size-3" />
                    Created Date
                  </div>
                  <div className="font-semibold">
                    {formatDate(proposalData.createdAtUtc)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Current Stage
                  </div>
                  <div className="font-semibold text-primary">
                    {proposalData.currentStage}
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Information */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-bold mb-4 text-primary">
                Budget Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <IndianRupee className="size-3" />
                    Total Project Cost
                  </div>
                  <div className="text-2xl font-bold text-[#374151]">
                    {formatCurrencyLakhs(proposalData.costOfProjectLakhs)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <IndianRupee className="size-3" />
                    Budget Allocated
                  </div>
                  <div className="text-2xl font-bold text-[#0B1F4D]">
                    {formatCurrencyLakhs(proposalData.budgetAllocated)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <IndianRupee className="size-3" />
                    Budget Received
                  </div>
                  <div className="text-2xl font-bold text-[#1E5AA8]">
                    {formatCurrencyLakhs(proposalData.budgetReceived)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <IndianRupee className="size-3" />
                    Budget Utilized
                  </div>
                  <div className="text-2xl font-bold text-[#059669]">
                    {formatCurrencyLakhs(proposalData.budgetUtilized)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-primary">Uploaded Documents</h3>
            </div>
            
            {isDocsLoading ? (
              <div className="flex justify-center items-center h-32 text-muted-foreground">
                <RefreshCw className="animate-spin size-6 mr-2" /> Fetching Documents...
              </div>
            ) : !documentsData || documentsData.length === 0 ? (
              <div className="flex justify-center items-center h-32 text-muted-foreground">
                No documents found for this proposal.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                        Document Name
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                        Type
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                        Uploaded By
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                        Upload Date
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                        Size
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {documentsData.map((doc: any) => (
                      <tr
                        key={doc.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FileText className="size-4 text-primary" />
                            <span className="font-medium text-sm break-all">
                              {doc.fileName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">{doc.documentTypeName}</td>
                        <td className="px-6 py-4 text-sm">{doc.uploadedBy}</td>
                        <td className="px-6 py-4 text-sm">{formatDate(doc.createdAtUtc)}</td>
                        <td className="px-6 py-4 text-sm">{formatBytes(doc.sizeBytes)}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium ${getStatusColor(doc.ocrStatus || "Pending")}`}
                          >
                            {(doc.ocrStatus === "Verified" || doc.ocrStatus === "Completed") && (
                              <CheckCircle2 className="size-3" />
                            )}
                            {doc.ocrStatus === "Pending" && (
                              <Clock className="size-3" />
                            )}
                            {doc.ocrStatus || "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleDownload(doc.id, doc.fileName)}
                              className="inline-flex items-center gap-1 px-2 py-1 border border-border rounded hover:bg-muted transition-colors text-xs"
                            >
                              <Download className="size-3" />
                              Download
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Dynamic Timeline Tab */}
        {activeTab === "timeline" && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold mb-6 text-primary">Workflow Timeline</h3>
            
            {isTimelineLoading ? (
              <div className="flex justify-center items-center h-32 text-muted-foreground">
                <RefreshCw className="animate-spin size-6 mr-2" /> Fetching Timeline...
              </div>
            ) : !timelineData || timelineData.length === 0 ? (
              <div className="flex justify-center items-center h-32 text-muted-foreground">
                No timeline data available for this proposal.
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-6">
                  {timelineData.map((item: any, index: number) => (
                    <div key={index} className="relative pl-12">
                      <div
                        className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center bg-background ${
                          item.status?.toLowerCase().includes("completed") || item.status?.toLowerCase().includes("approved")
                            ? "bg-green-100 border-2 border-green-600 text-green-600"
                            : item.status?.toLowerCase().includes("pending")
                              ? "bg-gray-100 border-2 border-gray-300 text-gray-400"
                              : "bg-blue-100 border-2 border-blue-600 text-blue-600"
                        }`}
                      >
                        {item.status?.toLowerCase().includes("completed") || item.status?.toLowerCase().includes("approved") ? (
                          <CheckCircle2 className="size-4" />
                        ) : item.status?.toLowerCase().includes("pending") ? (
                          <Clock className="size-4" />
                        ) : (
                          <RefreshCw className="size-4" />
                        )}
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4 border border-border">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{item.stage}</h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {formatDate(item.enteredUtc)}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="size-3" />
                            {item.actorName || "System"}
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="size-3" />
                            {item.documentsUploaded || 0} docs
                          </div>
                        </div>
                        {item.remarks && (
                          <p className="text-sm mt-2">{item.remarks}</p>
                        )}
                        {/* Optionally display revision or rejection reasons if they exist */}
                        {item.revisionReson && (
                          <p className="text-sm mt-2 text-orange-600"><strong>Revision Reason:</strong> {item.revisionReson}</p>
                        )}
                        {item.rejectionResion && (
                          <p className="text-sm mt-2 text-red-600"><strong>Rejection Reason:</strong> {item.rejectionResion}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Audit Trail Tab */}
        {activeTab === "audit" && (
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <h3 className="font-bold text-primary">Audit Trail</h3>
              <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm">
                <Download className="size-4" />
                Export Audit Trail (PDF)
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                      Action
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                      User
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                      Timestamp
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {auditTrail.map((entry, index) => (
                    <tr
                      key={index}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-sm">
                        {entry.action}
                      </td>
                      <td className="px-6 py-4 text-sm flex items-center gap-1">
                        <User className="size-3 text-muted-foreground" />
                        {entry.user}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {entry.timestamp}
                      </td>
                      <td className="px-6 py-4 text-sm">{entry.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}