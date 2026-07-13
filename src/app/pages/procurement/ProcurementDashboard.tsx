import { useState, useMemo } from "react";
import { ShoppingCart, IndianRupee, Building2 } from "lucide-react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { Select } from "antd";
import type { ColDef } from "ag-grid-community";
import { Table } from "../../components/Table"; // Adjust the path to where your Table component is saved
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";

// --- TypeScript Interfaces ---
export interface ProcurementItem {
  id: string | number;
  procurementRefNo: string;
  financialYear: string;
  itemName: string;
  demandFrom?: string;
  vendor?: string;
  awardCostInclGstLakhs?: number;
  deliveryPct: number;
  status: string;
}

export interface ProcurementResponse {
  items: ProcurementItem[];
  totalCount?: number;
  hasNextPage?: boolean;
}

export interface DashboardResponse {
  totalProcuredItems: number;
  budgetApproved: number;
  budgetSpent: number;
  topBeneficiaryDepartment: string;
}

export function ProcurementDashboard() {
  const axiosPrivate = useAxiosPrivate();

  // Filter States
  const [financialYear, setFinancialYear] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [department, setDepartment] = useState<string>("");

  // Pagination States
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // Fetch Districts for Dropdown
  const { data: districtsData, isLoading: isDistrictsLoading } = useQuery({
    queryKey: ["districts"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/districts", {
        params: { page: 1, pageSize: 100 },
      });
      return response.data?.items || [];
    },
  });

  // Map district API data to Antd Select options
  const districtOptions = [
    { value: "", label: "All Districts" },
    ...((Array.isArray(districtsData) &&
      districtsData?.map((dist: any) => ({
        value: dist.id,
        label: dist.name,
      }))) ||
      []),
  ];

  // Fetch Line Departments for Dropdown
  const { data: lineDepartmentsData, isLoading: isLineDepartmentsLoading } =
    useQuery({
      queryKey: ["lineDepartments"],
      queryFn: async () => {
        const response = await axiosPrivate.get(
          "/api/v1/masters/line-departments",
          {
            params: { page: 1, pageSize: 100 },
          },
        );
        return response.data?.items || [];
      },
    });

  // Map line department API data to Antd Select options
  const lineDepartmentOptions = [
    { value: "", label: "All Departments" },
    ...((Array.isArray(lineDepartmentsData) &&
      lineDepartmentsData?.map((dept: any) => ({
        value: dept.id,
        label: dept.name,
      }))) ||
      []),
  ];

  // Fetch Table Data
  const { data, isLoading, isError } = useQuery<ProcurementResponse, Error>({
    queryKey: [
      "procurements",
      page,
      pageSize,
      financialYear,
      district,
      department,
    ],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Procurements", {
        params: {
          Page: page,
          PageSize: pageSize,
          financialYear: financialYear || undefined,
          districtId: district || undefined,
          lineDepartmentId: department || undefined,
        },
      });
      return response.data;
    },
  });

  // Fetch Dashboard KPI Data
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery<
    DashboardResponse,
    Error
  >({
    queryKey: ["procurementDashboard", financialYear, district, department],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        "/api/v1/Procurements/dashboard",
        {
          params: {
            financialYear: financialYear || undefined,
            districtId: district || undefined,
            lineDepartmentId: department || undefined,
          },
        },
      );
      return response.data;
    },
  });

  const procurements: ProcurementItem[] = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // Helper for formatting currency
  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <span className="px-2 py-1 bg-success-muted text-success-muted-foreground rounded-full text-xs font-medium whitespace-nowrap">
            Completed
          </span>
        );
      case "In Progress":
      case "ProposalScrutiny":
      case "Pending PSC":
        return (
          <span className="px-2 py-1 bg-info-muted text-info-muted-foreground rounded-full text-xs font-medium whitespace-nowrap">
            {status}
          </span>
        );
      case "Draft":
        return (
          <span className="px-2 py-1 bg-muted text-foreground rounded-full text-xs font-medium whitespace-nowrap">
            Draft
          </span>
        );
      case "Delayed":
        return (
          <span className="px-2 py-1 bg-destructive-muted text-destructive-muted-foreground rounded-full text-xs font-medium whitespace-nowrap">
            Delayed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-muted text-foreground rounded-full text-xs font-medium whitespace-nowrap">
            {status || "Unknown"}
          </span>
        );
    }
  };

  // AG Grid Column Definitions
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: "procurementRefNo",
        headerName: "Procurement ID",
        minWidth: 150,
      },
      { field: "financialYear", headerName: "Financial Year", minWidth: 130 },
      { field: "itemName", headerName: "Item Name", minWidth: 200, flex: 1 },
      {
        field: "demandFrom",
        headerName: "Demand From",
        valueFormatter: (params) => params.value || "-",
      },
      {
        field: "vendor",
        headerName: "Vendor Name",
        valueFormatter: (params) => params.value || "Pending",
      },
      {
        field: "awardCostInclGstLakhs",
        headerName: "Award Cost (Lakhs)",
        valueFormatter: (params) => `₹${params.value?.toFixed(2) || "0.00"}`,
      },
      {
        field: "deliveryPct",
        headerName: "Delivery %",
        minWidth: 150,
        cellRenderer: (params: any) => (
          <div className="flex items-center gap-2 h-full">
            <div className="w-full bg-muted rounded-full h-1.5 max-w-15">
              <div
                className="bg-primary h-1.5 rounded-full"
                style={{ width: `${params.value}%` }}
              ></div>
            </div>
            <span className="text-xs text-muted-foreground">
              {params.value}%
            </span>
          </div>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        cellRenderer: (params: any) => (
          <div className="flex items-center h-full">
            {getStatusBadge(params.value)}
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[30px] font-bold text-primary">
            Procurement Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Summary view of all procurement records
          </p>
        </div>
      </div>

      {/* Top Filter Section */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Financial Year
            </label>
            <Select
              value={financialYear}
              onChange={(value) => setFinancialYear(value)}
              className="w-full h-10"
              options={[
                { value: "", label: "All Years" },
                { value: "2025-26", label: "2025-26" },
                { value: "2024-25", label: "2024-25" },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">District</label>
            <Select
              value={district}
              onChange={(value) => setDistrict(value)}
              className="w-full h-10"
              options={districtOptions}
              loading={isDistrictsLoading}
              disabled={isDistrictsLoading}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Line Department
            </label>
            <Select
              value={department}
              onChange={(value) => setDepartment(value)}
              className="w-full h-10"
              options={lineDepartmentOptions}
              loading={isLineDepartmentsLoading}
              disabled={isLineDepartmentsLoading}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setFinancialYear("");
              setDistrict("");
              setDepartment("");
              setPage(1);
            }}
          >
            Reset Filter
          </Button>
          <Button size="lg" onClick={() => setPage(1)}>
            Apply Filter
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI Cards Remain Unchanged */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-info-muted text-info p-2 rounded-lg">
              <ShoppingCart className="size-5" />
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">
            {isDashboardLoading
              ? "..."
              : dashboardData?.totalProcuredItems?.toLocaleString() || "0"}
          </div>
          <div className="text-xs text-muted-foreground">
            Total Procured Items
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-success-muted text-success p-2 rounded-lg">
              <IndianRupee className="size-5" />
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">
            {isDashboardLoading
              ? "..."
              : formatCurrency(dashboardData?.budgetApproved)}
          </div>
          <div className="text-xs text-muted-foreground">Budget Approved</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-warning-muted text-warning p-2 rounded-lg">
              <IndianRupee className="size-5" />
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">
            {isDashboardLoading
              ? "..."
              : formatCurrency(dashboardData?.budgetSpent)}
          </div>
          <div className="text-xs text-muted-foreground">Budget Spent</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-category-6/10 text-category-6 p-2 rounded-lg">
              <Building2 className="size-5" />
            </div>
          </div>
          <div className="text-lg font-bold mb-1 line-clamp-1">
            {isDashboardLoading
              ? "..."
              : dashboardData?.topBeneficiaryDepartment || "N/A"}
          </div>
          <div className="text-xs text-muted-foreground">
            Highest Beneficiary Department
          </div>
        </div>
      </div>

      {/* Procurement Table Header */}
      <div className="flex justify-between items-center mt-6 mb-2">
        <h2 className="text-lg font-semibold text-primary">
          Procurement Records
        </h2>
      </div>

      {/* Render the Custom AG Grid Table Component */}
      {isLoading ? (
        <div className="bg-card border border-border rounded-xl p-8">
          <Spinner label="Loading procurement records..." />
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-destructive bg-card border border-border rounded-xl">
          Failed to load records. Please try again.
        </div>
      ) : (
        <Table
          rowData={procurements}
          columnDefs={columnDefs}
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </div>
  );
}
