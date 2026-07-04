import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { Table } from "../../components/Table";
import PhoneInput from "antd-phone-input";

import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import {
  Input as AntdInput,
  Select as AntdSelect,
  Checkbox as AntdCheckbox,
  Modal,
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
  name: string;
  designation: string;
  lineDepartmentId: string;
  districtId: string;
  email: string;
  phone: string;
  isActive: boolean;
};

export function OfficerMaster() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  // Table State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<any | null>(null);
  const [officerToDelete, setOfficerToDelete] = useState<string | null>(null);

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      designation: "",
      lineDepartmentId: "",
      districtId: "",
      email: "",
      phone: "",
      isActive: true,
    },
  });

  // --- QUERIES ---

  // 1. Fetch Officers
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["officers", page, pageSize],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/officers", {
        params: { page, pageSize },
      });
      return response.data;
    },
  });

  // 2. Fetch Districts
  const { data: districtsData, isLoading: isDistrictsLoading } = useQuery({
    queryKey: ["districts"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/districts", {
        params: { page: 1, pageSize: 100 },
      });
      return response.data;
    },
  });

  // 3. Fetch Departments
  const { data: deptData, isLoading: isDepartmentsLoading } = useQuery({
    queryKey: ["departments-dropdown"],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        "/api/v1/masters/line-departments",
        {
          params: { page: 1, pageSize: 100 },
        },
      );
      return response.data;
    },
  });

  const officers = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;

  const districts = districtsData ?? [];
  const departments = deptData?.items ?? [];

  const districtMap = useMemo(() => {
    if (isDistrictsLoading) return {};
    return Object.fromEntries(
      (districts.items ?? []).map((district: any) => [
        district.id,
        district.name,
      ]),
    );
  }, [districts.items, isDistrictsLoading]);

  const departmentsMap = useMemo(() => {
    if (isDepartmentsLoading) return {};
    return Object.fromEntries(
      (departments ?? []).map((dept: any) => [dept.id, dept.name]),
    );
  }, [departments, isDepartmentsLoading]);

  // --- MUTATIONS ---
  const addMutation = useMutation({
    mutationFn: async (newData: FormValues) => {
      return await axiosPrivate.post("/api/v1/masters/officers", newData, {
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["officers"] });
      closeModal();
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormValues }) => {
      return await axiosPrivate.put(`/api/v1/masters/officers/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["officers"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await axiosPrivate.delete(`/api/v1/masters/officers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["officers"] });
      setOfficerToDelete(null);
    },
  });

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    setEditingOfficer(null);
    form.reset({
      name: "",
      designation: "",
      lineDepartmentId: "",
      districtId: "",
      email: "",
      phone: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (officer: any) => {
    setEditingOfficer(officer);
    form.reset({
      name: officer.name || "",
      designation: officer.designation || "",
      // ✅ Look for the flat ID first, then the nested ID, then fallback to an empty string
      lineDepartmentId:
        officer.lineDepartmentId || officer.lineDepartment?.id || "",
      districtId: officer.districtId || officer.district?.id || "",
      email: officer.email || "",
      phone: officer.phone || "1234567890",
      isActive: officer.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOfficer(null);
    form.reset();
  };

  const onSubmit = (data: FormValues) => {
    if (editingOfficer) {
      editMutation.mutate({ id: editingOfficer.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  // --- AG GRID COLUMN DEFINITIONS ---
  const columnDefs = useMemo(
    () => [
      { field: "name", headerName: "Name", flex: 1 },
      { field: "designation", headerName: "Designation", flex: 1 },
      {
        field: "lineDepartmentId",
        headerName: "Department",
        flex: 1,
        cellRenderer: (params: any) => departmentsMap[params.value] || "-",
      },
      {
        field: "districtId",
        headerName: "District",
        flex: 1,
        cellRenderer: (params: any) => districtMap[params.value] || "-",
      },
      { field: "email", headerName: "Email", flex: 1 },
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
                onClick={() => setOfficerToDelete(params.data.id)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          );
        },
      },
    ],
    [districtMap, departmentsMap],
  );

  if (isLoading || isDistrictsLoading || isDepartmentsLoading) {
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
          <h1 className="text-[30px] font-bold text-primary">Officer Master</h1>
          <p className="text-sm text-muted-foreground">
            Manage officer information
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Plus className="size-5" /> Add Officer
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <Table
          rowData={officers}
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
        title={editingOfficer ? "Edit Officer" : "Add Officer"}
        onCancel={closeModal}
        footer={null}
        width={900}
        centered
        styles={{ body: { maxHeight: "75vh", overflowY: "auto" } }}
      >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: "Officer name is required" }}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Officer Name</FormLabel>
                      <FormControl>
                        <AntdInput
                          placeholder="Enter officer name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="designation"
                  rules={{ required: "Designation is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <FormControl>
                        <AntdInput placeholder="Enter designation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lineDepartmentId"
                  rules={{ required: "Department is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <AntdSelect
                          className="w-full"
                          placeholder="Select Department"
                          value={field.value || undefined}
                          onChange={field.onChange}
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
                          className="w-full"
                          placeholder="Select District"
                          value={field.value || undefined}
                          onChange={field.onChange}
                          getPopupContainer={(trigger) =>
                            trigger.parentElement as HTMLElement
                          }
                          options={districts?.items?.map((district: any) => ({
                            label: district.name,
                            value: district.id,
                          }))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <AntdInput
                          type="email"
                          placeholder="Enter email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <PhoneInput
                        preferredCountries={["in"]}
                          country="in"
                          disableParentheses
                          enableSearch
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(
                              `+${value.countryCode}${value.areaCode}${value.phoneNumber}`,
                            );
                          }}
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
                    <FormItem className="col-span-2">
                      <FormControl>
                        <AntdCheckbox
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        >
                          Is Active?
                        </AntdCheckbox>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

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
        open={!!officerToDelete}
        title="Are you absolutely sure?"
        onCancel={() => setOfficerToDelete(null)}
        centered
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setOfficerToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (officerToDelete) deleteMutation.mutate(officerToDelete);
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
          Are you sure you want to delete this officer entry? This action cannot
          be undone
        </p>
      </Modal>
    </div>
  );
}
