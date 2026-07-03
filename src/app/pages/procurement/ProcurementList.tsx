import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Search, RotateCcw, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { Input, Select } from "antd";
import type { ColDef } from "ag-grid-community";
import { Table } from "../../components/Table";

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
    queryKey: ["procurements", page, appliedFilters],
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
      { headerName: "Procurement Ref No", field: "procurementRefNo", flex: 1 },
      { headerName: "Financial Year", field: "financialYear", flex: 1 },
      { headerName: "Item Name", field: "itemName", flex: 1 },
      {
        headerName: "Demand From",
        flex: 1,
        valueGetter: (params) => {
          const row = params.data;
          if (!row) return "N/A";
          if (row.demandFrom === "Districts" && row.districtId) {
            const dist = districts.find((d: any) => d.id === row.districtId);
            return dist ? dist.name : "Loading District...";
          }
          if (row.demandFrom === "Other Departments" && row.departmentId) {
            const dept = departments.find(
              (d: any) => d.id === row.departmentId,
            );
            return dept ? dept.name : "Loading Department...";
          }
          return row.demandFrom || "N/A";
        },
      },
      {
        headerName: "Total Quantity",
        field: "totalQuantity",
        flex: 1,
        valueFormatter: (params) => params.value ?? "0",
      },
      {
        headerName: "Award Cost (Lakhs)",
        field: "awardCostInclGstLakhs",
        flex: 1,
        valueFormatter: (params) =>
          `₹${params.value?.toLocaleString("en-IN") || "0"}`,
      },
      {
        headerName: "Current Status",
        field: "status",
        flex: 1,
        cellRenderer: (params: any) => {
          const status = params.value;
          if (!status) return null;
          const colorClasses =
            statusColors[status] ?? "bg-gray-100 text-gray-800";
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses}`}
            >
              {status}
            </span>
          );
        },
      },
    ],
    [districts, departments],
  );

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[30px] font-bold text-primary">
            Procurement List
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse and manage all procurement records
          </p>
        </div>
        <button
          onClick={() => navigate("/procurement/new")}
          className="px-4 py-2 cursor-pointer bg-[#FF5B1A] hover:bg-opacity-90 text-white rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
        >
          <Plus className="size-4" />
          New Procurement
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <Input
          prefix={<Search className="size-4 text-muted-foreground mr-2" />}
          placeholder="Search Item Name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onPressEnter={handleSearchSubmit}
          size="large"
          className="w-full"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            value={financialYear}
            onChange={setFinancialYear}
            placeholder="All Financial Years"
            size="large"
            allowClear
            options={[
              { label: "2025-26", value: "2025-26" },
              { label: "2024-25", value: "2024-25" },
              { label: "2023-24", value: "2023-24" },
            ]}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="All Statuses"
            size="large"
            allowClear
            options={[
              { label: "Pending PSC", value: "Pending PSC" },
              { label: "In Progress", value: "In Progress" },
              { label: "Completed", value: "Completed" },
            ]}
          />
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-sm flex-1"
            >
              <RotateCcw className="size-4" />
              Reset
            </button>
            <button
              onClick={handleSearchSubmit}
              className="px-4 py-2 cursor-pointer bg-primary hover:bg-opacity-90 text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-sm flex-1"
            >
              <Search className="size-4" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="w-full">
        {isLoading ? (
          <div className="bg-white border border-border rounded-xl shadow-sm p-8 text-center text-muted-foreground">
            Loading procurement data...
          </div>
        ) : isError ? (
          <div className="bg-white border border-border rounded-xl shadow-sm p-8 text-center text-red-500 font-medium">
            Failed to fetch procurement records. Please try again.
          </div>
        ) : procurementItems.length === 0 ? (
          <div className="bg-white border border-border rounded-xl shadow-sm p-8 text-center text-muted-foreground">
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
          />
        )}
      </div>
    </div>
  );
}
