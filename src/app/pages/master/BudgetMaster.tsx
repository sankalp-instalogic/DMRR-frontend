import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import {
  Input as AntdInput,
  Select as AntdSelect,
  InputNumber as AntdInputNumber,
} from "antd";

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

import { Table } from "../../components/Table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Button } from "../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";

const COLORS = ["#2563eb", "#16a34a", "#f97316"];

// --- TYPES ---
type FormValues = {
  financialYear: string;
  lineDepartmentId: string | null;
  districtId: string | null;
  allocatedAmount: number | string;
  utilizedAmount: number | string;
};

export function BudgetMaster() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  // --- STATES ---
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<any>(null); // For "View Details" Modal

  // Form State
  const form = useForm<FormValues>({
    defaultValues: {
      financialYear: "",
      lineDepartmentId: null,
      districtId: null,
      allocatedAmount: "",
      utilizedAmount: "",
    },
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
  const { data: districtsData, isLoading: isDistrictsLoading } = useQuery({
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
  const districtsList = districtsData?.items ?? [];

  const departmentsMap = useMemo(() => {
    if (isDepartmentsLoading) return {};
    return Object.fromEntries(
      (deptData?.items ?? []).map((dept: any) => [dept.id, dept.name]),
    );
  }, [deptData?.items, isDepartmentsLoading]);

  const districtsMap = useMemo(() => {
    if (isDistrictsLoading) return {};
    return Object.fromEntries(
      (districtsData?.items ?? []).map((dist: any) => [dist.id, dist.name]),
    );
  }, [districtsData?.items, isDistrictsLoading]);

  // --- CHART DATA AGGREGATION ---

  // 1. Dynamic Pie Data (Total Utilized by Department)
  const dynamicPieData = useMemo(() => {
    const deptTotals: Record<string, number> = {};

    budgets.forEach((b: any) => {
      const deptName =
        departmentsMap[b.lineDepartmentId] || b.lineDept || "Unknown";
      deptTotals[deptName] =
        (deptTotals[deptName] || 0) + (b.utilizedAmount || 0);
    });

    return Object.entries(deptTotals)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0);
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

      if (!districtTotals[distName]) {
        districtTotals[distName] = { district: distName };
      }

      districtTotals[distName][deptName] =
        (districtTotals[distName][deptName] || 0) + (b.utilizedAmount || 0);

      depts.add(deptName);
    });

    return {
      barData: Object.values(districtTotals),
      barDepartments: Array.from(depts),
    };
  }, [budgets, departmentsMap, districtsMap]);

  // --- MUTATIONS ---
  const addMutation = useMutation({
    mutationFn: async (newData: FormValues) => {
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
    mutationFn: async ({ id, data }: { id: string; data: FormValues }) => {
      return await axiosPrivate.put(`/api/v1/masters/budgets/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await axiosPrivate.delete(`/api/v1/masters/budgets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setBudgetToDelete(null);
    },
  });

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    setEditingBudget(null);
    form.reset({
      financialYear: "",
      lineDepartmentId: null,
      districtId: null,
      allocatedAmount: "",
      utilizedAmount: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (budget: any) => {
    setEditingBudget(budget);
    form.reset({
      financialYear: budget.financialYear || budget.fy || "",
      // Use undefined/null if the value doesn't exist
      lineDepartmentId:
        budget.lineDepartmentId || budget.lineDepartment?.id || null,
      districtId: budget.districtId || budget.district?.id || null,
      allocatedAmount: budget.allocatedAmount || budget.allocated || 0,
      utilizedAmount: budget.utilizedAmount || budget.utilized || 0,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBudget(null);
    form.reset();
  };

  const onSubmit = (data: FormValues) => {
    if (editingBudget) {
      editMutation.mutate({ id: editingBudget.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  // --- AG GRID COLUMN DEFINITIONS ---
  const columnDefs = useMemo(
    () => [
      { field: "financialYear", headerName: "Financial Year", flex: 1 },
      {
        field: "lineDepartmentId",
        headerName: "Line Department",
        flex: 1,
        cellRenderer: (params: any) => {
          const deptName =
            departmentsMap[params.value] || params.data.lineDept || "-";
          return (
            <span
              className="text-primary cursor-pointer font-medium hover:underline inline-block"
              onClick={() => {
                const allocated =
                  params.data.allocatedAmount || params.data.allocated || 0;
                const utilized =
                  params.data.utilizedAmount || params.data.utilized || 0;
                const remaining = allocated - utilized;
                const utilization =
                  allocated > 0 ? Math.round((utilized / allocated) * 100) : 0;
                setSelectedDept({ ...params.data, remaining, utilization });
              }}
            >
              {deptName}
            </span>
          );
        },
      },
      {
        field: "allocatedAmount",
        headerName: "Allocated (Cr)",
        flex: 1,
        valueGetter: (params: any) =>
          params.data.allocatedAmount || params.data.allocated || 0,
        cellRenderer: (params: any) => `₹${params.value}`,
      },
      {
        field: "utilizedAmount",
        headerName: "Utilized (Cr)",
        flex: 1,
        valueGetter: (params: any) =>
          params.data.utilizedAmount || params.data.utilized || 0,
        cellRenderer: (params: any) => `₹${params.value}`,
      },
      {
        headerName: "Remaining (Cr)",
        flex: 1,
        valueGetter: (params: any) => {
          const allocated =
            params.data.allocatedAmount || params.data.allocated || 0;
          const utilized =
            params.data.utilizedAmount || params.data.utilized || 0;
          return allocated - utilized;
        },
        cellRenderer: (params: any) => `₹${params.value}`,
      },
      {
        headerName: "Utilization %",
        flex: 1,
        cellRenderer: (params: any) => {
          const allocated =
            params.data.allocatedAmount || params.data.allocated || 0;
          const utilized =
            params.data.utilizedAmount || params.data.utilized || 0;
          const utilization =
            allocated > 0 ? Math.round((utilized / allocated) * 100) : 0;

          return (
            <div className="flex items-center gap-2 h-full">
              <div className="flex-1 bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-accent h-2 rounded-full"
                  style={{ width: `${utilization}%` }}
                />
              </div>
              <span className="text-sm mt-2">{utilization}%</span>
            </div>
          );
        },
      },
      {
        headerName: "Actions",
        flex: 1,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => {
          return (
            <div className="flex gap-2 mt-4">
              <button
                className="p-2 hover:bg-muted rounded cursor-pointer"
                onClick={() => handleOpenEdit(params.data)}
              >
                <Edit2 className="size-4" />
              </button>
              <button
                className="p-2 hover:bg-destructive/20 rounded cursor-pointer"
                onClick={() => setBudgetToDelete(params.data.id)}
              >
                <Trash2 className="size-4 text-destructive" />
              </button>
            </div>
          );
        },
      },
    ],
    [departmentsMap],
  );

  // --- RENDER CHECKS ---
  if (isLoading || isDepartmentsLoading || isDistrictsLoading) {
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
        <Table
          rowData={budgets}
          columnDefs={columnDefs}
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* View Details Modal (Department Drill-Down) */}
      {selectedDept && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-xl w-237.5 max-h-[85vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setSelectedDept(null)}
              className="absolute top-4 right-4 cursor-pointer"
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
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="district" />
                <YAxis />
                <Tooltip />
                <Legend />
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBudget ? "Edit Budget Entry" : "Add Budget Entry"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4"
            >
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="financialYear"
                  rules={{ required: "Financial Year is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Financial Year</FormLabel>
                      <FormControl>
                        <AntdInput placeholder="e.g. 2025-26" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lineDepartmentId"
                  rules={{ required: "Department is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Line Department</FormLabel>
                      <FormControl>
                        <AntdSelect
                          {...field}
                          className="w-full"
                          placeholder="Select Department"
                          getPopupContainer={(trigger) =>
                            trigger.parentElement as HTMLElement
                          }
                          options={departments.map((dept: any) => ({
                            label: `${dept.name} (${dept.code})`,
                            value: dept.id,
                          }))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="districtId"
                  rules={{ required: "District is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <FormControl>
                        <AntdSelect
                          {...field}
                          className="w-full"
                          getPopupContainer={(trigger) =>
                            trigger.parentElement as HTMLElement
                          }
                          placeholder="Select District"
                          options={districtsList.map((district: any) => ({
                            label: district.name,
                            value: district.id,
                          }))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 col-span-2">
                <FormField
                  control={form.control}
                  name="allocatedAmount"
                  rules={{ required: "Allocated budget is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allocated Budget (Cr)</FormLabel>
                      <FormControl>
                        <AntdInputNumber
                          {...field}
                          className="w-full"
                          placeholder="Enter allocated budget"
                          style={{ width: "100%" }}
                          min={0}
                          step={0.01}
                          onChange={(value) => field.onChange(value || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="utilizedAmount"
                  rules={{ required: "Utilized budget is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Utilized Budget (Cr)</FormLabel>
                      <FormControl>
                        <AntdInputNumber
                          {...field}
                          className="w-full"
                          style={{ width: "100%" }}
                          placeholder="Enter Utilized Budget"
                          min={0}
                          step={0.01}
                          onChange={(value) => field.onChange(value || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
          </Form>
        </DialogContent>
      </Dialog>

      {/* --- DELETE CONFIRMATION DIALOG --- */}
      <AlertDialog
        open={!!budgetToDelete}
        onOpenChange={() => setBudgetToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              budget entry and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (budgetToDelete) deleteMutation.mutate(budgetToDelete);
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
