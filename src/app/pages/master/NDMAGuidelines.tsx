import { Plus, Download, FileText } from "lucide-react";

const guidelines = [
  { code: "NDMA-FL-2024", title: "Flood Management & Mitigation Guidelines", version: "3.2", date: "15-Mar-2024", category: "Flood" },
  { code: "NDMA-EQ-2023", title: "Earthquake Preparedness Guidelines", version: "2.1", date: "10-Dec-2023", category: "Earthquake" },
  { code: "NDMA-DR-2024", title: "Drought Management Framework", version: "4.0", date: "01-Apr-2024", category: "Drought" },
  { code: "NDMA-CY-2023", title: "Cyclone Preparedness & Response", version: "2.5", date: "20-Aug-2023", category: "Cyclone" },
];

export function NDMAGuidelines() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>NDMA Guidelines</h1>
          <p className="text-sm text-muted-foreground">National Disaster Management Authority guidelines repository</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 hover:opacity-90">
          <Plus className="size-5" />
          Add Guideline
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm">Guideline Code</th>
                <th className="px-6 py-4 text-left text-sm">Title</th>
                <th className="px-6 py-4 text-left text-sm">Version</th>
                <th className="px-6 py-4 text-left text-sm">Published Date</th>
                <th className="px-6 py-4 text-left text-sm">Category</th>
                <th className="px-6 py-4 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guidelines.map((guideline, index) => (
                <tr key={index} className="border-t border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium font-mono text-sm">{guideline.code}</td>
                  <td className="px-6 py-4">{guideline.title}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs">
                      v{guideline.version}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{guideline.date}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-secondary/20 text-secondary rounded-full text-xs">
                      {guideline.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-muted rounded" title="View">
                        <FileText className="size-4" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded" title="Download">
                        <Download className="size-4" />
                      </button>
                    </div>
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
