import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router";
import {
  Search,
  RotateCcw,
  Plus,
  Eye,
  FileText,
  MapPin,
  Building2,
  Filter,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { Input, Select } from "antd";
import type { ColDef } from "ag-grid-community";
import { Table } from "../../components/Table";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";

const statusColors: Record<string, string> = {
  Completed: "bg-success-muted text-success-muted-foreground",
  "In Progress": "bg-info-muted text-info-muted-foreground",
  "PSC Pending": "bg-warning-muted text-warning-muted-foreground",
  "Pending PSC": "bg-warning-muted text-warning-muted-foreground",
  "TAC Pending": "bg-warning-muted text-warning-muted-foreground",
  "Pending TAC": "bg-warning-muted text-warning-muted-foreground",
  "SEC Pending": "bg-category-6/10 text-category-6",
  "Pending SEC": "bg-category-6/10 text-category-6",
  Draft: "bg-muted text-foreground",
  Delayed: "bg-destructive-muted text-destructive-muted-foreground",
};

export function ProcurementList() {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  // --- PAGINATION & FILTER STATE ---
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchInput, setSearchInput] = useState("");
  const [financialYear, setFinancialYear] = useState<string | undefined>(
    undefined,
  );
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  );

  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: "",
    financialYear: undefined as string | undefined,
    statusFilter: undefined as string | undefined,
  });

  // --- MASTER DATA QUERIES ---
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
      const response = await axiosPrivate.get(
        "/api/v1/masters/line-departments",
        {
          params: { page: 1, pageSize: 100 },
        },
      );
      return response.data;
    },
  });

  const districts = districtsData?.items ?? [];
  const departments = deptData?.items ?? [];

  // --- GET PROCUREMENT LIST QUERY ---
  const {
    data: procurementResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["procurements", page, pageSize, appliedFilters],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Procurements", {
        params: {
          Page: page,
          PageSize: pageSize,
          financialYear: appliedFilters.financialYear,
          itemName: appliedFilters.searchTerm || undefined,
          status: appliedFilters.statusFilter,
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
    setFinancialYear(undefined);
    setStatusFilter(undefined);
    setPage(1);
    setAppliedFilters({
      searchTerm: "",
      financialYear: undefined,
      statusFilter: undefined,
    });
  };

  // --- AG GRID COLUMN DEFINITIONS ---
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Ref No. & Item",
        field: "procurementRefNo",
        flex: 1.5,
        minWidth: 200,
        cellRenderer: (params: any) => {
          if (!params.data) return null;
          return (
            <div className="flex flex-col justify-center h-full">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-primary shrink-0" />
                <span className="font-semibold text-sm whitespace-nowrap">
                  {params.data.procurementRefNo}
                </span>
              </div>
              <span
                className="text-xs text-muted-foreground mt-1 truncate max-w-50"
                title={params.data.itemName}
              >
                {params.data.itemName}
              </span>
            </div>
          );
        },
      },
      { headerName: "Financial Year", field: "financialYear", flex: 1, minWidth: 130 },
      {
        headerName: "Demand From",
        flex: 1,
        minWidth: 150,
        cellRenderer: (params: any) => {
          const row = params.data;
          if (!row) return "N/A";
          let label = row.demandFrom || "N/A";
          let Icon = MapPin;
          if (row.demandFrom === "Districts" && row.districtId) {
            const dist = districts.find((d: any) => d.id === row.districtId);
            label = dist ? dist.name : "Loading District...";
            Icon = MapPin;
          } else if (
            row.demandFrom === "Other Departments" &&
            row.departmentId
          ) {
            const dept = departments.find((d: any) => d.id === row.departmentId);
            label = dept ? dept.name : "Loading Department...";
            Icon = Building2;
          }
          return (
            <div className="flex items-center gap-1 text-sm whitespace-nowrap h-full">
              <Icon className="size-3 text-muted-foreground shrink-0" />
              {label}
            </div>
          );
        },
      },
      {
        headerName: "Total Quantity",
        field: "totalQuantity",
        flex: 1,
        minWidth: 120,
        valueFormatter: (params) => params.value ?? "0",
      },
      {
        headerName: "Award Cost (Lakhs)",
        field: "awardCostInclGstLakhs",
        flex: 1,
        minWidth: 150,
        valueFormatter: (params) =>
          `₹${params.value?.toLocaleString("en-IN") || "0"}`,
      },
      {
        headerName: "Current Status",
        field: "status",
        flex: 1,
        minWidth: 120,
        cellRenderer: (params: any) => {
          const status = params.value;
          if (!status) return null;
          const colorClasses =
            statusColors[status] ?? "bg-muted text-foreground";
          return (
            <div className="flex items-center h-full">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses}`}
              >
                {status}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Actions",
        flex: 0.8,
        minWidth: 100,
        sortable: false,
        filter: false,
        pinned: "right",
        cellRenderer: (params: any) => {
          if (!params.data) return null;
          return (
            <div className="flex items-center h-full">
              <Link
                to={`/procurement-detail/${params.data.id}`}
                title="View"
                className="inline-flex items-center justify-center size-9 text-primary hover:bg-info-muted rounded-lg transition-colors"
              >
                <Eye className="size-4" />
              </Link>
            </div>
          );
        },
      },
    ],
    [districts, departments],
  );

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold text-primary">
            Procurement List
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse and manage all procurement records
          </p>
        </div>
        <Button
          onClick={() => navigate("/procurement/new")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap"
        >
          <Plus className="size-4" />
          New Procurement
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm space-y-4 w-full">
        {/* Search Bar */}
        <Input
          size="large"
          placeholder="Search Item Name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onPressEnter={handleSearchSubmit}
          prefix={<Search className="size-5 text-muted-foreground mr-2" />}
          className="w-full"
        />

        {/* Filter Section */}
        <div className="flex items-center gap-2 mb-2">
          <Filter className="size-4 text-primary" />
          <h3 className="font-semibold text-sm">Global Filters</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Financial Year
            </label>
            <Select
              value={financialYear}
              onChange={setFinancialYear}
              placeholder="All Financial Years"
              className="w-full"
              allowClear
              options={[
                { label: "2025-26", value: "2025-26" },
                { label: "2024-25", value: "2024-25" },
                { label: "2023-24", value: "2023-24" },
              ]}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Status
            </label>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="All Statuses"
              className="w-full"
              allowClear
              options={[
                { label: "Pending PSC", value: "Pending PSC" },
                { label: "In Progress", value: "In Progress" },
                { label: "Completed", value: "Completed" },
              ]}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              &nbsp;
            </label>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleReset}
                className="flex-1"
              >
                <RotateCcw className="size-4" />
                Reset
              </Button>
              <Button onClick={handleSearchSubmit} className="flex-1">
                <Search className="size-4" />
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count & Page Size */}
        <div className="pt-2 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-primary">
              {procurementItems.length}
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
                setPage(1);
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

      {/* Table Content */}
      <div className="w-full">
        {isLoading ? (
          <div className="bg-card border border-border rounded-xl shadow-sm p-8">
            <Spinner label="Loading procurement data..." />
          </div>
        ) : isError ? (
          <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-center text-destructive font-medium">
            Failed to fetch procurement records. Please try again.
          </div>
        ) : procurementItems.length === 0 ? (
          <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-center text-muted-foreground">
            No procurement records found.
          </div>
        ) : (
          <Table
            rowData={procurementItems}
            columnDefs={columnDefs}
            totalCount={totalItems}
            page={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
            rowHeight={64}
          />
        )}
      </div>
    </div>
  );
}
