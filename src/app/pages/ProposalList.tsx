import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import {
  Search,
  Filter,
  Eye,
  FileText,
  MapPin,
  Building2,
  Calendar,
} from "lucide-react";
import { Input, Select } from "antd";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { Table } from "../components/Table";
import formattedDate from "../../utils/dateFormatter";

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

// Master Item Interface for dropdowns
interface MasterItem {
  id: string | number;
  name: string;
}

const statuses = [
  "All Statuses",
  "Draft",
  "UnderReview",
  "Approved",
  "Pending",
  "Rejected",
];
const stages = [
  "All Stages",
  "Initiation",
  "DDMA",
  "PMU",
  "PAC",
  "TAC",
  "SEC",
  "SDMA",
];

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

  // Fetch Proposals
  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ["proposals", page, pageSize],
    queryFn: async () => {
      const response = await axios.get(
        `/api/v1/Proposals?Page=${page}&PageSize=${pageSize}`,
      );
      return response.data;
    },
    retry: false,
  });

  // Fetch Districts dynamically
  const { data: fetchedDistricts = [], isLoading: isLoadingDistricts } = useQuery<
    MasterItem[]
  >({
    queryKey: ["districts"],
    queryFn: async () => {
      const response = await axios.get("/api/v1/masters/districts");
      return response.data?.items || [];
    },
  });

  // Fetch Line Departments dynamically
  const { data: fetchedDepartments = [], isLoading: isLoadingDepartments } = useQuery<
    MasterItem[]
  >({
    queryKey: ["lineDepartments"],
    queryFn: async () => {
      const response = await axios.get("/api/v1/masters/line-departments");
      return response.data?.items || [];
    },
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
          p.lineDepartment.toLowerCase().includes(searchTerm.toLowerCase()),
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
  }, [
    searchTerm,
    statusFilter,
    stageFilter,
    districtFilter,
    departmentFilter,
    data,
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "Pending":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "Draft":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Initiation":
        return "bg-yellow-100 text-yellow-700";
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

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Ref No. & Title",
        field: "proposalRefNo",
        flex: 1.5,
        minWidth: 200,
        cellRenderer: (params: ICellRendererParams<Proposal>) => {
          if (!params.data) return null;
          return (
            <div className="flex flex-col justify-center h-full">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-primary shrink-0" />
                <span className="font-semibold text-sm whitespace-nowrap">
                  {params.data.proposalRefNo}
                </span>
              </div>
              <span
                className="text-xs text-muted-foreground mt-1 truncate max-w-50"
                title={params.data.title}
              >
                {params.data.title}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Disaster Type",
        field: "disasterType",
        flex: 1,
        minWidth: 150,
      },
      {
        headerName: "District",
        field: "district",
        flex: 1,
        minWidth: 130,
        cellRenderer: (params: ICellRendererParams<Proposal>) => (
          <div className="flex items-center gap-1 text-sm whitespace-nowrap h-full">
            <MapPin className="size-3 text-muted-foreground shrink-0" />
            {params.value}
          </div>
        ),
      },
      {
        headerName: "Department",
        field: "lineDepartment",
        flex: 1,
        minWidth: 150,
        cellRenderer: (params: ICellRendererParams<Proposal>) => (
          <div className="flex items-center gap-1 text-sm whitespace-nowrap h-full">
            <Building2 className="size-3 text-muted-foreground shrink-0" />
            {params.value}
          </div>
        ),
      },
      {
        headerName: "Current Stage",
        field: "currentStage",
        flex: 1,
        minWidth: 130,
        cellRenderer: (params: ICellRendererParams<Proposal>) => (
          <div className="flex items-center h-full">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStageColor(params.value)}`}
            >
              {params.value}
            </span>
          </div>
        ),
      },
      {
        headerName: "Status",
        field: "status",
        flex: 1,
        minWidth: 120,
        cellRenderer: (params: ICellRendererParams<Proposal>) => (
          <div className="flex items-center h-full">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(params.value)}`}
            >
              {params.value}
            </span>
          </div>
        ),
      },
      {
        headerName: "Created Date",
        field: "createdAtUtc",
        flex: 1,
        minWidth: 130,
        cellRenderer: (params: ICellRendererParams<Proposal>) => (
          <div className="flex items-center gap-1 text-sm text-muted-foreground h-full">
            <Calendar className="size-3 shrink-0" />
            {formattedDate(params.value)}
          </div>
        ),
      },
      {
        headerName: "Actions",
        flex: 0.8,
        minWidth: 100,
        sortable: false,
        filter: false,
        cellRenderer: (params: ICellRendererParams<Proposal>) => {
          if (!params.data) return null;
          return (
            <div className="flex items-center h-full">
              <Link
                to={`/proposal-detail/${params.data.id}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors text-xs font-medium"
              >
                <Eye className="size-3" />
                View
              </Link>
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold text-primary">Proposal List</h1>
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
        {/* Search Bar - Antd Input */}
        <Input
          size="large"
          placeholder="Search by Proposal Ref No, Disaster Type, District..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefix={<Search className="size-5 text-muted-foreground mr-2" />}
          className="w-full"
        />

        {/* Filter Section */}
        <div className="flex items-center gap-2 mb-2">
          <Filter className="size-4 text-primary" />
          <h3 className="font-semibold text-sm">Global Filters</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Status
            </label>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full"
              options={statuses.map((status) => ({
                label: status,
                value: status,
              }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Stage
            </label>
            <Select
              value={stageFilter}
              onChange={setStageFilter}
              className="w-full"
              options={stages.map((stage) => ({ label: stage, value: stage }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              District
            </label>
            <Select
              value={districtFilter}
              onChange={setDistrictFilter}
              className="w-full"
              loading={isLoadingDistricts}
              options={[
                { label: "All Districts", value: "All Districts" },
                ...(Array.isArray(fetchedDistricts)
                  ? fetchedDistricts.map((district) => ({
                      label: district.name,
                      value: district.name,
                    }))
                  : []),
              ]}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Department
            </label>
            <Select
              value={departmentFilter}
              onChange={setDepartmentFilter}
              className="w-full"
              loading={isLoadingDepartments}
              options={[
                { label: "All Departments", value: "All Departments" },
                ...(Array.isArray(fetchedDepartments)
                  ? fetchedDepartments.map((dept) => ({
                      label: dept.name,
                      value: dept.name,
                    }))
                  : []),
              ]}
            />
          </div>
        </div>

        {/* Results Count & Page Size (Moved above the table) */}
        <div className="pt-2 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-primary">
              {filteredProposals.length}
            </span>{" "}
            results on this page
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Items per page:
            </span>
            <Select
              value={pageSize}
              onChange={(value) => {
                setPageSize(value);
                setPage(1); // Reset to first page on size change
              }}
              options={[
                { label: "10", value: 10 },
                { label: "20", value: 20 },
                { label: "50", value: 50 },
              ]}
              className="w-20"
            />
          </div>
        </div>
      </div>

      {/* Custom Table Component Replacement */}
      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground border border-border rounded-xl bg-card">
          Loading proposals...
        </div>
      ) : isError ? (
        <div className="p-12 text-center text-red-500 border border-border rounded-xl bg-card">
          Failed to load proposals. Please try again later.
        </div>
      ) : (
        <Table
          rowData={filteredProposals}
          columnDefs={columnDefs}
          totalCount={data?.totalCount || 0}
          page={page}
          totalPages={data?.totalPages || 0}
          onPageChange={setPage}
          rowHeight={64}
        />
      )}
    </div>
  );
}