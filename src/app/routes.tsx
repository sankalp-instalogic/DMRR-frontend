import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { AuthGuard } from "./components/AuthGuard";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { ProposalInitiation } from "./pages/ProposalInitiation";
import { ProposalInitiationWizard } from "./pages/ProposalInitiationWizard";
import { ProposalList } from "./pages/ProposalList";
import { ProposalDetail } from "./pages/ProposalDetail";
import { StageUpdate } from "./pages/StageUpdate";
import { DocumentUploadScreen } from "./pages/DocumentUploadScreen";
import { DocumentViewerScreen } from "./pages/DocumentViewerScreen";
import { HierarchyMaster } from "./pages/HierarchyMaster";
import { DDMAWorkflow } from "./pages/DDMAWorkflow";
// import { PMUScrutiny } from "./pages/PMUScrutiny";
import { PACEvaluation } from "./pages/PACEvaluation";
import { BudgetRationalization } from "./pages/BudgetRationalization";
import { TACAppraisal } from "./pages/TACAppraisal";
import { SECReview } from "./pages/SECReview";
import { SDMAApproval } from "./pages/SDMAApproval";
import { Tendering } from "./pages/Tendering";
import { ProjectExecution } from "./pages/ProjectExecution";
import { Billing } from "./pages/Billing";
import { ProjectClosure } from "./pages/ProjectClosure";
import { ProcurementDashboard } from "./pages/procurement/ProcurementDashboard";
import { ProcurementRegister } from "./pages/procurement/ProcurementRegister";
import { CreateProcurement } from "./pages/procurement/CreateProcurement";
import { EditProcurement } from "./pages/procurement/EditProcurement";
import { ProcurementOpen } from "./pages/procurement/ProcurementOpen";
import { DocumentManagement } from "./pages/DocumentManagement";
import { AIDocumentIntelligence } from "./pages/AIDocumentIntelligence";
import { Reports } from "./pages/Reports";
import { AuditTrail } from "./pages/AuditTrail";
import { DistrictMaster } from "./pages/master/DistrictMaster";
import { TalukaMaster } from "./pages/master/TalukaMaster";
import { DepartmentMaster } from "./pages/master/DepartmentMaster";
import { OfficerMaster } from "./pages/master/OfficerMaster";
import { BudgetMaster } from "./pages/master/BudgetMaster";
import { NDMAGuidelines } from "./pages/master/NDMAGuidelines";
import { VendorMaster } from "./pages/master/VendorMaster";
// import { EquipmentCatalogue } from "./pages/master/EquipmentCatalogue";
import { AdminConfiguration } from "./pages/AdminConfiguration";

import { AdministrativeApproval } from "./pages/AdministrativeApproval";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: AuthGuard,
    children: [
      {
        path: "/",
        Component: Layout,
        children: [
          { index: true, Component: Dashboard },
          { path: "proposal-initiation", Component: ProposalInitiationWizard },
          { path: "proposal-list", Component: ProposalList },
          { path: "proposal-detail", Component: ProposalDetail },
          { path: "stage-update", Component: StageUpdate },
          { path: "document-upload", Component: DocumentUploadScreen },
          { path: "document-viewer", Component: DocumentViewerScreen },
          { path: "hierarchy-master", Component: HierarchyMaster },
      { path: "ddma-workflow", Component: DDMAWorkflow },
      // { path: "pmu-scrutiny", Component: PMUScrutiny },
      { path: "pac-evaluation", Component: PACEvaluation },
      // { path: "budget-rationalization", Component: BudgetRationalization },
      { path: "tac-appraisal", Component: TACAppraisal },
      { path: "sec-review", Component: SECReview },
      { path: "administrative-approval", Component: AdministrativeApproval },
      { path: "sdma-approval", Component: SDMAApproval },
      { path: "tendering", Component: Tendering },
      { path: "project-execution", Component: ProjectExecution },
      { path: "billing", Component: Billing },
      { path: "project-closure", Component: ProjectClosure },
      { path: "procurement", Component: ProcurementDashboard },
      { path: "procurement-register", Component: ProcurementRegister },
      { path: "procurement-create", Component: CreateProcurement },
      { path: "procurement-edit/:id", Component: EditProcurement },
      { path: "procurement-view/:id", Component: ProcurementOpen },
      { path: "documents", Component: DocumentManagement },
      { path: "ai-intelligence", Component: AIDocumentIntelligence },
      { path: "reports", Component: Reports },
      { path: "audit-trail", Component: AuditTrail },
      { path: "master/district", Component: DistrictMaster },
      { path: "master/taluka", Component: TalukaMaster },
      { path: "master/department", Component: DepartmentMaster },
      { path: "master/officer", Component: OfficerMaster },
      { path: "master/budget", Component: BudgetMaster },
      { path: "master/ndma-guidelines", Component: NDMAGuidelines },
      { path: "master/vendor", Component: VendorMaster },
      // { path: "master/equipment", Component: EquipmentCatalogue },
      { path: "admin", Component: AdminConfiguration },
        ],
      },
    ],
  },
]);
