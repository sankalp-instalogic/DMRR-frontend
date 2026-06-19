import { useState } from "react";
import { useNavigate } from "react-router";
import { ShoppingCart, IndianRupee, Building2, Eye, Edit } from "lucide-react";

export function ProcurementDashboard() {
  const navigate = useNavigate();
  const [financialYear, setFinancialYear] = useState("");
  const [district, setDistrict] = useState("");
  const [department, setDepartment] = useState("");

  const procurementData = [
    {
      id: "PROC-2025-001",
      year: "2025-26",
      item: "Heavy Duty Excavator",
      dept: "Rural Development",
      vendor: "Tata Hitachi",
      cost: "₹45,00,000",
      delivery: "100%",
      status: "Completed",
    },
    {
      id: "PROC-2025-002",
      year: "2025-26",
      item: "Medical Kits",
      dept: "Health Department",
      vendor: "Apollo Pharma",
      cost: "₹12,50,000",
      delivery: "50%",
      status: "In Progress",
    },
    {
      id: "PROC-2025-003",
      year: "2024-25",
      item: "Rescue Boats",
      dept: "Disaster Management",
      vendor: "Marine Solutions",
      cost: "₹85,00,000",
      delivery: "0%",
      status: "Draft",
    },
    {
      id: "PROC-2025-004",
      year: "2025-26",
      item: "Communication Radios",
      dept: "Police Department",
      vendor: "Motorola Solutions",
      cost: "₹35,00,000",
      delivery: "20%",
      status: "Delayed",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Completed
          </span>
        );
      case "In Progress":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            In Progress
          </span>
        );
      case "Draft":
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            Draft
          </span>
        );
      case "Delayed":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            Delayed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {status}
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
        <button
          onClick={() => navigate("/procurement/create")}
          className="bg-[#0B1F4D] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          New Procurement
        </button>
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
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Reset Filter
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-[#0B1F4D] hover:bg-opacity-90 rounded-lg transition-colors">
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
          <div className="text-2xl font-bold mb-1">1,250</div>
          <div className="text-xs text-muted-foreground">
            Total Procured Items
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-green-100 text-green-600 p-2 rounded-lg">
              <IndianRupee className="size-5" />
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">₹250 Crore</div>
          <div className="text-xs text-muted-foreground">Budget Approved</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
              <IndianRupee className="size-5" />
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">₹198 Crore</div>
          <div className="text-xs text-muted-foreground">Budget Spent</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
              <Building2 className="size-5" />
            </div>
          </div>
          <div className="text-lg font-bold mb-1 line-clamp-1">
            Rural Development
          </div>
          <div className="text-xs text-muted-foreground">
            Highest Beneficiary Department
          </div>
        </div>
      </div>

      {/* Procurement Table */}
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-[#0B1F4D]">
            Procurement Records
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Procurement ID</th>
                <th className="px-4 py-3 font-medium">Financial Year</th>
                <th className="px-4 py-3 font-medium">Item Name</th>
                <th className="px-4 py-3 font-medium">
                  Beneficiary Department
                </th>
                <th className="px-4 py-3 font-medium">Vendor Name</th>
                <th className="px-4 py-3 font-medium">Award Cost</th>
                <th className="px-4 py-3 font-medium">Delivery %</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {procurementData.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-[#0B1F4D]">
                    {row.id}
                  </td>
                  <td className="px-4 py-3">{row.year}</td>
                  <td className="px-4 py-3">{row.item}</td>
                  <td className="px-4 py-3">{row.dept}</td>
                  <td className="px-4 py-3">{row.vendor}</td>
                  <td className="px-4 py-3 font-medium">{row.cost}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-15">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: row.delivery }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {row.delivery}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(row.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/procurement/view/${row.id}`)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View"
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/procurement/edit/${row.id}`)}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                        title="Update"
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
      </div>
    </div>
  );
}
