import { Clock, TrendingUp, CheckCircle2, IndianRupee } from "lucide-react";

// Financial Year options
export const financialYears = ["2023-24", "2024-25", "2025-26"];
export const districts = [
  "All Districts",
  "Mumbai",
  "Pune",
  "Nagpur",
  "Nashik",
  "Aurangabad",
  "Thane",
  "Kolhapur",
  "Ahmednagar",
];
export const disasterTypes = [
  "All Types",
  "Flood",
  "Drought",
  "Earthquake",
  "Cyclone",
  "Landslide",
];
export const departments = [
  "All Departments",
  "PWD",
  "WRD",
  "Health",
  "Forest",
  "Urban Development",
  "Rural Development",
  "PSU",
];

// Section 1 - Mitigation Proposals KPIs
export const totalProposalsData = {
  total: 1247,
  approved: 456,
  pending: 623,
  rejected: 168,
};

export const proposalsUnderReview = [
  {
    stage: "PAC",
    count: 156,
    pendingDays: 12,
    link: "/proposal-list?stage=PAC",
  },
  {
    stage: "TAC",
    count: 134,
    pendingDays: 8,
    link: "/proposal-list?stage=TAC",
  },
  {
    stage: "SEC",
    count: 98,
    pendingDays: 15,
    link: "/proposal-list?stage=SEC",
  },
  {
    stage: "SDMA",
    count: 88,
    pendingDays: 6,
    link: "/proposal-list?stage=SDMA",
  },
];

export const budgetAllocationData = [
  { name: "Allocated", value: 2450, color: "#0B1F4D" },
  { name: "Received", value: 1876, color: "#1E5AA8" },
  { name: "Utilized", value: 1234, color: "#059669" },
];

// Section 2 - Procurement KPIs
export const procurementKPIs = {
  totalItems: 3245,
  procurementValue: "₹1,876 Cr",
};

export const procurementTrend = [
  { year: "2020-21", value: 850 },
  { year: "2021-22", value: 1100 },
  { year: "2022-23", value: 1350 },
  { year: "2023-24", value: 1600 },
  { year: "2024-25", value: 1876 },
];

export const budgetByDepartment = [
  { name: "PWD", value: 520, color: "#0B1F4D" },
  { name: "WRD", value: 435, color: "#1E5AA8" },
  { name: "Health", value: 298, color: "#059669" },
  { name: "Forest", value: 245, color: "#FBAC1B" },
  { name: "Urban Dev", value: 198, color: "#D97706" },
  { name: "Rural Dev", value: 120, color: "#7C3AED" },
  { name: "PSU", value: 60, color: "#DC2626" },
];

export const lineDeptProposals = [
  { dept: "PWD", count: 320 },
  { dept: "Water Resources", count: 280 },
  { dept: "Health & FW", count: 195 },
  { dept: "Forest", count: 145 },
  { dept: "Urban Dev", count: 110 },
  { dept: "Rural Dev", count: 90 },
  { dept: "MJP", count: 65 },
  { dept: "PSU", count: 42 },
];

export const tenderingPipeline = [
  { stage: "Initiated", count: 145 },
  { stage: "Evaluation", count: 98 },
  { stage: "L1 Identified", count: 65 },
  { stage: "DMU Concurrence", count: 42 },
  { stage: "WO Issued", count: 312 },
];

export const projectMonitoringPipeline = [
  { stage: "Implementation", count: 234 },
  { stage: "Quality Monitoring", count: 156 },
  { stage: "Audit Compliance", count: 112 },
  { stage: "Billing", count: 89 },
  { stage: "Completion", count: 345 },
  { stage: "Asset Handover", count: 210 },
];

export const budgetData = [
  {
    title: "Budget Allocated",
    value: "₹2,450 Cr",
    icon: IndianRupee,
    color: "bg-chart-1",
  },
  {
    title: "Budget Received",
    value: "₹1,876 Cr",
    icon: CheckCircle2,
    color: "bg-chart-3",
  },
  {
    title: "Budget Utilized",
    value: "₹1,234 Cr",
    icon: TrendingUp,
    color: "bg-chart-2",
  },
  {
    title: "Remaining Budget",
    value: "₹642 Cr",
    icon: Clock,
    color: "bg-chart-4",
  },
];

export const districtBudgetData = [
  { district: "Mumbai", allocated: 450, utilized: 387 },
  { district: "Pune", allocated: 380, utilized: 298 },
  { district: "Nagpur", allocated: 290, utilized: 234 },
  { district: "Nashik", allocated: 245, utilized: 189 },
  { district: "Aurangabad", allocated: 220, utilized: 176 },
  { district: "Thane", allocated: 315, utilized: 267 },
];

export const proposalTrend = [
  { month: "Jan", created: 145, approved: 98, rejected: 23 },
  { month: "Feb", created: 167, approved: 112, rejected: 28 },
  { month: "Mar", created: 189, approved: 134, rejected: 31 },
  { month: "Apr", created: 178, approved: 124, rejected: 27 },
  { month: "May", created: 198, approved: 145, rejected: 34 },
  { month: "Jun", created: 212, approved: 167, rejected: 29 },
];

export const disasterTypeData = [
  { name: "Flood", value: 456, color: "#0B1F4D" },
  { name: "Drought", value: 345, color: "#1E5AA8" },
  { name: "Earthquake", value: 178, color: "#FBAC1B" },
  { name: "Cyclone", value: 145, color: "#059669" },
  { name: "Landslide", value: 123, color: "#D97706" },
];

export const notifications = [
  {
    type: "alert",
    message: "15 proposals pending PAC approval for >30 days",
    link: "/evaluation/pac",
  },
  {
    type: "warning",
    message: "Budget threshold 85% reached for Pune district",
    link: "/budget-rationalization",
  },
  {
    type: "info",
    message: "New NDMA guidelines published for flood mitigation",
    link: "/master/ndma-guidelines",
  },
  {
    type: "alert",
    message: "23 projects requiring TPQA monitoring upload",
    link: "/project-execution",
  },
  {
    type: "warning",
    message: "DMU concurrence pending for 12 billing requests",
    link: "/billing",
  },
];
