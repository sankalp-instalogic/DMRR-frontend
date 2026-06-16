import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, RotateCcw, Plus, Eye, Edit } from "lucide-react";

export function ProcurementRegister() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [financialYear, setFinancialYear] = useState("");
  const [department, setDepartment] = useState("");
  const [district, setDistrict] = useState("");
  const [status, setStatus] = useState("");

  const procurementData = [
    { id: "PROC-2025-001", year: "2025-26", item: "Heavy Duty Excavator", dept: "Rural Development", vendor: "Tata Hitachi", cost: "₹45,00,000", delivery: "100%", status: "Completed" },
    { id: "PROC-2025-002", year: "2025-26", item: "Medical Kits", dept: "Health Department", vendor: "Apollo Pharma", cost: "₹12,50,000", delivery: "50%", status: "In Progress" },
    { id: "PROC-2025-003", year: "2024-25", item: "Rescue Boats", dept: "Disaster Management", vendor: "Marine Solutions", cost: "₹85,00,000", delivery: "0%", status: "Draft" },
    { id: "PROC-2025-004", year: "2025-26", item: "Communication Radios", dept: "Police Department", vendor: "Motorola Solutions", cost: "₹35,00,000", delivery: "20%", status: "Delayed" },
    { id: "PROC-2024-105", year: "2024-25", item: "Emergency Tents", dept: "Disaster Management", vendor: "SafeShelter Inc", cost: "₹18,00,000", delivery: "100%", status: "Completed" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed": return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Completed</span>;
      case "In Progress": return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">In Progress</span>;
      case "Draft": return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Draft</span>;
      case "Delayed": return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Delayed</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setFinancialYear("");
    setDepartment("");
    setDistrict("");
    setStatus("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F4D]">Procurement Register</h1>
          <p className="text-sm text-muted-foreground">Search and browse all procurement records</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        {/* Search */}
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

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <select
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg"
          >
            <option value="">Financial Year</option>
            <option value="2025-26">2025-26</option>
            <option value="2024-25">2024-25</option>
          </select>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg"
          >
            <option value="">Beneficiary Department</option>
            <option value="Rural Development">Rural Development</option>
            <option value="Health">Health Department</option>
            <option value="Disaster Management">Disaster Management</option>
            <option value="Police">Police Department</option>
          </select>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg"
          >
            <option value="">District</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Pune">Pune</option>
            <option value="Nagpur">Nagpur</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg"
          >
            <option value="">Procurement Status</option>
            <option value="Draft">Draft</option>
            <option value="In Progress">In Progress</option>
            <option value="Delayed">Delayed</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
          >
            <RotateCcw className="size-4" />
            Reset
          </button>
          <button className="px-4 py-2 bg-[#0B1F4D] hover:bg-opacity-90 text-white rounded-lg flex items-center gap-2 transition-colors font-medium text-sm">
            <Search className="size-4" />
            Search
          </button>
          <button 
            onClick={() => navigate("/procurement-create")}
            className="px-4 py-2 bg-[#FF5B1A] hover:bg-opacity-90 text-white rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
          >
            <Plus className="size-4" />
            New Procurement
          </button>
        </div>
      </div>

      {/* Register Table */}
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-4 font-medium whitespace-nowrap">Procurement ID</th>
                <th className="px-4 py-4 font-medium whitespace-nowrap">Financial Year</th>
                <th className="px-4 py-4 font-medium whitespace-nowrap">Item Name</th>
                <th className="px-4 py-4 font-medium whitespace-nowrap">Beneficiary Department</th>
                <th className="px-4 py-4 font-medium whitespace-nowrap">Vendor</th>
                <th className="px-4 py-4 font-medium whitespace-nowrap">Award Cost</th>
                <th className="px-4 py-4 font-medium whitespace-nowrap">Delivery %</th>
                <th className="px-4 py-4 font-medium whitespace-nowrap">Current Status</th>
                <th className="px-4 py-4 font-medium whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {procurementData.map((row) => (
                <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-[#0B1F4D] whitespace-nowrap">{row.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.year}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.item}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.dept}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.vendor}</td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{row.cost}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-[60px]">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: row.delivery }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">{row.delivery}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(row.status)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/procurement-view/${row.id}`)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View"
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/procurement-edit/${row.id}`)}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/20">
          <span className="text-sm text-muted-foreground">Showing 1 to 5 of 5 entries</span>
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
