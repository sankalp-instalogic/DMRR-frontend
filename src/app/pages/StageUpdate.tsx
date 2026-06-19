import { useState } from "react";
import { useNavigate } from "react-router";
import { AlertCircle, ArrowLeft, Send } from "lucide-react";

import { Stage1 } from "../components/Stage1";
import { Stage2 } from "../components/Stage2";
import { MeetingStage } from "../components/MeetingStage";
import { Stage8 } from "../components/Stage8";
import { Stage9 } from "../components/Stage9";
import { Stage10 } from "../components/Stage10";
import { Stage11 } from "../components/Stage11";

import type {
  MeetingStageData,
  Stage,
  Stage1Data,
  Stage2Data,
  Stage8Data,
  Stage9Data,
  Stage10Data,
  Stage11Data,
} from "../../../constants/stageTypes";

import {
  
  validateMeetingStage,
  validateStage1,
  validateStage2,
  validateStage8,
  validateStage9,
  validateStage10,
  validateStage11,
} from "../../../constants/stage-validation";
import type { ValidationResult } from "../../../constants/stage-validation";

// Mock current proposal stage (in real app, this would come from props/context)
const currentProposal = {
  id: "PROP-2026-001",
  currentStage: 1,
  stageName: "DDMA & Line Department Workflow",
};

const stages: Stage[] = [
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
  { id: 11, name: "Project Closure" },
];

const makeMeetingData = (): MeetingStageData => ({
  meetingDate: "",
  meetingTime: "",
  members: [{ srNo: 1, name: "", designation: "" }],
  attendanceSheet: null,
  decision: "",
  momFile: null,
  reason: "",
  observationNotes: "",
});

export function StageUpdate() {
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState(currentProposal.currentStage);

  const [stage1Data, setStage1Data] = useState<Stage1Data>({
    deskOfficerApproved: "",
    approvalDocument: null,
    rejectionReason: "",
  });

  const [stage2Data, setStage2Data] = useState<Stage2Data>({
    proposalReceivedDateTime: "",
    observationSubmittedDate: "",
    observation: "",
    complianceFlag: false,
    revisionRequired: false,
    decision: "",
  });

  // Committee-meeting stages (3 PAC, 4 TAC, 5 SEC, 6 Admin Approval, 7 SDMA)
  const [stage3Data, setStage3Data] = useState<MeetingStageData>(makeMeetingData);
  const [stage4Data, setStage4Data] = useState<MeetingStageData>(makeMeetingData);
  const [stage5Data, setStage5Data] = useState<MeetingStageData>(makeMeetingData);
  const [stage6Data, setStage6Data] = useState<MeetingStageData>(makeMeetingData);
  const [stage7Data, setStage7Data] = useState<MeetingStageData>(makeMeetingData);

  const [stage8Data, setStage8Data] = useState<Stage8Data>({
    l1VendorIdentified: "",
    vendorName: "",
    l1Cost: "",
    workOrderIssued: "",
    workOrderIssuedDate: "",
    supportingDocType: "Letter from DMRR",
    supportingDocs: [],
  });

  const [stage9Data, setStage9Data] = useState<Stage9Data>({
    entryDate: "",
    startDate: "",
    expectedCompletion: "",
    mprDocs: [],
    mprMonth: "",
    mprDate: "",
    progressPercent: "",
    mprRemarks: "",
    geoPhotos: [],
    supportingDocs: [],
    docType: "Site Inspection Report",
  });

  const [stage10Data, setStage10Data] = useState<Stage10Data>({
    billReceivedLineDept: "",
    lineDeptReceiptDate: "",
    lineDeptBillAmount: "",
    lineDeptDocs: [],
    lineDeptDocType: "Invoice",
    billReceivedDO: "",
    doReceivedDate: "",
    doAmount: "",
    doDocs: [],
    doDocType: "",
    billSentPS: "",
    psForwardingDate: "",
    psRemarks: "",
    psDoc: null,
    paymentOrderMade: "",
    paymentOrderDate: "",
    installmentPhase: "25%",
    amountReleased: "",
    releaseRemarks: "",
    paymentDoc: null,
    paymentDocType: "Payment Order",
  });

  const [stage11Data, setStage11Data] = useState<Stage11Data>({
    projectCompleted: "",
    completionDate: "",
    certificateIssuedDate: "",
    completionCertificate: null,
    socialAuditFiles: [],
    status: "Pending",
  });

  // Maps a meeting stage id -> its state and the committee label used in the form.
  type MeetingEntry = {
    data: MeetingStageData;
    setData: React.Dispatch<React.SetStateAction<MeetingStageData>>;
    label: string;
  };

  const meetingStages: Partial<Record<number, MeetingEntry>> = {
    3: { data: stage3Data, setData: setStage3Data, label: "PAC" },
    4: { data: stage4Data, setData: setStage4Data, label: "TAC" },
    5: { data: stage5Data, setData: setStage5Data, label: "SEC" },
    6: {
      data: stage6Data,
      setData: setStage6Data,
      label: "Administrative Approval",
    },
    7: { data: stage7Data, setData: setStage7Data, label: "SDMA" },
  };

  const currentMeeting = meetingStages[currentStage];

  const validateCurrentStage = (): ValidationResult => {
    switch (currentStage) {
      case 1:
        return validateStage1(stage1Data);
      case 2:
        return validateStage2(stage2Data);
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        return validateMeetingStage(meetingStages[currentStage]!.data);
      case 8:
        return validateStage8(stage8Data);
      case 9:
        return validateStage9();
      case 10:
        return validateStage10();
      case 11:
        return validateStage11(stage11Data);
      default:
        return { ok: false, error: "Please complete all required fields." };
    }
  };

  const handleConfirmTransition = () => {
    const result = validateCurrentStage();

    if (!result.ok) {
      alert(result.error);
      return;
    }

    if (currentStage === 11) {
      setStage11Data((prev) => ({ ...prev, status: "Completed" }));
      alert("Project Closure Saved Successfully. Status changed to Completed.");
    } else {
      alert(`Stage transition confirmed: ${result.message}`);
    }

    navigate("/proposal-detail");
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
              <p className="font-semibold text-blue-900">
                Current Stage: {stages[currentStage - 1]?.name}
              </p>
              <p className="text-sm text-blue-700">
                Complete the fields below to transition to the next stage
              </p>
            </div>
          </div>
          <div>
            <select
              value={currentStage}
              onChange={(e) => setCurrentStage(Number(e.target.value))}
              className="px-3 py-1 border rounded-md text-sm"
            >
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stage-Specific Form */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-primary mb-6">
          {stages[currentStage - 1]?.name}
        </h3>

        {currentStage === 1 && (
          <Stage1 data={stage1Data} setData={setStage1Data} />
        )}

        {currentStage === 2 && (
          <Stage2 data={stage2Data} setData={setStage2Data} />
        )}

        {currentMeeting && (
          <MeetingStage
            data={currentMeeting.data}
            setData={currentMeeting.setData}
            momLabel={currentMeeting.label}
          />
        )}

        {currentStage === 8 && (
          <Stage8 data={stage8Data} setData={setStage8Data} />
        )}

        {currentStage === 9 && (
          <Stage9 data={stage9Data} setData={setStage9Data} />
        )}

        {currentStage === 10 && (
          <Stage10 data={stage10Data} setData={setStage10Data} />
        )}

        {currentStage === 11 && (
          <Stage11 data={stage11Data} setData={setStage11Data} />
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