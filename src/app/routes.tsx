import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { AuthGuard } from "./components/AuthGuard";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { ProposalInitiationWizard } from "./pages/ProposalInitiationWizard";
import { ProposalList } from "./pages/ProposalList";
import { ProposalDetail } from "./pages/ProposalDetail";
import { StageUpdate } from "./pages/StageUpdate";
import { DocumentUploadScreen } from "./pages/DocumentUploadScreen";
import { DocumentViewerScreen } from "./pages/DocumentViewerScreen";
import { HierarchyMaster } from "./pages/HierarchyMaster";
import { DDMAWorkflow } from "./pages/DDMAWorkflow";
import { PACEvaluation } from "./pages/PACEvaluation";
import { TACAppraisal } from "./pages/TACAppraisal";
import { SECReview } from "./pages/SECReview";
import { SDMAApproval } from "./pages/SDMAApproval";
import { Tendering } from "./pages/Tendering";
import { ProjectExecution } from "./pages/ProjectExecution";
import { Billing } from "./pages/Billing";
import { ProjectClosure } from "./pages/ProjectClosure";
import { ProcurementDashboard } from "./pages/procurement/ProcurementDashboard";
import { ProcurementRegister } from "./pages/procurement/ProcurementRegister";
import { ProcurementList } from "./pages/procurement/ProcurementList";
import { CreateProcurement } from "./pages/procurement/CreateProcurement";
import { NewProcurement } from "./pages/procurement/NewProcurement";
import { EditProcurement } from "./pages/procurement/EditProcurement";
import { ProcurementOpen } from "./pages/procurement/ProcurementOpen";
import { ProposalScrutinyCommittee } from "./pages/procurement/ProposalScrutinyCommittee";
import { TechnicalAppraisalCommittee } from "./pages/procurement/TechnicalAppraisalCommittee";
import { SECApprovalProcurement } from "./pages/procurement/SECApprovalProcurement";
import { ProcurementAdminApproval } from "./pages/procurement/ProcurementAdminApproval";
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
import { EquipmentCatalogue } from "./pages/master/EquipmentCatalogue";
import { AdminConfiguration } from "./pages/AdminConfiguration";
import { AdministrativeApproval } from "./pages/AdministrativeApproval";
import { TendersList } from "./pages/procurement/tendering/TendersList";
import { TenderDetails } from "./pages/procurement/tendering/TenderDetails";
import { NewTender } from "./pages/procurement/tendering/NewTender";
import { UnderDevelopment } from "./pages/UnderDevelopment";
import { RedLineBlueLineSurvey} from "./pages/non-structural/RedLineBlueLineSurvey";
import { NatureBasedSolutions } from "./pages/non-structural/NatureBasedSolutions";
import { Tenders} from "./pages/non-structural/Tenders";
import {ResearchAndGrants} from "./pages/non-structural/ResearchAndGrants";
import { FundsDistributedDistricts } from "./pages/funds-distributed/FundsDistributedDistricts";
import { FundsDistributedOther } from "./pages/funds-distributed/FundsDistributedOther";

// const RedLineBlueLine = () => <UnderDevelopment moduleName="Red Line Blue Line Survey" />;
// const NatureBasedSolutions = () => <UnderDevelopment moduleName="Nature Based Solutions" />;
const ResearchGrants = () => <UnderDevelopment moduleName="Research & Grants" />;
const TrainingModule = () => <UnderDevelopment moduleName="Training" />;
const ProcurementTraining = () => <UnderDevelopment moduleName="Procurement + Training" />;
const MediaBudget = () => <UnderDevelopment moduleName="Media Budget" />;

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

          // Proposal For Mitigation - Structural
          { path: "proposal-initiation", Component: ProposalInitiationWizard },
          { path: "proposal-list", Component: ProposalList },
          { path: "proposal-detail", Component: ProposalDetail },
          { path: "stage-update", Component: StageUpdate },
          { path: "document-upload", Component: DocumentUploadScreen },
          { path: "document-viewer", Component: DocumentViewerScreen },
          { path: "hierarchy-master", Component: HierarchyMaster },
          { path: "ddma-workflow", Component: DDMAWorkflow },
          { path: "pac-evaluation", Component: PACEvaluation },
          { path: "tac-appraisal", Component: TACAppraisal },
          { path: "sec-review", Component: SECReview },
          { path: "administrative-approval", Component: AdministrativeApproval },
          { path: "sdma-approval", Component: SDMAApproval },
          { path: "tendering", Component: Tendering },
          { path: "project-execution", Component: ProjectExecution },
          { path: "billing", Component: Billing },
          { path: "project-closure", Component: ProjectClosure },

          // Proposal For Mitigation - Non-Structural
          {
  path: "non-structural/red-line-blue-line",
  Component: RedLineBlueLineSurvey
},
          {
  path: "non-structural/nature-based",
  Component: NatureBasedSolutions
},

          {
  path: "non-structural/tenders",
  Component: Tenders
},


          // Proposal For Mitigation - Research & Grants
          { path: "non-structural/ResearchAndGrants", Component: ResearchAndGrants },

          // Proposals for Preparedness & Capacity Building - Procurements
          { path: "procurement", Component: ProcurementDashboard },
          { path: "procurement-register", Component: ProcurementRegister },
          { path: "procurement-list", Component: ProcurementList },
          { path: "procurement/create", Component: CreateProcurement },
          { path: "procurement/new", Component: NewProcurement },
          { path: "procurement/edit/:id", Component: EditProcurement },
          { path: "procurement/view/:id", Component: ProcurementOpen },
          { path: "procurement-psc", Component: ProposalScrutinyCommittee },
          { path: "procurement-tac", Component: TechnicalAppraisalCommittee },
          { path: "procurement-sec-approval", Component: SECApprovalProcurement },
          { path: "procurement-admin-approval", Component: ProcurementAdminApproval },
          { path: "procurement-tendering/tenders", Component: TendersList },
          { path: "procurement-tendering/tenders/:id", Component: TenderDetails },
          { path: "procurement-tendering/new", Component: NewTender },
          { path: "procurement/project-execution", Component: ProjectExecution },
          { path: "procurement/billing", Component: Billing },
          { path: "procurement/project-closure", Component: ProjectClosure },

          // Funds Distributed
          { path: "funds-distributed/districts", Component: FundsDistributedDistricts },
          { path: "funds-distributed/other-utilizations", Component: FundsDistributedOther },

          // Proposals for Preparedness & Capacity Building - Other sections
          { path: "prep/training", Component: TrainingModule },
          { path: "prep/procurement-training", Component: ProcurementTraining },
          { path: "prep/media-budget", Component: MediaBudget },

          // Other modules (unchanged)
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
          { path: "master/equipment", Component: EquipmentCatalogue },
          { path: "admin", Component: AdminConfiguration },
        ],
      },
    ],
  },
]);
