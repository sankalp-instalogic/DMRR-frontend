// import { useState } from "react";
// import { useNavigate } from "react-router";
// import {
//   CheckCircle2, XCircle, RefreshCw, Upload, AlertCircle, ArrowLeft, Send, Plus, Trash2, Eye, Download, FileText, MapPin, Calendar, IndianRupee, Map
// } from "lucide-react";
// import { Stage7 } from "../components/Stage7";
// import { Stage8 } from "../components/Stage8";
// import { Stage9 } from "../components/Stage9";

import { useState } from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Upload,
  AlertCircle,
  ArrowLeft,
  Send,
  Plus,
  Trash2,
  Eye,
  Download,
  FileText,
  MapPin,
  Calendar,
  IndianRupee,
  Map
} from "lucide-react";

import { Stage7 } from "../components/Stage7";
import { Stage8 } from "../components/Stage8";
import { Stage9 } from "../components/Stage9";

// Mock current proposal stage (in real app, this would come from props/context)
const currentProposal = {
  id: "PROP-2026-001",
  currentStage: 1, // 1-6 for the different stages
  stageName: "DDMA & Line Department Workflow"
};

const stages = [
  { id: 1, name: "DDMA & Line Department Workflow" },
  { id: 2, name: "PMU Review" },
  { id: 3, name: "PAC Evaluation" },
  { id: 4, name: "TAC Evaluation" },
  { id: 5, name: "SEC Evaluation" },
  { id: 6, name: "Administrative Approval" },
  { id: 7, name: "SDMA Evaluation" },
  { id: 8, name: "Tendering" },
  { id: 9, name: "Project Execution & Monitoring" },
  { id: 10, name: "Billing & Fund Release" },
  { id: 11, name: "Project Closure" }
];

interface Member {
  srNo: number;
  name: string;
  designation: string;
}

