import { useState, useEffect } from "react";
import { Modal, Tag } from "antd";
import {
  FileText,
  Calendar,
  HardDrive,
  AlertCircle,
  Download
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Spinner } from "./ui/spinner";
import formattedDate from "../../utils/dateFormatter";

// Interfaces based on the API response structure you provided
interface DocumentMetadata {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  sha256: string;
  version: number;
  ocrStatus: string;
  documentTypeName: string;
  createdAtUtc: string;
}

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string | null;
}

// Helper to format file sizes elegantly
const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export function DocumentPreviewModal({ isOpen, onClose, documentId }: DocumentPreviewModalProps) {
  const axios = useAxiosPrivate();
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  // 1. Fetch Document Metadata
  const { 
    data: metadata, 
    isLoading: isMetadataLoading, 
    isError: isMetadataError 
  } = useQuery<DocumentMetadata>({
    queryKey: ["documentMetadata", documentId],
    queryFn: async () => {
      const response = await axios.get(`/api/v1/Documents/${documentId}`);
      return response.data;
    },
    enabled: !!documentId && isOpen, // Only run if modal is open and ID exists
    retry: false,
  });

  // 2. Fetch Document File Blob (Runs only after metadata is successfully retrieved)
  const { 
    data: fileBlob, 
    isLoading: isFileLoading,
    isError: isFileError
  } = useQuery<Blob>({

    queryKey: ["documentFile", metadata?.id],
    queryFn: async () => {
      const response = await axios.get(`/api/v1/Documents/${metadata?.id}/view`, {
        responseType: "blob",
        headers: {
          Accept: metadata?.contentType || "application/pdf, image/*", // Hint to backend for binary
        }
      });
      return response.data;
    },
    enabled: !!metadata?.id && isOpen, // Only run once we have the ID from the metadata
    retry: false,
  });

  // 3. Convert Blob to Object URL for the Iframe
  useEffect(() => {
    if (fileBlob && metadata) {
      // Create a local object URL from the binary blob data
      const url = URL.createObjectURL(
        new Blob([fileBlob], { type: metadata.contentType })
      );
      setFileUrl(url);

      // Cleanup function to prevent memory leaks when modal closes or file changes
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [fileBlob, metadata]);

  // Reset state when modal closes
  const handleClose = () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(null);
    onClose();
  };

  // Decide how the fetched blob can be shown: images and PDFs render inline,
  // everything else falls back to the "Preview not available" state.
  const contentType = metadata?.contentType || "";
  const isImage = contentType.startsWith("image/");
  const isPdf =
    contentType === "application/pdf" ||
    metadata?.fileName?.toLowerCase().endsWith(".pdf");
  const canPreview = isImage || isPdf;

  const getOcrStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return "success";
      case "pending": return "warning";
      case "failed": return "error";
      default: return "default";
    }
  };

  return (
    <Modal
      title={null} // Using custom header inside modal body
      open={isOpen}
      onCancel={handleClose}
      footer={null} // No bottom buttons needed for a pure viewer
      width={1000} // Large width for comfortable reading
      centered
      destroyOnHidden
      className="document-preview-modal"
      classNames={{
        body: "p-0 overflow-hidden rounded-xl", // Removes default Antd padding for a flush layout
      }}
    >
      <div className="flex flex-col h-[85vh]">
        {/* Modal Header */}
        <div className="bg-card border-b border-border p-4 sm:p-5 flex items-start justify-between shrink-0 gap-4">
          <div className="flex items-start gap-3 overflow-hidden">
            <div className="bg-primary/10 p-2 rounded-lg shrink-0 mt-1">
              <FileText className="size-6 text-primary" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-lg font-semibold truncate" title={metadata?.fileName || "Loading Document..."}>
                {metadata?.fileName || "Loading Document..."}
              </h2>
              
              {/* Metadata Badges */}
              {metadata && (
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <HardDrive className="size-3" />
                    {formatBytes(metadata.sizeBytes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {formattedDate(metadata.createdAtUtc)}
                  </span>
                  <Tag color="blue" className="m-0 text-[10px] border-none">
                    v{metadata.version}
                  </Tag>
                  <Tag className="m-0 text-[10px] border-none" color={getOcrStatusColor(metadata.ocrStatus)}>
                    OCR: {metadata.ocrStatus}
                  </Tag>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body / Iframe Viewer */}
        <div className="flex-1 bg-muted dark:bg-background relative overflow-hidden flex items-center justify-center p-4">
          {/* Loading State */}
          {(isMetadataLoading || isFileLoading) && (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Spinner iconClassName="size-8" />
              <p className="text-sm font-medium animate-pulse">
                {isMetadataLoading ? "Fetching document details..." : "Downloading file content..."}
              </p>
            </div>
          )}

          {/* Error State */}
          {(isMetadataError || isFileError) && !isMetadataLoading && !isFileLoading && (
            <div role="alert" className="flex flex-col items-center gap-2 text-destructive bg-destructive/10 p-6 rounded-xl border border-destructive/20 max-w-sm text-center">
              <AlertCircle className="size-8" aria-hidden="true" />
              <h3 className="font-semibold text-base">Failed to load document</h3>
              <p className="text-sm opacity-90">
                There was a problem retrieving the file. Please try again later.
              </p>
            </div>
          )}

          {/* Image Viewer */}
          {!isMetadataLoading && !isFileLoading && fileUrl && isImage && (
            <img
              src={fileUrl}
              alt={metadata?.fileName || "Document preview"}
              className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
            />
          )}

          {/* Document Viewer (Iframe) */}
          {!isMetadataLoading && !isFileLoading && fileUrl && !isImage && isPdf && (
            <iframe
              src={`${fileUrl}#view=FitH`} // FitH forces PDF to fit window horizontally
              title={metadata?.fileName || "Document preview"}
              className="w-full h-full border border-border shadow-sm rounded-lg bg-card"
              style={{ border: 'none' }}
              allowFullScreen
            />
          )}

          {/* Non-previewable fallback (matches FileUpload's preview modal) */}
          {!isMetadataLoading && !isFileLoading && fileUrl && !canPreview && (
            <div className="flex flex-col items-center gap-3 text-muted-foreground text-center max-w-sm">
              <AlertCircle className="size-8" aria-hidden="true" />
              <h3 className="font-semibold text-base text-foreground">
                Preview not available
              </h3>
              <p className="text-sm">
                This file type can't be previewed in the browser. You can
                download it to view its contents.
              </p>
              <a
                href={fileUrl}
                download={metadata?.fileName}
                className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
              >
                <Download className="size-4" />
                Download
              </a>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}