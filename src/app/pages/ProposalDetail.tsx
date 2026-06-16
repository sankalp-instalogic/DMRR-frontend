import { useState } from "react";
import { Link } from "react-router";
import {
  FileText, MapPin, Building2, Calendar, IndianRupee, User, Download,
  Upload, Eye, RefreshCw, CheckCircle2, Clock, AlertCircle, Edit
} from "lucide-react";

// Mock proposal data
const proposalData = {
  id: "PROP-2026-001",
  disasterType: "Flood",
  state: "Maharashtra",
  district: "Mumbai",
  taluka: "Kurla",
  department: "PWD",
  electedRep: "MLA Rajesh Kumar",
  receivingAuthority: "District Collector Mumbai",
  officerInCharge: "XEN Suresh Patil",
  ndmaGuideline: "NDMA-FL-2024-08",
  currentStage: "PAC Evaluation",
  status: "Under Review",
  createdDate: "2026-01-15",
  budgetAllocated: "₹45 Cr",
  budgetReceived: "₹30 Cr",
  budgetUtilized: "₹12 Cr"
};

const documents = [
  { id: 1, name: "Proposal Demand File.pdf", type: "Demand File", uploadedBy: "Officer A", uploadDate: "2026-01-15", size: "2.4 MB", status: "Verified" },
  { id: 2, name: "NDMA Validation Report.pdf", type: "Validation", uploadedBy: "System", uploadDate: "2026-01-16", size: "1.8 MB", status: "Verified" },
  { id: 3, name: "PMU Observation.docx", type: "PMU", uploadedBy: "PMU Officer", uploadDate: "2026-02-10", size: "456 KB", status: "Verified" },
  { id: 4, name: "PAC Minutes.pdf", type: "PAC MoM", uploadedBy: "PAC Secretary", uploadDate: "2026-03-05", size: "3.2 MB", status: "Pending" }
];

const timeline = [
  { stage: "DDMA Workflow", date: "2026-01-15", status: "Completed", remarks: "Approved by Desk Officer", user: "ddma.officer@gov.in", docs: 1 },
  { stage: "PMU Scrutiny", date: "2026-02-10", status: "Completed", remarks: "Compliance verified, forwarded to PAC", user: "pmu.officer@gov.in", docs: 2 },
  { stage: "PAC Evaluation", date: "2026-03-05", status: "Completed", remarks: "Under committee review", user: "pac.secretary@gov.in", docs: 1 },
  { stage: "TAC Appraisal", date: "2026-03-20", status: "Completed", remarks: "Approved", user: "tac.chair@gov.in", docs: 1 },
  { stage: "SEC Review", date: "2026-04-05", status: "Completed", remarks: "Approved", user: "sec.admin@gov.in", docs: 1 },
  { stage: "SDMA Approval", date: "2026-04-15", status: "Completed", remarks: "Final approval granted", user: "sdma.head@gov.in", docs: 1 },
  { stage: "Tendering", date: "2026-05-01", status: "Completed", remarks: "Vendor selected", user: "tender.officer@gov.in", docs: 3 },
  { stage: "Project Execution & Monitoring", date: "2026-05-20", status: "In Progress", remarks: "MPR uploaded, 15% physical progress", user: "exec.engineer@gov.in", docs: 2 },
  { stage: "Billing & Fund Release", date: "-", status: "Pending", remarks: "Awaiting milestone completion", user: "-", docs: 0 },
  { stage: "Project Completion", date: "-", status: "Pending", remarks: "Pending final review", user: "-", docs: 0 }
];

const auditTrail = [
  { action: "Proposal Created", user: "officer@disaster-management.gov", timestamp: "2026-01-15 10:30 AM", remarks: "Initial proposal submission" },
  { action: "Document Uploaded", user: "officer@disaster-management.gov", timestamp: "2026-01-15 11:15 AM", remarks: "Uploaded Proposal Demand File" },
  { action: "NDMA Validation Triggered", user: "System", timestamp: "2026-01-16 09:00 AM", remarks: "Automated validation completed" },
  { action: "Stage Updated to PMU", user: "ddma.officer@gov.in", timestamp: "2026-01-20 02:45 PM", remarks: "Approved by DDMA, forwarded to PMU" },
  { action: "PMU Observation Added", user: "pmu.officer@gov.in", timestamp: "2026-02-10 04:20 PM", remarks: "Compliance verified" },
  { action: "Stage Updated to PAC", user: "pmu.officer@gov.in", timestamp: "2026-02-12 11:00 AM", remarks: "Forwarded to PAC for evaluation" },
  { action: "PAC Review Started", user: "pac.secretary@gov.in", timestamp: "2026-03-05 10:00 AM", remarks: "Committee review initiated" }
];

