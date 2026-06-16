import { Plus, Edit2, Trash2, Upload } from "lucide-react";

const districts = [
  { code: "MUM", name: "Mumbai", region: "Konkan", population: "12.4M", active: true },
  { code: "PUN", name: "Pune", region: "Pune", population: "9.4M", active: true },
  { code: "NAG", name: "Nagpur", region: "Vidarbha", population: "4.6M", active: true },
  { code: "NAS", name: "Nashik", region: "Nashik", population: "6.1M", active: true },
  { code: "AUR", name: "Aurangabad", region: "Marathwada", population: "3.7M", active: true },
];

export function DistrictMaster() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>District Master</h1>
          <p className="text-sm text-muted-foreground">Manage district information</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-muted rounded-lg flex items-center gap-2 hover:bg-muted/80">
            <Upload className="size-5" />
            Upload Excel
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 hover:opacity-90">
            <Plus className="size-5" />
            Add District
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm">District Code</th>
                <th className="px-6 py-4 text-left text-sm">District Name</th>
                <th className="px-6 py-4 text-left text-sm">Region</th>
                <th className="px-6 py-4 text-left text-sm">Population</th>
                <th className="px-6 py-4 text-left text-sm">Status</th>
                <th className="px-6 py-4 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {districts.map((district, index) => (
                <tr key={index} className="border-t border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium">{district.code}</td>
                  <td className="px-6 py-4">{district.name}</td>
                  <td className="px-6 py-4">{district.region}</td>
                  <td className="px-6 py-4">{district.population}</td>
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
