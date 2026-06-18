import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, Filter, Eye, Download, FileText, MapPin, Building2, Calendar, Activity } from "lucide-react";

// Mock proposal data
const mockProposals = [
  {
    id: "PROP-2026-001",
    projectName: "Flood Protection Wall",
    disasterType: "Flood",
    district: "Mumbai",
    taluka: "Kurla",
    department: "PWD",
    currentStage: "PAC",
    status: "Under Review",
    createdDate: "2026-01-15",
    budgetAllocated: "₹45 Cr"
  },
  {
    id: "PROP-2026-002",
    projectName: "River Deepening Project",
    disasterType: "Drought",
    district: "Pune",
    taluka: "Haveli",
    department: "WRD",
    currentStage: "TAC",
    status: "Under Review",
    createdDate: "2026-02-10",
    budgetAllocated: "₹32 Cr"
  },
  {
    id: "PROP-2026-003",
    projectName: "Storm Water Drainage",
    disasterType: "Earthquake",
    district: "Nagpur",
    taluka: "Nagpur Urban",
    department: "Urban Development",
    currentStage: "SEC",
    status: "Under Review",
    createdDate: "2026-03-05",
    budgetAllocated: "₹28 Cr"
  },
  {
    id: "PROP-2026-004",
    projectName: "Landslide Mitigation Works",
    disasterType: "Cyclone",
    district: "Thane",
    taluka: "Kalyan",
    department: "Rural Development",
    currentStage: "SDMA",
    status: "Approved",
    createdDate: "2026-01-20",
    budgetAllocated: "₹18 Cr"
  },
  {
    id: "PROP-2026-005",
    projectName: "Dam Strengthening",
    disasterType: "Landslide",
    district: "Nashik",
    taluka: "Igatpuri",
    department: "Forest",
    currentStage: "PMU",
    status: "Pending",
    createdDate: "2026-04-12",
    budgetAllocated: "₹12 Cr"
  },
  {
    id: "PROP-2026-006",
    projectName: "River Embankment",
    disasterType: "Flood",
    district: "Kolhapur",
    taluka: "Kolhapur City",
    department: "Health",
    currentStage: "DDMA",
    status: "Rejected",
    createdDate: "2026-02-28",
    budgetAllocated: "₹8 Cr"
  },
];

const statuses = ["All Statuses", "Under Review", "Approved", "Pending", "Rejected"];
const stages = ["All Stages", "DDMA", "PMU", "PAC", "TAC", "SEC", "SDMA"];
const districts = ["All Districts", "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Kolhapur"];
const departments = ["All Departments", "PWD", "WRD", "Health", "Forest", "Urban Development", "Rural Development", "PSU"];

export function ProposalList() {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [stageFilter, setStageFilter] = useState("All Stages");
  const [districtFilter, setDistrictFilter] = useState("All Districts");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [filteredProposals, setFilteredProposals] = useState(mockProposals);

  // Apply filters from URL params on load
  useEffect(() => {
    const filterParam = searchParams.get("filter");
    const stageParam = searchParams.get("stage");

    if (filterParam === "approved") {
      setStatusFilter("Approved");
    } else if (filterParam === "pending") {
      setStatusFilter("Pending");
    } else if (filterParam === "rejected") {
      setStatusFilter("Rejected");
    }

    if (stageParam) {
      setStageFilter(stageParam);
    }
  }, [searchParams]);

  // Apply all filters
  useEffect(() => {
    let filtered = mockProposals;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.disasterType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "All Statuses") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Stage filter
    if (stageFilter !== "All Stages") {
      filtered = filtered.filter((p) => p.currentStage === stageFilter);
    }

    // District filter
    if (districtFilter !== "All Districts") {
      filtered = filtered.filter((p) => p.district === districtFilter);
    }

    // Department filter
    if (departmentFilter !== "All Departments") {
      filtered = filtered.filter((p) => p.department === departmentFilter);
    }

    setFilteredProposals(filtered);
  }, [searchTerm, statusFilter, stageFilter, districtFilter, departmentFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "Pending":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "DDMA":
        return "bg-purple-100 text-purple-700";
      case "PMU":
        return "bg-indigo-100 text-indigo-700";
      case "PAC":
        return "bg-blue-100 text-blue-700";
      case "TAC":
        return "bg-cyan-100 text-cyan-700";
      case "SEC":
        return "bg-teal-100 text-teal-700";
      case "SDMA":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Proposal List</h1>
          <p className="text-sm text-muted-foreground">
            View and manage all proposals across stages
          </p>
        </div>
        <Link
          to="/proposal-initiation"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
        >
          Create New Proposal
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Proposal ID, Disaster Type, District, or Department..."
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Filter Section */}
        <div className="flex items-center gap-2 mb-2">
          <Filter className="size-4 text-primary" />
          <h3 className="font-semibold text-sm">Global Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Stage Filter
            </label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              District Filter
            </label>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Department Filter
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-primary">{filteredProposals.length}</span> of{" "}
            <span className="font-semibold">{mockProposals.length}</span> proposals
          </p>
        </div>
      </div>

      {/* Proposals Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Proposal ID
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Disaster Type
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  District
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Department
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Current Stage
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Created Date
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProposals.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      <span className="font-semibold text-sm">{proposal.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{proposal.disasterType}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="size-3 text-muted-foreground" />
                      {proposal.district}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Building2 className="size-3 text-muted-foreground" />
                      {proposal.department}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStageColor(
                        proposal.currentStage
                      )}`}
                    >
                      {proposal.currentStage}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        proposal.status
                      )}`}
                    >
                      {proposal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="size-3" />
                      {proposal.createdDate}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to="/proposal-detail"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-xs font-medium"
                    >
                      <Eye className="size-3" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProposals.length === 0 && (
          <div className="py-12 text-center">
            <FileText className="size-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground">No proposals found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
