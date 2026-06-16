import { useState } from "react";
import { Search, Filter, Download, FileText, Activity } from "lucide-react";

const auditLogs = [
  { id: 1, timestamp: "2025-06-15 10:30:45", user: "Ramesh Kumar", role: "PMU User", action: "Updated Compliance", before: "Pending", after: "Pass" },
  { id: 2, timestamp: "2025-06-15 11:15:20", user: "Admin", role: "System Admin", action: "Assigned Role", before: "None", after: "PAC Member" },
  { id: 3, timestamp: "2025-06-16 09:45:10", user: "Suresh P", role: "TAC Member", action: "Forwarded Proposal", before: "TAC Review", after: "SDMA Review" },
  { id: 4, timestamp: "2025-06-16 14:20:05", user: "Rahul M", role: "Accounts", action: "Fund Released", before: "Pending DMU", after: "Approved" },
];

export function AuditTrail() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleExport = (type) => {
    alert(`Exporting Audit Trail as ${type}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>System Audit Trail</h1>
          <p className="text-sm text-muted-foreground">Track all system activities and data changes</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('PDF')} className="px-4 py-2 border border-border rounded-lg flex items-center gap-2 hover:bg-muted text-sm"><FileText className="size-4"/> Export PDF</button>
          <button onClick={() => handleExport('Excel')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 hover:opacity-90 text-sm"><Download className="size-4"/> Export Excel</button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by User, Role, Action..."
            className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button className="px-4 py-2 bg-muted rounded-lg flex items-center gap-2 hover:bg-muted/80">
          <Filter className="size-5" /> Filters
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm">Timestamp</th>
                <th className="px-6 py-4 text-left text-sm">User</th>
                <th className="px-6 py-4 text-left text-sm">Role</th>
                <th className="px-6 py-4 text-left text-sm">Action</th>
                <th className="px-6 py-4 text-left text-sm">Before Value</th>
                <th className="px-6 py-4 text-left text-sm">After Value</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.filter(l => l.user.toLowerCase().includes(searchTerm.toLowerCase()) || l.action.toLowerCase().includes(searchTerm.toLowerCase())).map((log) => (
                <tr key={log.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{log.timestamp}</td>
                  <td className="px-6 py-4 text-sm font-medium">{log.user}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-secondary/10 text-secondary rounded text-xs">
                      {log.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm flex items-center gap-2"><Activity className="size-3 text-accent" />{log.action}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground line-through">{log.before}</td>
                  <td className="px-6 py-4 text-sm font-medium text-primary">{log.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}