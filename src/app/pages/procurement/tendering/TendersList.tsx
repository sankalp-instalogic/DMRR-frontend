import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Plus, Search, Eye, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

export function TendersList() {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const queryClient = useQueryClient();

  // Fetch data using React Query
  const {
    data: tenders = [],
    isLoading,
    isError,
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
    queryKey: ["procurements", page],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Procurements", {
        params: {
          Page: page,
          PageSize: pageSize,
          status: "Approved - Tendering",
        },
      });
      return response.data;
    },
  });

  const procurementItems = procurementResponse?.items ?? [];
  const totalItems = procurementResponse?.totalCount ?? 0;
  const totalPages = procurementResponse?.totalPages ?? 1;

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

  // Helper function for dynamic badge colors
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
    // Default fallback styling
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  // Local search filtering & excluding completed status
  const filteredTenders = tenders
    .filter((tender: any) => {
      // 1. Exclude Completed tenders
      if (tender.status === "Completed") return false;

      // 2. Apply search filter
      const searchLower = searchTerm.toLowerCase();
      return (
        tender.tenderTitle?.toLowerCase().includes(searchLower) ||
        tender.tenderRefNo?.toLowerCase().includes(searchLower) ||
        tender.tenderCode?.toLowerCase().includes(searchLower) ||
        tender.organizationChain?.toLowerCase().includes(searchLower)
      );
    })
    .filter((item: any) => item.status !== "Completed");

  // Handler for closing a procurement record
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
      // Invalidate the 'procurements' query so the table refetches automatically
      queryClient.invalidateQueries({ queryKey: ["procurements"] });
    },
    onError: (error) => {
      console.error("Error marking procurement for closure:", error);
      // You can also add a toast notification here
    },
  });

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
            className="flex items-center gap-2 bg-[#1E5AA8] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="size-4" />
            <span className="font-medium">New Tender</span>
          </Link>
        </div>
      </div>

      {/* --- TABLE 1: ALL TENDERS --- */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-semibold text-[#0B1F4D]">All Tenders</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tenders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium">Tender Title</th>
                <th className="px-6 py-3 font-medium">Tender Ref No</th>
                <th className="px-6 py-3 font-medium">Tender ID</th>
                <th className="px-6 py-3 font-medium">Organizational Chain</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-center">View</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    <Loader2 className="size-6 animate-spin mx-auto mb-2 text-[#1E5AA8]" />
                    <p>Loading tenders...</p>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-red-500"
                  >
                    Failed to load tenders. Please try again later.
                  </td>
                </tr>
              ) : filteredTenders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No tenders found.
                  </td>
                </tr>
              ) : (
                filteredTenders.map((tender: any) => (
                  <tr
                    key={tender.id || tender.procurementId}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-[#0B1F4D] whitespace-nowrap">
                      {tender.tenderTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tender.tenderRefNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tender.tenderCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tender.organisationChain}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* --- STATUS BADGE ADDED HERE --- */}
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyles(
                          tender.status,
                        )}`}
                      >
                        {tender.status || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <button
                        onClick={() =>
                          navigate(
                            `/procurement-tendering/tenders/${tender.id}`,
                          )
                        }
                        className="p-2 inline-flex justify-center hover:bg-muted rounded-lg text-muted-foreground hover:text-[#0B1F4D] transition-colors"
                        title="View Details"
                      >
                        <Eye className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Tenders Pagination Footer */}
        {!isLoading && !isError && filteredTenders.length !== 0 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-gray-50/50">
            <span>
              Showing {filteredTenders.length > 0 ? 1 : 0} to{" "}
              {filteredTenders.length} of {tenders.length} tenders
            </span>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 border border-border rounded-md hover:bg-muted disabled:opacity-50 transition-colors"
                disabled
              >
                Previous
              </button>
              <button className="px-3 py-1 bg-[#1E5AA8] text-white rounded-md font-medium">
                1
              </button>
              <button
                className="px-3 py-1 border border-border rounded-md hover:bg-muted disabled:opacity-50 transition-colors"
                disabled
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- TABLE 2: PROCUREMENT RECORDS --- */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-gray-50/50">
          <h2 className="text-lg font-semibold text-[#0B1F4D]">
            Pending Procurement Records
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium">Procurement Ref No</th>
                <th className="px-6 py-3 font-medium">Financial Year</th>
                <th className="px-6 py-3 font-medium">Item Name</th>
                <th className="px-6 py-3 font-medium">Demand From</th>
                <th className="px-6 py-3 font-medium">Total Quantity</th>
                <th className="px-6 py-3 font-medium">Award Cost (Lakhs)</th>
                <th className="px-6 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isProcurementLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    <Loader2 className="size-6 animate-spin mx-auto mb-2 text-[#1E5AA8]" />
                    <p>Loading procurement data...</p>
                  </td>
                </tr>
              ) : isProcurementError ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-red-500 font-medium"
                  >
                    Failed to fetch procurement records. Please try again.
                  </td>
                </tr>
              ) : procurementItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No procurement records found.
                  </td>
                </tr>
              ) : (
                procurementItems.map((row: any) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-[#0B1F4D]">
                      {row.procurementRefNo || "N/A"}
                    </td>
                    <td className="px-6 py-4">{row.financialYear}</td>
                    <td className="px-6 py-4">{row.itemName}</td>
                    <td className="px-6 py-4">{getDemandLocationName(row)}</td>
                    <td className="px-6 py-4">{row.totalQuantity ?? 0}</td>
                    <td className="px-6 py-4 font-medium">
                      ₹
                      {row.awardCostInclGstLakhs?.toLocaleString("en-IN") ||
                        "0"}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => markForClosureMutation.mutate(row.id)}
                        disabled={
                          markForClosureMutation.isPending &&
                          markForClosureMutation.variables === row.id
                        }
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Mark for Closure"
                      >
                        {markForClosureMutation.isPending &&
                        markForClosureMutation.variables === row.id
                          ? "Processing..."
                          : "Mark for Closure"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Procurements Server-Side Pagination Footer */}
        {!isProcurementLoading &&
          !isProcurementError &&
          procurementItems.length > 0 && (
            <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-gray-50/50">
              <span>
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, totalItems)} of {totalItems} tenders
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="px-3 py-1 border border-border rounded-md hover:bg-muted disabled:opacity-50 transition-colors bg-white"
                  disabled={page === 1}
                >
                  Previous
                </button>
                <button className="px-3 py-1 bg-[#1E5AA8] text-white rounded-md font-medium">
                  {page}
                </button>
                <button
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className="px-3 py-1 border border-border rounded-md hover:bg-muted disabled:opacity-50 transition-colors cursor-pointer bg-white"
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
