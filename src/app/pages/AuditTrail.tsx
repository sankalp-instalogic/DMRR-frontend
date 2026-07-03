import { useMemo, useState } from "react";
import { Activity, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Table } from "../components/Table";
import dateFormatter from "../../utils/dateFormatter"

interface AuditLog {
  timestampUtc: string;
  userName?: string | null;
  role?: string | null;
  action?: string | null;
  entity?: string | null;
  remarks?: string | null;
}

interface AuditResponse {
  items: AuditLog[];
  totalCount: number;
  totalPages: number;
}

export function AuditTrail() {
  const axiosPrivate = useAxiosPrivate();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchAuditLogs = async (): Promise<AuditResponse> => {
    const response = await axiosPrivate.get("/api/v1/Audit", {
      params: {
        Page: page,
        PageSize: pageSize,
      },
    });
    return response.data;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["auditLogs", page, pageSize],
    queryFn: fetchAuditLogs,
    placeholderData: (previousData) => previousData,
  });

  // Using your new payload structure (data.items)
  const auditLogs = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.totalCount || 0;

  // Updated filter to match the new keys
  const filteredLogs = auditLogs.filter(
    (l) =>
      (l.userName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (l.action?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (l.entity?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
  );

  const columnDefs = useMemo<ColDef<AuditLog>[]>(
    () => [
      {
        field: "timestampUtc",
        headerName: "Timestamp",
        flex: 1.4,
        minWidth: 190,
        valueFormatter: (params) =>
          params.value ? dateFormatter(params.value) : "-",
      },
      {
        field: "userName",
        headerName: "User",
        flex: 1,
        minWidth: 140,
        cellRenderer: (params: ICellRendererParams<AuditLog>) => (
          <span
            className={
              !params.value ? "text-muted-foreground italic" : undefined
            }
          >
            {params.value || "System"}
          </span>
        ),
      },
      {
        field: "role",
        headerName: "Role",
        flex: 1,
        minWidth: 120,
        cellRenderer: (params: ICellRendererParams<AuditLog>) =>
          params.value ? (
            <span className="px-2 py-1 bg-secondary/10 text-secondary rounded text-xs">
              {params.value}
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          ),
      },
      {
        field: "action",
        headerName: "Action",
        flex: 1.2,
        minWidth: 150,
        cellRenderer: (params: ICellRendererParams<AuditLog>) => (
          <div className="flex items-center gap-2 h-full">
            <Activity className="size-3 text-accent shrink-0" />
            <span>{params.value || "-"}</span>
          </div>
        ),
      },
      {
        field: "entity",
        headerName: "Entity",
        flex: 1,
        minWidth: 130,
        valueFormatter: (params) => params.value || "-",
      },
      {
        field: "remarks",
        headerName: "Remarks",
        flex: 1.5,
        minWidth: 180,
        valueFormatter: (params) => params.value || "-",
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>System Audit Trail</h1>
          <p className="text-sm text-muted-foreground">
            Track all system activities and data changes
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by User, Action, or Entity..."
            className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground border border-border rounded-xl bg-card">
          Loading audit logs...
        </div>
      ) : isError ? (
        <div className="p-12 text-center text-red-500 border border-border rounded-xl bg-card">
          {(error as Error)?.message || "Failed to load audit logs."}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground border border-border rounded-xl bg-card">
          No audit logs found.
        </div>
      ) : (
        <Table
          rowData={filteredLogs}
          columnDefs={columnDefs}
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          rowHeight={56}
        />
      )}
    </div>
  );
}
