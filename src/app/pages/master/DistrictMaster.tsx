import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { Edit2, Plus, Trash2, Upload } from "lucide-react";
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
  Input as AntdInput,
  InputNumber as AntdInputNumber,
  Checkbox as AntdCheckbox,
} from "antd";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";

// --- TYPES ---
type FormValues = {
  code: string;
  name: string;
  region: string;
  population: number | string;
  isActive: boolean;
};

export function DistrictMaster() {
  const axiosPrivate = useAxiosPrivate();

  // Table State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<any | null>(null);
  const [districtToDelete, setDistrictToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    defaultValues: {
      code: "",
      name: "",
      region: "",
      population: "",
      isActive: true,
    },
  });

  // --- QUERIES ---
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["districts", page, pageSize],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/districts", {
        params: { page, pageSize },
      });
      return response.data;
    },
  });

  const districts = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;

  // --- MUTATIONS ---
  const addMutation = useMutation({
    mutationFn: async (newData: FormValues) => {
      return await axiosPrivate.post("/api/v1/masters/districts", newData, {
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
      closeModal();
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormValues }) => {
      return await axiosPrivate.put(`/api/v1/masters/districts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await axiosPrivate.delete(`/api/v1/masters/districts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
      setDistrictToDelete(null);
    },
  });

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    setEditingDistrict(null);
    form.reset({
      code: "",
      name: "",
      region: "",
      population: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (district: any) => {
    setEditingDistrict(district);
    form.reset({
      code: district.code,
      name: district.name,
      region: district.region,
      population: district.population || 0,
      isActive: district.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDistrict(null);
    form.reset();
  };

  const onSubmit = (data: FormValues) => {
    if (editingDistrict) {
      editMutation.mutate({ id: editingDistrict.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  // --- AG GRID COLUMN DEFINITIONS ---
  const columnDefs = useMemo(
    () => [
      { field: "code", headerName: "District Code", flex: 1 },
      { field: "name", headerName: "District Name", flex: 1 },
      { field: "region", headerName: "Region", flex: 1 },
      {
        field: "population",
        headerName: "Population",
        flex: 1,
        cellRenderer: (params: any) => {
          return params.value
            ? `${(params.value / 1_000_000).toFixed(1)}M`
            : "-";
        },
      },
      {
        field: "isActive",
        headerName: "Status",
        flex: 1,
        cellRenderer: (params: any) => {
          const isActive = params.value;
          return (
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 mt-2 text-xs font-medium ${
                isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isActive ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              {isActive ? "Active" : "Inactive"}
            </span>
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
            <div className="flex gap-2 mt-1">
              <button
                className="p-2 hover:bg-muted rounded cursor-pointer"
                onClick={() => handleOpenEdit(params.data)}
              >
                <Edit2 className="size-4" />
              </button>
              <button
                className="p-2 hover:bg-destructive/20 rounded cursor-pointer"
                onClick={() => setDistrictToDelete(params.data.id)}
              >
                <Trash2 className="size-4 text-destructive" />
              </button>
            </div>
          );
        },
      },
    ],
    [],
  );

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[30px] font-bold text-primary">District Master</h1>
          <p className="text-sm text-muted-foreground">
            Manage district information
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Upload className="size-5" /> Upload Excel
          </Button>
          <Button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Plus className="size-5" /> Add District
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <Table
          rowData={districts}
          columnDefs={columnDefs}
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* --- ADD / EDIT MODAL --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDistrict ? "Edit District" : "Add District"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={form.control}
                name="code"
                rules={{ required: "District code is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District Code</FormLabel>
                    <FormControl>
                      <AntdInput placeholder="Enter district code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                rules={{ required: "District name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District Name</FormLabel>
                    <FormControl>
                      <AntdInput placeholder="Enter district name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                rules={{ required: "Region is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <FormControl>
                      <AntdInput placeholder="Enter region" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="population"
                rules={{
                  required: "Population is required",
                  min: {
                    value: 0,
                    message: "Population must be a positive number",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Population</FormLabel>
                    <FormControl>
                      <AntdInputNumber
                        {...field}
                        className="w-full"
                        style={{ width: "100%" }}
                        placeholder="Enter population"
                        min={0}
                        onChange={(value) => field.onChange(value ?? 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <AntdCheckbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      >
                        Is Active?
                      </AntdCheckbox>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  className="cursor-pointer"
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
        open={!!districtToDelete}
        onOpenChange={() => setDistrictToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this district entry? This action cannot be undone
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (districtToDelete) deleteMutation.mutate(districtToDelete);
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
