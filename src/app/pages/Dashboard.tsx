import { useState } from "react";
import { Link, useNavigate } from "react-router";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { Select } from "antd";
import { buttonVariants } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";
import { formatCurrencyLakhs } from "../../utils/currencyFormatter";
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  IndianRupee,
  ArrowRight,
  Package,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "../components/ui/utils";

// Financial Year options formatted for Antd Select
const financialYearOptions = [
  { value: "", label: "All financial Years" },
  { value: "2023-24", label: "2023-24" },
  { value: "2024-25", label: "2024-25" },
  { value: "2025-26", label: "2025-26" },
];

// Resolve a CSS custom property (defined in theme.css) to its concrete color.
// Lets recharts — which needs real color strings, not `var(...)` — follow the theme.
const themeColor = (token: string) =>
  typeof document !== "undefined"
    ? getComputedStyle(document.documentElement).getPropertyValue(token).trim()
    : "";

// Chart series palette, sourced from theme tokens (status colors + categorical hues).
const CHART_COLOR_TOKENS = [
  "--primary",
  "--secondary",
  "--success",
  "--category-3",
  "--warning",
  "--category-6",
  "--destructive",
];

export function Dashboard() {
  const navigate = useNavigate();
  const [selectedFY, setSelectedFY] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedLineDepartment, setSelectedLineDepartment] = useState("");

  const axiosPrivate = useAxiosPrivate();

  // 1. Fetch Districts for Dropdown
  const { data: districtsData, isLoading: isDistrictsLoading } = useQuery({
    queryKey: ["districts"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/districts");
      return response.data?.items || [];
    },
  });

  // Map district API data to Antd Select options
  const districtOptions = [
    { value: "", label: "All Districts" },
    ...((Array.isArray(districtsData) &&
      districtsData?.map((dist: any) => ({
        value: dist.id, // Using 'id' as the value to send to the backend
        label: dist.name, // Using 'name' for the display label
      }))) ||
      []),
  ];

  // 1b. Fetch Line Departments for Dropdown
  const { data: lineDepartmentsData, isLoading: isLineDepartmentsLoading } =
    useQuery({
      queryKey: ["lineDepartments"],
      queryFn: async () => {
        const response = await axiosPrivate.get(
          "/api/v1/masters/line-departments",
        );
        return response.data?.items || [];
      },
    });

  // Map line department API data to Antd Select options
  const lineDepartmentOptions = [
    { value: "", label: "All Departments" },
    ...((Array.isArray(lineDepartmentsData) &&
      lineDepartmentsData?.map((dept: any) => ({
        value: dept.id, // Using 'id' as the value to send to the backend
        label: dept.name, // Using 'name' for the display label
      }))) ||
      []),
  ];

  // 2. Fetch Dashboard Summary (Taking query parameters into account)
  // 2. Fetch Dashboard Summary
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: [
      "dashboard-summary",
      selectedFY,
      selectedDistrict,
      selectedLineDepartment,
    ],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Dashboard/summary", {
        params: {
          financialYear: selectedFY || undefined,
          districtId: selectedDistrict || undefined,
          lineDepartmentId: selectedLineDepartment || undefined,
        },
      });
      return response.data;
    },
  });

  // 3. Fetch Dashboard Charts
  const {
    data: chartsData,
    isLoading: isChartsLoading,
    error: chartsError,
  } = useQuery({
    queryKey: [
      "dashboard-charts",
      selectedFY,
      selectedDistrict,
      selectedLineDepartment,
    ],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Dashboard/charts", {
        params: {
          financialYear: selectedFY || undefined,
          districtId: selectedDistrict || undefined,
          lineDepartmentId: selectedLineDepartment || undefined,
        },
      });
      return response.data;
    },
  });

  const handleKPIDrillDown = (filter: string) => {
    navigate(
      `/proposal-list?filter=${filter}&fy=${selectedFY}&district=${selectedDistrict}`,
    );
  };

  // --- Handle Loading & Error States ---
  if (isSummaryLoading || isChartsLoading) {
    return <Spinner fullPage label="Loading Dashboard Metrics..." />;
  }

  if (summaryError || !summaryData || chartsError) {
    return (
      <div className="flex items-center justify-center h-125 text-destructive font-medium">
        Failed to load dashboard data. Please try again later.
      </div>
    );
  }

  // --- Transform API Data for UI ---
  const apiProposals = summaryData.proposals || {
    total: 0,
    approved: 0,
    rejected: 0,
    byStage: {},
  };
  const totalPending =
    apiProposals.total - apiProposals.approved - apiProposals.rejected;

  const proposalsUnderReview = Object.entries(apiProposals.byStage || {}).map(
    ([stage, count]) => ({
      stage,
      count,
      pendingDays: "--",
      link: `/proposal-list?stage=${stage}`,
    }),
  );

  // Budget Calculations
  const apiBudget = summaryData.budget || [];
  const totalAllocated = apiBudget.reduce(
    (sum: number, item: any) => sum + (item.allocated || 0),
    0,
  );
  const totalReceived = apiBudget.reduce(
    (sum: number, item: any) => sum + (item.received || 0),
    0,
  );
  const totalUtilized = apiBudget.reduce(
    (sum: number, item: any) => sum + (item.utilized || 0),
    0,
  );

  const getSegmentUtilized = (segmentName: string) => {
    const segment = apiBudget.find((b: any) => b.segment === segmentName);
    return segment ? segment.utilized : 0;
  };
  const chartColors = CHART_COLOR_TOKENS.map(themeColor);
  const primaryColor = themeColor("--primary");
  const categoryGold = themeColor("--category-3");
  const budgetByDepartmentChartData = (chartsData.budgetByDepartment || []).map(
    (item: any, index: number) => ({
      name: item.label,
      value: item.value,
      color: chartColors[index % chartColors.length],
    }),
  );
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[30px] font-bold text-primary">
            Operator Dashboard
          </h1>
          <p className="text-[14px] font-medium text-muted-foreground mt-1">
            Proposal Monitoring, Procurement & Budget Overview
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/proposal-initiation"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "cursor-pointer",
            )}
          >
            New Proposal
          </Link>
          <Link
            to="/proposal-list"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "cursor-pointer",
            )}
          >
            Open Proposal
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="size-5 text-primary" />
          <h3 className="font-semibold text-[16px] text-primary">
            Dashboard Filters
          </h3>
        </div>
        <div className="flex flex-row gap-4">
          <div className="flex-1">
            <label className="text-[14px] font-medium text-muted-foreground mb-1 block">
              Financial Year
            </label>
            <Select
              value={selectedFY}
              onChange={(value) => setSelectedFY(value)}
              className="w-full h-10"
              options={financialYearOptions}
            />
          </div>
          <div className="flex-1">
            <label className="text-[14px] font-medium text-muted-foreground mb-1 block">
              District
            </label>
            <Select
              value={selectedDistrict}
              onChange={(value) => setSelectedDistrict(value)}
              className="w-full h-10"
              options={districtOptions}
              loading={isDistrictsLoading}
              disabled={isDistrictsLoading}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </div>
          <div className="flex-1">
            <label className="text-[14px] font-medium text-muted-foreground mb-1 block">
              Line Department
            </label>
            <Select
              value={selectedLineDepartment}
              onChange={(value) => setSelectedLineDepartment(value)}
              className="w-full h-10"
              options={lineDepartmentOptions}
              loading={isLineDepartmentsLoading}
              disabled={isLineDepartmentsLoading}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </div>
        </div>
      </div>

      {/* SECTION 1 - MITIGATION PROPOSALS */}
      <div className="mb-6">
        <h2 className="text-[20px] font-semibold mb-6 text-primary">
          Section 1 — Mitigation Proposals
        </h2>

        {/* A. Total Proposals */}
        <div className="mb-6">
          <div
            onClick={() => handleKPIDrillDown("all")}
            className="bg-linear-to-br from-primary to-secondary text-primary-foreground rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer mb-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[16px] font-semibold opacity-90 mb-1">
                  Total Proposals
                </div>
                <div className="text-[32px] font-bold">
                  {apiProposals.total.toLocaleString()}
                </div>
              </div>
              <FileText className="size-8 opacity-80 text-primary-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              onClick={() => handleKPIDrillDown("approved")}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-success"
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="size-5 text-success" />
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-success transition-colors" />
              </div>
              <div className="text-[24px] font-bold text-success">
                {apiProposals.approved.toLocaleString()}
              </div>
              <div className="text-[14px] font-medium text-muted-foreground mt-1">
                Approved Proposals
              </div>
            </div>
            <div
              onClick={() => handleKPIDrillDown("rejected")}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-destructive"
            >
              <div className="flex items-center justify-between mb-2">
                <XCircle className="size-5 text-destructive" />
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-destructive transition-colors" />
              </div>
              <div className="text-[24px] font-bold text-destructive">
                {apiProposals.rejected.toLocaleString()}
              </div>
              <div className="text-[14px] font-medium text-muted-foreground mt-1">
                Rejected Proposals
              </div>
            </div>
          </div>
        </div>

        {/* B. Proposals Under Review */}
        <div className="mb-6">
          <div
            onClick={() => handleKPIDrillDown("pending")}
            className=" bg-linear-to-br from-accent to-warning text-primary-foreground rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer mb-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[16px] font-semibold opacity-90 mb-1">
                  Proposals Under Review
                </div>

                <div className="text-[32px] font-bold">
                  {totalPending.toLocaleString()}
                </div>
              </div>

              <Clock className="size-8 opacity-80 text-primary-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {proposalsUnderReview.map((item, idx) => (
              <div
                key={idx}
                onClick={() => navigate(item.link)}
                className="bg-card border border-border rounded-2xl p-5 hover:border-primary hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[16px] text-primary">
                    {item.stage}
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
                <div className="text-[24px] font-bold mb-1 text-foreground">
                  {item.count as number}
                </div>
                <div className="text-[14px] font-medium text-muted-foreground mt-1">
                  Pending {item.pendingDays} days avg
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* C. Budget Section */}
        <h3 className="text-[20px] font-semibold mb-6 text-primary">
          Budget Overview - FY {selectedFY}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="text-[16px] font-semibold text-muted-foreground mb-2">
              Budget Allocated
            </div>
            <div className="text-[32px] font-bold text-primary">
              ₹{totalAllocated.toLocaleString()}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="text-[16px] font-semibold text-muted-foreground mb-2">
              Budget Received
            </div>
            <div className="text-[32px] font-bold text-secondary">
              ₹{totalReceived.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="text-center mb-6">
            <div className="text-[16px] font-semibold text-muted-foreground">
              Budget Utilized
            </div>
            <div className="text-[32px] font-bold mt-2 text-foreground">
              ₹{totalUtilized.toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="bg-category-1 rounded-2xl p-5 shadow-sm mb-6">
                <div className="text-[16px] font-semibold text-primary-foreground/90">
                  Mitigation
                </div>
                <div className="text-[24px] font-bold text-primary-foreground mt-1">
                  ₹{totalUtilized.toLocaleString()}
                </div>
              </div>

              <div className="space-y-4 ml-8 border-l-4 border-category-1 pl-8">
                <div className="bg-category-1/10 rounded-2xl p-5 shadow-sm border border-category-1/20">
                  <div className="text-[14px] font-medium text-category-1">
                    Structural Mitigation
                  </div>
                  <div className="text-[20px] font-bold text-category-1 mt-1">
                    ₹{getSegmentUtilized("Structural").toLocaleString()}
                  </div>
                </div>

                <div className="bg-category-2/10 rounded-2xl p-5 shadow-sm border border-category-2/20">
                  <div className="text-[14px] font-medium text-category-2">
                    Non-Structural Mitigation
                  </div>
                  <div className="text-[20px] font-bold text-category-2 mt-1">
                    ₹{getSegmentUtilized("Non-Structural").toLocaleString()}
                  </div>
                </div>

                <div className="bg-category-3/10 rounded-2xl p-5 shadow-sm border border-category-3/20">
                  <div className="text-[14px] font-medium text-category-3">
                    Research & Grants
                  </div>
                  <div className="text-[20px] font-bold text-category-3 mt-1">
                    ₹{getSegmentUtilized("Research").toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-primary rounded-2xl text-primary-foreground p-5 shadow-sm mb-6">
                <div className="text-[16px] font-semibold text-primary-foreground/90">
                  Preparedness & Capacity Building
                </div>
                <div className="text-[24px] font-bold mt-1">
                  ₹{getSegmentUtilized("Preparedness").toLocaleString()}
                </div>
              </div>

              <div className="space-y-4 ml-8 border-l-4 border-primary pl-8">
                <div className="bg-category-4/10 rounded-2xl p-5 shadow-sm border border-category-4/20">
                  <div className="text-[14px] font-medium text-category-4">
                    Procurements
                  </div>
                  <div className="text-[20px] font-bold text-category-4 mt-1">
                    ₹{getSegmentUtilized("Procurement").toLocaleString()}
                  </div>
                </div>

                <div className="bg-category-5/10 rounded-2xl p-5 shadow-sm border border-category-5/20">
                  <div className="text-[14px] font-medium text-category-5">
                    Funds to Districts
                  </div>
                  <div className="text-[20px] font-bold text-category-5 mt-1">
                    ₹{getSegmentUtilized("Districts").toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 - PROCUREMENT */}
      <div className="mt-6">
        <h2 className="text-[20px] font-semibold mb-6 text-primary">
          Section 2 — Preparedness & Capacity Building
        </h2>

        {/* Procurement KPIs - Integrated Live Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Package className="size-6 text-primary" />
              <div className="text-[14px] font-medium text-muted-foreground">
                Total Procured Items
              </div>
            </div>
            <div className="text-[32px] font-bold text-foreground">
              {summaryData.procuredItems?.toLocaleString() || 0}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <IndianRupee className="size-6 text-success" />
              <div className="text-[14px] font-medium text-muted-foreground">
                Total Procurement Value
              </div>
            </div>
            <div className="text-[32px] font-bold text-foreground">
              {formatCurrencyLakhs(summaryData.procurementValue) || 0}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Trend Chart */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="mb-6 text-primary font-semibold text-[16px]">
              Year-wise Procurement Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={chartsData?.procurementTrend || []}
                margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px" }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={primaryColor}
                  strokeWidth={3}
                  dot={{ r: 5, fill: primaryColor }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="mb-6 text-primary font-semibold text-[16px]">
              Budget Spent by Beneficiary Department
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={budgetByDepartmentChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  nameKey="name"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {budgetByDepartmentChartData.map((entry: any) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => `₹${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart 1 - Line Departments */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="mb-6 text-primary font-semibold text-[16px]">
              Line Department Proposals
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={chartsData?.proposalsPerLineDepartment || []}
                margin={{ top: 20, right: 20, left: 10, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, textAnchor: "end" }}
                  height={70}
                />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px" }} />
                <Bar
                  dataKey="value"
                  name="Proposals"
                  fill={categoryGold}
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart 2 - District Utilization */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="mb-6 text-primary font-semibold text-[16px]">
              District-wise Budget Utilization
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={chartsData?.districtBudgetUtilization || []}
                margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px" }} />
                <Legend wrapperStyle={{ paddingTop: 20 }} />
                <Bar
                  dataKey="value"
                  name="Allocated"
                  fill={primaryColor}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="value2"
                  name="Utilized"
                  fill={categoryGold}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
