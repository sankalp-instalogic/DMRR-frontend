import { useState, useMemo } from "react";
import { useParams } from "react-router";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import type { ColDef } from "ag-grid-community";
import {
  FileText,
  MapPin,
  Building2,
  Calendar,
  IndianRupee,
  User,
  Download,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

import { formatCurrencyLakhs } from "../../utils/currencyFormatter";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Table } from "../components/Table"; // Adjust path to your custom Table component

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

const formatDateTime = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export function ProposalDetail() {
  const [activeTab, setActiveTab] = useState("overview");

  // Pagination State for Audit Trail
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize] = useState(10); // Keeping size constant for this example

  const { id } = useParams();
  const axiosPrivate = useAxiosPrivate();

  const getStatusColor = (status: string) => {
    if (!status) return "text-gray-600 bg-gray-100";

    const lowerStatus = status.toLowerCase();
    if (
      lowerStatus.includes("completed") ||
      lowerStatus.includes("verified") ||
      lowerStatus.includes("approved")
    ) {
      return "text-green-600 bg-green-100";
    }
    if (
      lowerStatus.includes("progress") ||
      lowerStatus.includes("revision") ||
      lowerStatus.includes("draft")
    ) {
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
  const { data: documentsData, isLoading: isDocsLoading } = useQuery({
    queryKey: ["documents", id],
    queryFn: async () => {
      const response = await axiosPrivate.get(`/api/v1/Documents/list`, {
        params: { ownerType: 1, ownerId: id },
      });
      return response.data;
    },
    enabled: !!id,
  });

  // Fetch Timeline Data
  const { data: timelineData, isLoading: isTimelineLoading } = useQuery({
    queryKey: ["timeline", id],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        `/api/v1/Proposals/${id}/timeline`,
      );
      return response.data;
    },
    enabled: !!id && activeTab === "timeline",
  });

  // Fetch Audit Data
  const {
    data: auditData,
    isLoading: isAuditLoading,
    isError: isAuditError,
    isFetching: isAuditFetching,
  } = useQuery({
    queryKey: ["audit", id, auditPage, auditPageSize],
    queryFn: async () => {
      const response = await axiosPrivate.get(`/api/v1/Audit/proposal/${id}`, {
        params: {
          page: auditPage,
          pageSize: auditPageSize,
        },
      });
      return response.data;
    },
    enabled: !!id && activeTab === "audit",
  });

  // Download Handler
  const handleDownload = async (docId: string, fileName: string) => {
    try {
      const toastId = toast.loading("Downloading...");
      const response = await axiosPrivate.get(
        `/api/v1/Documents/${docId}/download`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
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

  // --- Column Definitions for Custom Tables ---

  const documentColumnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: "fileName",
        headerName: "Document Name",
        flex: 2,
        cellRenderer: (params: any) => (
          <div className="flex items-center gap-2 h-full">
            <FileText className="size-4 text-primary shrink-0" />
            <span className="font-medium text-sm truncate">{params.value}</span>
          </div>
        ),
      },
      { field: "documentTypeName", headerName: "Type", flex: 1 },
      { field: "uploadedBy", headerName: "Uploaded By", flex: 1 },
      {
        field: "createdAtUtc",
        headerName: "Upload Date",
        flex: 1,
        valueFormatter: (params) => formatDate(params.value),
      },
      {
        field: "sizeBytes",
        headerName: "Size",
        flex: 0.8,
        valueFormatter: (params) => formatBytes(params.value),
      },
      {
        field: "ocrStatus",
        headerName: "Status",
        flex: 1,
        cellRenderer: (params: any) => {
          const status = params.value || "Pending";
          return (
            <div className="flex items-center h-full">
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(
                  status,
                )}`}
              >
                {(status === "Verified" || status === "Completed") && (
                  <CheckCircle2 className="size-3" />
                )}
                {status === "Pending" && <Clock className="size-3" />}
                {status}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Actions",
        flex: 1,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => (
          <div className="flex items-center h-full">
            <button
              onClick={() =>
                handleDownload(params.data.id, params.data.fileName)
              }
              className="inline-flex items-center gap-1 px-2 py-1 border border-border rounded hover:bg-muted transition-colors text-xs"
            >
              <Download className="size-3" />
              Download
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const auditColumnDefs = useMemo<ColDef[]>(
    () => [
      { field: "action", headerName: "Action", flex: 1 },
      { field: "entity", headerName: "Entity", flex: 1 },
      {
        headerName: "User / Role",
        flex: 1.5,
        cellRenderer: (params: any) => (
          <div className="flex flex-col justify-center h-full gap-0.5">
            <span className="flex items-center gap-1 font-medium text-sm">
              <User className="size-3 text-muted-foreground" />
              {params.data.userName}
            </span>
            <span className="text-xs text-muted-foreground ml-4">
              Role: {params.data.role}
            </span>
          </div>
        ),
      },
      {
        field: "timestampUtc",
        headerName: "Timestamp",
        flex: 1.5,
        valueFormatter: (params) => formatDateTime(params.value),
      },
      { field: "remarks", headerName: "Remarks", flex: 2 },
    ],
    [],
  );

  // --- Ant Design Tabs Configuration ---

  const tabItems: TabsProps["items"] = [
    {
      key: "overview",
      label: <span className="font-bold text-base">Overview</span>,
      children: (
        <div className="space-y-6 mt-4">
          {/* Proposal Metadata */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-primary">Proposal Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Disaster Type
                </div>
                <div className="font-semibold">
                  {proposalData?.disasterType}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <MapPin className="size-3" /> Location
                </div>
                <div className="font-semibold">
                  {proposalData?.district}, {proposalData?.taluka}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Building2 className="size-3" /> Department
                </div>
                <div className="font-semibold">
                  {proposalData?.lineDepartment}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <User className="size-3" /> Received From
                </div>
                <div
                  className={
                    proposalData?.receivedFromName
                      ? "font-semibold"
                      : "font-semibold text-muted-foreground"
                  }
                >
                  {proposalData?.receivedFromName
                    ? `${proposalData.receivedFromName} (${proposalData.receivedFromSource})`
                    : "Not specified"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Receiving Authority
                </div>
                <div
                  className={
                    proposalData?.receivingAuthority
                      ? "font-semibold"
                      : "font-semibold text-muted-foreground"
                  }
                >
                  {proposalData?.receivingAuthority || "Not specified"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Officer In Charge
                </div>
                {proposalData?.officerInChargeName ? (
                  <div className="font-semibold">
                    {proposalData.officerInChargeName}
                    {proposalData.officerInChargeDesignation && (
                      <span className="text-xs text-muted-foreground font-normal block">
                        {proposalData.officerInChargeDesignation}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="font-semibold text-muted-foreground">
                    Not specified
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  NDMA Guideline
                </div>
                <div className="font-semibold">
                  {proposalData?.ndmaGuideline}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="size-3" /> Created Date
                </div>
                <div className="font-semibold">
                  {formatDate(proposalData?.createdAtUtc)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Current Stage
                </div>
                <div className="font-semibold text-primary">
                  {proposalData?.currentStage}
                </div>
              </div>
            </div>
          </div>

          {/* Budget Information */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-primary">Budget Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <IndianRupee className="size-3" /> Total Project Cost
                </div>
                <div className="text-2xl font-bold text-[#374151]">
                  {formatCurrencyLakhs(proposalData?.costOfProjectLakhs)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <IndianRupee className="size-3" /> Budget Allocated
                </div>
                <div className="text-2xl font-bold text-[#0B1F4D]">
                  {formatCurrencyLakhs(proposalData?.budgetAllocated)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <IndianRupee className="size-3" /> Budget Received
                </div>
                <div className="text-2xl font-bold text-[#1E5AA8]">
                  {formatCurrencyLakhs(proposalData?.budgetReceived)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <IndianRupee className="size-3" /> Budget Utilized
                </div>
                <div className="text-2xl font-bold text-[#059669]">
                  {formatCurrencyLakhs(proposalData?.budgetUtilized)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "documents",
      label: <span className="font-bold text-base">Documents</span>,
      children: (
        <div className="mt-4">
          {isDocsLoading ? (
            <div className="flex justify-center items-center h-32 text-muted-foreground bg-card border border-border rounded-xl shadow-sm">
              <RefreshCw className="animate-spin size-6 mr-2" /> Fetching
              Documents...
            </div>
          ) : !documentsData || documentsData.length === 0 ? (
            <div className="flex justify-center items-center h-32 text-muted-foreground bg-card border border-border rounded-xl shadow-sm">
              No documents found for this proposal.
            </div>
          ) : (
            <Table
              rowData={documentsData}
              columnDefs={documentColumnDefs}
              totalCount={documentsData.length} // Pass length if no backend pagination for docs
              page={1}
              totalPages={1}
              onPageChange={() => {}} // No-op if purely static data
            />
          )}
        </div>
      ),
    },
    {
      key: "timeline",
      label: <span className="font-bold text-base">Timeline</span>,
      children: (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm mt-4">
          <h3 className="font-bold mb-6 text-primary">Workflow Timeline</h3>
          {isTimelineLoading ? (
            <div className="flex justify-center items-center h-32 text-muted-foreground">
              <RefreshCw className="animate-spin size-6 mr-2" /> Fetching
              Timeline...
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
                        item.status?.toLowerCase().includes("completed") ||
                        item.status?.toLowerCase().includes("approved")
                          ? "bg-green-100 border-2 border-green-600 text-green-600"
                          : item.status?.toLowerCase().includes("pending")
                            ? "bg-gray-100 border-2 border-gray-300 text-gray-400"
                            : "bg-blue-100 border-2 border-blue-600 text-blue-600"
                      }`}
                    >
                      {item.status?.toLowerCase().includes("completed") ||
                      item.status?.toLowerCase().includes("approved") ? (
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
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            item.status,
                          )}`}
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
                      {item.revisionReson && (
                        <p className="text-sm mt-2 text-orange-600">
                          <strong>Revision Reason:</strong> {item.revisionReson}
                        </p>
                      )}
                      {item.rejectionResion && (
                        <p className="text-sm mt-2 text-red-600">
                          <strong>Rejection Reason:</strong>{" "}
                          {item.rejectionResion}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "audit",
      label: <span className="font-bold text-base">Audit Trail</span>,
      children: (
        <div className="mt-4">
          <div className="flex items-center gap-3 mb-4 px-1">
            <h3 className="font-bold text-primary">Audit Trail Logs</h3>
            {isAuditFetching && (
              <RefreshCw className="animate-spin size-4 text-muted-foreground" />
            )}
          </div>
          {isAuditLoading ? (
            <div className="flex justify-center items-center h-32 text-muted-foreground bg-card border border-border rounded-xl shadow-sm">
              <RefreshCw className="animate-spin size-6 mr-2" /> Fetching Audit
              Trail...
            </div>
          ) : isAuditError ||
            !auditData ||
            !auditData.items ||
            auditData.items.length === 0 ? (
            <div className="flex justify-center items-center h-32 text-muted-foreground bg-card border border-border rounded-xl shadow-sm">
              <AlertCircle className="size-5 mr-2" />
              {isAuditError
                ? "Failed to load audit trail."
                : "No audit trail records found."}
            </div>
          ) : (
            <Table
              rowData={auditData.items}
              columnDefs={auditColumnDefs}
              totalCount={auditData.totalCount || auditData.items.length}
              page={auditPage}
              totalPages={auditData.totalPages || 1}
              onPageChange={setAuditPage}
            />
          )}
        </div>
      ),
    },
  ];

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
              className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                proposalData.status,
              )}`}
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

      {/* Main Tab Navigation */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
}
