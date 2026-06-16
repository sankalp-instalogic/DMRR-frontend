import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  AlertCircle,
  IndianRupee,
  MapPin,
  Calendar,
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
import {
  budgetAllocationData,
  budgetByDepartment,
  budgetData,
  departments,
  disasterTypeData,
  disasterTypes,
  districtBudgetData,
  districts,
  financialYears,
  lineDeptProposals,
  notifications,
  procurementKPIs,
  procurementTrend,
  projectMonitoringPipeline,
  proposalTrend,
  proposalsUnderReview,
  tenderingPipeline,
  totalProposalsData,
} from "../../../constants/dummyDashboardData";

export function Dashboard() {
  const navigate = useNavigate();
  const [selectedFY, setSelectedFY] = useState("2025-26");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [selectedDisasterType, setSelectedDisasterType] = useState("All Types");
  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");

  const handleKPIDrillDown = (filter: string) => {
    navigate(
      `/proposal-list?filter=${filter}&fy=${selectedFY}&district=${selectedDistrict}&type=${selectedDisasterType}&dept=${selectedDepartment}`,
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Operator Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Proposal Monitoring, Procurement & Budget Overview
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/proposal-initiation"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            New Proposal
          </Link>
          <Link
            to="/proposal-list"
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            Open Proposal
          </Link>
          {/* <Link to="/reports" className="border border-border px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium">
            Reports
          </Link>
          <Link to="/procurement" className="border border-border px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium">
            Procurement Module
          </Link> */}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="size-4 text-primary" />
          <h3 className="font-semibold text-sm">Dashboard Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Financial Year
            </label>
            <select
              value={selectedFY}
              onChange={(e) => setSelectedFY(e.target.value)}
              className="w-full cursor-pointer px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {financialYears.map((fy) => (
                <option key={fy} value={fy}>
                  {fy}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full cursor-pointer px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {districts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Disaster Type
            </label>
            <select
              value={selectedDisasterType}
              onChange={(e) => setSelectedDisasterType(e.target.value)}
              className="w-full cursor-pointer px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {disasterTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full cursor-pointer px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 1 - MITIGATION PROPOSALS */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-primary">
          Section 1 — Mitigation Proposals
        </h2>

        {/* A. Total Proposals (Parent KPI with Child KPIs) */}
        <div className="mb-6">
          <div
            onClick={() => handleKPIDrillDown("all")}
            className="bg-gradient-to-br from-[#0B1F4D] to-[#1E5AA8] text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer mb-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90 mb-1">Total Proposals</div>
                <div className="text-4xl font-bold">
                  {totalProposalsData.total.toLocaleString()}
                </div>
              </div>
              <FileText className="size-12 opacity-80" />
            </div>
          </div>

          {/* Child KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => handleKPIDrillDown("approved")}
              className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-green-500"
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="size-5 text-green-600" />
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-green-600 transition-colors" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {totalProposalsData.approved}
              </div>
              <div className="text-xs text-muted-foreground">
                Approved Proposals
              </div>
            </div>
            <div
              onClick={() => handleKPIDrillDown("pending")}
              className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-orange-500"
            >
              <div className="flex items-center justify-between mb-2">
                <Clock className="size-5 text-orange-600" />
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-orange-600 transition-colors" />
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {totalProposalsData.pending}
              </div>
              <div className="text-xs text-muted-foreground">
                Pending Proposals
              </div>
            </div>
            <div
              onClick={() => handleKPIDrillDown("rejected")}
              className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-red-500"
            >
              <div className="flex items-center justify-between mb-2">
                <XCircle className="size-5 text-red-600" />
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-red-600 transition-colors" />
              </div>
              <div className="text-2xl font-bold text-red-600">
                {totalProposalsData.rejected}
              </div>
              <div className="text-xs text-muted-foreground">
                Rejected Proposals
              </div>
            </div>
          </div>
        </div>

        {/* B. Proposals Under Review */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Proposals Under Review</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {proposalsUnderReview.map((item, idx) => (
              <div
                key={idx}
                onClick={() => navigate(item.link)}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-lg text-primary">
                    {item.stage}
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold mb-1">{item.count}</div>
                <div className="text-xs text-muted-foreground">
                  Pending {item.pendingDays} days avg
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* C. Budget Section */}
        <div>
          <h3 className="font-semibold mb-3">
            Budget Overview - FY {selectedFY}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Budget Summary Cards */}
            <div className="space-y-3">
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="text-xs text-muted-foreground mb-1">
                  Budget Allocated
                </div>
                <div className="text-2xl font-bold text-[#0B1F4D]">
                  ₹2,450 Cr
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="text-xs text-muted-foreground mb-1">
                  Budget Received
                </div>
                <div className="text-2xl font-bold text-[#1E5AA8]">
                  ₹1,876 Cr
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="text-xs text-muted-foreground mb-1">
                  Budget Utilized
                </div>
                <div className="text-2xl font-bold text-[#059669]">
                  ₹1,234 Cr
                </div>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="bg-card border border-border rounded-xl p-2">
              <h4 className="text-sm font-semibold mb-3">
                Budget Distribution
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={budgetAllocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {budgetAllocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "7px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Utilization Gauge */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h4 className="text-sm font-semibold mb-3">Utilization Rate</h4>
              <div className="flex flex-col items-center justify-center h-[200px]">
                <div className="relative w-40 h-40">
                  <svg className="transform -rotate-90 w-40 h-40">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#E5E7EB"
                      strokeWidth="12"
                      fill="transparent"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#059669"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={`${(1234 / 2450) * 440} 440`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#059669]">
                        {Math.round((1234 / 2450) * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Utilized
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 - PROCUREMENT */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-primary">
          Section 2 — Procurement
        </h2>

        {/* Procurement KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Package className="size-6 text-[#0B1F4D]" />
              <div className="text-sm text-muted-foreground">
                Total Procured Items
              </div>
            </div>
            <div className="text-3xl font-bold">
              {procurementKPIs.totalItems.toLocaleString()}
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <IndianRupee className="size-6 text-[#059669]" />
              <div className="text-sm text-muted-foreground">
                Total Procurement Value
              </div>
            </div>
            <div className="text-3xl font-bold">
              {procurementKPIs.procurementValue}
            </div>
          </div>
        </div>

        {/* Procurement Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Year-wise Procurement Trend */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="mb-4 text-[#0B1F4D] font-bold">
              Year-wise Procurement Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={procurementTrend}>
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
                  name="Value (₹Cr)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Budget Spent by Beneficiary Department */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="mb-4 text-[#0B1F4D] font-bold">
              Budget Spent by Beneficiary Department
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={budgetByDepartment}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  dataKey="value"
                >
                  {budgetByDepartment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "8px" }}
                  formatter={(value) => `₹${value} Cr`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Advanced Pipelines & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendering Pipeline */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="mb-4 text-[#0B1F4D] font-bold">Tendering Pipeline</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={tenderingPipeline}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                dataKey="stage"
                type="category"
                width={100}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "#f1f5f9" }}
                contentStyle={{ borderRadius: "8px" }}
              />
              <Bar
                dataKey="count"
                fill="#1E5AA8"
                radius={[0, 4, 4, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Project Monitoring Pipeline */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="mb-4 text-[#0B1F4D] font-bold">
            Project Monitoring Pipeline
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={projectMonitoringPipeline}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                dataKey="stage"
                type="category"
                width={120}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "#f1f5f9" }}
                contentStyle={{ borderRadius: "8px" }}
              />
              <Bar
                dataKey="count"
                fill="#059669"
                radius={[0, 4, 4, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Department Proposals */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="mb-4 text-[#0B1F4D] font-bold">
            Line Department Proposals
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={lineDeptProposals}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="dept"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, textAnchor: "end" }}
                height={60}
              />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "#f1f5f9" }}
                contentStyle={{ borderRadius: "8px" }}
              />
              <Bar
                dataKey="count"
                fill="#FBAC1B"
                radius={[4, 4, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* District-wise Budget Utilization */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="mb-4 text-[#0B1F4D] font-bold">
            District-wise Budget Utilization
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={districtBudgetData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="district"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "#F1F5F9" }}
                contentStyle={{ borderRadius: "8px" }}
              />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Bar
                dataKey="allocated"
                fill="#0B1F4D"
                name="Allocated (₹Cr)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="utilized"
                fill="#FBAC1B"
                name="Utilized (₹Cr)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Proposal Trend */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="mb-4 text-[#0B1F4D] font-bold">
            Proposal Trend (Last 6 Months)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={proposalTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "8px" }} />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Line
                type="monotone"
                dataKey="created"
                stroke="#0B1F4D"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Created"
              />
              <Line
                type="monotone"
                dataKey="approved"
                stroke="#059669"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Approved"
              />
              <Line
                type="monotone"
                dataKey="rejected"
                stroke="#DC2626"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Rejected"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Disaster Type Distribution */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="mb-4 text-[#0B1F4D] font-bold">
            Proposals by Disaster Type
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={disasterTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                innerRadius={60}
                dataKey="value"
              >
                {disasterTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "8px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Notifications Panel */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold">
          Recent Alerts & Notifications
        </h3>
        <div className="space-y-3">
          {notifications.map((notif, index) => (
            <Link
              key={index}
              to={notif.link}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border"
            >
              <AlertCircle
                className={`size-5 mt-0.5 ${
                  notif.type === "alert"
                    ? "text-destructive"
                    : notif.type === "warning"
                      ? "text-secondary"
                      : "text-accent"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm">{notif.message}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  View details →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/proposal-initiation" className="bg-primary text-primary-foreground rounded-xl p-6 hover:opacity-90 transition-opacity">
          <FileText className="size-8 mb-3" />
          <h3 className="mb-2">Create New Proposal</h3>
          <p className="text-sm opacity-90">Initiate a new disaster mitigation proposal</p>
        </Link>
        <Link to="/procurement/planning" className="bg-secondary text-secondary-foreground rounded-xl p-6 hover:opacity-90 transition-opacity">
          <IndianRupee className="size-8 mb-3" />
          <h3 className="mb-2">Start Procurement</h3>
          <p className="text-sm opacity-90">Begin procurement planning process</p>
        </Link>
        <Link to="/reports" className="bg-accent text-accent-foreground rounded-xl p-6 hover:opacity-90 transition-opacity">
          <Calendar className="size-8 mb-3" />
          <h3 className="mb-2">Generate Reports</h3>
          <p className="text-sm opacity-90">Export comprehensive analytics reports</p>
        </Link>
      </div> */}
    </div>
  );
}
