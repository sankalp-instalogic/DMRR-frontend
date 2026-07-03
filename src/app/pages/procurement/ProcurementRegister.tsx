import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, RotateCcw, Plus, Eye, Edit } from "lucide-react";
import { Button } from "../../components/ui/button";

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
      case "Completed": return <span className="px-2 py-1 bg-success-muted text-success-muted-foreground rounded-full text-xs font-medium">Completed</span>;
      case "In Progress": return <span className="px-2 py-1 bg-info-muted text-info-muted-foreground rounded-full text-xs font-medium">In Progress</span>;
      case "Draft": return <span className="px-2 py-1 bg-muted text-foreground rounded-full text-xs font-medium">Draft</span>;
      case "Delayed": return <span className="px-2 py-1 bg-destructive-muted text-destructive-muted-foreground rounded-full text-xs font-medium">Delayed</span>;
      default: return <span className="px-2 py-1 bg-muted text-foreground rounded-full text-xs font-medium">{status}</span>;
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
          <h1 className="text-2xl font-bold text-primary">Procurement Register</h1>
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
          <Button variant="secondary" onClick={handleReset}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
          <Button>
            <Search className="size-4" />
            Search
          </Button>
          <Button
            onClick={() => navigate("/procurement/create")}
            className="bg-accent hover:bg-accent/90 text-primary-foreground"
          >
            <Plus className="size-4" />
            New Procurement
          </Button>
        </div>
      </div>

      {/* Register Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-4 font-medium">Procurement ID</th>
                <th className="px-4 py-4 font-medium">Financial Year</th>
                <th className="px-4 py-4 font-medium">Item Name</th>
                <th className="px-4 py-4 font-medium">Beneficiary Department</th>
                <th className="px-4 py-4 font-medium">Vendor</th>
                <th className="px-4 py-4 font-medium">Award Cost</th>
                <th className="px-4 py-4 font-medium">Delivery %</th>
                <th className="px-4 py-4 font-medium">Current Status</th>
                <th className="px-4 py-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {procurementData.map((row) => (
                <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-primary">{row.id}</td>
                  <td className="px-4 py-3">{row.year}</td>
                  <td className="px-4 py-3">{row.item}</td>
                  <td className="px-4 py-3">{row.dept}</td>
                  <td className="px-4 py-3">{row.vendor}</td>
                  <td className="px-4 py-3 font-medium">{row.cost}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-muted rounded-full h-1.5 max-w-15">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: row.delivery }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">{row.delivery}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(row.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/procurement/view/${row.id}`)}
                        className="text-info hover:bg-info-muted"
                        title="View"
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/procurement/edit/${row.id}`)}
                        className="text-warning hover:bg-warning-muted"
                        title="Edit"
                      >
                        <Edit className="size-4" />
                      </Button>
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
            <button className="px-3 py-1 bg-card border border-border rounded text-sm disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 bg-primary text-primary-foreground border border-primary rounded text-sm">1</button>
            <button className="px-3 py-1 bg-card border border-border rounded text-sm disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
