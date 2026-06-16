import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Upload, FileText, CheckCircle2, AlertCircle, XCircle, Loader2, ArrowLeft
} from "lucide-react";

const documentTypes = [
  "Proposal Demand File",
  "DPR/PPR",
  "Technical Sanction",
  "PAC MoM",
  "TAC MoM",
  "SEC MoM",
  "SDMA MoM",
  "Supporting Document",
  "Other"
];

type OCRStatus = "pending" | "processing" | "done" | "failed";

export function DocumentUploadScreen() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [versionNote, setVersionNote] = useState("");
  const [ocrStatus, setOcrStatus] = useState<OCRStatus>("pending");
  const [uploadProgress, setUploadProgress] = useState(0);

  const allowedFormats = [".pdf", ".docx", ".doc", ".xlsx", ".jpg", ".png"];
  const maxSizeMB = 25;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }

    // Validate file format
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedFormats.includes(extension)) {
      alert(`Invalid file format. Allowed formats: ${allowedFormats.join(", ")}`);
      return;
    }

    setSelectedFile(file);
    setOcrStatus("pending");
  };

  const handleUpload = () => {
    if (!selectedFile || !documentType) {
      alert("Please select a file and document type.");
      return;
    }

    // Simulate upload
    setOcrStatus("processing");
    setUploadProgress(0);

    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate OCR processing
    setTimeout(() => {
      setOcrStatus("processing");
    }, 2000);

    setTimeout(() => {
      setOcrStatus("done");
      alert("Document uploaded successfully! OCR processing complete.");
    }, 5000);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setDocumentType("");
    setVersionNote("");
    setOcrStatus("pending");
    setUploadProgress(0);
  };

  const getStatusIcon = (status: OCRStatus) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="size-5 text-gray-400" />;
      case "processing":
        return <Loader2 className="size-5 text-blue-600 animate-spin" />;
      case "done":
        return <CheckCircle2 className="size-5 text-green-600" />;
      case "failed":
        return <XCircle className="size-5 text-red-600" />;
    }
  };

  const getStatusText = (status: OCRStatus) => {
    switch (status) {
      case "pending":
        return "Pending Upload";
      case "processing":
        return "Processing OCR...";
      case "done":
        return "OCR Complete";
      case "failed":
        return "OCR Failed";
    }
  };

  const getStatusColor = (status: OCRStatus) => {
    switch (status) {
      case "pending":
        return "bg-gray-50 border-gray-200 text-gray-700";
      case "processing":
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "done":
        return "bg-green-50 border-green-200 text-green-700";
      case "failed":
        return "bg-red-50 border-red-200 text-red-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Document Upload</h1>
          <p className="text-sm text-muted-foreground">
            Upload supporting documents with automated OCR processing
          </p>
        </div>
        <button
          onClick={() => navigate("/proposal-detail")}
          className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium flex items-center gap-2"
        >
          <ArrowLeft className="size-4" />
          Back to Proposal
        </button>
      </div>

      {/* Upload Form */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
        {/* File Upload Area */}
        <div>
          <label className="block text-sm font-medium mb-2">
            File Upload <span className="text-red-600">*</span>
          </label>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/30">
            <Upload className="size-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="font-semibold mb-2">Choose a file to upload</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Allowed formats: PDF, DOCX, DOC, XLSX, JPG, PNG | Maximum size: {maxSizeMB} MB
            </p>
            <input
              type="file"
              accept={allowedFormats.join(",")}
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity cursor-pointer font-medium"
            >
              <Upload className="size-4" />
              Select File
            </label>

            {selectedFile && (
              <div className="mt-6 bg-white border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="size-6 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                  >
                    <XCircle className="size-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Document Type */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Document Type <span className="text-red-600">*</span>
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select Document Type</option>
            {documentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Version Note */}
        <div>
          <label className="block text-sm font-medium mb-2">Version Note (Optional)</label>
          <textarea
            value={versionNote}
            onChange={(e) => setVersionNote(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            rows={3}
            placeholder="Add notes about this version (e.g., 'Updated budget figures', 'Final approved version')"
          />
        </div>

        {/* OCR Status */}
        <div>
          <label className="block text-sm font-medium mb-2">OCR Status</label>
          <div
            className={`flex items-center gap-3 p-4 rounded-lg border ${getStatusColor(
              ocrStatus
            )}`}
          >
            {getStatusIcon(ocrStatus)}
            <div className="flex-1">
              <p className="font-semibold text-sm">{getStatusText(ocrStatus)}</p>
              {ocrStatus === "processing" && (
                <div className="mt-2 bg-white/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
              {ocrStatus === "done" && (
                <p className="text-xs mt-1">Document successfully uploaded and processed</p>
              )}
              {ocrStatus === "failed" && (
                <p className="text-xs mt-1">OCR processing failed. Please try again.</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            onClick={handleCancel}
            className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !documentType || ocrStatus === "processing"}
            className={`px-6 py-3 rounded-lg font-medium transition-opacity flex items-center gap-2 ${
              !selectedFile || !documentType || ocrStatus === "processing"
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            <Upload className="size-4" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 mb-1">Document Upload Guidelines</p>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Ensure documents are clear and readable for accurate OCR processing</li>
              <li>PDF format is recommended for best OCR results</li>
              <li>After OCR completion, document will be available in the Document Viewer</li>
              <li>You can upload new versions of documents with version notes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
