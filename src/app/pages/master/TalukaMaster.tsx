import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { Edit2, Plus, Trash2, Upload } from "lucide-react";
import { Table } from "../../components/Table";

import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import {
  Input as AntdInput,
  InputNumber as AntdInputNumber,
  Checkbox as AntdCheckbox,
  Select as AntdSelect,
  Modal,
} from "antd";
import type { ColDef } from "ag-grid-community";
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
  districtId: string;
  villages: number | string;
  isActive: boolean;
};

export function TalukaMaster() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  // Table State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaluka, setEditingTaluka] = useState<any | null>(null);
  const [talukaToDelete, setTalukaToDelete] = useState<string | null>(null);

  const form = useForm<FormValues>({
    defaultValues: {
      code: "",
      name: "",
      districtId: "",
      villages: "",
      isActive: true,
    },
  });

  // --- QUERIES ---
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["talukas", page, pageSize],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/talukas", {
        params: { page, pageSize },
      });
      return response.data;
    },
  });

  const { data: districtsData, isLoading: isDistrictsLoading } = useQuery({
    queryKey: ["districts"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/districts", {
        params: { page: 1, pageSize: 100 },
      });
      return response.data;
    },
  });

  const districts = districtsData ?? [];

  const districtMap = useMemo(() => {
    return Object.fromEntries(
      (districts?.items ?? []).map((district: any) => [
        district.id,
        district.name,
      ]),
    );
  }, [districts]);

  const talukas = data?.items ?? data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? talukas.length;

  // --- MUTATIONS ---
  const addMutation = useMutation({
    mutationFn: async (newData: FormValues) => {
      return await axiosPrivate.post("/api/v1/masters/talukas", newData, {
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talukas"] });
      closeModal();
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormValues }) => {
      return await axiosPrivate.put(`/api/v1/masters/talukas/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talukas"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await axiosPrivate.delete(`/api/v1/masters/talukas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talukas"] });
      setTalukaToDelete(null);
    },
  });

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    setEditingTaluka(null);
    form.reset({
      code: "",
      name: "",
      districtId: "",
      villages: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (taluka: any) => {
    setEditingTaluka(taluka);
    form.reset({
      code: taluka.code,
      name: taluka.name,
      districtId: taluka.districtId,
      villages: taluka.villages?.toString() || "",
      isActive: taluka.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTaluka(null);
    form.reset();
  };

  const onSubmit = (data: FormValues) => {
    if (editingTaluka) {
      editMutation.mutate({ id: editingTaluka.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  // --- AG GRID COLUMN DEFINITIONS ---
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: "code", headerName: "Taluka Code", flex: 1 },
      { field: "name", headerName: "Taluka Name", flex: 1 },
      {
        field: "districtId",
        headerName: "District",
        flex: 1,
        cellRenderer: (params: any) => {
          return districtMap[params.value] || "-";
        },
      },
      {
        field: "villages",
        headerName: "Villages",
        flex: 1,
        cellRenderer: (params: any) => params.value || "-",
      },
      {
        field: "isActive",
        headerName: "Status",
        flex: 1,
        cellRenderer: (params: any) => {
          const isActive = params.value !== false;
          return (
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 mt-2 text-xs font-medium ${
                isActive
                  ? "bg-success-muted text-success-muted-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isActive ? "bg-success" : "bg-muted-foreground"
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
              <Button
                variant="ghost"
                size="icon"
                className={"hover:bg-primary/10 hover:text-primary"}
                onClick={() => handleOpenEdit(params.data)}
              >
                <Edit2 className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={"hover:bg-destructive/10"}
                onClick={() => setTalukaToDelete(params.data.id)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          );
        },
      },
    ],
    [districtMap],
  );

  if (isLoading || isDistrictsLoading) {
    return <Spinner fullPage />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="max-w-md rounded-lg border border-destructive-border bg-destructive-muted p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="text-destructive">⚠️</div>
            <div>
              <h3 className="font-semibold text-destructive-muted-foreground">
                Something went wrong
              </h3>
              <p className="mt-1 text-sm text-destructive">
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
          <h1 className="text-[30px] font-bold text-primary">Taluka Master</h1>
          <p className="text-sm text-muted-foreground">
            Manage taluka information
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
            <Plus className="size-5" /> Add Taluka
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <Table
          rowData={talukas}
          columnDefs={columnDefs}
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* --- ADD / EDIT MODAL --- */}
      <Modal
        open={isModalOpen}
        title={editingTaluka ? "Edit Taluka" : "Add Taluka"}
        onCancel={closeModal}
        footer={null}
        centered
      >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={form.control}
                name="code"
                rules={{ required: "Taluka code is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taluka Code</FormLabel>
                    <FormControl>
                      <AntdInput placeholder="Enter taluka code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Taluka name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taluka Name</FormLabel>
                    <FormControl>
                      <AntdInput placeholder="Enter taluka name" {...field} />
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
                        className="w-full"
                        placeholder="Select District"
                        value={field.value || undefined}
                        getPopupContainer={(trigger) =>
                          trigger.parentElement as HTMLElement
                        }
                        onChange={field.onChange}
                        options={districts?.items?.map((district: any) => ({
                          value: district.id,
                          label: district.name,
                        }))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="villages"
                rules={{
                  required: "Number of villages is required",
                  min: {
                    value: 0,
                    message: "Must be a positive number",
                  },
                }}
                render={({ field }) => (
                  <FormControl>
                    <FormItem>
                      <FormLabel>Villages</FormLabel>
                      <AntdInputNumber
                        className="w-full"
                        style={{ width: "100%" }}
                        placeholder="Enter number of villages"
                        min={0}
                        value={field.value as number}
                        onChange={(value) => field.onChange(value ?? 0)}
                      />
                    </FormItem>
                  </FormControl>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row mt-2 items-center space-x-3 space-y-0 rounded-md border p-4">
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

              <div className="mt-6 flex justify-end gap-2">
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
                  {addMutation.isPending || editMutation.isPending ? (
                    <>
                      <Spinner inline iconClassName="size-4" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </form>
          </Form>
      </Modal>

      {/* --- DELETE CONFIRMATION DIALOG --- */}
      <Modal
        open={!!talukaToDelete}
        title="Are you absolutely sure?"
        onCancel={() => setTalukaToDelete(null)}
        centered
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setTalukaToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (talukaToDelete) deleteMutation.mutate(talukaToDelete);
              }}
            >
              {deleteMutation.isPending ? (
                <>
                  <Spinner inline iconClassName="size-4" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        }
      >
        <p>
          Are you sure you want to delete this taluka entry? This action cannot
          be undone
        </p>
      </Modal>
    </div>
  );
}
