import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Plus, Search, Eye } from "lucide-react";

export function TendersList() {
  const navigate = useNavigate();

  const [tenders] = useState([
    { id: "TND-2024-001", refNo: "REF-2024-001", title: "Procurement of Medical Supplies", orgChain: "Department of Health" },
    { id: "TND-2024-002", refNo: "REF-2024-002", title: "IT Infrastructure Upgrade", orgChain: "Department of IT" },
    { id: "TND-2024-003", refNo: "REF-2024-003", title: "Construction of Relief Camps", orgChain: "Disaster Management" },
    { id: "TND-2024-004", refNo: "REF-2024-004", title: "Emergency Vehicles Procurement", orgChain: "Transport Department" },
    { id: "TND-2024-005", refNo: "REF-2024-005", title: "Consultancy for Flood Management", orgChain: "Water Resources" },
    { id: "TND-2024-006", refNo: "REF-2024-006", title: "Maintenance of Cyclone Shelters", orgChain: "Public Works Department" },
    { id: "TND-2024-007", refNo: "REF-2024-007", title: "Communication Equipment Setup", orgChain: "Department of Telecommunications" },
    { id: "TND-2024-008", refNo: "REF-2024-008", title: "Disaster Response Training", orgChain: "Disaster Management" },
    { id: "TND-2024-009", refNo: "REF-2024-009", title: "Renovation of Control Rooms", orgChain: "Public Works Department" },
    { id: "TND-2024-010", refNo: "REF-2024-010", title: "Distribution of Relief Material", orgChain: "Food and Civil Supplies" },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F4D]">Tenders</h1>
          <p className="text-muted-foreground mt-1">Manage and track all procurement tenders</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/procurement/tendering/new"
            className="flex items-center gap-2 bg-[#1E5AA8] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="size-4" />
            <span className="font-medium">New Tender</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-semibold text-[#0B1F4D]">All Tenders</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tenders..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Tender Title</th>
                <th className="px-6 py-3 font-medium">Tender Ref No</th>
                <th className="px-6 py-3 font-medium">Tender ID</th>
                <th className="px-6 py-3 font-medium">Organizational Chain</th>
                <th className="px-6 py-3 font-medium text-center">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tenders.map((tender) => (
                <tr key={tender.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-[#0B1F4D] whitespace-nowrap">
                    {tender.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{tender.refNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{tender.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{tender.orgChain}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <button 
                      onClick={() => navigate(`/procurement/tendering/tenders/${tender.id}`)}
                      className="p-2 inline-flex justify-center hover:bg-muted rounded-lg text-muted-foreground hover:text-[#0B1F4D] transition-colors"
                      title="View Details"
                    >
                      <Eye className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-gray-50/50">
          <span>Showing 1 to 10 of 10 tenders</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-border rounded-md hover:bg-muted disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 bg-[#1E5AA8] text-white rounded-md">1</button>
            <button className="px-3 py-1 border border-border rounded-md hover:bg-muted disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
