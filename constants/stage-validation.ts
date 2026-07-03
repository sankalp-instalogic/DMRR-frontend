import type {
  MeetingStageData,
  Stage1Data,
  Stage2Data,
  Stage8Data,
  Stage11Data,
} from "./stageTypes";

/**
 * Result of validating a stage.
 *  - ok: true  -> safe to transition; `message` is the confirmation text.
 *  - ok: false -> blocked; `error` is shown to the user.
 */
export type ValidationResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

const fail = (error: string): ValidationResult => ({ ok: false, error });
const pass = (message: string): ValidationResult => ({ ok: true, message });

const INCOMPLETE = "Please complete all required fields.";

export function validateStage1(d: Stage1Data): ValidationResult {
  if (d.deskOfficerApproved === "yes" && !d.approvalDocument) {
    return fail("Please upload approval document.");
  }
  if (d.deskOfficerApproved === "no" && !d.rejectionReason) {
    return fail("Please provide rejection reason.");
  }
  if (d.deskOfficerApproved === "") return fail(INCOMPLETE);

  return pass(
    d.deskOfficerApproved === "yes"
      ? "Approved and forwarded to PMU"
      : "Sent for revision",
  );
}

export function validateStage2(d: Stage2Data): ValidationResult {
  if (d.decision === "") return fail(INCOMPLETE);
  return pass(`Proposal ${d.decision}`);
}

export function validateMeetingStage(d: MeetingStageData): ValidationResult {
  if (!d.meetingDate) return fail("Please select Meeting Date.");
  if (!d.meetingTime) return fail("Please select Meeting Time.");

  if (
    d.members.length === 0 ||
    d.members.some((m) => m.name.trim() === "" || m.designation.trim() === "")
  ) {
    return fail("Please enter all Member details.");
  }

  if (!d.attendanceSheet) return fail("Please upload Attendance Sheet.");

  if (d.decision === "approve" && !d.momFile) {
    return fail("Please upload Minutes of Meeting.");
  }
  if (d.decision === "reject" && !d.reason) {
    return fail("Please provide rejection reason.");
  }
  if (d.decision === "revision" && !d.observationNotes) {
    return fail("Please provide observation notes.");
  }
  if (d.decision === "") return fail(INCOMPLETE);

  return pass(`Proposal ${d.decision}`);
}

export function validateStage8(d: Stage8Data): ValidationResult {
  if (d.l1VendorIdentified === "yes" && (!d.vendorName || !d.l1Cost)) {
    return fail("Please enter Vendor Name and L1 Cost.");
  }
  if (d.workOrderIssued === "yes" && !d.workOrderIssuedDate) {
    return fail("Please enter Work Order Issued Date.");
  }
  if (d.supportingDocs.length === 0) {
    return fail("Please upload Supporting Documents.");
  }
  return pass("Tendering details saved successfully.");
}

export function validateStage9(): ValidationResult {
  return pass("Stage 9 saved. Forwarded to Stage 10.");
}

export function validateStage10(): ValidationResult {
  return pass("Stage 10 saved. Forwarded to Project Closure Stage.");
}

export function validateStage11(d: Stage11Data): ValidationResult {
  if (d.projectCompleted === "yes") {
    if (!d.completionDate) return fail("Please enter Date of Completion.");
    if (!d.certificateIssuedDate) {
      return fail("Please enter Completion Certificate Issued Date.");
    }
    if (!d.completionCertificate) {
      return fail("Please upload Completion Certificate.");
    }
  }
  return pass("Project Closure Saved. Status changed to Completed.");
}