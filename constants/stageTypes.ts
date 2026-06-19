export interface Member {
  srNo: number;
  name: string;
  designation: string;
}

export interface Stage1Data {
  deskOfficerApproved: string;
  approvalDocument: File | null;
  rejectionReason: string;
}

export interface Stage2Data {
  proposalReceivedDateTime: string;
  observationSubmittedDate: string;
  observation: string;
  complianceFlag: boolean;
  revisionRequired: boolean;
  decision: string;
}

/**
 * Shared shape for the committee-meeting stages (PAC, TAC, SEC,
 * Administrative Approval, SDMA). These were previously five separate
 * state objects that differed only in the name of the "minutes of meeting"
 * field (pacMoM / tacMoM / ...). They are unified here under `momFile`.
 */
export interface MeetingStageData {
  meetingDate: string;
  meetingTime: string;
  members: Member[];
  attendanceSheet: File | null;
  decision: string;
  momFile: File | null;
  reason: string;
  observationNotes: string;
}

export interface Stage8Data {
  l1VendorIdentified: string;
  vendorName: string;
  l1Cost: string;
  workOrderIssued: string;
  workOrderIssuedDate: string;
  supportingDocType: string;
  supportingDocs: File[];
}

export interface Stage9Data {
  entryDate: string;
  startDate: string;
  expectedCompletion: string;
  mprDocs: File[];
  mprMonth: string;
  mprDate: string;
  progressPercent: string;
  mprRemarks: string;
  geoPhotos: {
    file: File;
    lat: string;
    lng: string;
    date: string;
    desc: string;
  }[];
  supportingDocs: File[];
  docType: string;
}

export interface Stage10Data {
  billReceivedLineDept: string;
  lineDeptReceiptDate: string;
  lineDeptBillAmount: string;
  lineDeptDocs: File[];
  lineDeptDocType: string;
  billReceivedDO: string;
  doReceivedDate: string;
  doAmount: string;
  doDocs: File[];
  doDocType: string;
  billSentPS: string;
  psForwardingDate: string;
  psRemarks: string;
  psDoc: File | null;
  paymentOrderMade: string;
  paymentOrderDate: string;
  installmentPhase: string;
  amountReleased: string;
  releaseRemarks: string;
  paymentDoc: File | null;
  paymentDocType: string;
}

export interface Stage11Data {
  projectCompleted: string;
  completionDate: string;
  certificateIssuedDate: string;
  completionCertificate: File | null;
  socialAuditFiles: File[];
  status: string;
}

export interface Stage {
  id: number;
  name: string;
}

/**
 * Helper type for a `[data, setData]`-style pair passed into stage
 * components. `setData` accepts either the next value or an updater fn,
 * matching React's `Dispatch<SetStateAction<T>>`.
 */
export interface StageProps<T> {
  data: T;
  setData: React.Dispatch<React.SetStateAction<T>>;
}