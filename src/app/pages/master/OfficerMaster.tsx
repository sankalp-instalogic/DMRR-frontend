import { Plus, Edit2, Trash2 } from "lucide-react";

const officers = [
  { name: "Shri Rajesh Kumar", designation: "Deputy Director", department: "PWD", district: "Mumbai", email: "rajesh.kumar@gov.in", active: true },
  { name: "Smt. Priya Sharma", designation: "Assistant Director", department: "WRD", district: "Pune", email: "priya.sharma@gov.in", active: true },
  { name: "Shri Amit Patel", designation: "District Collector", department: "Revenue", district: "Nagpur", email: "amit.patel@gov.in", active: true },
];

export function OfficerMaster() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Officer Master</h1>
          <p className="text-sm text-muted-foreground">Manage officer information</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 hover:opacity-90">
          <Plus className="size-5" />
          Add Officer
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm">Name</th>
                <th className="px-6 py-4 text-left text-sm">Designation</th>
                <th className="px-6 py-4 text-left text-sm">Department</th>
                <th className="px-6 py-4 text-left text-sm">District</th>
                <th className="px-6 py-4 text-left text-sm">Email</th>
                <th className="px-6 py-4 text-left text-sm">Status</th>
                <th className="px-6 py-4 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {officers.map((officer, index) => (
                <tr key={index} className="border-t border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium">{officer.name}</td>
                  <td className="px-6 py-4">{officer.designation}</td>
                  <td className="px-6 py-4">{officer.department}</td>
                  <td className="px-6 py-4">{officer.district}</td>
                  <td className="px-6 py-4 text-sm">{officer.email}</td>
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
