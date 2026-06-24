import { useState } from "react";
import { useNavigate } from "react-router";
import { ShoppingCart, IndianRupee, Building2 } from "lucide-react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";

// --- TypeScript Interfaces ---
export interface ProcurementItem {
  id: string | number;
  procurementRefNo: string;
  financialYear: string;
  itemName: string;
  demandFrom?: string;
  vendor?: string;
  awardCostInclGstLakhs?: number;
  deliveryPct: number;
  status: string;
}

export interface ProcurementResponse {
  items: ProcurementItem[];
  totalCount?: number;
  hasNextPage?: boolean;
}

// Added interface for the Dashboard API response
export interface DashboardResponse {
  totalProcuredItems: number;
  budgetApproved: number;
  budgetSpent: number;
  topBeneficiaryDepartment: string;
}

export function ProcurementDashboard() {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  
  // Filter States
  const [financialYear, setFinancialYear] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [department, setDepartment] = useState<string>("");

  // Pagination States
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Fetch Table Data
  const { data, isLoading, isError } = useQuery<ProcurementResponse, Error>({
    queryKey: ["procurements", page, pageSize, financialYear, district, department],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Procurements", {
        params: {
          Page: page,
          PageSize: pageSize,
          // financialYear: financialYear || undefined,
          // districtId: district || undefined,
        },
      });
      return response.data;
    },
    // keepPreviousData is deprecated in latest react-query, but keeping it as per your original code
    keepPreviousData: true, 
  });

  // Fetch Dashboard KPI Data
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery<DashboardResponse, Error>({
    queryKey: ["procurementDashboard", financialYear, district, department],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Procurements/dashboard", {
        params: {
          // You can pass your filters here if your dashboard endpoint supports them
          // financialYear: financialYear || undefined,
          // districtId: district || undefined,
        },
      });
      return response.data;
    },
  });

  const procurements: ProcurementItem[] = data?.items || [];

  // Helper for formatting currency
  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium whitespace-nowrap">
            Completed
          </span>
        );
      case "In Progress":
      case "ProposalScrutiny":
      case "Pending PSC":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium whitespace-nowrap">
            {status}
          </span>
        );
      case "Draft":
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium whitespace-nowrap">
            Draft
          </span>
        );
      case "Delayed":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium whitespace-nowrap">
            Delayed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium whitespace-nowrap">
            {status || "Unknown"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F4D]">
            Procurement Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Summary view of all procurement records
          </p>
        </div>
      </div>

      {/* Top Filter Section */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Financial Year
            </label>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg"
            >
              <option value="">All Years</option>
              <option value="2025-26">2025-26</option>
              <option value="2024-25">2024-25</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg"
            >
              <option value="">All Districts</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Pune">Pune</option>
              <option value="Nagpur">Nagpur</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Line Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg"
            >
              <option value="">All Departments</option>
              <option value="Rural Development">Rural Development</option>
              <option value="Health">Health</option>
              <option value="Disaster Management">Disaster Management</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => { setFinancialYear(""); setDistrict(""); setDepartment(""); setPage(1); }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Reset Filter
          </button>
          <button 
            onClick={() => setPage(1)}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0B1F4D] hover:bg-opacity-90 rounded-lg transition-colors"
          >
            Apply Filter
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
              <ShoppingCart className="size-5" />
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">
            {isDashboardLoading ? "..." : (dashboardData?.totalProcuredItems?.toLocaleString() || "0")}
          </div>
          <div className="text-xs text-muted-foreground">Total Procured Items</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-green-100 text-green-600 p-2 rounded-lg">
              <IndianRupee className="size-5" />
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">
            {isDashboardLoading ? "..." : formatCurrency(dashboardData?.budgetApproved)}
          </div>
          <div className="text-xs text-muted-foreground">Budget Approved</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
              <IndianRupee className="size-5" />
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">
            {isDashboardLoading ? "..." : formatCurrency(dashboardData?.budgetSpent)}
          </div>
          <div className="text-xs text-muted-foreground">Budget Spent</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
              <Building2 className="size-5" />
            </div>
          </div>
          <div className="text-lg font-bold mb-1 line-clamp-1">
            {isDashboardLoading ? "..." : (dashboardData?.topBeneficiaryDepartment || "N/A")}
          </div>
          <div className="text-xs text-muted-foreground">
            Highest Beneficiary Department
          </div>
        </div>
      </div>

      {/* Procurement Table */}
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold text-[#0B1F4D]">
            Procurement Records
          </h2>
          <select 
            value={pageSize} 
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="text-sm border border-border rounded-md px-2 py-1"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
        
        {/* Horizontal Scroll Wrapper */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Procurement ID</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Financial Year</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Item Name</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Demand From</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Vendor Name</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Award Cost (Lakhs)</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Delivery %</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    Loading procurement records...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-red-500">
                    Failed to load records. Please try again.
                  </td>
                </tr>
              ) : procurements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No procurement records found.
                  </td>
                </tr>
              ) : (
                procurements.map((row: ProcurementItem) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-[#0B1F4D] whitespace-nowrap">
                      {row.procurementRefNo}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{row.financialYear}</td>
                    <td className="px-4 py-3 whitespace-nowrap min-w-[200px]">{row.itemName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{row.demandFrom || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{row.vendor || "Pending"}</td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                      ₹{row.awardCostInclGstLakhs?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-[60px]">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${row.deliveryPct}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {row.deliveryPct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(row.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-gray-50">
          <span className="text-sm text-muted-foreground">
            Showing Page {page}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((old) => Math.max(old - 1, 1))}
              className="px-3 py-1 text-sm bg-white border border-border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((old) => old + 1)}
              disabled={data?.hasNextPage === false}
              className="px-3 py-1 text-sm bg-white border border-border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}