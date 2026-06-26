import {
  BarChart3,
  Brain,
  Database,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Settings,
  Shield,
  ShoppingCart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  to?: string;
  icon?: LucideIcon;
  end?: boolean;
  stateKey?: string;
  children?: NavItem[];
}

export const sidebarLinks: NavItem[] = [
  {
    title: "Dashboard",
    to: "/",
    icon: LayoutDashboard,
    end: true,
  },

  {
    title: "Proposals for Mitigation",
    icon: FileText,
    stateKey: "proposal",
    children: [
      {
        title: "A. Structural (85%)",
        stateKey: "structural",
        children: [
          { title: "Proposal Initiation", to: "/proposal-initiation" },
          { title: "Proposal List", to: "/proposal-list" },
          { title: "DDMA & Line Department", to: "/ddma-workflow" },
          { title: "PAC Evaluation", to: "/evaluation/pac" },
          { title: "TAC Technical Appraisal", to: "/evaluation/tac" },
          { title: "SEC Review", to: "/evaluation/sec" },
          { title: "Administrative Approval", to: "/evaluation/aa" },
          { title: "SDMA Approval", to: "/evaluation/sdma" },
          { title: "Tendering", to: "/tendering" },
          { title: "Project Execution", to: "/project-execution" },
          { title: "Billing & Fund Release", to: "/billing" },
          { title: "Project Closure", to: "/project-closure" },
        ],
      },

      {
        title: "B. Non-Structural (10%)",
        stateKey: "nonStructural",
        children: [
          {
            title: "Red Line Blue Line Survey",
            to: "/non-structural/red-line-blue-line",
          },
          {
            title: "Nature Based Solutions",
            to: "/non-structural/nature-based",
          },
          {
            title: "Data Management & Tendering",
            to: "/non-structural/tenders",
          },
        ],
      },

      {
        title: "C. Research & Grants (5%)",
        stateKey: "research",
        children: [
          {
            title: "Research & Grants",
            to: "/non-structural/ResearchAndGrants",
          },
        ],
      },
    ],
  },

  {
    title: "Proposals for Preparedness & Capacity Building",
    icon: ShoppingCart,
    stateKey: "preparedness",
    children: [
      {
        title: "A. Procurements",
        stateKey: "procurements",
        children: [
          { title: "Procurement Dashboard", to: "/procurement" },
          { title: "Procurement List", to: "/procurement-list" },
          // { title: "Procurement Register", to: "/procurement-register" },
          { title: "Proposal Scrutiny Committee", to: "/procurement-psc" },
          { title: "Technical Appraisal Committee", to: "/procurement-tac" },
          { title: "SEC Approval", to: "/procurement-sec-approval" },
          {
            title: "Administrative Approval",
            to: "/procurement-admin-approval",
          },
          {
            title: "Tendering",
            to: "/procurement-tendering/tenders",
          },
          // {
          //   title: "Project Execution",
          //   to: "/procurement/project-execution",
          // },
          // { title: "Billing", to: "/procurement/billing" },
          {
            title: "procurement Closure",
            to: "/procurement-closure",
          },
        ],
      },

      {
        title: "B. Funds Distributed",
        stateKey: "fundsDistributed",
        children: [
          {
            title: "To Districts",
            to: "/funds-distributed/districts",
          },
          {
            title: "To Other Utilizations",
            to: "/funds-distributed/other-utilizations",
          },
        ],
      },
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
      { title: "Equipment Catalogue", to: "/master/equipment" },
    ],
  },

  {
    title: "Admin & Configuration",
    to: "/admin",
    icon: Settings,
  },
];
