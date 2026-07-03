import { useState } from "react";
import {
  Plus, Edit, Power, History, Upload, Download, Search
} from "lucide-react";

type HierarchyLevel = "state" | "district" | "taluka";

interface HierarchyItem {
  id: string;
  code: string;
  name: string;
  parent: string;
  active: boolean;
  createdAt: string;
  modifiedAt: string;
}

const mockStates: HierarchyItem[] = [
  { id: "1", code: "MH", name: "Maharashtra", parent: "-", active: true, createdAt: "2024-01-01", modifiedAt: "2024-01-01" }
];

const mockDistricts: HierarchyItem[] = [
  { id: "2", code: "MH-MUM", name: "Mumbai", parent: "Maharashtra", active: true, createdAt: "2024-01-01", modifiedAt: "2024-01-01" },
  { id: "3", code: "MH-PUN", name: "Pune", parent: "Maharashtra", active: true, createdAt: "2024-01-01", modifiedAt: "2024-01-01" },
  { id: "4", code: "MH-NAG", name: "Nagpur", parent: "Maharashtra", active: true, createdAt: "2024-01-01", modifiedAt: "2024-01-01" },
  { id: "5", code: "MH-NAS", name: "Nashik", parent: "Maharashtra", active: true, createdAt: "2024-01-01", modifiedAt: "2024-01-01" },
  { id: "6", code: "MH-AUR", name: "Aurangabad", parent: "Maharashtra", active: true, createdAt: "2024-01-01", modifiedAt: "2024-01-01" }
];

const mockTalukas: HierarchyItem[] = [
  { id: "7", code: "MH-MUM-KUR", name: "Kurla", parent: "Mumbai", active: true, createdAt: "2024-01-01", modifiedAt: "2024-01-01" },
  { id: "8", code: "MH-MUM-AND", name: "Andheri", parent: "Mumbai", active: true, createdAt: "2024-01-01", modifiedAt: "2024-01-01" },
  { id: "9", code: "MH-MUM-BAN", name: "Bandra", parent: "Mumbai", active: true, createdAt: "2024-01-01", modifiedAt: "2024-01-01" },
  { id: "10", code: "MH-PUN-HAV", name: "Haveli", parent: "Pune", active: true, createdAt: "2024-01-01", modifiedAt: "2024-01-01" },
  { id: "11", code: "MH-PUN-MUL", name: "Mulshi", parent: "Pune", active: true, createdAt: "2024-01-01", modifiedAt: "2024-01-01" }
];

export function HierarchyMaster() {
  const [activeLevel, setActiveLevel] = useState<HierarchyLevel>("district");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<HierarchyItem | null>(null);

  const [newItem, setNewItem] = useState({
    code: "",
    name: "",
    parent: ""
  });

  const getData = () => {
    switch (activeLevel) {
      case "state":
        return mockStates;
      case "district":
        return mockDistricts;
      case "taluka":
        return mockTalukas;
    }
  };

  const filteredData = getData().filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (!newItem.code || !newItem.name) {
      alert("Please fill all required fields.");
      return;
    }
    alert(`Added new ${activeLevel}: ${newItem.name}`);
    setShowAddModal(false);
    setNewItem({ code: "", name: "", parent: "" });
  };

  const handleEdit = (item: HierarchyItem) => {
    setEditingItem(item);
    setNewItem({
      code: item.code,
      name: item.name,
      parent: item.parent
    });
    setShowAddModal(true);
  };

  const handleDeactivate = (item: HierarchyItem) => {
    if (confirm(`Are you sure you want to deactivate ${item.name}?`)) {
      alert(`${item.name} has been deactivated.`);
    }
  };

  const handleBulkUpload = () => {
    alert("Bulk upload feature: Upload CSV or Excel file with hierarchy data.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>State / District / Taluka Master</h1>
        <p className="text-sm text-muted-foreground">
          Maintain administrative hierarchy and location data
        </p>
      </div>

      {/* Level Selector */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">Hierarchy Level:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveLevel("state")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeLevel === "state"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              State
            </button>
            <button
              onClick={() => setActiveLevel("district")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeLevel === "district"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              District
            </button>
            <button
              onClick={() => setActiveLevel("taluka")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeLevel === "taluka"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Taluka
            </button>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${activeLevel}...`}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingItem(null);
              setNewItem({ code: "", name: "", parent: "" });
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 font-medium"
          >
            <Plus className="size-4" />
            Add
          </button>
          <button
            onClick={handleBulkUpload}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 font-medium"
          >
            <Upload className="size-4" />
            Bulk Upload
          </button>
          <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2 font-medium">
            <Download className="size-4" />
            Export
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Level Code
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Parent
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Created At
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Modified At
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-medium">{item.code}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-sm">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{item.parent}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.active
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {item.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{item.createdAt}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{item.modifiedAt}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="size-4" />
                      </button>
                      <button
                        onClick={() => handleDeactivate(item)}
                        className="p-1.5 text-orange-600 hover:bg-orange-100 rounded transition-colors"
                        title="Deactivate"
                      >
                        <Power className="size-4" />
                      </button>
                      <button
                        className="p-1.5 text-secondary hover:bg-secondary/10 rounded transition-colors"
                        title="View History"
                      >
                        <History className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No {activeLevel}s found matching your search.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-4">
              {editingItem ? `Edit ${activeLevel}` : `Add New ${activeLevel}`}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Level Code <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={newItem.code}
                  onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., MH-MUM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder={`Enter ${activeLevel} name`}
                />
              </div>

              {activeLevel !== "state" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Parent <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={newItem.parent}
                    onChange={(e) => setNewItem({ ...newItem, parent: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select Parent</option>
                    {activeLevel === "district" && mockStates.map((state) => (
                      <option key={state.id} value={state.name}>{state.name}</option>
                    ))}
                    {activeLevel === "taluka" && mockDistricts.map((district) => (
                      <option key={district.id} value={district.name}>{district.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                  setNewItem({ code: "", name: "", parent: "" });
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                {editingItem ? "Save Changes" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
