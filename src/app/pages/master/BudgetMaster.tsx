import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { Plus, Edit2, X } from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const COLORS = ["#2563eb", "#16a34a", "#f97316"];

export function BudgetMaster() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  // --- STATES ---
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any | null>(null);
  const [selectedDept, setSelectedDept] = useState<any>(null); // For "View Details" Modal

  // Form State
  const [formData, setFormData] = useState({
    financialYear: "",
    lineDepartmentId: "",
    districtId: "", // Added districtId
    allocatedAmount: 0,
    utilizedAmount: 0,
  });

  // --- QUERIES ---

  // 1. Fetch Budgets
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["budgets", page, pageSize],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/budgets", {
        params: { page, pageSize },
      });
      return response.data;
    },
  });

  // 2. Fetch Departments for dropdown mapping
  const { data: deptData, isLoading: isDepartmentsLoading } = useQuery({
    queryKey: ["departments-dropdown"],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        "/api/v1/masters/line-departments",
        { params: { page: 1, pageSize: 100 } },
      );
      return response.data;
    },
  });

  // 3. Fetch Districts for dropdown mapping
  const { data: districtsData } = useQuery({
    queryKey: ["districts"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/districts", {
        params: { page: 1, pageSize: 100 },
      });
      return response.data;
    },
  });

  const budgets = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;

  const departments = deptData?.items ?? [];
  const departmentsMap = isDepartmentsLoading
    ? {}
    : Object.fromEntries(
        deptData?.items?.map((dept: any) => [dept.id, dept.name]),
      );

  const districtsList = districtsData?.items ?? [];

  // ADD THIS: Create a lookup map for district names
  const districtsMap = useMemo(() => {
    if (!districtsData?.items) return {};
    return Object.fromEntries(
      districtsData.items.map((dist: any) => [dist.id, dist.name]),
    );
  }, [districtsData]);

  // --- CHART DATA AGGREGATION ---

  // 1. Dynamic Pie Data (Total Utilized by Department)
  const dynamicPieData = useMemo(() => {
    const deptTotals: Record<string, number> = {};

    budgets.forEach((b: any) => {
      const deptName =
        departmentsMap[b.lineDepartmentId] || b.lineDept || "Unknown";
      // Using utilizedAmount, but you could switch to allocatedAmount if preferred
      deptTotals[deptName] =
        (deptTotals[deptName] || 0) + (b.utilizedAmount || 0);
    });

    return Object.entries(deptTotals)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0); // Only show depts that have spent money
  }, [budgets, departmentsMap]);

  // 2. Dynamic Bar Data (District-wise Utilization by Department)
  const { barData, barDepartments } = useMemo(() => {
    const districtTotals: Record<string, any> = {};
    const depts = new Set<string>();

    budgets.forEach((b: any) => {
      const distName =
        districtsMap[b.districtId] || b.district?.name || "Unknown";
      const deptName =
        departmentsMap[b.lineDepartmentId] || b.lineDept || "Unknown";

      // Initialize district object if it doesn't exist
      if (!districtTotals[distName]) {
        districtTotals[distName] = { district: distName };
      }

      // Add to the department's total within this district
      districtTotals[distName][deptName] =
        (districtTotals[distName][deptName] || 0) + (b.utilizedAmount || 0);

      depts.add(deptName); // Keep track of all unique departments for the Bar components
    });

    return {
      barData: Object.values(districtTotals),
      barDepartments: Array.from(depts), // We need this to dynamically render <Bar /> tags
    };
  }, [budgets, departmentsMap, districtsMap]);

  // --- MUTATIONS ---
  const addMutation = useMutation({
    mutationFn: async (newData: any) => {
      return await axiosPrivate.post("/api/v1/masters/budgets", newData, {
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      closeModal();
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await axiosPrivate.put(`/api/v1/masters/budgets/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      closeModal();
    },
  });

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    setEditingBudget(null);
    setFormData({
      financialYear: "",
      lineDepartmentId: "",
      districtId: "", // Reset district id
      allocatedAmount: 0,
      utilizedAmount: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (budget: any) => {
    setEditingBudget(budget);

    // FIXED: Ensure we are using the exact keys returned by the API table mapping
    setFormData({
      financialYear: budget.financialYear || budget.fy || "",
      lineDepartmentId:
        budget.lineDepartmentId || budget.lineDepartment?.id || "",
      districtId: budget.districtId || budget.district?.id || "",
      allocatedAmount: budget.allocatedAmount || budget.allocated || 0,
      utilizedAmount: budget.utilizedAmount || budget.utilized || 0,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBudget(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBudget) {
      editMutation.mutate({ id: editingBudget.id, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  // --- RENDER CHECKS ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="text-red-500">⚠️</div>
            <div>
              <h3 className="font-semibold text-red-800">
                Something went wrong
              </h3>
              <p className="mt-1 text-sm text-red-600">
                {(error as Error).message}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Budget Master</h1>
          <p className="text-sm text-muted-foreground">
            Manage budget allocations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Plus className="size-5" /> Add Budget Entry
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm">Financial Year</th>
                <th className="px-6 py-4 text-left text-sm">Line Department</th>
                <th className="px-6 py-4 text-left text-sm">Allocated (Cr)</th>
                <th className="px-6 py-4 text-left text-sm">Utilized (Cr)</th>
                <th className="px-6 py-4 text-left text-sm">Remaining (Cr)</th>
                <th className="px-6 py-4 text-left text-sm">Utilization %</th>
                <th className="px-6 py-4 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget: any) => {
                const remaining =
                  budget.allocatedAmount - budget.utilizedAmount;
                const utilization =
                  budget.allocatedAmount > 0
                    ? Math.round(
                        (budget.utilizedAmount / budget.allocatedAmount) * 100,
                      )
                    : 0;

                return (
                  <tr
                    key={budget.id}
                    className="border-t border-border hover:bg-muted/50"
                  >
                    <td className="px-6 py-4 font-medium">
                      {budget.financialYear}
                    </td>
                    <td
                      className="text-primary cursor-pointer font-medium hover:underline"
                      onClick={() =>
                        setSelectedDept({ ...budget, remaining, utilization })
                      }
                    >
                      {departmentsMap[budget.lineDepartmentId] ||
                        budget.lineDept ||
                        "-"}
                    </td>
                    <td className="px-6 py-4">₹{budget.allocatedAmount}</td>
                    <td className="px-6 py-4 text-accent">
                      ₹{budget.utilizedAmount}
                    </td>
                    <td className="px-6 py-4">₹{remaining}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-accent h-2 rounded-full"
                            style={{ width: `${utilization}%` }}
                          />
                        </div>
                        <span className="text-sm">{utilization}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          className="p-2 hover:bg-muted rounded cursor-pointer"
                          onClick={() => handleOpenEdit(budget)}
                        >
                          <Edit2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <span className="text-sm text-muted-foreground">
            Total Records: {totalCount}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => prev - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* View Details Modal (Department Drill-Down) */}
      {selectedDept && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-xl w-237.5 max-h-[85vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setSelectedDept(null)}
              className="absolute top-4 right-4"
            >
              <X className="size-5" />
            </button>

            <h2 className="text-xl font-bold mb-6">Line Department Details</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-sm font-medium">Line Dept Name</label>
                <input
                  readOnly
                  value={
                    departmentsMap[selectedDept.lineDepartmentId] ||
                    selectedDept.lineDept ||
                    "-"
                  }
                  className="w-full border rounded-lg px-4 py-2 bg-muted mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Budget Allocated</label>
                <input
                  readOnly
                  value={`₹${selectedDept.allocatedAmount || selectedDept.allocated} Cr`}
                  className="w-full border rounded-lg px-4 py-2 bg-muted mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Budget Utilized</label>
                <input
                  readOnly
                  value={`₹${selectedDept.utilizedAmount || selectedDept.utilized} Cr`}
                  className="w-full border rounded-lg px-4 py-2 bg-muted mt-1"
                />
              </div>
            </div>

            <h3 className="font-bold mb-4">Projects Utilizing Budget</h3>
            {/* Kept static for structural consistency */}
            <table className="w-full border">
              <thead className="bg-muted">
                <tr>
                  <th className="border px-3 py-2 text-left">District</th>
                  <th className="border px-3 py-2 text-left">Project Name</th>
                  <th className="border px-3 py-2 text-left">Description</th>
                  <th className="border px-3 py-2 text-left">Budget Used</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-3 py-2">Mumbai</td>
                  <td className="border px-3 py-2">Flood Protection Wall</td>
                  <td className="border px-3 py-2">
                    Construction of retaining wall
                  </td>
                  <td className="border px-3 py-2">₹45 Cr</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="bg-card border rounded-xl p-6">
          <h3 className="font-bold mb-5">
            Budget Spent by Beneficiary Department
          </h3>
          <div className="h-87.5">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {/* CHANGED: Use dynamicPieData here */}
                <Pie
                  data={dynamicPieData}
                  innerRadius={70}
                  outerRadius={110}
                  dataKey="value"
                  nameKey="name"
                  label
                >
                  {dynamicPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Multiple Bar Chart */}
        <div className="bg-card border rounded-xl p-6">
          <h3 className="font-bold mb-5">District-wise Budget Utilization</h3>
          <div className="h-87.5">
            <ResponsiveContainer width="100%" height="100%">
              {/* CHANGED: Use barData here */}
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="district" />
                <YAxis />
                <Tooltip />
                <Legend />
                {/* CHANGED: Dynamically map the Bars based on active departments */}
                {barDepartments.map((deptName, index) => (
                  <Bar
                    key={deptName}
                    dataKey={deptName}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- ADD / EDIT DIALOG --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBudget ? "Edit Budget Entry" : "Add Budget Entry"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fy">Financial Year</Label>
              <Input
                id="fy"
                placeholder="e.g. 2025-26"
                value={formData.financialYear}
                onChange={(e) =>
                  setFormData({ ...formData, financialYear: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Line Department</Label>
                <select
                  id="department"
                  value={formData.lineDepartmentId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lineDepartmentId: e.target.value,
                    })
                  }
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>
                    Select Department
                  </option>
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <select
                  id="district"
                  value={formData.districtId}
                  onChange={(e) =>
                    setFormData({ ...formData, districtId: e.target.value })
                  }
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>
                    Select District
                  </option>
                  {districtsList.map((district: any) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="allocated">Allocated Budget (Cr)</Label>
                <Input
                  id="allocated"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.allocatedAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      allocatedAmount: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="utilized">Utilized Budget (Cr)</Label>
                <Input
                  id="utilized"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.utilizedAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      utilizedAmount: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                className="cursor-pointer"
                type="button"
                variant="outline"
                onClick={closeModal}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={addMutation.isPending || editMutation.isPending}
              >
                {addMutation.isPending || editMutation.isPending
                  ? "Saving..."
                  : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