function MembersTable({
  members,
  setMembers,
}: {
  members: Member[];
  setMembers: (members: Member[]) => void;
}) {

  const addRow = () => {
    setMembers([
      ...members,
      {
        srNo: members.length + 1,
        name: "",
        designation: "",
      },
    ]);
  };

  const removeRow = (index: number) => {
    setMembers(
      members
        .filter((_, i) => i !== index)
        .map((m, idx) => ({
          ...m,
          srNo: idx + 1,
        }))
    );
  };

  return (
    <div className="space-y-3">

      <div className="flex justify-between items-center">
        <h4 className="font-semibold">
          Members Present
        </h4>

        <button
          type="button"
          onClick={addRow}
          className="px-3 py-2 bg-primary text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="size-4" />
          Add Member
        </button>
      </div>

      <table className="w-full border border-border rounded-lg overflow-hidden">
        <thead className="bg-muted">
          <tr>
            <th className="p-3 border">Sr No</th>
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Designation</th>
            <th className="p-3 border">Action</th>
          </tr>
        </thead>

        <tbody>
          {members.map((member, index) => (
            <tr key={index}>
              <td className="border p-2 text-center">
                {member.srNo}
              </td>

              <td className="border p-2">
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => {
                    const updated = [...members];
                    updated[index].name = e.target.value;
                    setMembers(updated);
                  }}
                  className="w-full px-3 py-2 border rounded"
                />
              </td>

              <td className="border p-2">
                <input
                  type="text"
                  value={member.designation}
                  onChange={(e) => {
                    const updated = [...members];
                    updated[index].designation = e.target.value;
                    setMembers(updated);
                  }}
                  className="w-full px-3 py-2 border rounded"
                />
              </td>

              <td className="border p-2 text-center">
                {members.length > 1 && (
                  <button
                    onClick={() => removeRow(index)}
                    className="text-red-600"
                  >
                    <Trash2 className="size-5" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StageUpdate() {
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState(currentProposal.currentStage);

  // Stage 1 - DDMA
  const [stage1Data, setStage1Data] = useState({
    deskOfficerApproved: "",
    approvalDocument: null as File | null,
    rejectionReason: ""
  });

  // Stage 2 - PMU
  // const [stage2Data, setStage2Data] = useState({
  //   observation: "",
  //   complianceFlag: false,
  //   revisionRequired: false,
  //   decision: "" // approve, reject, revision
  // });

  const [stage2Data, setStage2Data] = useState({
  proposalReceivedDateTime: "",
  observationSubmittedDate: "",
  observation: "",
  complianceFlag: false,
  revisionRequired: false,
  decision: ""
});

  // Stage 3 - PAC
  // const [stage3Data, setStage3Data] = useState({
  //   decision: "", // approve, reject, revision
  //   pacMoM: null as File | null,
  //   observationNotes: ""
  // });

//   const [stage3Data, setStage3Data] = useState({
//   meetingDate: "",
//   meetingTime: "",
//   members: [
//     {
//       srNo: 1,
//       name: "",
//       designation: ""
//     }
//   ],
//   attendanceSheet: null as File | null,
//   decision: "",
//   pacMoM: null as File | null,
//   observationNotes: ""
// });

  const [stage3Data, setStage3Data] = useState({
  meetingDate: "",
  meetingTime: "",
  members: [
    {
      srNo: 1,
      name: "",
      designation: ""
    }
  ],
  attendanceSheet: null as File | null,
  decision: "",
  pacMoM: null as File | null,
  reason: "",
  observationNotes: ""
});

  // Stage 4 - TAC
  // const [stage4Data, setStage4Data] = useState({
  //   decision: "", // approve, reject, revision
  //   tacMoM: null as File | null,
  //   reason: "",
  //   observationNotes: ""
  // });

const [stage4Data, setStage4Data] = useState({
  meetingDate: "",
  meetingTime: "",
  members: [
    {
      srNo: 1,
      name: "",
      designation: ""
    }
  ],
  attendanceSheet: null as File | null,
  decision: "",
  tacMoM: null as File | null,
  reason: "",
  observationNotes: ""
});
  
  // Stage 5 - SEC
  // const [stage5Data, setStage5Data] = useState({
  //   decision: "", // approve, reject, revision
  //   secMoM: null as File | null,
  //   reason: "",
  //   observationNotes: ""
  // });

  const [stage5Data, setStage5Data] = useState({
  meetingDate: "",
  meetingTime: "",
  members: [
    {
      srNo: 1,
      name: "",
      designation: ""
    }
  ],
  attendanceSheet: null as File | null,
  decision: "",
  secMoM: null as File | null,
  reason: "",
  observationNotes: ""
});

  // Stage 6 - Administrative Approval
  const [stage6Data, setStage6Data] = useState({
    meetingDate: "",
    meetingTime: "",
    members: [
      {
        srNo: 1,
        name: "",
        designation: ""
      }
    ],
    attendanceSheet: null as File | null,
    decision: "",
    adminApprovalMoM: null as File | null,
    reason: "",
    observationNotes: ""
  });

  // Stage 7 - SDMA
  const [stage7Data, setStage7Data] = useState({
    meetingDate: "",
    meetingTime: "",
    members: [
      {
        srNo: 1,
        name: "",
        designation: ""
      }
    ],
    attendanceSheet: null as File | null,
    decision: "",
    sdmaMoM: null as File | null,
    reason: "",
    observationNotes: ""
  });

  // Stage 8 - Tendering
  const [stage8Data, setStage8Data] = useState({
    tenderDate: "",
    tenderRef: "",
    tenderUrl: "",
    tenderDoc: null as File | null,
    vendorName: "",
    vendorRegNo: "",
    vendorContactPerson: "",
    vendorContactNo: "",
    workOrderInitDate: "",
    workOrderNo: "",
    totalTenderCost: "",
    installments: [] as { no: string, date: string, amount: string, remarks: string }[],
    supportingDocs: [] as File[],
    docType: "Bid Evaluation Report"
  });

  // Stage 9 - Project Execution
  const [stage9Data, setStage9Data] = useState({
    entryDate: "",
    startDate: "",
    expectedCompletion: "",
    mprDocs: [] as File[],
    mprMonth: "",
    mprDate: "",
    progressPercent: "",
    mprRemarks: "",
    geoPhotos: [] as { file: File, lat: string, lng: string, date: string, desc: string }[],
    supportingDocs: [] as File[],
    docType: "Site Inspection Report"
  });

  // Stage 10 - Billing & Fund Release
  const [stage10Data, setStage10Data] = useState({
    billReceivedLineDept: "", // Yes / No
    lineDeptReceiptDate: "",
    lineDeptBillAmount: "",
    lineDeptDocs: [] as File[],
    lineDeptDocType: "Invoice",

    billReceivedDO: "", // Yes / No
    doReceivedDate: "",
    doAmount: "",
    doDocs: [] as File[],
    doDocType: "",

    billSentPS: "", // Yes / No
    psForwardingDate: "",
    psRemarks: "",
    psDoc: null as File | null,

    paymentOrderMade: "", // Yes / No
    paymentOrderDate: "",
    installmentPhase: "25%",
    amountReleased: "",
    releaseRemarks: "",
    paymentDoc: null as File | null,
    paymentDocType: "Payment Order"
  });

  // Stage 11 - Project Closure
  const [stage11Data, setStage11Data] = useState({
    projectCompleted: "",
    completionDate: "",
    certificateIssuedDate: "",
    completionCertificate: null as File | null,
    socialAuditFiles: [] as File[],
    status: "Pending"
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (25MB max)
      if (file.size > 25 * 1024 * 1024) {
        alert("File size exceeds 25MB limit.");
        return;
      }
      setter(file);
    }
  };

  const handleConfirmTransition = () => {
    // Validate based on stage
    let isValid = false;
    let message = "";

    switch (currentStage) {
      case 1:
        if (stage1Data.deskOfficerApproved === "yes" && !stage1Data.approvalDocument) {
          alert("Please upload approval document.");
          return;
        }
        if (stage1Data.deskOfficerApproved === "no" && !stage1Data.rejectionReason) {
          alert("Please provide rejection reason.");
          return;
        }
        isValid = stage1Data.deskOfficerApproved !== "";
        message = stage1Data.deskOfficerApproved === "yes" ? "Approved and forwarded to PMU" : "Sent for revision";
        break;

      case 2:
        isValid = stage2Data.decision !== "";
        message = `Proposal ${stage2Data.decision}`;
        break;

      // case 3:
      //   if (stage3Data.decision === "approve" && !stage3Data.pacMoM) {
      //     alert("Please upload PAC Minutes of Meeting.");
      //     return;
      //   }
      //   isValid = stage3Data.decision !== "";
      //   message = stage3Data.decision === "approve" ? "Approved and forwarded to TAC" : stage3Data.decision === "reject" ? "Moved to General List" : "Sent for revision";
      //   break;

      // case 4:
      //   if (stage4Data.decision === "approve" && !stage4Data.tacMoM) {
      //     alert("Please upload TAC Minutes of Meeting.");
      //     return;
      //   }
      //   if (stage4Data.decision === "reject" && !stage4Data.reason) {
      //     alert("Please provide rejection reason.");
      //     return;
      //   }
      //   isValid = stage4Data.decision !== "";
      //   message = `Proposal ${stage4Data.decision}`;
      //   break;

      // case 5:
      //   if (stage5Data.decision === "approve" && !stage5Data.secMoM) {
      //     alert("Please upload SEC Minutes of Meeting.");
      //     return;
      //   }
      //   if (stage5Data.decision === "reject" && !stage5Data.reason) {
      //     alert("Please provide rejection reason.");
      //     return;
      //   }
      //   isValid = stage5Data.decision !== "";
      //   message = `Proposal ${stage5Data.decision}`;
      //   break;

      // case 6:
      //   if (stage6Data.decision === "approve" && !stage6Data.sdmaMoM) {
      //     alert("Please upload SDMA Minutes of Meeting.");
      //     return;
      //   }
      //   if (stage6Data.decision === "reject" && !stage6Data.reason) {
      //     alert("Please provide rejection reason.");
      //     return;
      //   }
      //   isValid = stage6Data.decision !== "";
      //   message = `Proposal ${stage6Data.decision}`;
      //   break;

        case 3:
  // Meeting details validation
  if (!stage3Data.meetingDate) {
    alert("Please select Meeting Date.");
    return;
  }

  if (!stage3Data.meetingTime) {
    alert("Please select Meeting Time.");
    return;
  }

  // Members validation
  if (
    stage3Data.members.length === 0 ||
    stage3Data.members.some(
      (m) => m.name.trim() === "" || m.designation.trim() === ""
    )
  ) {
    alert("Please enter all Member details.");
    return;
  }

  // Attendance sheet
  if (!stage3Data.attendanceSheet) {
    alert("Please upload Attendance Sheet.");
    return;
  }

  // Decision validations
  if (stage3Data.decision === "approve" && !stage3Data.pacMoM) {
    alert("Please upload PAC Minutes of Meeting.");
    return;
  }

  if (stage3Data.decision === "reject" && !stage3Data.reason) {
    alert("Please provide rejection reason.");
    return;
  }

  if (stage3Data.decision === "revision" && !stage3Data.observationNotes) {
    alert("Please provide observation notes.");
    return;
  }

  isValid = stage3Data.decision !== "";

  message =
    stage3Data.decision === "approve"
      ? "Approved and forwarded to TAC"
      : stage3Data.decision === "reject"
      ? "Moved to General List"
      : "Sent for revision";

  break;



case 4:
  if (!stage4Data.meetingDate) {
    alert("Please select Meeting Date.");
    return;
  }

  if (!stage4Data.meetingTime) {
    alert("Please select Meeting Time.");
    return;
  }

  if (
    stage4Data.members.length === 0 ||
    stage4Data.members.some(
      (m) => m.name.trim() === "" || m.designation.trim() === ""
    )
  ) {
    alert("Please enter all Member details.");
    return;
  }

  if (!stage4Data.attendanceSheet) {
    alert("Please upload Attendance Sheet.");
    return;
  }

  if (stage4Data.decision === "approve" && !stage4Data.tacMoM) {
    alert("Please upload TAC Minutes of Meeting.");
    return;
  }

  if (stage4Data.decision === "reject" && !stage4Data.reason) {
    alert("Please provide rejection reason.");
    return;
  }

  if (stage4Data.decision === "revision" && !stage4Data.observationNotes) {
    alert("Please provide observation notes.");
    return;
  }

  isValid = stage4Data.decision !== "";
  message = `Proposal ${stage4Data.decision}`;

  break;



case 5:
  if (!stage5Data.meetingDate) {
    alert("Please select Meeting Date.");
    return;
  }

  if (!stage5Data.meetingTime) {
    alert("Please select Meeting Time.");
    return;
  }

  if (
    stage5Data.members.length === 0 ||
    stage5Data.members.some(
      (m) => m.name.trim() === "" || m.designation.trim() === ""
    )
  ) {
    alert("Please enter all Member details.");
    return;
  }

  if (!stage5Data.attendanceSheet) {
    alert("Please upload Attendance Sheet.");
    return;
  }

  if (stage5Data.decision === "approve" && !stage5Data.secMoM) {
    alert("Please upload SEC Minutes of Meeting.");
    return;
  }

  if (stage5Data.decision === "reject" && !stage5Data.reason) {
    alert("Please provide rejection reason.");
    return;
  }

  if (stage5Data.decision === "revision" && !stage5Data.observationNotes) {
    alert("Please provide observation notes.");
    return;
  }

  isValid = stage5Data.decision !== "";
  message = `Proposal ${stage5Data.decision}`;

  break;



case 6:
  if (!stage6Data.meetingDate) {
    alert("Please select Meeting Date.");
    return;
  }

  if (!stage6Data.meetingTime) {
    alert("Please select Meeting Time.");
    return;
  }

  if (
    stage6Data.members.length === 0 ||
    stage6Data.members.some(
      (m) => m.name.trim() === "" || m.designation.trim() === ""
    )
  ) {
    alert("Please enter all Member details.");
    return;
  }

  if (!stage6Data.attendanceSheet) {
    alert("Please upload Attendance Sheet.");
    return;
  }

  if (stage6Data.decision === "approve" && !stage6Data.adminApprovalMoM) {
    alert("Please upload Administrative Approval Minutes of Meeting.");
    return;
  }

  if (stage6Data.decision === "reject" && !stage6Data.reason) {
    alert("Please provide rejection reason.");
    return;
  }

  if (stage6Data.decision === "revision" && !stage6Data.observationNotes) {
    alert("Please provide observation notes.");
    return;
  }

  isValid = stage6Data.decision !== "";
  message = `Proposal ${stage6Data.decision}`;

  break;

case 7:
  if (!stage7Data.meetingDate) {
    alert("Please select Meeting Date.");
    return;
  }

  if (!stage7Data.meetingTime) {
    alert("Please select Meeting Time.");
    return;
  }

  if (
    stage7Data.members.length === 0 ||
    stage7Data.members.some(
      (m) => m.name.trim() === "" || m.designation.trim() === ""
    )
  ) {
    alert("Please enter all Member details.");
    return;
  }

  if (!stage7Data.attendanceSheet) {
    alert("Please upload Attendance Sheet.");
    return;
  }

  if (stage7Data.decision === "approve" && !stage7Data.sdmaMoM) {
    alert("Please upload SDMA Minutes of Meeting.");
    return;
  }

  if (stage7Data.decision === "reject" && !stage7Data.reason) {
    alert("Please provide rejection reason.");
    return;
  }

  if (stage7Data.decision === "revision" && !stage7Data.observationNotes) {
    alert("Please provide observation notes.");
    return;
  }

  isValid = stage7Data.decision !== "";
  message = `Proposal ${stage7Data.decision}`;

  break;

      case 8:
        isValid = true;
        message = "Stage 8 saved. Forwarded to Stage 9.";
        break;

      case 9:
        isValid = true;
        message = "Stage 9 saved. Forwarded to Stage 10.";
        break;

     case 10:
        isValid = true;
        message = "Stage 10 saved. Forwarded to Project Closure Stage.";
        break;

        case 11:
  if (stage11Data.projectCompleted === "yes") {

    if (!stage11Data.completionDate) {
      alert("Please enter Date of Completion.");
      return;
    }

    if (!stage11Data.certificateIssuedDate) {
      alert("Please enter Completion Certificate Issued Date.");
      return;
    }

    if (!stage11Data.completionCertificate) {
      alert("Please upload Completion Certificate.");
      return;
    }
  }

  isValid = true;
  message = "Project Closure Saved. Status changed to Completed.";
  break;
    }

    if (isValid) {
        if (currentStage === 11) {
        
          setStage11Data((prev) => ({
            ...prev,
            status: "Completed"
          }));
        
          alert("Project Closure Saved Successfully. Status changed to Completed.");
        
        } else {
        
          alert(`Stage transition confirmed: ${message}`);
        }
        
        navigate("/proposal-detail");
    } else {
      alert("Please complete all required fields.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Stage Update</h1>
          <p className="text-sm text-muted-foreground">
            Update proposal stage: {currentProposal.id}
          </p>
        </div>
        <button
          onClick={() => navigate("/proposal-detail")}
          className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium flex items-center gap-2"
        >
          <ArrowLeft className="size-4" />
          Back to Detail
        </button>
      </div>

      {/* Current Stage Indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-5 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-900">Current Stage: {stages[currentStage - 1]?.name}</p>
              <p className="text-sm text-blue-700">Complete the fields below to transition to the next stage</p>
            </div>
          </div>
          <div>
            <select 
              value={currentStage} 
              onChange={(e) => setCurrentStage(Number(e.target.value))}
              className="px-3 py-1 border rounded-md text-sm"
            >
              {stages.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stage-Specific Form */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-primary mb-6">{stages[currentStage - 1]?.name}</h3>

        {currentStage === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Desk Officer Approved DPR/PPR? <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="approved"
                    value="yes"
                    checked={stage1Data.deskOfficerApproved === "yes"}
                    onChange={(e) => setStage1Data({ ...stage1Data, deskOfficerApproved: e.target.value })}
                    className="w-4 h-4"
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="approved"
                    value="no"
                    checked={stage1Data.deskOfficerApproved === "no"}
                    onChange={(e) => setStage1Data({ ...stage1Data, deskOfficerApproved: e.target.value })}
                    className="w-4 h-4"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            {stage1Data.deskOfficerApproved === "yes" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload DPR & PPR  <span className="text-red-600">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, (file) => setStage1Data({ ...stage1Data, approvalDocument: file }))}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background"
                />
                {stage1Data.approvalDocument && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {stage1Data.approvalDocument.name}
                  </p>
                )}
              </div>
            )}

            {stage1Data.deskOfficerApproved === "no" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Reason for Rejection <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={stage1Data.rejectionReason}
                  onChange={(e) => setStage1Data({ ...stage1Data, rejectionReason: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={4}
                  placeholder="Provide detailed reason for rejection"
                />
              </div>
            )}
          </div>
        )}

        {/* {currentStage === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">PMU Observation</label>
              <textarea
                value={stage2Data.observation}
                onChange={(e) => setStage2Data({ ...stage2Data, observation: e.target.value })}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={4}
                placeholder="Enter PMU observations"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="compliance"
                checked={stage2Data.complianceFlag}
                onChange={(e) => setStage2Data({ ...stage2Data, complianceFlag: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="compliance" className="text-sm font-medium cursor-pointer">
                Compliance Flag
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="revision"
                checked={stage2Data.revisionRequired}
                onChange={(e) => setStage2Data({ ...stage2Data, revisionRequired: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="revision" className="text-sm font-medium cursor-pointer">
                Revision Requirement
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Decision <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setStage2Data({ ...stage2Data, decision: "approve" })}
                  className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
                    stage2Data.decision === "approve"
                      ? "bg-green-100 border-green-600 text-green-700"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <CheckCircle2 className="size-4 mx-auto mb-1" />
                  Approve
                </button>
                <button
                  onClick={() => setStage2Data({ ...stage2Data, decision: "reject" })}
                  className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
                    stage2Data.decision === "reject"
                      ? "bg-red-100 border-red-600 text-red-700"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <XCircle className="size-4 mx-auto mb-1" />
                  Reject
                </button>
                <button
                  onClick={() => setStage2Data({ ...stage2Data, decision: "revision" })}
                  className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
                    stage2Data.decision === "revision"
                      ? "bg-orange-100 border-orange-600 text-orange-700"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <RefreshCw className="size-4 mx-auto mb-1" />
                  Revision
                </button>
              </div>
            </div>
          </div>
        )} */}

{currentStage === 2 && (
  <div className="space-y-6">

    {/* Proposal Received Date & Time */}
    <div>
      <label className="block text-sm font-medium mb-2">
        Date & Time Proposal Received by PMU Team
      </label>

      <input
        type="datetime-local"
        value={stage2Data.proposalReceivedDateTime}
        onChange={(e) =>
          setStage2Data({
            ...stage2Data,
            proposalReceivedDateTime: e.target.value,
          })
        }
        className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>

    {/* PMU Observation */}
    <div>
      <label className="block text-sm font-medium mb-2">
        PMU Observation
      </label>

      <textarea
        value={stage2Data.observation}
        onChange={(e) =>
          setStage2Data({
            ...stage2Data,
            observation: e.target.value,
          })
        }
        className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        rows={5}
        placeholder="Enter PMU observations"
      />
    </div>

    {/* Compliance Flag */}
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id="compliance"
        checked={stage2Data.complianceFlag}
        onChange={(e) =>
          setStage2Data({
            ...stage2Data,
            complianceFlag: e.target.checked,
          })
        }
        className="w-4 h-4"
      />

      <label
        htmlFor="compliance"
        className="text-sm font-medium cursor-pointer"
      >
        Compliance Flag
      </label>
    </div>

    {/* Revision Requirement */}
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id="revision"
        checked={stage2Data.revisionRequired}
        onChange={(e) =>
          setStage2Data({
            ...stage2Data,
            revisionRequired: e.target.checked,
          })
        }
        className="w-4 h-4"
      />

      <label
        htmlFor="revision"
        className="text-sm font-medium cursor-pointer"
      >
        Revision Requirement
      </label>
    </div>

    {/* Observation Submitted Date */}
    <div>
      <label className="block text-sm font-medium mb-2">
        Date PMU Team Submitted Observations
      </label>

      <input
        type="date"
        value={stage2Data.observationSubmittedDate}
        onChange={(e) =>
          setStage2Data({
            ...stage2Data,
            observationSubmittedDate: e.target.value,
          })
        }
        className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>

    {/* Decision */}
    <div>
      <label className="block text-sm font-medium mb-2">
        Decision <span className="text-red-600">*</span>
      </label>

      <div className="flex gap-4">

        {/* Approve */}
        <button
          onClick={() =>
            setStage2Data({
              ...stage2Data,
              decision: "approve",
            })
          }
          className={`flex-1 px-4 py-4 rounded-lg border font-medium transition-all ${
            stage2Data.decision === "approve"
              ? "bg-green-100 border-green-600 text-green-700"
              : "border-border hover:bg-muted"
          }`}
        >
          <CheckCircle2 className="size-5 mx-auto mb-2" />
          Approve
        </button>

        {/* Reject */}
        <button
          onClick={() =>
            setStage2Data({
              ...stage2Data,
              decision: "reject",
            })
          }
          className={`flex-1 px-4 py-4 rounded-lg border font-medium transition-all ${
            stage2Data.decision === "reject"
              ? "bg-red-100 border-red-600 text-red-700"
              : "border-border hover:bg-muted"
          }`}
        >
          <XCircle className="size-5 mx-auto mb-2" />
          Reject
        </button>

        {/* Revision */}
        <button
          onClick={() =>
            setStage2Data({
              ...stage2Data,
              decision: "revision",
            })
          }
          className={`flex-1 px-4 py-4 rounded-lg border font-medium transition-all ${
            stage2Data.decision === "revision"
              ? "bg-orange-100 border-orange-600 text-orange-700"
              : "border-border hover:bg-muted"
          }`}
        >
          <RefreshCw className="size-5 mx-auto mb-2" />
          Revision
        </button>

      </div>
    </div>

  </div>
)}
        
        {/* {(currentStage === 3 || currentStage === 4 || currentStage === 5 || currentStage === 6) && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Decision <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    if (currentStage === 3) setStage3Data({ ...stage3Data, decision: "approve" });
                    if (currentStage === 4) setStage4Data({ ...stage4Data, decision: "approve" });
                    if (currentStage === 5) setStage5Data({ ...stage5Data, decision: "approve" });
                    if (currentStage === 6) setStage6Data({ ...stage6Data, decision: "approve" });
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
                    (currentStage === 3 && stage3Data.decision === "approve") ||
                    (currentStage === 4 && stage4Data.decision === "approve") ||
                    (currentStage === 5 && stage5Data.decision === "approve") ||
                    (currentStage === 6 && stage6Data.decision === "approve")
                      ? "bg-green-100 border-green-600 text-green-700"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <CheckCircle2 className="size-4 mx-auto mb-1" />
                  Approve
                </button>
                <button
                  onClick={() => {
                    if (currentStage === 3) setStage3Data({ ...stage3Data, decision: "reject" });
                    if (currentStage === 4) setStage4Data({ ...stage4Data, decision: "reject" });
                    if (currentStage === 5) setStage5Data({ ...stage5Data, decision: "reject" });
                    if (currentStage === 6) setStage6Data({ ...stage6Data, decision: "reject" });
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
                    (currentStage === 3 && stage3Data.decision === "reject") ||
                    (currentStage === 4 && stage4Data.decision === "reject") ||
                    (currentStage === 5 && stage5Data.decision === "reject") ||
                    (currentStage === 6 && stage6Data.decision === "reject")
                      ? "bg-red-100 border-red-600 text-red-700"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <XCircle className="size-4 mx-auto mb-1" />
                  Reject
                </button>
                <button
                  onClick={() => {
                    if (currentStage === 3) setStage3Data({ ...stage3Data, decision: "revision" });
                    if (currentStage === 4) setStage4Data({ ...stage4Data, decision: "revision" });
                    if (currentStage === 5) setStage5Data({ ...stage5Data, decision: "revision" });
                    if (currentStage === 6) setStage6Data({ ...stage6Data, decision: "revision" });
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
                    (currentStage === 3 && stage3Data.decision === "revision") ||
                    (currentStage === 4 && stage4Data.decision === "revision") ||
                    (currentStage === 5 && stage5Data.decision === "revision") ||
                    (currentStage === 6 && stage6Data.decision === "revision")
                      ? "bg-orange-100 border-orange-600 text-orange-700"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <RefreshCw className="size-4 mx-auto mb-1" />
                  Revision
                </button>
              </div>
            </div>

            {((currentStage === 3 && stage3Data.decision === "approve") ||
              (currentStage === 4 && stage4Data.decision === "approve") ||
              (currentStage === 5 && stage5Data.decision === "approve") ||
              (currentStage === 6 && stage6Data.decision === "approve")) && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload {currentStage === 3 ? "PAC" : currentStage === 4 ? "TAC" : currentStage === 5 ? "SEC" : "SDMA"} MoM{" "}
                  <span className="text-red-600">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    if (currentStage === 3) handleFileUpload(e, (file) => setStage3Data({ ...stage3Data, pacMoM: file }));
                    if (currentStage === 4) handleFileUpload(e, (file) => setStage4Data({ ...stage4Data, tacMoM: file }));
                    if (currentStage === 5) handleFileUpload(e, (file) => setStage5Data({ ...stage5Data, secMoM: file }));
                    if (currentStage === 6) handleFileUpload(e, (file) => setStage6Data({ ...stage6Data, sdmaMoM: file }));
                  }}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background"
                />
                {((currentStage === 3 && stage3Data.pacMoM) ||
                  (currentStage === 4 && stage4Data.tacMoM) ||
                  (currentStage === 5 && stage5Data.secMoM) ||
                  (currentStage === 6 && stage6Data.sdmaMoM)) && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ File uploaded
                  </p>
                )}
              </div>
            )}

            {((currentStage === 3 && stage3Data.decision === "reject") ||
              (currentStage === 4 && stage4Data.decision === "reject") ||
              (currentStage === 5 && stage5Data.decision === "reject") ||
              (currentStage === 6 && stage6Data.decision === "reject")) && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Reason for Rejection <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={
                    currentStage === 3 ? stage3Data.observationNotes :
                    currentStage === 4 ? stage4Data.reason :
                    currentStage === 5 ? stage5Data.reason :
                    stage6Data.reason
                  }
                  onChange={(e) => {
                    if (currentStage === 3) setStage3Data({ ...stage3Data, observationNotes: e.target.value });
                    if (currentStage === 4) setStage4Data({ ...stage4Data, reason: e.target.value });
                    if (currentStage === 5) setStage5Data({ ...stage5Data, reason: e.target.value });
                    if (currentStage === 6) setStage6Data({ ...stage6Data, reason: e.target.value });
                  }}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={4}
                  placeholder="Provide detailed reason for rejection"
                />
              </div>
            )}

            {((currentStage === 3 && stage3Data.decision === "revision") ||
              (currentStage === 4 && stage4Data.decision === "revision") ||
              (currentStage === 5 && stage5Data.decision === "revision") ||
              (currentStage === 6 && stage6Data.decision === "revision")) && (
              <div>
                <label className="block text-sm font-medium mb-2">Observation Notes</label>
                <textarea
                  value={
                    currentStage === 3 ? stage3Data.observationNotes :
                    currentStage === 4 ? stage4Data.observationNotes :
                    currentStage === 5 ? stage5Data.observationNotes :
                    stage6Data.observationNotes
                  }
                  onChange={(e) => {
                    if (currentStage === 3) setStage3Data({ ...stage3Data, observationNotes: e.target.value });
                    if (currentStage === 4) setStage4Data({ ...stage4Data, observationNotes: e.target.value });
                    if (currentStage === 5) setStage5Data({ ...stage5Data, observationNotes: e.target.value });
                    if (currentStage === 6) setStage6Data({ ...stage6Data, observationNotes: e.target.value });
                  }}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={4}
                  placeholder="Provide observation notes for revision"
                />
              </div>
            )}
          </div>
        )} */}

{(currentStage === 3 ||
  currentStage === 4 ||
  currentStage === 5 ||
  currentStage === 6 ||
  currentStage === 7) && (
  <div className="space-y-6">

    {/* Meeting Date & Time */}
    <div className="grid grid-cols-2 gap-4">

      <div>
        <label className="block text-sm font-medium mb-2">
          Meeting Date
        </label>

        <input
          type="date"
          value={
            currentStage === 3
              ? stage3Data.meetingDate
              : currentStage === 4
              ? stage4Data.meetingDate
              : currentStage === 5
              ? stage5Data.meetingDate
              : currentStage === 6
              ? stage6Data.meetingDate
              : stage7Data.meetingDate
          }
          onChange={(e) => {
            if (currentStage === 3)
              setStage3Data({ ...stage3Data, meetingDate: e.target.value });

            if (currentStage === 4)
              setStage4Data({ ...stage4Data, meetingDate: e.target.value });

            if (currentStage === 5)
              setStage5Data({ ...stage5Data, meetingDate: e.target.value });

            if (currentStage === 6)
              setStage6Data({ ...stage6Data, meetingDate: e.target.value });

            if (currentStage === 7)
              setStage7Data({ ...stage7Data, meetingDate: e.target.value });
          }}
          className="w-full px-4 py-3 border border-border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Meeting Time
        </label>

        <input
          type="time"
          value={
            currentStage === 3
              ? stage3Data.meetingTime
              : currentStage === 4
              ? stage4Data.meetingTime
              : currentStage === 5
              ? stage5Data.meetingTime
              : currentStage === 6
              ? stage6Data.meetingTime
              : stage7Data.meetingTime
          }
          onChange={(e) => {
            if (currentStage === 3)
              setStage3Data({ ...stage3Data, meetingTime: e.target.value });

            if (currentStage === 4)
              setStage4Data({ ...stage4Data, meetingTime: e.target.value });

            if (currentStage === 5)
              setStage5Data({ ...stage5Data, meetingTime: e.target.value });

            if (currentStage === 6)
              setStage6Data({ ...stage6Data, meetingTime: e.target.value });

            if (currentStage === 7)
              setStage7Data({ ...stage7Data, meetingTime: e.target.value });
          }}
          className="w-full px-4 py-3 border border-border rounded-lg"
        />
      </div>
    </div>

    {/* Members Table */}
    <MembersTable
      members={
        currentStage === 3
          ? stage3Data.members
          : currentStage === 4
          ? stage4Data.members
          : currentStage === 5
          ? stage5Data.members
          : currentStage === 6
          ? stage6Data.members
          : stage7Data.members
      }
      setMembers={(members) => {
        if (currentStage === 3)
          setStage3Data({ ...stage3Data, members });

        if (currentStage === 4)
          setStage4Data({ ...stage4Data, members });

        if (currentStage === 5)
          setStage5Data({ ...stage5Data, members });

        if (currentStage === 6)
          setStage6Data({ ...stage6Data, members });

        if (currentStage === 7)
          setStage7Data({ ...stage7Data, members });
      }}
    />

    {/* Attendance Sheet Upload */}
    <div>
      <label className="block text-sm font-medium mb-2">
        Upload Attendance Sheet
      </label>

      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;

          if (currentStage === 3)
            setStage3Data({
              ...stage3Data,
              attendanceSheet: file,
            });

          if (currentStage === 4)
            setStage4Data({
              ...stage4Data,
              attendanceSheet: file,
            });

          if (currentStage === 5)
            setStage5Data({
              ...stage5Data,
              attendanceSheet: file,
            });

          if (currentStage === 6)
            setStage6Data({
              ...stage6Data,
              attendanceSheet: file,
            });

          if (currentStage === 7)
            setStage7Data({
              ...stage7Data,
              attendanceSheet: file,
            });
        }}
        className="w-full px-4 py-3 border border-border rounded-lg"
      />
    </div>

    {/* Decision */}
    <div>
      <label className="block text-sm font-medium mb-2">
        Decision <span className="text-red-600">*</span>
      </label>

      <div className="flex gap-4">

        <button
          onClick={() => {
            if (currentStage === 3)
              setStage3Data({ ...stage3Data, decision: "approve" });

            if (currentStage === 4)
              setStage4Data({ ...stage4Data, decision: "approve" });

            if (currentStage === 5)
              setStage5Data({ ...stage5Data, decision: "approve" });

            if (currentStage === 6)
              setStage6Data({ ...stage6Data, decision: "approve" });

            if (currentStage === 7)
              setStage7Data({ ...stage7Data, decision: "approve" });
          }}
          className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
            (currentStage === 3 && stage3Data.decision === "approve") ||
            (currentStage === 4 && stage4Data.decision === "approve") ||
            (currentStage === 5 && stage5Data.decision === "approve") ||
            (currentStage === 6 && stage6Data.decision === "approve") ||
            (currentStage === 7 && stage7Data.decision === "approve")
              ? "bg-green-100 border-green-600 text-green-700"
              : "border-border hover:bg-muted"
          }`}
        >
          <CheckCircle2 className="size-4 mx-auto mb-1" />
          Approve
        </button>

        <button
          onClick={() => {
            if (currentStage === 3)
              setStage3Data({ ...stage3Data, decision: "reject" });

            if (currentStage === 4)
              setStage4Data({ ...stage4Data, decision: "reject" });

            if (currentStage === 5)
              setStage5Data({ ...stage5Data, decision: "reject" });

            if (currentStage === 6)
              setStage6Data({ ...stage6Data, decision: "reject" });

            if (currentStage === 7)
              setStage7Data({ ...stage7Data, decision: "reject" });
          }}
          className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
            (currentStage === 3 && stage3Data.decision === "reject") ||
            (currentStage === 4 && stage4Data.decision === "reject") ||
            (currentStage === 5 && stage5Data.decision === "reject") ||
            (currentStage === 6 && stage6Data.decision === "reject") ||
            (currentStage === 7 && stage7Data.decision === "reject")
              ? "bg-red-100 border-red-600 text-red-700"
              : "border-border hover:bg-muted"
          }`}
        >
          <XCircle className="size-4 mx-auto mb-1" />
          Reject
        </button>

        <button
          onClick={() => {
            if (currentStage === 3)
              setStage3Data({ ...stage3Data, decision: "revision" });

            if (currentStage === 4)
              setStage4Data({ ...stage4Data, decision: "revision" });

            if (currentStage === 5)
              setStage5Data({ ...stage5Data, decision: "revision" });

            if (currentStage === 6)
              setStage6Data({ ...stage6Data, decision: "revision" });

            if (currentStage === 7)
              setStage7Data({ ...stage7Data, decision: "revision" });
          }}
          className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
            (currentStage === 3 && stage3Data.decision === "revision") ||
            (currentStage === 4 && stage4Data.decision === "revision") ||
            (currentStage === 5 && stage5Data.decision === "revision") ||
            (currentStage === 6 && stage6Data.decision === "revision") ||
            (currentStage === 7 && stage7Data.decision === "revision")
              ? "bg-orange-100 border-orange-600 text-orange-700"
              : "border-border hover:bg-muted"
          }`}
        >
          <RefreshCw className="size-4 mx-auto mb-1" />
          Revision
        </button>

      </div>
    </div>

    {/* MoM Upload */}
    {(
      (currentStage === 3 && stage3Data.decision === "approve") ||
      (currentStage === 4 && stage4Data.decision === "approve") ||
      (currentStage === 5 && stage5Data.decision === "approve") ||
      (currentStage === 6 && stage6Data.decision === "approve") ||
      (currentStage === 7 && stage7Data.decision === "approve")
    ) && (
      <div>

        <label className="block text-sm font-medium mb-2">
          Upload{" "}
          {currentStage === 3
            ? "PAC"
            : currentStage === 4
            ? "TAC"
            : currentStage === 5
            ? "SEC"
            : currentStage === 6
            ? "Administrative Approval"
            : "SDMA"}{" "}
          Minutes of Meeting
        </label>

        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => {
            if (currentStage === 3)
              handleFileUpload(e, (file) =>
                setStage3Data({ ...stage3Data, pacMoM: file })
              );

            if (currentStage === 4)
              handleFileUpload(e, (file) =>
                setStage4Data({ ...stage4Data, tacMoM: file })
              );

            if (currentStage === 5)
              handleFileUpload(e, (file) =>
                setStage5Data({ ...stage5Data, secMoM: file })
              );

            if (currentStage === 6)
              handleFileUpload(e, (file) =>
                setStage6Data({ ...stage6Data, adminApprovalMoM: file })
              );

            if (currentStage === 7)
              handleFileUpload(e, (file) =>
                setStage7Data({ ...stage7Data, sdmaMoM: file })
              );
          }}
          className="w-full px-4 py-3 border border-border rounded-lg"
        />
      </div>
    )}

    {/* Reject */}
    {(
      (currentStage === 3 && stage3Data.decision === "reject") ||
      (currentStage === 4 && stage4Data.decision === "reject") ||
      (currentStage === 5 && stage5Data.decision === "reject") ||
      (currentStage === 6 && stage6Data.decision === "reject") ||
      (currentStage === 7 && stage7Data.decision === "reject")
    ) && (
      <div>

        <label className="block text-sm font-medium mb-2">
          Reason for Rejection
        </label>

        <textarea
          rows={4}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="Enter reason for rejection"
          onChange={(e) => {
            if (currentStage === 3) setStage3Data({ ...stage3Data, reason: e.target.value });
            if (currentStage === 4) setStage4Data({ ...stage4Data, reason: e.target.value });
            if (currentStage === 5) setStage5Data({ ...stage5Data, reason: e.target.value });
            if (currentStage === 6) setStage6Data({ ...stage6Data, reason: e.target.value });
            if (currentStage === 7) setStage7Data({ ...stage7Data, reason: e.target.value });
          }}
        />
      </div>
    )}

    {/* Revision */}
    {(
      (currentStage === 3 && stage3Data.decision === "revision") ||
      (currentStage === 4 && stage4Data.decision === "revision") ||
      (currentStage === 5 && stage5Data.decision === "revision") ||
      (currentStage === 6 && stage6Data.decision === "revision") ||
      (currentStage === 7 && stage7Data.decision === "revision")
    ) && (
      <div>

        <label className="block text-sm font-medium mb-2">
          Observation Notes
        </label>

        <textarea
          rows={4}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="Provide observation notes"
          onChange={(e) => {
            if (currentStage === 3) setStage3Data({ ...stage3Data, observationNotes: e.target.value });
            if (currentStage === 4) setStage4Data({ ...stage4Data, observationNotes: e.target.value });
            if (currentStage === 5) setStage5Data({ ...stage5Data, observationNotes: e.target.value });
            if (currentStage === 6) setStage6Data({ ...stage6Data, observationNotes: e.target.value });
            if (currentStage === 7) setStage7Data({ ...stage7Data, observationNotes: e.target.value });
          }}
        />
      </div>
    )}

  </div>
)}
        
        {currentStage === 8 && (
          <Stage7 data={stage8Data} setData={setStage8Data} />
        )}

        {currentStage === 9 && (
          <Stage8 data={stage9Data} setData={setStage9Data} />
        )}

        {currentStage === 10 && (
          <Stage9 data={stage10Data} setData={setStage10Data} />
        )}

        {currentStage === 11 && (
  <div className="space-y-6">

    <div>
      <label className="block text-sm font-medium mb-3">
        Is Project Completed?
      </label>

      <div className="flex gap-4">

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="projectCompleted"
            value="yes"
            checked={stage11Data.projectCompleted === "yes"}
            onChange={(e) =>
              setStage11Data({
                ...stage11Data,
                projectCompleted: e.target.value
              })
            }
          />
          Yes
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="projectCompleted"
            value="no"
            checked={stage11Data.projectCompleted === "no"}
            onChange={(e) =>
              setStage11Data({
                ...stage11Data,
                projectCompleted: e.target.value
              })
            }
          />
          No
        </label>

      </div>
    </div>

    {stage11Data.projectCompleted === "yes" && (
      <div className="space-y-4 border rounded-lg p-5">

        <div>
          <label className="block text-sm font-medium mb-2">
            Date of Completion
          </label>

          <input
            type="date"
            value={stage11Data.completionDate}
            onChange={(e) =>
              setStage11Data({
                ...stage11Data,
                completionDate: e.target.value
              })
            }
            className="w-full px-4 py-2 border border-border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Date of Completion Certificate Issued
          </label>

          <input
            type="date"
            value={stage11Data.certificateIssuedDate}
            onChange={(e) =>
              setStage11Data({
                ...stage11Data,
                certificateIssuedDate: e.target.value
              })
            }
            className="w-full px-4 py-2 border border-border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Upload Completion Certificate
          </label>

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) =>
              setStage11Data({
                ...stage11Data,
                completionCertificate:
                  e.target.files?.[0] || null
              })
            }
            className="w-full px-4 py-2 border border-border rounded-lg"
          />

          {stage11Data.completionCertificate && (
            <p className="text-sm text-green-600 mt-2">
              ✓ {stage11Data.completionCertificate.name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Upload Multiple Social Audit Files
          </label>

          <input
            type="file"
            multiple
            onChange={(e) =>
              setStage11Data({
                ...stage11Data,
                socialAuditFiles: Array.from(
                  e.target.files || []
                )
              })
            }
            className="w-full px-4 py-2 border border-border rounded-lg"
          />

          {stage11Data.socialAuditFiles.length > 0 && (
            <div className="mt-2 text-sm text-green-600">
              {stage11Data.socialAuditFiles.length} file(s)
              selected
            </div>
          )}
        </div>

      </div>
    )}
  </div>
)}
        
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/proposal-detail")}
          className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmTransition}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2"
        >
          <Send className="size-4" />
          Confirm Transition
        </button>
      </div>
    </div>
  );
}
