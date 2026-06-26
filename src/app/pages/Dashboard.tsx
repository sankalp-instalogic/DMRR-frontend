import { useState } from "react";
import { Link, useNavigate } from "react-router"; // note: might need to be 'react-router-dom' depending on your setup
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { Select } from "antd"; // Imported Ant Design Select
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
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

// Financial Year options formatted for Antd Select
const financialYearOptions = [
  { value: "", label: "All financial Years" },
  { value: "2023-24", label: "2023-24" },
  { value: "2024-25", label: "2024-25" },
  { value: "2025-26", label: "2025-26" },
];

// --- Fallback Chart & Notification Data ---
const procurementTrend = [
  { year: "2020-21", value: 850 },
  { year: "2021-22", value: 1100 },
  { year: "2022-23", value: 1350 },
  { year: "2023-24", value: 1600 },
  { year: "2024-25", value: 1876 },
];

const budgetByDepartment = [
  { name: "PWD", value: 520, color: "#0B1F4D" },
  { name: "WRD", value: 435, color: "#1E5AA8" },
  { name: "Health", value: 298, color: "#059669" },
  { name: "Forest", value: 245, color: "#FBAC1B" },
  { name: "Urban Dev", value: 198, color: "#D97706" },
  { name: "Rural Dev", value: 120, color: "#7C3AED" },
  { name: "PSU", value: 60, color: "#DC2626" },
];

const lineDeptProposals = [
  { dept: "PWD", count: 320 },
  { dept: "Water Resources", count: 280 },
  { dept: "Health & FW", count: 195 },
  { dept: "Forest", count: 145 },
  { dept: "Urban Dev", count: 110 },
  { dept: "Rural Dev", count: 90 },
  { dept: "MJP", count: 65 },
  { dept: "PSU", count: 42 },
];

const districtBudgetData = [
  { district: "Mumbai", allocated: 450, utilized: 387 },
  { district: "Pune", allocated: 380, utilized: 298 },
  { district: "Nagpur", allocated: 290, utilized: 234 },
  { district: "Nashik", allocated: 245, utilized: 189 },
  { district: "Aurangabad", allocated: 220, utilized: 176 },
  { district: "Thane", allocated: 315, utilized: 267 },
];

const notifications = [
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
];

