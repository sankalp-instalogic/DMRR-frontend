import { Plus, Edit2, Trash2, Upload } from "lucide-react";

const talukas = [
  { code: "MUM-F", name: "Fort", district: "Mumbai", villages: 12, active: true },
  { code: "MUM-A", name: "Andheri", district: "Mumbai", villages: 8, active: true },
  { code: "PUN-K", name: "Khadki", district: "Pune", villages: 45, active: true },
  { code: "PUN-H", name: "Haveli", district: "Pune", villages: 67, active: true },
];

export function TalukaMaster() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Taluka Master</h1>
          <p className="text-sm text-muted-foreground">Manage taluka information</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-muted rounded-lg flex items-center gap-2 hover:bg-muted/80">
            <Upload className="size-5" />
            Upload Excel
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 hover:opacity-90">
            <Plus className="size-5" />
            Add Taluka
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm">Taluka Code</th>
                <th className="px-6 py-4 text-left text-sm">Taluka Name</th>
                <th className="px-6 py-4 text-left text-sm">District</th>
                <th className="px-6 py-4 text-left text-sm">Villages</th>
                <th className="px-6 py-4 text-left text-sm">Status</th>
                <th className="px-6 py-4 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {talukas.map((taluka, index) => (
                <tr key={index} className="border-t border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium">{taluka.code}</td>
                  <td className="px-6 py-4">{taluka.name}</td>
                  <td className="px-6 py-4">{taluka.district}</td>
                  <td className="px-6 py-4">{taluka.villages}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-accent/20 text-accent rounded-full text-xs">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-muted rounded">
                        <Edit2 className="size-4" />
                      </button>
                      <button className="p-2 hover:bg-destructive/20 rounded">
                        <Trash2 className="size-4 text-destructive" />
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