export function ProposalDetail() {
  const [activeTab, setActiveTab] = useState<"overview" | "documents" | "timeline" | "audit">("overview");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-green-600 bg-green-100";
      case "In Progress":
        return "text-blue-600 bg-blue-100";
      case "Pending":
        return "text-orange-600 bg-orange-100";
      case "Verified":
        return "text-green-600";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{proposalData.id}</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
              {proposalData.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {proposalData.disasterType} Mitigation Proposal — {proposalData.district}, {proposalData.taluka}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/stage-update"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium flex items-center gap-2"
          >
            <RefreshCw className="size-4" />
            Update Stage
          </Link>
          <Link
            to="/document-upload"
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium flex items-center gap-2"
          >
            <Upload className="size-4" />
            Upload Document
          </Link>
          <button className="border border-border px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium">
            Export PDF
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-2 font-medium text-sm transition-colors relative ${
              activeTab === "overview"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview
            {activeTab === "overview" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`pb-3 px-2 font-medium text-sm transition-colors relative ${
              activeTab === "documents"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Documents
            {activeTab === "documents" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`pb-3 px-2 font-medium text-sm transition-colors relative ${
              activeTab === "timeline"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Timeline
            {activeTab === "timeline" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`pb-3 px-2 font-medium text-sm transition-colors relative ${
              activeTab === "audit"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Audit Trail
            {activeTab === "audit" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
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
                  <div className="text-xs text-muted-foreground mb-1">Disaster Type</div>
                  <div className="font-semibold">{proposalData.disasterType}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <MapPin className="size-3" />
                    Location
                  </div>
                  <div className="font-semibold">{proposalData.district}, {proposalData.taluka}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Building2 className="size-3" />
                    Department
                  </div>
                  <div className="font-semibold">{proposalData.department}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <User className="size-3" />
                    Elected Representative
                  </div>
                  <div className="font-semibold">{proposalData.electedRep}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Receiving Authority</div>
                  <div className="font-semibold">{proposalData.receivingAuthority}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Officer In Charge</div>
                  <div className="font-semibold">{proposalData.officerInCharge}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">NDMA Guideline</div>
                  <div className="font-semibold">{proposalData.ndmaGuideline}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="size-3" />
                    Created Date
                  </div>
                  <div className="font-semibold">{proposalData.createdDate}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Current Stage</div>
                  <div className="font-semibold text-primary">{proposalData.currentStage}</div>
                </div>
              </div>
            </div>

            {/* Budget Information */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-bold mb-4 text-primary">Budget Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <IndianRupee className="size-3" />
                    Budget Allocated
                  </div>
                  <div className="text-2xl font-bold text-[#0B1F4D]">{proposalData.budgetAllocated}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <IndianRupee className="size-3" />
                    Budget Received
                  </div>
                  <div className="text-2xl font-bold text-[#1E5AA8]">{proposalData.budgetReceived}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <IndianRupee className="size-3" />
                    Budget Utilized
                  </div>
                  <div className="text-2xl font-bold text-[#059669]">{proposalData.budgetUtilized}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-primary">Uploaded Documents</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Document Name</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Type</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Uploaded By</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Upload Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Size</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="size-4 text-primary" />
                          <span className="font-medium text-sm">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{doc.type}</td>
                      <td className="px-6 py-4 text-sm">{doc.uploadedBy}</td>
                      <td className="px-6 py-4 text-sm">{doc.uploadDate}</td>
                      <td className="px-6 py-4 text-sm">{doc.size}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${getStatusColor(doc.status)}`}>
                          {doc.status === "Verified" && <CheckCircle2 className="size-3" />}
                          {doc.status === "Pending" && <Clock className="size-3" />}
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to="/document-viewer"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity text-xs"
                          >
                            <Eye className="size-3" />
                            View
                          </Link>
                          <button className="inline-flex items-center gap-1 px-2 py-1 border border-border rounded hover:bg-muted transition-colors text-xs">
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
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold mb-6 text-primary">Workflow Timeline</h3>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-6">
                {timeline.map((item, index) => (
                  <div key={index} className="relative pl-12">
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        item.status === "Completed"
                          ? "bg-green-100 border-2 border-green-600"
                          : item.status === "In Progress"
                          ? "bg-blue-100 border-2 border-blue-600"
                          : "bg-gray-100 border-2 border-gray-300"
                      }`}
                    >
                      {item.status === "Completed" && <CheckCircle2 className="size-4 text-green-600" />}
                      {item.status === "In Progress" && <RefreshCw className="size-4 text-blue-600" />}
                      {item.status === "Pending" && <Clock className="size-4 text-gray-400" />}
                    </div>

                    {/* Timeline content */}
                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{item.stage}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {item.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="size-3" />
                          {item.user}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="size-3" />
                          {item.docs} docs
                        </div>
                      </div>
                      <p className="text-sm">{item.remarks}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Action</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">User</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Timestamp</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {auditTrail.map((entry, index) => (
                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-sm">{entry.action}</td>
                      <td className="px-6 py-4 text-sm flex items-center gap-1">
                        <User className="size-3 text-muted-foreground" />
                        {entry.user}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{entry.timestamp}</td>
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
