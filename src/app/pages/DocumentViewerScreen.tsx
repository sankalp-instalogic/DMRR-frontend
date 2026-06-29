import { useState } from "react";
import { useNavigate } from "react-router";
import {
  FileText, Download, Shield, ArrowLeft, Eye, Copy, CheckCircle2
} from "lucide-react";

// Mock document data
const documentData = {
  id: "DOC-2026-001",
  name: "Proposal Demand File.pdf",
  type: "Demand File",
  uploadedBy: "officer@disaster-management.gov",
  uploadDate: "2026-01-15 10:30 AM",
  size: "2.4 MB",
  version: "1.0",
  sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  ocrStatus: "Done",
  ocrCompletedAt: "2026-01-15 10:32 AM"
};

const mockOCRText = `GOVERNMENT OF MAHARASHTRA
Disaster Management, Relief & Rehabilitation Department

PROPOSAL DEMAND FILE

Proposal ID: PROP-2026-001
Disaster Type: Flood
Location: Kurla, Mumbai
Department: PWD

EXECUTIVE SUMMARY
This proposal outlines the requirement for flood mitigation infrastructure in Kurla, Mumbai. The area has experienced recurring flood events during monsoon seasons, affecting approximately 50,000 residents.

SCOPE OF WORK
1. Construction of storm water drainage system (5 km)
2. Installation of pumping stations (3 locations)
3. Road elevation and improvement works
4. Emergency evacuation route development

BUDGET ESTIMATE
Total Project Cost: ₹45 Crores
- Civil Works: ₹32 Cr
- Equipment: ₹8 Cr
- Contingency: ₹5 Cr

TIMELINE
- Planning & Design: 3 months
- Procurement: 4 months
- Execution: 18 months
- Commissioning: 2 months

NDMA COMPLIANCE
This proposal is aligned with NDMA Guideline FL-2024-08 for flood mitigation and urban drainage systems.`;

const mockMetadata = {
  "Document Type": "PDF",
  "Number of Pages": "24",
  "File Format": "PDF 1.7",
  "Creation Date": "2026-01-14",
  "Author": "PWD Mumbai",
  "Subject": "Flood Mitigation Proposal",
  "Keywords": "Flood, Drainage, Infrastructure, Mumbai",
  "Producer": "Adobe PDF Library",
  "OCR Language": "English",
  "OCR Confidence": "98.5%",
  "Word Count": "4,523",
  "Character Count": "28,947"
};

export function DocumentViewerScreen() {
  const navigate = useNavigate();
  const [hashCopied, setHashCopied] = useState(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(documentData.sha256Hash);
    setHashCopied(true);
    setTimeout(() => setHashCopied(false), 2000);
  };

  const handleVerifyHash = () => {
    alert("Hash verification successful! Document integrity confirmed.");
  };

  const handleReOCR = () => {
    if (confirm("Are you sure you want to re-run OCR on this document?")) {
      alert("Re-OCR initiated. This may take a few minutes.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Document Viewer</h1>
          <p className="text-sm text-muted-foreground">
            View document with OCR output and metadata
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/proposal-detail")}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium flex items-center gap-2"
          >
            <ArrowLeft className="size-4" />
            Back to Proposal
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium flex items-center gap-2">
            <Download className="size-4" />
            Download Original
          </button>
        </div>
      </div>

      {/* Document Info Card */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <FileText className="size-6 text-primary shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg mb-1">{documentData.name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Type: {documentData.type}</span>
                <span>•</span>
                <span>Size: {documentData.size}</span>
                <span>•</span>
                <span>Version: {documentData.version}</span>
                <span>•</span>
                <span>Uploaded: {documentData.uploadDate}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              <CheckCircle2 className="size-3" />
              OCR {documentData.ocrStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Three-Panel View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel 1: Original Document Preview */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h4 className="font-bold text-primary flex items-center gap-2">
              <Eye className="size-4" />
              Original Document
            </h4>
          </div>
          <div className="p-6 flex items-center justify-center bg-gray-100 min-h-125">
            <div className="text-center">
              <FileText className="size-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                PDF Document Preview
              </p>
              <p className="text-xs text-muted-foreground">
                {documentData.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                24 pages
              </p>
              <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium flex items-center gap-2 mx-auto">
                <Download className="size-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Panel 2: OCR Extracted Text */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h4 className="font-bold text-primary flex items-center gap-2">
              <FileText className="size-4" />
              OCR Extracted Text
            </h4>
          </div>
          <div className="p-6 max-h-125 overflow-y-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed">
              {mockOCRText}
            </pre>
          </div>
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/30">
            <span className="text-xs text-muted-foreground">
              OCR Completed: {documentData.ocrCompletedAt}
            </span>
            <button className="text-xs text-primary hover:underline font-medium">
              Copy Text
            </button>
          </div>
        </div>

        {/* Panel 3: Structured Metadata */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h4 className="font-bold text-primary flex items-center gap-2">
              <Shield className="size-4" />
              Document Metadata
            </h4>
          </div>
          <div className="p-6 space-y-4">
            {/* SHA-256 Hash */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-semibold text-blue-900">SHA-256 Hash</span>
                <button
                  onClick={handleCopyHash}
                  className="text-xs text-blue-700 hover:underline font-medium flex items-center gap-1"
                >
                  {hashCopied ? (
                    <>
                      <CheckCircle2 className="size-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs font-mono text-blue-700 break-all leading-relaxed">
                {documentData.sha256Hash}
              </p>
              <button
                onClick={handleVerifyHash}
                className="mt-2 text-xs text-blue-700 hover:underline font-medium"
              >
                Verify Hash
              </button>
            </div>

            {/* OCR Status */}
            <div>
              <span className="text-xs font-semibold text-muted-foreground">OCR Status</span>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm font-medium text-green-600">{documentData.ocrStatus}</span>
                <CheckCircle2 className="size-4 text-green-600" />
              </div>
            </div>

            {/* Version */}
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Version Number</span>
              <p className="text-sm mt-1">{documentData.version}</p>
            </div>

            {/* Upload Date */}
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Upload Date</span>
              <p className="text-sm mt-1">{documentData.uploadDate}</p>
            </div>

            {/* Metadata Fields */}
            <div className="pt-4 border-t border-border">
              <span className="text-xs font-semibold text-muted-foreground mb-3 block">
                Additional Metadata
              </span>
              <div className="space-y-2">
                {Object.entries(mockMetadata).map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between text-xs">
                    <span className="text-muted-foreground">{key}:</span>
                    <span className="font-medium text-right ml-2">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Administrator Actions */}
            <div className="pt-4 border-t border-border">
              <span className="text-xs font-semibold text-muted-foreground mb-3 block">
                Administrator Only
              </span>
              <button
                onClick={handleReOCR}
                className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
              >
                Re-run OCR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="size-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900 mb-1">Document Verified</p>
            <p className="text-sm text-green-700">
              This document has been successfully processed and verified. The SHA-256 hash ensures document integrity.
              OCR extraction is complete with 98.5% confidence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
