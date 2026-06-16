import { Plus, Edit2, IndianRupee } from "lucide-react";

const budgets = [
  { fy: "2025-26", district: "Mumbai", allocated: "₹450 Cr", utilized: "₹387 Cr", remaining: "₹63 Cr", utilization: 86 },
  { fy: "2025-26", district: "Pune", allocated: "₹380 Cr", utilized: "₹298 Cr", remaining: "₹82 Cr", utilization: 78 },
  { fy: "2025-26", district: "Nagpur", allocated: "₹290 Cr", utilized: "₹234 Cr", remaining: "₹56 Cr", utilization: 81 },
];

export function BudgetMaster() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Budget Master</h1>
          <p className="text-sm text-muted-foreground">Manage budget allocations</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 hover:opacity-90">
          <Plus className="size-5" />
          Add Budget Entry
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm">Financial Year</th>
                <th className="px-6 py-4 text-left text-sm">District</th>
                <th className="px-6 py-4 text-left text-sm">Allocated</th>
                <th className="px-6 py-4 text-left text-sm">Utilized</th>
                <th className="px-6 py-4 text-left text-sm">Remaining</th>
                <th className="px-6 py-4 text-left text-sm">Utilization %</th>
                <th className="px-6 py-4 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget, index) => (
                <tr key={index} className="border-t border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium">{budget.fy}</td>
                  <td className="px-6 py-4">{budget.district}</td>
                  <td className="px-6 py-4">{budget.allocated}</td>
                  <td className="px-6 py-4 text-accent">{budget.utilized}</td>
                  <td className="px-6 py-4">{budget.remaining}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full"
                          style={{ width: `${budget.utilization}%` }}
                        />
                      </div>
                      <span className="text-sm">{budget.utilization}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-muted rounded">
                      <Edit2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
