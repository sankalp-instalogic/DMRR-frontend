import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {  Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import type { ColDef } from "ag-grid-community";
import { Table } from "../../../components/Table";
import { Button } from "../../../components/ui/button";
import { Spinner } from "../../../components/ui/spinner";

export function TendersList() {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  // Search & Pagination states

  const [procurementPage, setProcurementPage] = useState(1);
  const [procurementPageSize] = useState(10);

  const {
    data: procurementResponse,
    isLoading: isProcurementLoading,
    isError: isProcurementError,
  } = useQuery({
    queryKey: ["procurements", procurementPage],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Procurements", {
        params: {
          Page: procurementPage,
          PageSize: procurementPageSize,
          status: "Approved - Tendering",
        },
      });
      return response.data;
    },
  });

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
        { params: { page: 1, pageSize: 100 } },
      );
      return response.data;
    },
  });

  // --- DATA PREPARATION ---

  const districts = districtsData?.items ?? [];
  const departments = deptData?.items ?? [];

  const getDemandLocationName = (row: any) => {
    if (row.demandFrom === "Districts" && row.beneficiaryDistrictId) {
      const dist = districts.find(
        (d: any) => d.id === row.beneficiaryDistrictId,
      );
      return dist ? `${dist.name}` : "Loading District...";
    }
    if (row.demandFrom === "Other Departments" && row.beneficiaryDepartmentId) {
      const dept = departments.find(
        (d: any) => d.id === row.beneficiaryDepartmentId,
      );
      return dept ? `${dept.name}` : "Loading Department...";
    }
    return row.demandFrom || "N/A";
  };

  const procurementItems = procurementResponse?.items ?? [];
  const procurementTotalCount = procurementResponse?.totalCount ?? 0;
  const procurementTotalPages = procurementResponse?.totalPages ?? 1;


  const procurementColDefs = useMemo<ColDef[]>(
    () => [
      {
        field: "procurementRefNo",
        headerName: "Procurement Ref No",
        valueFormatter: (p) => p.value || "N/A",
      },
      { field: "financialYear", headerName: "Financial Year" },
      { field: "itemName", headerName: "Item Name", flex: 1, minWidth: 200 },
      {
        headerName: "Demand From",
        valueGetter: (params) => getDemandLocationName(params.data),
      },
      {
        field: "quantity",
        headerName: "Total Quantity",
        valueFormatter: (p) => p.value ?? 0,
      },
      {
        field: "awardCostInclGstLakhs",
        headerName: "Award Cost (Lakhs)",
        valueFormatter: (p) => `₹${p.value?.toLocaleString("en-IN") || "0"}`,
      },
      {
        headerName: "Action",
        width: 180,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => {
          const row = params.data;

          return (
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                navigate(`/procurement-tendering/tenders/procurement/${row.id}`)
              }
              className="text-muted-foreground hover:text-primary"
              title="View Details"
            >
              <Eye className="size-4" />
            </Button>
          );
        },
      },
    ],
    [districts, departments, navigate],
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold text-primary">Tenders</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all procurement tenders
          </p>
        </div>
      </div>

      {/* --- TABLE 2: PROCUREMENT RECORDS --- */}
      <div className="space-y-4 mt-8">
        <h2 className="text-lg font-semibold text-primary">
          Procurement Tenders
        </h2>

        {isProcurementLoading ? (
          <div className="p-8 bg-card rounded-xl border border-border">
            <Spinner iconClassName="size-6" label="Loading procurement data..." />
          </div>
        ) : isProcurementError ? (
          <div className="p-8 text-center bg-card rounded-xl border border-border text-destructive">
            Failed to fetch procurement records. Please try again.
          </div>
        ) : (
          <Table
            rowData={procurementItems}
            columnDefs={procurementColDefs}
            totalCount={procurementTotalCount}
            page={procurementPage}
            totalPages={procurementTotalPages}
            onPageChange={setProcurementPage}
          />
        )}
      </div>
    </div>
  );
}
