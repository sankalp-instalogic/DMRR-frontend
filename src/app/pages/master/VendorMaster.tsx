import { Plus, Edit2, Trash2 } from "lucide-react";

const vendors = [
  { code: "V001", name: "ABC Equipment Pvt Ltd", gst: "27AABCU9603R1ZX", pan: "AABCU9603R", category: "Equipment", rating: 4.5, active: true },
  { code: "V002", name: "XYZ Suppliers", gst: "27AABCX1234P1Z5", pan: "AABCX1234P", category: "Materials", rating: 4.2, active: true },
  { code: "V003", name: "MediTech Solutions", gst: "27AABCM5678Q1Z9", pan: "AABCM5678Q", category: "Medical", rating: 4.8, active: true },
];

export function VendorMaster() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Vendor Master</h1>
          <p className="text-sm text-muted-foreground">Manage vendor and supplier information</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 hover:opacity-90">
          <Plus className="size-5" />
          Add Vendor
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm">Vendor Code</th>
                <th className="px-6 py-4 text-left text-sm">Vendor Name</th>
                <th className="px-6 py-4 text-left text-sm">GST Number</th>
                <th className="px-6 py-4 text-left text-sm">PAN</th>
                <th className="px-6 py-4 text-left text-sm">Category</th>
                <th className="px-6 py-4 text-left text-sm">Rating</th>
                <th className="px-6 py-4 text-left text-sm">Status</th>
                <th className="px-6 py-4 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor, index) => (
                <tr key={index} className="border-t border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium">{vendor.code}</td>
                  <td className="px-6 py-4">{vendor.name}</td>
                  <td className="px-6 py-4 text-sm font-mono">{vendor.gst}</td>
                  <td className="px-6 py-4 text-sm font-mono">{vendor.pan}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs">
                      {vendor.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="text-secondary">★</span>
                      <span>{vendor.rating}</span>
                    </div>
                  </td>
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
