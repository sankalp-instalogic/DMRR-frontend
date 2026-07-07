import { useEffect, useId, useRef, useState } from "react";
import { Modal } from "antd";
import {
  Eye,
  FileText,
  FileCheck,
  Upload as UploadIcon,
  X,
  AlertCircle,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "./ui/utils";
import { Button } from "./ui/button";
import {
  MAX_FILE_SIZE,
  formatBytes,
  matchesAccept,
  isFileEncrypted,
  isZipFile,
} from "../../../constants/file-upload";

/* ------------------------------------------------------------------ */
/* Local file preview modal                                            */
/* ------------------------------------------------------------------ */

interface FilePreviewModalProps {
  file: File | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Previews a locally-selected `File` (before it is uploaded) inside an antd
 * Modal. Images and PDFs render inline; anything else falls back to file
 * metadata plus a download link.
 */
export function FilePreviewModal({ file, open, onClose }: FilePreviewModalProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !file) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [open, file]);

  const type = file?.type || "";
  const isImage = type.startsWith("image/");
  const isPdf = type === "application/pdf" || file?.name.toLowerCase().endsWith(".pdf");
  const canPreview = isImage || isPdf;

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered
      destroyOnHidden
      classNames={{ body: "p-0 overflow-hidden rounded-xl" }}
    >
      <div className="flex flex-col h-[85vh]">
        {/* Header */}
        <div className="bg-card border-b border-border p-4 sm:p-5 flex items-start gap-3 shrink-0">
          <div className="bg-primary/10 p-2 rounded-lg shrink-0 mt-1">
            <FileText className="size-6 text-primary" />
          </div>
          <div className="overflow-hidden">
            <h2 className="text-lg font-semibold truncate" title={file?.name}>
              {file?.name || "Preview"}
            </h2>
            {file && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatBytes(file.size)}
                {type ? ` · ${type}` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 bg-muted dark:bg-background relative overflow-auto flex items-center justify-center p-4">
          {canPreview && url && isImage && (
            <img
              src={url}
              alt={file?.name || "Preview"}
              className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
            />
          )}

          {canPreview && url && isPdf && (
            <iframe
              src={`${url}#view=FitH`}
              title={file?.name || "Document preview"}
              className="w-full h-full rounded-lg bg-card"
              style={{ border: "none" }}
              allowFullScreen
            />
          )}

          {!canPreview && (
            <div className="flex flex-col items-center gap-3 text-muted-foreground text-center max-w-sm">
              <AlertCircle className="size-8" aria-hidden="true" />
              <h3 className="font-semibold text-base text-foreground">
                Preview not available
              </h3>
              <p className="text-sm">
                This file type can't be previewed in the browser. You can
                download it to view its contents.
              </p>
              {url && (
                <a
                  href={url}
                  download={file?.name}
                  className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  <Download className="size-4" />
                  Download
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* File upload                                                         */
/* ------------------------------------------------------------------ */

export interface FileUploadProps {
  /** Currently selected file (controlled). Works with local state or RHF `field.value`. */
  value: File | null;
  /** Called with the validated file, or `null` when removed. */
  onChange: (file: File | null) => void;
  /** Native `accept` string, e.g. ".pdf,.doc,.docx" or "image/*". */
  accept?: string;
  /** Max size in bytes. Defaults to 25 MB. */
  maxSize?: number;
  /** Heading shown above the control (dropzone variant). */
  label?: string;
  /** Helper text, e.g. "Allowed: PDF, DOC | Max 25 MB". */
  description?: string;
  /** Marks the field required (adds an asterisk to the label). */
  required?: boolean;
  disabled?: boolean;
  /** Text on the choose-file button. Defaults to "Choose File". */
  buttonText?: string;
  /** Unique id for the underlying input (auto-generated if omitted). */
  id?: string;
  className?: string;
  /**
   * "dropzone" (default) renders a large dashed drop area.
   * "compact" renders an inline button + selected-file chip.
   */
  variant?: "dropzone" | "compact";
}

export function FileUpload({
  value,
  onChange,
  accept,
  maxSize = MAX_FILE_SIZE,
  label,
  description,
  required,
  disabled,
  buttonText = "Choose File",
  id,
  className,
  variant = "dropzone",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const inputId = id ?? `file-upload-${generatedId}`;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [validating, setValidating] = useState(false);

  const validateAndSet = async (file: File | undefined | null) => {
    if (!file) return;

    if (isZipFile(file)) {
      toast.error("Unsupported file type. ZIP files are not allowed.");
      return;
    }

    if (!matchesAccept(file, accept)) {
      toast.error(
        accept
          ? `Unsupported file type. Allowed: ${accept}`
          : "Unsupported file type.",
      );
      return;
    }

    if (file.size > maxSize) {
      toast.error(`File is too large. Maximum size is ${formatBytes(maxSize)}.`);
      return;
    }

    setValidating(true);
    try {
      if (await isFileEncrypted(file)) {
        toast.error(
          "This file looks password protected / encrypted and can't be selected. Please choose an unprotected file.",
        );
        return;
      }
    } finally {
      setValidating(false);
    }

    onChange(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    void validateAndSet(e.target.files?.[0]);
    // reset so selecting the same file again re-triggers onChange
    e.target.value = "";
  };

  const handleRemove = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const hiddenInput = (
    <input
      ref={inputRef}
      id={inputId}
      type="file"
      accept={accept}
      disabled={disabled}
      onChange={handleInputChange}
      className="hidden"
    />
  );

  const selectedFileCard = value && (
    <div className="bg-success-muted border border-success-border rounded-lg p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <FileCheck className="size-5 text-success shrink-0" />
          <div className="text-left overflow-hidden">
            <p className="font-medium text-sm text-success-muted-foreground truncate" title={value.name}>
              {value.name}
            </p>
            <p className="text-xs text-success-muted-foreground">
              {formatBytes(value.size)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Preview file"
            onClick={() => setPreviewOpen(true)}
            className="text-primary hover:bg-primary/10"
          >
            <Eye className="size-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remove file"
            disabled={disabled}
            onClick={handleRemove}
            className="text-destructive hover:bg-destructive-muted"
          >
            <X className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );

  if (variant === "compact") {
    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <label className="block text-sm font-medium" htmlFor={inputId}>
            {label} {required && <span className="text-destructive">*</span>}
          </label>
        )}
        {hiddenInput}
        {!value ? (
          <>
            <label
              htmlFor={inputId}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 border border-input bg-background text-foreground rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
                (disabled || validating) && "opacity-50 pointer-events-none",
              )}
            >
              <UploadIcon className="size-4" />
              {validating ? "Checking file…" : buttonText}
            </label>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </>
        ) : (
          selectedFileCard
        )}
        <FilePreviewModal
          file={value}
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
        />
      </div>
    );
  }

  // dropzone variant
  return (
    <div className={cn("space-y-3", className)}>
      {hiddenInput}
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
        <UploadIcon className="size-10 mx-auto text-muted-foreground mb-3" />
        {label && (
          <h4 className="font-semibold mb-1">
            {label} {required && <span className="text-destructive">*</span>}
          </h4>
        )}
        {description && (
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        )}
        <label
          htmlFor={inputId}
          className={cn(
            "inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity cursor-pointer font-medium",
            (disabled || validating) && "opacity-50 pointer-events-none",
          )}
        >
          <UploadIcon className="size-4" />
          {validating ? "Checking file…" : buttonText}
        </label>

        {value && <div className="mt-6 text-left">{selectedFileCard}</div>}
      </div>

      <FilePreviewModal
        file={value}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}