export function Dashboard() {
  const navigate = useNavigate();
  const [selectedFY, setSelectedFY] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

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

  // 2. Fetch Dashboard Summary (Taking query parameters into account)
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-summary", selectedFY, selectedDistrict],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Dashboard/summary", {
        params: {
          financialYear: selectedFY || undefined,
          districtId: selectedDistrict || undefined,
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
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-125 text-[#0B1F4D] font-medium">
        Loading Dashboard Metrics...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-125 text-red-500 font-medium">
        Failed to load dashboard data. Please try again later.
      </div>
    );
  }

  // --- Transform API Data for UI ---
  const apiProposals = data.proposals || {
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
  const apiBudget = data.budget || [];
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[30px] font-bold text-[#0B1F4D]">
            Operator Dashboard
          </h1>
          <p className="text-[14px] font-medium text-gray-500 mt-1">
            Proposal Monitoring, Procurement & Budget Overview
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/proposal-initiation"
            className="bg-[#0B1F4D] text-white px-4 h-10 flex items-center justify-center rounded-[10px] hover:bg-[#0B1F4D]/90 transition-all text-sm font-medium"
          >
            New Proposal
          </Link>
          <Link
            to="/proposal-list"
            className="bg-white text-[#0B1F4D] border border-[#0B1F4D] px-4 h-10 flex items-center justify-center rounded-[10px] hover:bg-gray-50 transition-all text-sm font-medium"
          >
            Open Proposal
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="size-5 text-[#0B1F4D]" />
          <h3 className="font-semibold text-[16px] text-[#0B1F4D]">
            Dashboard Filters
          </h3>
        </div>
        <div className="flex flex-row gap-4">
          <div className="flex-1">
            <label className="text-[14px] font-medium text-gray-500 mb-1 block">
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
            <label className="text-[14px] font-medium text-gray-500 mb-1 block">
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
        </div>
      </div>

      {/* SECTION 1 - MITIGATION PROPOSALS */}
      <div className="mb-6">
        <h2 className="text-[20px] font-semibold mb-6 text-[#0B1F4D]">
          Section 1 — Mitigation Proposals
        </h2>

        {/* A. Total Proposals */}
        <div className="mb-6">
          <div
            onClick={() => handleKPIDrillDown("all")}
            className="bg-linear-to-br from-[#0B1F4D] to-[#1E5AA8] text-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer mb-6"
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
              <FileText className="size-8 opacity-80 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              onClick={() => handleKPIDrillDown("approved")}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-green-500"
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="size-5 text-green-600" />
                <ArrowRight className="size-4 text-gray-400 group-hover:text-green-600 transition-colors" />
              </div>
              <div className="text-[24px] font-bold text-green-600">
                {apiProposals.approved.toLocaleString()}
              </div>
              <div className="text-[14px] font-medium text-gray-500 mt-1">
                Approved Proposals
              </div>
            </div>
            <div
              onClick={() => handleKPIDrillDown("rejected")}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-red-500"
            >
              <div className="flex items-center justify-between mb-2">
                <XCircle className="size-5 text-red-600" />
                <ArrowRight className="size-4 text-gray-400 group-hover:text-red-600 transition-colors" />
              </div>
              <div className="text-[24px] font-bold text-red-600">
                {apiProposals.rejected.toLocaleString()}
              </div>
              <div className="text-[14px] font-medium text-gray-500 mt-1">
                Rejected Proposals
              </div>
            </div>
          </div>
        </div>

        {/* B. Proposals Under Review */}
        <div className="mb-6">
          <div
            onClick={() => handleKPIDrillDown("pending")}
            className=" bg-linear-to-br from-[#EA580C] to-[#F59E0B] text-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer mb-6"
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

              <Clock className="size-8 opacity-80 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {proposalsUnderReview.map((item, idx) => (
              <div
                key={idx}
                onClick={() => navigate(item.link)}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#0B1F4D] hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[16px] text-[#0B1F4D]">
                    {item.stage}
                  </span>
                  <ArrowRight className="size-4 text-gray-400" />
                </div>
                <div className="text-[24px] font-bold mb-1 text-gray-900">
                  {item.count as number}
                </div>
                <div className="text-[14px] font-medium text-gray-500 mt-1">
                  Pending {item.pendingDays} days avg
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* C. Budget Section */}
        <h3 className="text-[20px] font-semibold mb-6 text-[#0B1F4D]">
          Budget Overview - FY {selectedFY}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="text-[16px] font-semibold text-gray-500 mb-2">
              Budget Allocated
            </div>
            <div className="text-[32px] font-bold text-[#0B1F4D]">
              ₹{totalAllocated.toLocaleString()}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="text-[16px] font-semibold text-gray-500 mb-2">
              Budget Received
            </div>
            <div className="text-[32px] font-bold text-[#1E5AA8]">
              ₹{totalReceived.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="text-center mb-6">
            <div className="text-[16px] font-semibold text-gray-500">
              Budget Utilized
            </div>
            <div className="text-[32px] font-bold mt-2 text-gray-900">
              ₹{totalUtilized.toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="bg-emerald-700 rounded-2xl p-5 shadow-sm mb-6">
                <div className="text-[16px] font-semibold text-white/90">
                  Mitigation
                </div>
                <div className="text-[24px] font-bold text-white mt-1">
                  ₹{totalUtilized.toLocaleString()}
                </div>
              </div>

              <div className="space-y-4 ml-8 border-l-4 border-emerald-900 pl-8">
                <div className="bg-emerald-50 rounded-2xl p-5 shadow-sm border border-emerald-100">
                  <div className="text-[14px] font-medium text-emerald-800">
                    Structural Mitigation
                  </div>
                  <div className="text-[20px] font-bold text-emerald-900 mt-1">
                    ₹{getSegmentUtilized("Structural").toLocaleString()}
                  </div>
                </div>

                <div className="bg-lime-50 rounded-2xl p-5 shadow-sm border border-lime-100">
                  <div className="text-[14px] font-medium text-lime-800">
                    Non-Structural Mitigation
                  </div>
                  <div className="text-[20px] font-bold text-lime-900 mt-1">
                    ₹{getSegmentUtilized("Non-Structural").toLocaleString()}
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-2xl p-5 shadow-sm border border-yellow-100">
                  <div className="text-[14px] font-medium text-yellow-800">
                    Research & Grants
                  </div>
                  <div className="text-[20px] font-bold text-yellow-900 mt-1">
                    ₹{getSegmentUtilized("Research").toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-[#0B1F4D] rounded-2xl text-white p-5 shadow-sm mb-6">
                <div className="text-[16px] font-semibold text-white/90">
                  Preparedness & Capacity Building
                </div>
                <div className="text-[24px] font-bold mt-1">
                  ₹{getSegmentUtilized("Preparedness").toLocaleString()}
                </div>
              </div>

              <div className="space-y-4 ml-8 border-l-4 border-[#0B1F4D] pl-8">
                <div className="bg-sky-50 rounded-2xl p-5 shadow-sm border border-sky-100">
                  <div className="text-[14px] font-medium text-sky-800">
                    Procurements
                  </div>
                  <div className="text-[20px] font-bold text-sky-900 mt-1">
                    ₹{getSegmentUtilized("Procurement").toLocaleString()}
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-2xl p-5 shadow-sm border border-indigo-100">
                  <div className="text-[14px] font-medium text-indigo-800">
                    Funds to Districts
                  </div>
                  <div className="text-[20px] font-bold text-indigo-900 mt-1">
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
        <h2 className="text-[20px] font-semibold mb-6 text-[#0B1F4D]">
          Section 2 — Preparedness & Capacity Building
        </h2>

        {/* Procurement KPIs - Integrated Live Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Package className="size-6 text-[#0B1F4D]" />
              <div className="text-[14px] font-medium text-gray-500">
                Total Procured Items
              </div>
            </div>
            <div className="text-[32px] font-bold text-gray-900">
              {data.procuredItems?.toLocaleString() || 0}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <IndianRupee className="size-6 text-[#059669]" />
              <div className="text-[14px] font-medium text-gray-500">
                Total Procurement Value
              </div>
            </div>
            <div className="text-[32px] font-bold text-gray-900">
              ₹{data.procurementValue?.toLocaleString() || 0}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h3 className="mb-6 text-[#0B1F4D] font-semibold text-[16px]">
              Year-wise Procurement Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={procurementTrend}
                margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px" }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0B1F4D"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#0B1F4D" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h3 className="mb-6 text-[#0B1F4D] font-semibold text-[16px]">
              Budget Spent by Beneficiary Department
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={budgetByDepartment}
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
                  {budgetByDepartment.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => `₹${value} Cr`}
                  contentStyle={{ borderRadius: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h3 className="mb-6 text-[#0B1F4D] font-semibold text-[16px]">
              Line Department Proposals
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={lineDeptProposals}
                margin={{ top: 20, right: 20, left: 10, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="dept"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, textAnchor: "end" }}
                  height={70}
                />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px" }} />
                <Bar
                  dataKey="count"
                  fill="#FBAC1B"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h3 className="mb-6 text-[#0B1F4D] font-semibold text-[16px]">
              District-wise Budget Utilization
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={districtBudgetData}
                margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="district"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px" }} />
                <Legend wrapperStyle={{ paddingTop: 20 }} />
                <Bar dataKey="allocated" fill="#0B1F4D" radius={[4, 4, 0, 0]} />
                <Bar dataKey="utilized" fill="#FBAC1B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Notifications Panel */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6">
          <h3 className="mb-6 text-[20px] font-semibold text-[#0B1F4D]">
            Recent Alerts & Notifications
          </h3>

          <div className="space-y-3">
            {notifications.map((notif, index) => (
              <Link
                key={index}
                to={notif.link}
                className="flex items-start gap-3 p-3 rounded-[10px] hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
              >
                <AlertCircle
                  className={`size-5 mt-0.5 ${
                    notif.type === "alert"
                      ? "text-red-600"
                      : notif.type === "warning"
                        ? "text-[#F59E0B]"
                        : "text-[#FBAC1B]"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-gray-900">
                    {notif.message}
                  </p>
                  <p className="text-[12px] text-gray-500 mt-1">
                    View details →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
