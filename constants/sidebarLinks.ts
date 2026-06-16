// 1. Define the structural configuration for navigation links
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  FolderOpen,
  Brain,
  BarChart3,
  Shield,
  Database,
  Settings,
} from "lucide-react";

interface NavSubItem {
  title: string;
  to: string;
}

interface NavItem {
  title: string;
  to?: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean; // Used for exact path matching (e.g., Dashboard)
  stateKey?: string; // Used to track dropdown expand state
  children?: NavSubItem[];
}

export const sidebarLinks: NavItem[] = [
  {
    title: "Dashboard",
    to: "/",
    icon: LayoutDashboard,
    end: true,
  },
  {
    title: "Proposal For Mitigation",
    icon: FileText,
    stateKey: "proposal",
    children: [
      { title: "Proposal Initiation", to: "/proposal-initiation" },
      { title: "DDMA & Line Department", to: "/ddma-workflow" },
      { title: "PAC Evaluation", to: "/pac-evaluation" },
      { title: "TAC Technical Appraisal", to: "/tac-appraisal" },
      { title: "SEC Review", to: "/sec-review" },
      { title: "Administrative Approval", to: "/administrative-approval" },
      { title: "SDMA Approval", to: "/sdma-approval" },
      { title: "Tendering & Procurement", to: "/tendering" },
      { title: "Project Execution", to: "/project-execution" },
      { title: "Billing & Fund Release", to: "/billing" },
      { title: "Project Closure", to: "/project-closure" },
    ],
  },
  {
    title: "Procurement",
    icon: ShoppingCart,
    stateKey: "procurement",
    children: [
      { title: "Procurement Dashboard", to: "/procurement" },
      { title: "Procurement Register", to: "/procurement-register" },
      { title: "Create Procurement", to: "/procurement-create" },
    ],
  },
  {
    title: "Document Management",
    to: "/documents",
    icon: FolderOpen,
  },
  {
    title: "AI Document Intelligence",
    to: "/ai-intelligence",
    icon: Brain,
  },
  {
    title: "Reports & Analytics",
    to: "/reports",
    icon: BarChart3,
  },
  {
    title: "Audit Trail",
    to: "/audit-trail",
    icon: Shield,
  },
  {
    title: "Master Data",
    icon: Database,
    stateKey: "master",
    children: [
      { title: "District Master", to: "/master/district" },
      { title: "Taluka Master", to: "/master/taluka" },
      { title: "Department Master", to: "/master/department" },
      { title: "Officer Master", to: "/master/officer" },
      { title: "Budget Master", to: "/master/budget" },
      { title: "NDMA Guidelines", to: "/master/ndma-guidelines" },
      { title: "Vendor Master", to: "/master/vendor" },
    ],
  },
  {
    title: "Admin & Configuration",
    to: "/admin",
    icon: Settings,
  },
];
