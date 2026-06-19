import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, RotateCcw, Plus, Eye, Printer, Download, FileCheck } from "lucide-react";

const procurementData = [
  {
    id: "PROC-2025-001",
    year: "2025-26",
    item: "Heavy Duty Excavator",
    demandFrom: "Pune District",
    vendor: "Tata Hitachi",
    awardCost: "₹45,00,000",
    status: "Completed",
  },
  {
    id: "PROC-2025-002",
    year: "2025-26",
    item: "Medical Kits",
    demandFrom: "NDRF",
    vendor: "Apollo Pharma",
    awardCost: "₹12,50,000",
    status: "In Progress",
  },
  {
    id: "PROC-2025-003",
    year: "2024-25",
    item: "Rescue Boats",
    demandFrom: "Nagpur District",
    vendor: "Marine Solutions",
    awardCost: "₹85,00,000",
    status: "PSC Pending",
  },
  {
    id: "PROC-2025-004",
    year: "2025-26",
    item: "Communication Radios",
    demandFrom: "Army",
    vendor: "Motorola Solutions",
    awardCost: "₹35,00,000",
    status: "TAC Pending",
  },
  {
    id: "PROC-2024-105",
    year: "2024-25",
    item: "Emergency Tents",
    demandFrom: "Mumbai District",
    vendor: "SafeShelter Inc",
    awardCost: "₹18,00,000",
    status: "Completed",
  },
  {
    id: "PROC-2025-006",
    year: "2025-26",
    item: "Flood Barriers",
    demandFrom: "SDRF",
    vendor: "FloodGuard Tech",
    awardCost: "₹62,00,000",
    status: "SEC Pending",
  },
];

const statusColors: Record<string, string> = {
  Completed: "bg-green-100 text-green-800",
  "In Progress": "bg-blue-100 text-blue-800",
  "PSC Pending": "bg-yellow-100 text-yellow-800",
  "TAC Pending": "bg-orange-100 text-orange-800",
  "SEC Pending": "bg-purple-100 text-purple-800",
  Draft: "bg-gray-100 text-gray-800",
  Delayed: "bg-red-100 text-red-800",
};

export function ProcurementList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [financialYear, setFinancialYear] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = procurementData.filter((row) => {
    const matchSearch =
      !searchTerm ||
      row.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchYear = !financialYear || row.year === financialYear;
    const matchStatus = !statusFilter || row.status === statusFilter;
    return matchSearch && matchYear && matchStatus;
  });

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
            placeholder="Search Procurement ID, Item Name or Vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg"
          >
            <option value="">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="PSC Pending">PSC Pending</option>
            <option value="TAC Pending">TAC Pending</option>
            <option value="SEC Pending">SEC Pending</option>
            <option value="Draft">Draft</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => { setSearchTerm(""); setFinancialYear(""); setStatusFilter(""); }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm flex-1"
            >
              <RotateCcw className="size-4" />
              Reset
            </button>
            <button className="px-4 py-2 bg-[#0B1F4D] hover:bg-opacity-90 text-white rounded-lg flex items-center gap-2 transition-colors font-medium text-sm flex-1">
              <Search className="size-4" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-4 font-medium">Procurement ID</th>
                <th className="px-4 py-4 font-medium">Financial Year</th>
                <th className="px-4 py-4 font-medium">Item Name</th>
                <th className="px-4 py-4 font-medium">Demand From</th>
                <th className="px-4 py-4 font-medium">Vendor</th>
                <th className="px-4 py-4 font-medium">Award Cost</th>
                <th className="px-4 py-4 font-medium">Current Status</th>
                <th className="px-4 py-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-[#0B1F4D]">{row.id}</td>
                  <td className="px-4 py-3">{row.year}</td>
                  <td className="px-4 py-3">{row.item}</td>
                  <td className="px-4 py-3">{row.demandFrom}</td>
                  <td className="px-4 py-3">{row.vendor}</td>
                  <td className="px-4 py-3 font-medium">{row.awardCost}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[row.status] ?? "bg-gray-100 text-gray-800"}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => navigate(`/procurement/view/${row.id}`)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View"
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                        title="Print"
                        onClick={() => window.print()}
                      >
                        <Printer className="size-4" />
                      </button>
                      <button
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Download Summary"
                      >
                        <Download className="size-4" />
                      </button>
                      <button
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Approval Documents"
                      >
                        <FileCheck className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No procurement records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/20">
          <span className="text-sm text-muted-foreground">
            Showing {filtered.length} of {procurementData.length} entries
          </span>
          <div className="flex gap-1">
            <button className="px-3 py-1 bg-white border border-border rounded text-sm disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 bg-[#0B1F4D] text-white border border-[#0B1F4D] rounded text-sm">1</button>
            <button className="px-3 py-1 bg-white border border-border rounded text-sm disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
