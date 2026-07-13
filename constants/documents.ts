/**
 * Central source of truth for the `ownerType` and `documentType` values sent to
 * the `POST /api/v1/Documents/upload` endpoint.
 *
 * These mirror the backend C# enums (`DocumentOwnerType` / `DocumentType`).
 * Keep them in sync with the backend — do not hardcode these numbers anywhere
 * else in the app.
 *
 * NOTE: We use `as const` objects rather than TS `enum` because the project's
 * tsconfig enables `erasableSyntaxOnly`, which disallows `enum` (it emits
 * runtime code). These objects give the same `DocumentType.Invoice` ergonomics
 * while being fully type-erasable.
 */

export const DocumentOwnerType = {
  Proposal: 1,
  Procurement: 2,
  Project: 3,
  Billing: 4,
  Closure: 5,
  Survey: 6,
  Nbs: 7,
  DataTender: 8,
  Grant: 9,
  Committee: 10,
  Fund: 11,
  Master: 12,
  NdmaGuideline: 13,
  FundsOthers: 14,
  ProcurementTenders: 15,
} as const;

export type DocumentOwnerType =
  (typeof DocumentOwnerType)[keyof typeof DocumentOwnerType];

export const DocumentType = {
  ProposalDocument: 1,
  DDMAResolution: 2,
  TechnicalSanction: 3,
  PacAttendanceSheet: 4,
  PACMoM: 5,
  TacAttendanceSheet: 6,
  TACMoM: 7,
  SecAttendanceSheet: 8,
  SecMoM: 9,
  AAAttendanceSheet: 10,
  AdministrativeApprovalOrder: 11,
  SDMAAttendanceSheet: 12,
  SDMAMOM: 13,
  ConsolidatedTenderDocument: 14,
  MonthlyProgressReports: 15,
  GeoTaggedPhotos: 16,
  Exec_SiteInspectionReport: 17,
  Exec_TPQA: 18,
  Exec_UtilizationCertificate: 19,
  Exec_CompletionCertificate: 20,
  Bill_LineDepartment: 21,
  Bill_RecievedAtDO: 22,
  Bill_RecievedAtDirector: 23,
  Bill_RecievedAtPS: 24,
  Bill_RecievedAtMinister: 25,
  Bill_PaymentOrder: 26,
  Bill_GrantRelease: 27,
  Bill_PaymentToDDO: 28,
  Bill_ToTreasury: 29,
  Bill_ToVendor: 30,
  Closure_FDL_Proposal_CL: 31,
  Closure_DDO: 32,
  Closure_NonDuplicationCertificate: 33,
  Closure_Invoice_RABill: 34,
  Closure_LastBills_UtilizationCertificate: 35,
  Closure_WorkOrder: 36,
  Closure_ConsolidatedMPR_FPR: 37,
  Closure_CompletionCertificate_HandoverCertificate: 38,
  Closure_Quality_TestReport: 39,
  Closure_ConsolidatedMeasurementBook: 40,
  Closure_TQPACertification: 41,
  Closure_ConsolidatedGeoTagPhotos: 42,
  Closure_CompletionCertificate_HandoverCertificate2: 43,
  Closure_SocialAuditandEvaluationReport: 44,
  RLBL_GR: 45,
  RLBL_CompletionCertificate: 46,
  NBS_GR: 47,
  NBS_CompletionCertificate: 48,
  DMT_TechnicalBidOpening: 49,
  DMT_TechnicalEvaluation: 50,
  DMT_FinancialBidOpening: 51,
  DMT_FinancialEvaluation: 52,
  ResearchGrant_CompletionCertificate: 53,
  Proc_PSCApprovalDoc: 54,
  Proc_TACApprovalDoc: 55,
  Proc_SECApprovalDoc: 56,
  Proc_AAApprovalDoc: 57,
  Proc_Tend_TechnicalBidOpening: 58,
  Proc_Tend_TechnicalEvaluation: 59,
  Proc_Tend_FinancialBidOpening: 60,
  Proc_Tend_FinancialEvaluation: 61,
  Proc_Tend_AOC: 62,
  Proc_Closure_CompletionCertificate: 63,
  Proc_Closure_SocialAudit: 64,
  FD_District_UtilisationCertificate: 65,
  FD_Others_UtilisationCertificate: 66,
  NDMAGuidelines: 67,
} as const;

export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];
