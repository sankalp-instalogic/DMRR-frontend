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
  PACMoM: 3,
  TACMoM: 4,
  SECMoM: 5,
  AdministrativeApprovalOrder: 6,
  SDMAMoM: 7,
  WorkOrder: 8,
  TenderNotice: 9,
  AOC: 10,
  MonthlyProgressReport: 11,
  GeoTaggedPhoto: 12,
  TPQAReport: 13,
  Invoice: 14,
  RTGSAdvice: 15,
  PaymentOrder: 16,
  SanctionOrder: 17,
  CompletionCertificate: 18,
  CompletionReport: 19,
  ProcurementDemand: 20,
  ComparativeStatement: 21,
  PurchaseOrder: 22,
  DeliveryChallan: 23,
  SurveyReport: 24,
  GRCopy: 25,
  GrantSanctionLetter: 26,
  UtilizationCertificate: 27,
  FundReleaseOrder: 28,
  NDMAGuidelines: 29,
  TechnicalBidOpening: 30,
  TechnicalEvaluation: 31,
  FinancialBidOpening: 32,
  FinancialEvaluation: 33,
  PCSApprovalLetter: 34,
  TACApprovalLetter: 35,
  SECApprovalLetter: 36,
  AdministratiionApprovalLetter: 37,
  SocialAuditLetter: 38,
  CommitteAttendanceSheet: 39,
  DMRRLetter: 40,
  BidevaluationReport: 41,
  SiteInspectionReport: 42,
  CheckListDoc1: 43,
  CheckListDoc2: 44,
  CheckListDoc3: 45,
  CheckListDoc4: 46,
  CheckListDoc5: 47,
  CheckListDoc6: 48,
  CheckListDoc7: 49,
  CheckListDoc8: 50,
  CheckListDoc9: 51,
  CheckListDoc10: 52,
  CheckListDoc11: 53,
  CheckListDoc12: 54,
  CheckListDoc13: 55,
} as const;

export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];
