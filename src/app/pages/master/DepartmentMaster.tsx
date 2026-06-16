import { Plus, Edit2, Trash2 } from "lucide-react";

const departments = [
  { code: "PWD", name: "Public Works Department", headOffice: "Mumbai", contactPerson: "Shri R.K. Sharma", active: true },
  { code: "WRD", name: "Water Resources Department", headOffice: "Pune", contactPerson: "Smt. P.R. Desai", active: true },
  { code: "SWCD", name: "Soil & Water Conservation", headOffice: "Nashik", contactPerson: "Shri V.S. Patil", active: true },
  { code: "FOREST", name: "Forest Department", headOffice: "Nagpur", contactPerson: "Shri A.M. Kulkarni", active: true },
];

export function DepartmentMaster() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Department Master</h1>
          <p className="text-sm text-muted-foreground">Manage department information</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 hover:opacity-90">
          <Plus className="size-5" />
          Add Department
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm">Code</th>
                <th className="px-6 py-4 text-left text-sm">Department Name</th>
                <th className="px-6 py-4 text-left text-sm">Head Office</th>
                <th className="px-6 py-4 text-left text-sm">Contact Person</th>
                <th className="px-6 py-4 text-left text-sm">Status</th>
                <th className="px-6 py-4 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, index) => (
                <tr key={index} className="border-t border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium">{dept.code}</td>
                  <td className="px-6 py-4">{dept.name}</td>
                  <td className="px-6 py-4">{dept.headOffice}</td>
                  <td className="px-6 py-4">{dept.contactPerson}</td>
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
