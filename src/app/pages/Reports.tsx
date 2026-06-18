import { Download, FileText, Printer } from "lucide-react";

const reports = [
  {
    name: "Proposal Status Register",
    description: "Complete status of all proposals",
    format: "PDF / Excel",
  },
  {
    name: "Budget Utilization Report",
    description:
      "District-wise budget allocation and utilization",
    format: "PDF / Excel",
  },
  {
    name: "Stage Cycle Time Analysis",
    description: "Time taken at each approval stage",
    format: "PDF / Excel",
  },
  {
    name: "Fund Release Tracker",
    description: "Milestone-wise fund release status",
    format: "PDF / Excel",
  },
  {
    name: "Procurement Register",
    description: "Complete procurement activity log",
    format: "PDF / Excel",
  },
  {
    name: "Project Completion Register",
    description: "Completed projects with closure status",
    format: "PDF / Excel",
  },
  {
    name: "Audit Trail Export",
    description: "System audit and activity logs",
    format: "PDF / Excel",
  },
  {
    name: "Department-wise Performance",
    description: "Department performance metrics",
    format: "PDF / Excel",
  },
  {
    name: "Delayed Projects Report",
    description: "Projects behind schedule with reasons",
    format: "PDF / Excel",
  },
];

export function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Generate comprehensive reports and analytics
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search Report..."
            className="px-4 py-2 border border-border rounded-lg"
          />

          <select className="px-4 py-2 border border-border rounded-lg">
            <option>All Categories</option>
            <option>Proposal Reports</option>
            <option>Budget Reports</option>
            <option>Procurement Reports</option>
            <option>Project Reports</option>
          </select>

          <select className="px-4 py-2 border border-border rounded-lg">
            <option>All Formats</option>
            <option>PDF</option>
            <option>Excel</option>
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-4 text-left text-sm font-medium">
                Sr No.
              </th>
              <th className="px-4 py-4 text-left text-sm font-medium">
                Title
              </th>
              <th className="px-4 py-4 text-left text-sm font-medium">
                Description
              </th>
              <th className="px-4 py-4 text-center text-sm font-medium">
                Action
              </th>
              <th className="px-4 py-4 text-center text-sm font-medium">
                Last Download
              </th>
            </tr>
          </thead>

          <tbody>
            {reports.map((report, index) => (
              <tr
                key={index}
                className="border-t border-border hover:bg-muted/50"
              >
                <td className="px-4 py-4 text-sm">
                  {index + 1}
                </td>

                <td className="px-4 py-4 text-sm font-medium">
                  {report.name}
                </td>

                <td className="px-4 py-4 text-sm text-muted-foreground">
                  {report.description}
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-70 text-sm">
                      View
                    </button>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-center gap-2">
                    <button className="px-3 py-2 bg-red-500 text-white rounded-lg hover:opacity-60 flex items-center gap-1 text-sm">
                      <Download className="size-4" />
                      PDF
                    </button>

                    <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:opacity-60 flex items-center gap-1 text-sm">
                      <Download className="size-4" />
                      Excel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* 
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="mb-4">Custom Report Generator</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Report Type</label>
            <select className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option>Proposal Analysis</option>
              <option>Budget Analysis</option>
              <option>Procurement Analysis</option>
              <option>Timeline Analysis</option>
              <option>Custom Query</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Date From</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Date To</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">District Filter</label>
            <select className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option>All Districts</option>
              <option>Mumbai</option>
              <option>Pune</option>
              <option>Nagpur</option>
              <option>Nashik</option>
            </select>
          </div>

          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2">
            <FileText className="size-5" />
            Generate Custom Report
          </button>
        </div>
      </div> */}
    </div>
  );
}