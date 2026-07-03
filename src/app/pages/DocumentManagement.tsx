import { FileText, Download, Eye, Clock, Upload, Search, FileDiff, PlusCircle, Hash, User } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";

const initialDocs = [
  { id: 1, name: "Proposal_MUM_001_DPR.pdf", type: "DPR", size: "2.4 MB", uploaded: "15-Jun-2025", uploadedBy: "Ramesh Kumar", ocr: "OCR Complete", status: "Uploaded", version: "v1.2", hash: "a3f5b7c9e0d1..." },
  { id: 2, name: "PAC_Minutes_May2025.pdf", type: "MoM", size: "856 KB", uploaded: "20-May-2025", uploadedBy: "Admin", ocr: "OCR Complete", status: "Uploaded", version: "v1.0", hash: "b2d4e6f8a0c3..." },
  { id: 3, name: "Technical_Sanction_PWD.pdf", type: "Tech Sanction", size: "1.2 MB", uploaded: "10-Jun-2025", uploadedBy: "Suresh P", ocr: "OCR Processing", status: "Uploaded", version: "v1.0", hash: "c1a3e5g7b9d4..." },
  { id: 4, name: "Work_Order_WO001.pdf", type: "Work Order", size: "345 KB", uploaded: "01-Jul-2025", uploadedBy: "Rahul M", ocr: "OCR Failed", status: "Uploaded", version: "v2.1", hash: "d0f2h4j6k8l1..." },
];

export function DocumentManagement() {
  const [documents, setDocuments] = useState(initialDocs);
  const [selectedDoc, setSelectedDoc] = useState(initialDocs[0]);

  const handleUpload = () => {
    alert("Upload dialog opened");
  };

  const handleAction = (action, docName) => {
    alert(`${action} triggered for ${docName}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Document Management</h1>
        <p className="text-sm text-muted-foreground">Centralized document repository with version control and OCR</p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button onClick={handleUpload}>
          <Upload className="size-5" />
          Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Document List */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-4 text-left text-sm">Document Name</th>
                  <th className="px-4 py-4 text-left text-sm">Version</th>
                  <th className="px-4 py-4 text-left text-sm">Status</th>
                  <th className="px-4 py-4 text-left text-sm">OCR Status</th>
                  <th className="px-4 py-4 text-left text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr 
                    key={doc.id} 
                    className={`border-t border-border hover:bg-muted/50 cursor-pointer ${selectedDoc?.id === doc.id ? 'bg-primary/5' : ''}`}
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <td className="px-4 py-4 font-medium flex items-center gap-2">
                      <FileText className="size-4 text-muted-foreground" />
                      <span className="truncate max-w-[150px]" title={doc.name}>{doc.name}</span>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold">{doc.version}</td>
                    <td className="px-4 py-4 text-sm">{doc.status}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                        doc.ocr === 'OCR Complete' ? 'bg-accent/20 text-accent' : 
                        doc.ocr === 'OCR Processing' ? 'bg-secondary/20 text-secondary' : 
                        'bg-destructive/20 text-destructive'
                      }`}>
                        {doc.ocr}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={() => handleAction('View', doc.name)} title="View"><Eye className="size-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleAction('Download', doc.name)} title="Download"><Download className="size-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleAction('New Version', doc.name)} title="New Version"><PlusCircle className="size-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleAction('Compare', doc.name)} title="Compare Versions"><FileDiff className="size-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Metadata Panel */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <h3 className="mb-4 text-lg font-bold border-b border-border pb-2">Metadata Panel</h3>
          {selectedDoc ? (
            <div className="space-y-4 flex-1">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Document Name</span>
                <span className="font-medium truncate">{selectedDoc.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><FileText className="size-3"/> Type</span>
                  <span className="text-sm font-medium">{selectedDoc.type}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Clock className="size-3"/> Version</span>
                  <span className="text-sm font-medium">{selectedDoc.version}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Upload Date</span>
                  <span className="text-sm">{selectedDoc.uploaded}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><User className="size-3"/> Uploaded By</span>
                  <span className="text-sm">{selectedDoc.uploadedBy}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">OCR Status</span>
                <span className={`text-sm font-medium ${selectedDoc.ocr === 'OCR Failed' ? 'text-destructive' : 'text-accent'}`}>{selectedDoc.ocr}</span>
              </div>

              <div className="flex flex-col gap-1 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Hash className="size-3"/> SHA-256 Hash</span>
                <span className="text-xs font-mono bg-muted p-2 rounded break-all">{selectedDoc.hash}</span>
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
    </div>
  );
}
