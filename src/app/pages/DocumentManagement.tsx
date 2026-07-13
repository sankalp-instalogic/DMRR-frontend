import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColDef, RowClickedEvent } from "ag-grid-community";
import { FileText, Download, Eye, Clock, Search, User, HardDrive } from "lucide-react";
import { Input } from "antd";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Table } from "../components/Table";
import { Spinner } from "../components/ui/spinner";
import { DocumentPreviewModal } from "../components/DocumentPreviewModal";
import formattedDate from "../../utils/dateFormatter";

// --- TYPES ---
// Mirrors an item from GET /api/v1/Documents/search
interface DocumentItem {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  version: number;
  ocrStatus: string;
  ownerType: string;
  ownerId: string;
  createdAtUtc: string;
  uploadedBy: string;
  documentTypeName: string;
}

// OCR status → theme.css semantic badge classes
const ocrStatusColors: Record<string, string> = {
  Completed: "bg-success-muted text-success-muted-foreground",
  Processing: "bg-info-muted text-info-muted-foreground",
  Pending: "bg-warning-muted text-warning-muted-foreground",
  Failed: "bg-destructive-muted text-destructive-muted-foreground",
};

// Format byte counts into a human readable string.
const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export function DocumentManagement() {
  const axiosPrivate = useAxiosPrivate();

  // --- PAGINATION & SEARCH STATE ---
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Debounce the search box: wait until the user stops typing before firing
  // the query (and reset to the first page for the new result set).
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setAppliedSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // --- SELECTION & PREVIEW STATE ---
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(null);

  // --- DOCUMENTS QUERY ---
  const {
    data: documentsResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["documents", page, pageSize, appliedSearch],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Documents/search", {
        params: {
          Page: page,
          PageSize: pageSize,
          q: appliedSearch || undefined,
        },
      });
      return response.data;
    },
  });

  const documents: DocumentItem[] = documentsResponse?.items ?? [];
  const totalCount = documentsResponse?.totalCount ?? documents.length;
  const totalPages = documentsResponse?.totalPages ?? 1;

  // --- HANDLERS ---
  const handlePreview = (documentId: string) => {
    if (!documentId) return;
    setPreviewDocumentId(documentId);
    setIsPreviewOpen(true);
  };

  const handleDownload = async (documentId: string, fallbackName: string) => {
    if (!documentId) return;
    try {
      const response = await axiosPrivate.get(
        `/api/v1/Documents/${documentId}/download`,
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      let fileName = fallbackName || "document";
      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch && fileNameMatch.length === 2) {
          fileName = fileNameMatch[1];
        }
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("File download failed:", error);
    }
  };

  // --- COLUMN DEFINITIONS ---
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Document Name",
        field: "fileName",
        flex: 1.5,
        minWidth: 220,
        cellRenderer: (params: any) => {
          if (!params.data) return null;
          return (
            <div className="flex items-center gap-2 h-full">
              <FileText className="size-4 text-muted-foreground shrink-0" />
              <span className="truncate font-medium" title={params.value}>
                {params.value}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Type",
        field: "documentTypeName",
        flex: 1,
        minWidth: 160,
      },
      {
        headerName: "Version",
        field: "version",
        flex: 0.6,
        minWidth: 100,
        valueFormatter: (params) => `v${params.value ?? 1}`,
      },
      {
        headerName: "Size",
        field: "sizeBytes",
        flex: 0.8,
        minWidth: 110,
        valueFormatter: (params) => formatBytes(params.value ?? 0),
      },
      {
        headerName: "OCR Status",
        field: "ocrStatus",
        flex: 1,
        minWidth: 130,
        cellRenderer: (params: any) => {
          const status = params.value;
          if (!status) return null;
          const colorClasses =
            ocrStatusColors[status] ?? "bg-muted text-muted-foreground";
          return (
            <div className="flex items-center h-full">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colorClasses}`}
              >
                {status}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Actions",
        flex: 0.8,
        minWidth: 110,
        sortable: false,
        filter: false,
        pinned: "right",
        cellRenderer: (params: any) => {
          const doc = params.data as DocumentItem;
          if (!doc) return null;
          return (
            <div className="flex items-center gap-1 h-full">
              <button
                onClick={() => handlePreview(doc.id)}
                className="inline-flex items-center justify-center size-9 text-primary hover:bg-info-muted rounded-lg transition-colors"
                title="View"
              >
                <Eye className="size-4" />
              </button>
              <button
                onClick={() => handleDownload(doc.id, doc.fileName)}
                className="inline-flex items-center justify-center size-9 text-primary hover:bg-info-muted rounded-lg transition-colors"
                title="Download"
              >
                <Download className="size-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const rowClassRules = useMemo(
    () => ({
      "bg-info-muted": (params: any) =>
        !!selectedDoc && params.data?.id === selectedDoc.id,
    }),
    [selectedDoc],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] font-bold text-primary">
          Document Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Centralized document repository with version control and OCR
        </p>
      </div>

      {/* Search */}
      <Input
        size="large"
        placeholder="Search documents..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        prefix={<Search className="size-5 text-muted-foreground mr-2" />}
        allowClear
        className="w-full"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="bg-card border border-border rounded-xl shadow-sm p-8">
              <Spinner label="Loading documents..." />
            </div>
          ) : isError ? (
            <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-center text-destructive font-medium">
              Failed to fetch documents. Please try again.
            </div>
          ) : documents.length === 0 ? (
            <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-center text-muted-foreground">
              No documents found.
            </div>
          ) : (
            <Table
              rowData={documents}
              columnDefs={columnDefs}
              totalCount={totalCount}
              page={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
              rowHeight={64}
              onRowClicked={(event: RowClickedEvent) =>
                setSelectedDoc(event.data as DocumentItem)
              }
              rowClassRules={rowClassRules}
            />
          )}
        </div>

        {/* Metadata Panel */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <h3 className="mb-4 text-lg font-bold border-b border-border pb-2">
            Metadata Panel
          </h3>
          {selectedDoc ? (
            <div className="space-y-4 flex-1">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Document Name
                </span>
                <span className="font-medium break-all">
                  {selectedDoc.fileName}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <FileText className="size-3" /> Type
                  </span>
                  <span className="text-sm font-medium break-words">
                    {selectedDoc.documentTypeName}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Clock className="size-3" /> Version
                  </span>
                  <span className="text-sm font-medium">
                    v{selectedDoc.version}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <HardDrive className="size-3" /> Size
                  </span>
                  <span className="text-sm">
                    {formatBytes(selectedDoc.sizeBytes)}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Upload Date
                  </span>
                  <span className="text-sm">
                    {formattedDate(selectedDoc.createdAtUtc)}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <User className="size-3" /> Uploaded By
                  </span>
                  <span className="text-sm">{selectedDoc.uploadedBy}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  OCR Status
                </span>
                <span
                  className={`text-sm font-medium ${
                    selectedDoc.ocrStatus === "Failed"
                      ? "text-destructive"
                      : "text-success"
                  }`}
                >
                  {selectedDoc.ocrStatus}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-10 flex-1 flex flex-col items-center justify-center">
              <FileText className="size-10 mb-2 opacity-20" />
              <p>Select a document to view metadata</p>
            </div>
          )}
        </div>
      </div>

      {/* --- PREVIEW MODAL --- */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewDocumentId(null);
        }}
        documentId={previewDocumentId}
      />
    </div>
  );
}
