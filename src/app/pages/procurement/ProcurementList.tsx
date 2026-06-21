import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, RotateCcw, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const statusColors: Record<string, string> = {
  Completed: "bg-green-100 text-green-800",
  "In Progress": "bg-blue-100 text-blue-800",
  "PSC Pending": "bg-yellow-100 text-yellow-800",
  "Pending PSC": "bg-yellow-100 text-yellow-800",
  "TAC Pending": "bg-orange-100 text-orange-800",
  "Pending TAC": "bg-orange-100 text-orange-800",
  "SEC Pending": "bg-purple-100 text-purple-800",
  "Pending SEC": "bg-purple-100 text-purple-800",
  Draft: "bg-gray-100 text-gray-800",
  Delayed: "bg-red-100 text-red-800",
};

export function ProcurementList() {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  // --- PAGINATION & FILTER STATE ---
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  
  const [searchInput, setSearchInput] = useState("");
  const [financialYear, setFinancialYear] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: "",
    financialYear: "",
    statusFilter: "",
  });

  // --- MASTER DATA QUERIES (To resolve District/Department UUIDs to display names) ---
  const { data: districtsData } = useQuery({
    queryKey: ["districts-dropdown"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/districts", {
        params: { page: 1, pageSize: 100 },
      });
      return response.data;
    },
  });

  const { data: deptData } = useQuery({
    queryKey: ["departments-dropdown"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/line-departments", {
        params: { page: 1, pageSize: 100 },
      });
      return response.data;
    },
  });

  const districts = districtsData?.items ?? [];
  const departments = deptData?.items ?? [];

  // --- GET PROCUREMENT LIST QUERY ---
  const { data: procurementResponse, isLoading, isError } = useQuery({
    queryKey: ["procurements", page, appliedFilters],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Procurements", {
        params: {
          Page: page,
          PageSize: pageSize,
          financialYear: appliedFilters.financialYear || undefined,
          itemName: appliedFilters.searchTerm || undefined,
          status: appliedFilters.statusFilter || undefined,
        },
      });
      return response.data;
    },
  });

  const procurementItems = procurementResponse?.items ?? [];
  const totalItems = procurementResponse?.totalCount ?? 0;
  const totalPages = procurementResponse?.totalPages ?? 1;

  // --- ACTION HANDLERS ---
  const handleSearchSubmit = () => {
    setPage(1);
    setAppliedFilters({
      searchTerm: searchInput,
      financialYear: financialYear,
      statusFilter: statusFilter,
    });
  };

  const handleReset = () => {
    setSearchInput("");
    setFinancialYear("");
    setStatusFilter("");
    setPage(1);
    setAppliedFilters({
      searchTerm: "",
      financialYear: "",
      statusFilter: "",
    });
  };

  // --- NAME RESOLVER FOR ID VALUES ---
  const getDemandLocationName = (row: any) => {
    if (row.demandFrom === "Districts" && row.districtId) {
      const dist = districts.find((d: any) => d.id === row.districtId);
      return dist ? `${dist.name}` : "Loading District...";
    }
    if (row.demandFrom === "Other Departments" && row.departmentId) {
      const dept = departments.find((d: any) => d.id === row.departmentId);
      return dept ? `${dept.name}` : "Loading Department...";
    }
    return row.demandFrom || "N/A";
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F4D]">Procurement List</h1>
          <p className="text-sm text-muted-foreground">Browse and manage all procurement records</p>
        </div>
        <button
          onClick={() => navigate("/procurement/new")}
          className="px-4 py-2 bg-[#FF5B1A] hover:bg-opacity-90 text-white rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
        >
          <Plus className="size-4" />
          New Procurement
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Item Name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
            className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg"
          >
            <option value="">All Financial Years</option>
            <option value="2025-26">2025-26</option>
            <option value="2024-25">2024-25</option>
            <option value="2023-24">2023-24</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg"
          >
            <option value="">All Statuses</option>
            <option value="Pending PSC">Pending PSC</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm flex-1"
            >
              <RotateCcw className="size-4" />
              Reset
            </button>
            <button
              onClick={handleSearchSubmit}
              className="px-4 py-2 bg-[#0B1F4D] hover:bg-opacity-90 text-white rounded-lg flex items-center gap-2 transition-colors font-medium text-sm flex-1"
            >
              <Search className="size-4" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-4 font-medium">Procurement Ref No</th>
                <th className="px-4 py-4 font-medium">Financial Year</th>
                <th className="px-4 py-4 font-medium">Item Name</th>
                <th className="px-4 py-4 font-medium">Demand From</th>
                <th className="px-4 py-4 font-medium">Total Quantity</th>
                <th className="px-4 py-4 font-medium">Award Cost (Lakhs)</th>
                <th className="px-4 py-4 font-medium">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Loading procurement data...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-red-500 font-medium">
                    Failed to fetch procurement records. Please try again.
                  </td>
                </tr>
              ) : procurementItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No procurement records found.
                  </td>
                </tr>
              ) : (
                procurementItems.map((row: any) => (
                  <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-[#0B1F4D]">
                      {row.procurementRefNo || "N/A"}
                    </td>
                    <td className="px-4 py-3">{row.financialYear}</td>
                    <td className="px-4 py-3">{row.itemName}</td>
                    <td className="px-4 py-3">{getDemandLocationName(row)}</td>
                    <td className="px-4 py-3">{row.totalQuantity ?? 0}</td>
                    <td className="px-4 py-3 font-medium">
                      ₹{row.awardCostInclGstLakhs?.toLocaleString("en-IN") || "0"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[row.status] ?? "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Footer */}
        {!isLoading && !isError && procurementItems.length > 0 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/20">
            <span className="text-sm text-muted-foreground">
              Showing entries {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, totalItems)} of {totalItems} entries
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="px-3 py-1 bg-white border border-border rounded text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
                disabled={page === 1}
              >
                Previous
              </button>
              <button className="px-3 py-1 bg-[#0B1F4D] text-white border border-[#0B1F4D] rounded text-sm font-medium">
                {page}
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className="px-3 py-1 bg-white border border-border rounded text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}