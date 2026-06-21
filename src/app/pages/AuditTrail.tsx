import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  FileText,
  Activity,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

export function AuditTrail() {
  const axiosPrivate = useAxiosPrivate();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchAuditLogs = async () => {
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

  const handleExport = (type: any) => {
    alert(`Exporting Audit Trail as ${type}`);
  };

  // Using your new payload structure (data.items)
  const auditLogs = data?.items || [];
  const totalPages = data?.totalPages || 1;

  // Updated filter to match the new keys
  const filteredLogs = auditLogs.filter(
    (l: any) =>
      (l.userName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (l.action?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (l.entity?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
  );

  // Helper to format the UTC timestamp into a readable local string
  const formatDate = (utcString: any) => {
    return new Date(utcString).toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

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

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm">Timestamp</th>
                <th className="px-6 py-4 text-left text-sm">User</th>
                <th className="px-6 py-4 text-left text-sm">Role</th>
                <th className="px-6 py-4 text-left text-sm">Action</th>
                <th className="px-6 py-4 text-left text-sm">Entity</th>
                <th className="px-6 py-4 text-left text-sm">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    <Loader2 className="size-6 animate-spin mx-auto mb-2" />
                    Loading audit logs...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-red-500"
                  >
                    Failed to load audit logs:{" "}
                    {error?.message || "Unknown error"}
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log: any) => (
                  <tr
                    key={log.entityId}
                    className="border-t border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-muted-foreground whitespace-nowrap">
                      {formatDate(log.timestampUtc)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {log.userName || (
                        <span className="text-muted-foreground italic">
                          System
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {log.role ? (
                        <span className="px-2 py-1 bg-secondary/10 text-secondary rounded text-xs">
                          {log.role}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm flex items-center gap-2">
                      <Activity className="size-3 text-accent" />
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {log.entity}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {log.remarks || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card">
          <div className="text-sm text-muted-foreground">
            Showing Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((old) => Math.max(old - 1, 1))}
              disabled={page === 1 || isLoading}
              className="p-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => setPage((old) => old + 1)}
              disabled={page >= totalPages || isLoading}
              className="p-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
