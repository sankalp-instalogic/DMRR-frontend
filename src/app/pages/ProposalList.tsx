import { useState, useEffect } from 'react';
import { Link, useSearchParams } from "react-router";
import { Search, Filter, Eye, FileText, MapPin, Building2, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";

// Define the structure of a single item
interface Proposal {
    id: string;
    proposalRefNo: string;
    title: string;
    disasterType: string;
    district: string;
    lineDepartment: string;
    currentStage: string;
    status: string;
    createdAtUtc: string;
}

// Define the structure of the overall API response
interface ApiResponse {
    items: Proposal[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

const statuses = ["All Statuses", "Draft", "Under Review", "Approved", "Pending", "Rejected"];
const stages = ["All Stages", "Initiation", "DDMA", "PMU", "PAC", "TAC", "SEC", "SDMA"];
const districts = ["All Districts", "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Kolhapur"];
const departments = ["All Departments", "SDRF", "PWD", "WRD", "Health", "Forest", "Urban Development", "Rural Development", "PSU"];

export function ProposalList() {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [stageFilter, setStageFilter] = useState("All Stages");
  const [districtFilter, setDistrictFilter] = useState("All Districts");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  const axios = useAxiosPrivate();

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ["proposals", page, pageSize],
    queryFn: async () => {
      const response = await axios.get(`/api/v1/Proposals?Page=${page}&PageSize=${pageSize}`);
      return response.data;
    },
    retry: false,
  });

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

  // Apply all filters on the fetched API data
  useEffect(() => {
    if (!data?.items) {
      setFilteredProposals([]);
      return;
    }

    let filtered = data.items;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.proposalRefNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.disasterType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.lineDepartment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "All Statuses") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    if (stageFilter !== "All Stages") {
      filtered = filtered.filter((p) => p.currentStage === stageFilter);
    }

    if (districtFilter !== "All Districts") {
      filtered = filtered.filter((p) => p.district === districtFilter);
    }

    if (departmentFilter !== "All Departments") {
      filtered = filtered.filter((p) => p.lineDepartment === departmentFilter);
    }

    setFilteredProposals(filtered);
  }, [searchTerm, statusFilter, stageFilter, districtFilter, departmentFilter, data]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-700 border-green-200";
      case "Pending": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Rejected": return "bg-red-100 text-red-700 border-red-200";
      case "Draft": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Initiation": return "bg-yellow-100 text-yellow-700";
      case "DDMA": return "bg-purple-100 text-purple-700";
      case "PMU": return "bg-indigo-100 text-indigo-700";
      case "PAC": return "bg-blue-100 text-blue-700";
      case "TAC": return "bg-cyan-100 text-cyan-700";
      case "SEC": return "bg-teal-100 text-teal-700";
      case "SDMA": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (utcDate: string) => {
    return new Date(utcDate).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    });
  };

  return (
    // Added w-full max-w-full to prevent horizontal spillover
    <div className="space-y-6 w-full max-w-full overflow-x-hidden px-2 sm:px-0">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Proposal List</h1>
          <p className="text-sm text-muted-foreground">
            View and manage all proposals across stages
          </p>
        </div>
        <Link
          to="/proposal-initiation"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium whitespace-nowrap"
        >
          Create New Proposal
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm space-y-4 w-full">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Proposal Ref No, Disaster Type, District..."
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm sm:text-base"
          />
        </div>

        {/* Filter Section */}
        <div className="flex items-center gap-2 mb-2">
          <Filter className="size-4 text-primary" />
          <h3 className="font-semibold text-sm">Global Filters</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Stage</label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {stages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">District</label>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {districts.map((district) => <option key={district} value={district}>{district}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {departments.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-primary">{filteredProposals.length}</span> results on this page
          </p>
        </div>
      </div>

      {/* Proposals Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col w-full max-w-full">
        {/* Enforced w-full and overflow-x-auto so only the table scrolls horizontally */}
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-225"> {/* Added min-w to prevent extreme squeezing */}
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {/* Added whitespace-nowrap to prevent headers from stacking strangely */}
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Ref No. & Title</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Disaster Type</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">District</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Department</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Current Stage</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Created Date</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">Loading proposals...</td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-red-500">Failed to load proposals. Please try again later.</td>
                </tr>
              ) : filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <FileText className="size-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                    <p className="text-muted-foreground">No proposals found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredProposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <FileText className="size-4 text-primary shrink-0" />
                          <span className="font-semibold text-sm whitespace-nowrap">{proposal.proposalRefNo}</span>
                        </div>
                        {/* Fixed invalid max-w-50 class to a valid arbitrary value max-w-[200px] */}
                        <span className="text-xs text-muted-foreground mt-1 truncate max-w-50" title={proposal.title}>
                          {proposal.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">{proposal.disasterType}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm whitespace-nowrap">
                        <MapPin className="size-3 text-muted-foreground shrink-0" />
                        {proposal.district}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm whitespace-nowrap">
                        <Building2 className="size-3 text-muted-foreground shrink-0" />
                        {proposal.lineDepartment}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStageColor(proposal.currentStage)}`}>
                        {proposal.currentStage}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(proposal.status)}`}>
                        {proposal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="size-3 shrink-0" />
                        {formatDate(proposal.createdAtUtc)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/proposal-detail/${proposal.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors text-xs font-medium"
                      >
                        <Eye className="size-3" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls - Changed to wrap on small screens */}
        {data && data.totalPages > 1 && (
          <div className="border-t border-border px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              Showing page <span className="font-medium text-foreground">{data.page}</span> of{" "}
              <span className="font-medium text-foreground">{data.totalPages}</span>
              {" "}({data.totalCount} total items)
            </p>
            
            <div className="flex items-center flex-wrap justify-center gap-2">
              <button
                onClick={() => setPage((old) => Math.max(old - 1, 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="size-4" />
                Previous
              </button>
              
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1.5 border border-border rounded-lg text-sm bg-background focus:outline-none"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>

              <button
                onClick={() => setPage((old) => (!data || old === data.totalPages ? old : old + 1))}
                disabled={!data || page >= data.totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}