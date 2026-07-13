import { useState, useMemo } from "react";
import { useParams } from "react-router";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import type { ColDef } from "ag-grid-community";
import {
  FileText,
  MapPin,
  Calendar,
  IndianRupee,
  User,
  Download,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Package,
  Building2,
} from "lucide-react";

import { formatCurrencyLakhs } from "../../../utils/currencyFormatter";
import formattedDate from "../../../utils/dateFormatter";
import { useQuery } from "@tanstack/react-query";
import toast from "../../../utils/toast";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { Table } from "../../components/Table";
import { DocumentPreviewModal } from "../../components/DocumentPreviewModal";
import { Spinner } from "../../components/ui/spinner";
import { DocumentOwnerType } from "../../../../constants/documents";

// Helper functions for formatting
const formatDate = (dateString: string) => formattedDate(dateString);

const formatDateTime = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${formattedDate(date)}, ${time}`;
};

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export function ProcurementDetail() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null,
  );

  // Pagination State for Audit Trail
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize] = useState(10);

  const { id } = useParams();
  const axiosPrivate = useAxiosPrivate();

  const handlePreview = (docId: string) => {
    setSelectedDocumentId(docId);
    setIsPreviewOpen(true);
  };

  const getStatusColor = (status: string) => {
    if (!status) return "text-muted-foreground bg-muted";

    const lowerStatus = status.toLowerCase();
    if (
      lowerStatus.includes("completed") ||
      lowerStatus.includes("verified") ||
      lowerStatus.includes("approved")
    ) {
      return "text-success bg-success-muted";
    }
    if (
      lowerStatus.includes("progress") ||
      lowerStatus.includes("revision") ||
      lowerStatus.includes("draft")
    ) {
      return "text-info bg-info-muted";
    }
    if (lowerStatus.includes("pending") || lowerStatus.includes("psc")) {
      return "text-warning bg-warning-muted";
    }
    if (lowerStatus.includes("rejected")) {
      return "text-destructive bg-destructive-muted";
    }
    return "text-muted-foreground bg-muted";
  };

  // Fetch Procurement Data
  const {
    data: procurementData,
    isLoading: isProcurementLoading,
    isError: isProcurementError,
  } = useQuery({
    queryKey: ["procurement", id],
    queryFn: async () => {
      const response = await axiosPrivate.get(`/api/v1/Procurements/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  // Fetch Documents Data
  const { data: documentsData, isLoading: isDocsLoading } = useQuery({
    queryKey: ["procurement-documents", id],
    queryFn: async () => {
      const response = await axiosPrivate.get(`/api/v1/Documents/list`, {
        params: { ownerType: DocumentOwnerType.Procurement, ownerId: id },
      });
      return response.data;
    },
    enabled: !!id,
  });

  // Fetch Timeline Data
  const { data: timelineData, isLoading: isTimelineLoading } = useQuery({
    queryKey: ["procurement-timeline", id],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        `/api/v1/Procurements/${id}/timeline`,
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
    queryKey: ["procurement-audit", id, auditPage, auditPageSize],
    queryFn: async () => {
      const response = await axiosPrivate.get(`/api/v1/Audit/procurement/${id}`, {
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

  const itemColumnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "#",
        flex: 0.5,
        valueGetter: (params) =>
          (params.node?.rowIndex ?? 0) + 1,
      },
      {
        field: "quantity",
        headerName: "Quantity",
        flex: 1,
        valueFormatter: (params) => params.value ?? "0",
      },
      {
        field: "location",
        headerName: "Location",
        flex: 2,
        cellRenderer: (params: any) => (
          <div className="flex items-center gap-1 h-full">
            <MapPin className="size-3 text-muted-foreground shrink-0" />
            <span>{params.value || "-"}</span>
          </div>
        ),
      },
    ],
    [],
  );

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
        pinned: "right",
        filter: false,
        cellRenderer: (params: any) => (
          <div className="flex items-center gap-4 h-full">
            <button
              onClick={() => handlePreview(params.data.id)}
              className="cursor-pointer text-muted-foreground hover:text-primary transition-colors flex items-center"
              title="Preview"
            >
              <Eye className="size-5" />
            </button>

            <button
              onClick={() =>
                handleDownload(params.data.id, params.data.fileName)
              }
              className="cursor-pointer text-muted-foreground hover:text-primary transition-colors flex items-center"
              title="Download"
            >
              <Download className="size-5" />
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

  const renderApprovalBadge = (approved: boolean, date: string | null) => (
    <div className="font-semibold flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          approved ? "text-success bg-success-muted" : "text-warning bg-warning-muted"
        }`}
      >
        {approved ? (
          <CheckCircle2 className="size-3" />
        ) : (
          <Clock className="size-3" />
        )}
        {approved ? "Approved" : "Pending"}
      </span>
      {approved && date && (
        <span className="text-xs text-muted-foreground font-normal">
          {formatDate(date)}
        </span>
      )}
    </div>
  );

  const tabItems: TabsProps["items"] = [
    {
      key: "overview",
      label: <span className="font-bold text-base">Overview</span>,
      children: (
        <div className="space-y-6 mt-4">
          {/* Procurement Details */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-primary">Procurement Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Package className="size-3" /> Item Name
                </div>
                <div className="font-semibold">{procurementData?.itemName}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Building2 className="size-3" /> Demand From
                </div>
                <div className="font-semibold">
                  {procurementData?.beneficiaryDistrict ||
                    procurementData?.beneficiaryDepartment ||
                    procurementData?.demandFrom ||
                    "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Financial Year
                </div>
                <div className="font-semibold">
                  {procurementData?.financialYear}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Total Quantity
                </div>
                <div className="font-semibold">
                  {procurementData?.quantity ?? 0}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <MapPin className="size-3" /> Delivery Location
                </div>
                <div className="font-semibold">
                  {procurementData?.deliveryLocation || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="size-3" /> Delivery Deadline
                </div>
                <div className="font-semibold">
                  {formatDate(procurementData?.deliveryDeadline)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Items Delivered
                </div>
                <div className="font-semibold">
                  {procurementData?.itemsDelivered ?? 0} ({procurementData?.deliveryPct ?? 0}%)
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Vendor</div>
                <div
                  className={
                    procurementData?.vendor
                      ? "font-semibold"
                      : "font-semibold text-muted-foreground"
                  }
                >
                  {procurementData?.vendor || "Not assigned"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Current Stage
                </div>
                <div className="font-semibold text-primary">
                  {procurementData?.stage}
                </div>
              </div>
              {procurementData?.remarks && (
                <div className="md:col-span-2 lg:col-span-3">
                  <div className="text-xs text-muted-foreground mb-1">
                    Remarks
                  </div>
                  <div className="font-semibold">{procurementData.remarks}</div>
                </div>
              )}
            </div>
          </div>

          {/* Approvals */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-primary">Approvals</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  SEC Approval
                </div>
                {renderApprovalBadge(
                  procurementData?.secApproved,
                  procurementData?.secApprovalDate,
                )}
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Administrative Approval
                </div>
                {renderApprovalBadge(
                  procurementData?.aaApproved,
                  procurementData?.aaApprovalDate,
                )}
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Contract Awarded
                </div>
                {renderApprovalBadge(
                  procurementData?.contractAwarded,
                  procurementData?.contractAwardedDate,
                )}
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-primary">
              Financial Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <IndianRupee className="size-3" /> AA Value
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrencyLakhs(procurementData?.aaValueLakhs)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <IndianRupee className="size-3" /> Award Cost (incl. GST)
                </div>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrencyLakhs(procurementData?.awardCostInclGstLakhs)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <IndianRupee className="size-3" /> Savings
                </div>
                <div
                  className={`text-2xl font-bold ${
                    (procurementData?.savingRsLakhs ?? 0) < 0
                      ? "text-destructive"
                      : "text-success"
                  }`}
                >
                  {formatCurrencyLakhs(procurementData?.savingRsLakhs)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Savings %
                </div>
                <div
                  className={`text-2xl font-bold ${
                    (procurementData?.savingPct ?? 0) < 0
                      ? "text-destructive"
                      : "text-success"
                  }`}
                >
                  {procurementData?.savingPct ?? 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-primary">Items</h3>
            {!procurementData?.items || procurementData.items.length === 0 ? (
              <div className="flex justify-center items-center h-24 text-muted-foreground">
                No items found for this procurement.
              </div>
            ) : (
              <Table
                rowData={procurementData.items}
                columnDefs={itemColumnDefs}
                totalCount={procurementData.items.length}
                page={1}
                totalPages={1}
                onPageChange={() => {}}
              />
            )}
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
            <div className="flex justify-center items-center h-32 bg-card border border-border rounded-xl shadow-sm">
              <Spinner label="Loading documents..." iconClassName="size-6" />
            </div>
          ) : !documentsData || documentsData.length === 0 ? (
            <div className="flex justify-center items-center h-32 text-muted-foreground bg-card border border-border rounded-xl shadow-sm">
              No documents found for this procurement.
            </div>
          ) : (
            <Table
              rowData={documentsData}
              columnDefs={documentColumnDefs}
              totalCount={documentsData.length}
              page={1}
              totalPages={1}
              onPageChange={() => {}}
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
            <div className="flex justify-center items-center h-32">
              <Spinner label="Loading timeline..." iconClassName="size-6" />
            </div>
          ) : !timelineData || timelineData.length === 0 ? (
            <div className="flex justify-center items-center h-32 text-muted-foreground">
              No timeline data available for this procurement.
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-6">
                {timelineData.map((item: any, index: number) => {
                  const status = item.status?.toLowerCase() || "";
                  const isPending = status.includes("pending");
                  const hasNextStep = index < timelineData.length - 1;
                  const showTick = hasNextStep || !isPending;
                  return (
                    <div key={index} className="relative pl-12">
                      <div
                        className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center bg-background ${
                          showTick
                            ? "bg-success-muted border-2 border-success text-success"
                            : status.includes("pending")
                              ? "bg-muted border-2 border-border text-muted-foreground"
                              : "bg-info-muted border-2 border-info text-info"
                        }`}
                      >
                        {showTick ? (
                          <CheckCircle2 className="size-4" />
                        ) : status.includes("pending") ? (
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
                            {formatDate(item.decisionDate)}
                          </div>
                        </div>
                        {item.remarks && (
                          <p className="text-sm mt-2">{item.remarks}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
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
            {isAuditFetching && <Spinner iconClassName="size-4" />}
          </div>
          {isAuditLoading ? (
            <div className="flex justify-center items-center h-32 bg-card border border-border rounded-xl shadow-sm">
              <Spinner label="Loading audit trail..." iconClassName="size-6" />
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

  if (isProcurementLoading) {
    return (
      <Spinner fullPage label="Loading Procurement..." iconClassName="size-6" />
    );
  }

  if (isProcurementError || !procurementData) {
    return (
      <div className="flex justify-center items-center h-64 text-destructive">
        <AlertCircle className="size-6 mr-2" /> Error loading procurement
        details.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">
              {procurementData.procurementRefNo}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                procurementData.status,
              )}`}
            >
              {procurementData.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {procurementData.itemName} — {procurementData.demandFrom}
          </p>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedDocumentId(null);
        }}
        documentId={selectedDocumentId}
      />
    </div>
  );
}
