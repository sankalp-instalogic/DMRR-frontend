import { TrendingDown, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";

const districts = [
  { name: "Mumbai", allocated: 450, committed: 467, exceeded: 17, priority: "High" },
  { name: "Pune", allocated: 380, committed: 398, exceeded: 18, priority: "Medium" },
  { name: "Nagpur", allocated: 290, committed: 278, exceeded: 0, priority: "Low" },
  { name: "Nashik", allocated: 245, committed: 256, exceeded: 11, priority: "Medium" },
];

export function BudgetRationalization() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Budget Rationalization</h1>
        <p className="text-sm text-muted-foreground">Optimize district-wise budget allocation</p>
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-sm text-muted-foreground mb-1">Total Allocated</div>
          <div className="text-2xl font-bold">₹1,365 Cr</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-sm text-muted-foreground mb-1">Total Committed</div>
          <div className="text-2xl font-bold">₹1,399 Cr</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-sm text-muted-foreground mb-1">Exceeded Amount</div>
          <div className="text-2xl font-bold text-destructive">₹46 Cr</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-sm text-muted-foreground mb-1">Districts Over Budget</div>
          <div className="text-2xl font-bold text-secondary">3</div>
        </div>
      </div> */}

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm">District</th>
                <th className="px-6 py-4 text-left text-sm">Allocated (₹ Cr)</th>
                <th className="px-6 py-4 text-left text-sm">Committed (₹ Cr)</th>
                <th className="px-6 py-4 text-left text-sm">Exceeded (₹ Cr)</th>
                <th className="px-6 py-4 text-left text-sm">Priority Ranking</th>
                <th className="px-6 py-4 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {districts.map((district, index) => (
                <tr key={index} className="border-t border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium">{district.name}</td>
                  <td className="px-6 py-4">₹{district.allocated}</td>
                  <td className="px-6 py-4">₹{district.committed}</td>
                  <td className="px-6 py-4">
                    {district.exceeded > 0 ? (
                      <span className="text-destructive flex items-center gap-1">
                        <TrendingUp className="size-4" />
                        ₹{district.exceeded}
                      </span>
                    ) : (
                      <span className="text-accent flex items-center gap-1">
                        <TrendingDown className="size-4" />
                        Within Budget
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      district.priority === 'High' ? 'bg-destructive/20 text-destructive' :
                      district.priority === 'Medium' ? 'bg-secondary/20 text-secondary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {district.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Button size="sm">
                      Revise
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="mb-4">Proposal Revision Interface</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Select Proposal to Revise</label>
            <select className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option>DMRR/2025/MUM/001 - Flood Mitigation (₹450 Lakhs)</option>
              <option>DMRR/2025/PUN/034 - Drought Management (₹680 Lakhs)</option>
              <option>DMRR/2025/NAG/087 - Landslide Prevention (₹340 Lakhs)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2">Revised Budget (₹ Lakhs)</label>
            <input
              type="number"
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter revised budget"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Rationalization Remarks</label>
            <textarea
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              placeholder="Enter rationalization justification..."
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button size="lg">
          Re-submit to DMU
        </Button>
        <Button variant="secondary" size="lg">
          Edit Scope
        </Button>
        <button className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90">
          Reduce Cost
        </button>
      </div>
    </div>
  );
}
