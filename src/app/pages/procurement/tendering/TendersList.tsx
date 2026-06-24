import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { Plus, Search, Eye, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import type { ColDef } from "ag-grid-community";
import { Table } from "../../../components/Table"; // Adjust import path to your custom Table component
import { cn } from "../../../../utils/utils";
import { buttonVariants } from "../../../components/ui/button";

export function TendersList() {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  // Search & Pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [tenderPage, setTenderPage] = useState(1);
  const [tenderPageSize] = useState(10);

  const [procurementPage, setProcurementPage] = useState(1);
  const [procurementPageSize] = useState(10);

  // --- QUERIES ---

  const {
    data: tenders = [],
    isLoading: isTendersLoading,
    isError: isTendersError,
  } = useQuery({
    queryKey: ["procurement-tenders"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/procurement-tenders");
      return response.data;
    },
  });

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
    if (row.demandFrom === "Districts" && row.districtId) {
      const dist = districts.find((d: any) => d.id === row.districtId);
      return dist ? `${dist.name}` : "Loading District...";
    }
    if (row.demandFrom === "Other Departments" && row.departmentId) {
      const dept = departments.find((d: any) => d.id === row.departmentId);
      return dept ? `${dept.name}` : "Loading Department...";
    }
    return row.demandFrom || "N/A";
  };

  const getStatusStyles = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (
      s.includes("published") ||
      s.includes("active") ||
      s.includes("approved")
    ) {
      return "bg-green-100 text-green-700 border-green-200";
    }
    if (
      s.includes("closed") ||
      s.includes("rejected") ||
      s.includes("cancelled")
    ) {
      return "bg-red-100 text-red-700 border-red-200";
    }
    if (s.includes("draft") || s.includes("pending")) {
      return "bg-amber-100 text-amber-700 border-amber-200";
    }
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  // Local filtering for Tenders
  const filteredTenders = useMemo(() => {
    return tenders
      .filter((tender: any) => tender.status !== "Completed")
      .filter((tender: any) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          tender.tenderTitle?.toLowerCase().includes(searchLower) ||
          tender.tenderRefNo?.toLowerCase().includes(searchLower) ||
          tender.tenderCode?.toLowerCase().includes(searchLower) ||
          tender.organizationChain?.toLowerCase().includes(searchLower)
        );
      });
  }, [tenders, searchTerm]);

  // Local pagination calculation for Tenders
  const tenderTotalCount = filteredTenders.length;
  const tenderTotalPages = Math.ceil(tenderTotalCount / tenderPageSize) || 1;
  const paginatedTenders = filteredTenders.slice(
    (tenderPage - 1) * tenderPageSize,
    tenderPage * tenderPageSize,
  );

  const procurementItems = procurementResponse?.items ?? [];
  const procurementTotalCount = procurementResponse?.totalCount ?? 0;
  const procurementTotalPages = procurementResponse?.totalPages ?? 1;

  // --- MUTATION ---

  const markForClosureMutation = useMutation({
    mutationFn: async (procurementId: string) => {
      const response = await axiosPrivate.post(
        `/api/v1/Procurements/${procurementId}/committees/5/decision`,
        {
          approved: true,
          decisionDate: new Date().toISOString(),
          documentId: null,
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procurements"] });
    },
    onError: (error) => {
      console.error("Error marking procurement for closure:", error);
    },
  });

  // --- COLUMN DEFINITIONS ---

  const tenderColDefs = useMemo<ColDef[]>(
    () => [
      {
        field: "tenderTitle",
        headerName: "Tender Title",
        flex: 1,
        minWidth: 200,
      },
      { field: "tenderRefNo", headerName: "Tender Ref No" },
      { field: "tenderCode", headerName: "Tender ID" },
      { field: "organisationChain", headerName: "Organizational Chain" },
      {
        field: "status",
        headerName: "Status",
        cellRenderer: (params: any) => (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyles(
              params.value,
            )}`}
          >
            {params.value || "Unknown"}
          </span>
        ),
      },
      {
        headerName: "View",
        width: 100,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => (
          <button
            onClick={() =>
              navigate(
                `/procurement-tendering/tenders/${params.data.id || params.data.procurementId}`,
              )
            }
            className="p-2 inline-flex justify-center hover:bg-muted rounded-lg text-muted-foreground hover:text-[#0B1F4D] transition-colors"
            title="View Details"
          >
            <Eye className="size-4" />
          </button>
        ),
      },
    ],
    [navigate],
  );

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
        field: "totalQuantity",
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
          const isPending =
            markForClosureMutation.isPending &&
            markForClosureMutation.variables === row.id;
          return (
            <button
              onClick={() => markForClosureMutation.mutate(row.id)}
              disabled={isPending}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              title="Mark for Closure"
            >
              {isPending ? "Processing..." : "Mark for Closure"}
            </button>
          );
        },
      },
    ],
    [districts, departments, markForClosureMutation],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F4D]">Tenders</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all procurement tenders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/procurement-tendering/new"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <Plus className="size-4" />
            <span className="font-medium">New Tender</span>
          </Link>
        </div>
      </div>

      {/* --- TABLE 1: ALL TENDERS --- */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-[#0B1F4D]">All Tenders</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tenders..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setTenderPage(1); // Reset to first page on new search
              }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20"
            />
          </div>
        </div>

        {isTendersLoading ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-border text-muted-foreground">
            <Loader2 className="size-6 animate-spin mb-2 text-[#1E5AA8]" />
            <p>Loading tenders...</p>
          </div>
        ) : isTendersError ? (
          <div className="p-8 text-center bg-white rounded-xl border border-border text-red-500">
            Failed to load tenders. Please try again later.
          </div>
        ) : (
          <Table
            rowData={paginatedTenders}
            columnDefs={tenderColDefs}
            totalCount={tenderTotalCount}
            page={tenderPage}
            totalPages={tenderTotalPages}
            onPageChange={setTenderPage}
          />
        )}
      </div>

      {/* --- TABLE 2: PROCUREMENT RECORDS --- */}
      <div className="space-y-4 mt-8">
        <h2 className="text-lg font-semibold text-[#0B1F4D]">
          Pending Procurement Records
        </h2>

        {isProcurementLoading ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-border text-muted-foreground">
            <Loader2 className="size-6 animate-spin mb-2 text-[#1E5AA8]" />
            <p>Loading procurement data...</p>
          </div>
        ) : isProcurementError ? (
          <div className="p-8 text-center bg-white rounded-xl border border-border text-red-500">
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
