import { Plus, Edit2, Trash2 } from "lucide-react";

const equipment = [
  { code: "EQ-RV-001", name: "Rescue Vehicle 4x4", category: "Vehicles", specifications: "4WD, 2500cc Diesel", unitPrice: "₹25 L", active: true },
  { code: "EQ-CM-002", name: "VHF Communication System", category: "Communication", specifications: "100W, 25km Range", unitPrice: "₹2.5 L", active: true },
  { code: "EQ-MD-003", name: "Medical Emergency Kit", category: "Medical", specifications: "50-person capacity", unitPrice: "₹50,000", active: true },
  { code: "EQ-DK-004", name: "Disaster Relief Kit", category: "Relief Supplies", specifications: "Family pack (5 persons)", unitPrice: "₹12,000", active: true },
];

export function EquipmentCatalogue() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Equipment Catalogue</h1>
          <p className="text-sm text-muted-foreground">Manage disaster management equipment and supplies</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 hover:opacity-90">
          <Plus className="size-5" />
          Add Equipment
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm">Equipment Code</th>
                <th className="px-6 py-4 text-left text-sm">Equipment Name</th>
                <th className="px-6 py-4 text-left text-sm">Category</th>
                <th className="px-6 py-4 text-left text-sm">Specifications</th>
                <th className="px-6 py-4 text-left text-sm">Unit Price</th>
                <th className="px-6 py-4 text-left text-sm">Status</th>
                <th className="px-6 py-4 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((item, index) => (
                <tr key={index} className="border-t border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium font-mono text-sm">{item.code}</td>
                  <td className="px-6 py-4">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-secondary/20 text-secondary rounded-full text-xs">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{item.specifications}</td>
                  <td className="px-6 py-4 font-medium">{item.unitPrice}</td>
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
