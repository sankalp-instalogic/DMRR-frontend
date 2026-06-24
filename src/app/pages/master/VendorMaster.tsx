import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { Edit2, Plus, Trash2 } from "lucide-react";
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
  legalName: string;
  gstin: string;
  pan: string;
  category: string;
  rating: number | string;
  isActive: boolean;
};

export function VendorMaster() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  // Table State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null);

  const form = useForm<FormValues>({
    defaultValues: {
      legalName: "",
      gstin: "",
      pan: "",
      category: "",
      rating: "",
      isActive: true,
    },
  });

  // --- QUERIES ---
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["vendors", page, pageSize],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/vendors", {
        params: { page, pageSize },
      });
      return response.data;
    },
  });

  const vendors = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? vendors.length;

  // --- MUTATIONS ---
  const addMutation = useMutation({
    mutationFn: async (newData: FormValues) => {
      return await axiosPrivate.post("/api/v1/masters/vendors", newData, {
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      closeModal();
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormValues }) => {
      return await axiosPrivate.put(`/api/v1/masters/vendors/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await axiosPrivate.delete(`/api/v1/masters/vendors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      setVendorToDelete(null);
    },
  });

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    setEditingVendor(null);
    form.reset({
      legalName: "",
      gstin: "",
      pan: "",
      category: "",
      rating: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vendor: any) => {
    setEditingVendor(vendor);
    form.reset({
      legalName: vendor.legalName,
      gstin: vendor.gstin,
      pan: vendor.pan,
      category: vendor.category,
      rating: vendor.rating?.toString() || "",
      isActive: vendor.isActive ?? vendor.active ?? true,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVendor(null);
    form.reset();
  };

  const onSubmit = (data: FormValues) => {
    if (editingVendor) {
      editMutation.mutate({ id: editingVendor.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  // --- AG GRID COLUMN DEFINITIONS ---
  const columnDefs = useMemo(
    () => [
      { field: "legalName", headerName: "Vendor Name", flex: 1 },
      { field: "gstin", headerName: "GST Number", flex: 1, cellClass: "font-mono text-sm" },
      { field: "pan", headerName: "PAN", flex: 1, cellClass: "font-mono text-sm" },
      {
        field: "category",
        headerName: "Category",
        flex: 1,
        cellRenderer: (params: any) => {
          if (!params.value) return "-";
          return (
            <span className="px-2 py-1 mt-2 inline-block bg-primary/20 text-primary rounded-full text-xs">
              {params.value}
            </span>
          );
        },
      },
      {
        field: "rating",
        headerName: "Rating",
        flex: 1,
        cellRenderer: (params: any) => {
          const ratingValue = params.value ? (params.value / 10000).toFixed(2) : "0.00";
          return (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-yellow-500">★</span>
              <span>{ratingValue}</span>
            </div>
          );
        },
      },
      {
        field: "isActive",
        headerName: "Status",
        flex: 1,
        cellRenderer: (params: any) => {
          const isActive = params.value ?? params.data.active ?? true;
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
                onClick={() => setVendorToDelete(params.data.id)}
              >
                <Trash2 className="size-4 text-destructive" />
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
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
              <h3 className="font-semibold text-red-800">Something went wrong</h3>
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
          <h1>Vendor Master</h1>
          <p className="text-sm text-muted-foreground">
            Manage vendor and supplier information
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Plus className="size-5" /> Add Vendor
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <Table
          rowData={vendors}
          columnDefs={columnDefs}
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* --- ADD / EDIT MODAL --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingVendor ? "Edit Vendor" : "Add Vendor"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="legalName"
                    rules={{ required: "Vendor Name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor Name</FormLabel>
                        <FormControl>
                          <AntdInput placeholder="Enter vendor name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gstin"
                  rules={{ required: "GST Number is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST Number</FormLabel>
                      <FormControl>
                        <AntdInput placeholder="Enter GSTIN" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pan"
                  rules={{ required: "PAN is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN</FormLabel>
                      <FormControl>
                        <AntdInput placeholder="Enter PAN" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <AntdInput placeholder="Enter category" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <AntdInputNumber
                          {...field}
                          className="w-full"
                          style={{ width: "100%" }}
                          placeholder="Enter rating"
                          onChange={(value) => field.onChange(value ?? "")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
        open={!!vendorToDelete}
        onOpenChange={() => setVendorToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              vendor and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (vendorToDelete) deleteMutation.mutate(vendorToDelete);
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