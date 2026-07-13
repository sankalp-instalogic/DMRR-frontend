import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Plus, Power, PowerOff } from "lucide-react";
import { Table } from "../components/Table";

import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";
import { Input as AntdInput, Select as AntdSelect, Modal } from "antd";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import toast from "../../utils/toast";

// --- TYPES ---
interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
}

type FormValues = {
  name: string;
  username: string;
  email: string;
  password: string;
  role: string;
};

// Mirrors backend UserRole enum. The POST /api/v1/Users payload expects the
// role name (string), so we use the enum names as the option values.
const ROLE_OPTIONS = [
  { label: "Operator", value: "Operator" },
  { label: "Department Incharge", value: "DepartmentIncharge" },
];

export function UserManagement() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  // User pending an activate/deactivate confirmation.
  const [userToToggle, setUserToToggle] = useState<User | null>(null);

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      role: "Operator",
    },
  });

  // --- QUERIES ---
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Users");
      return response.data as User[];
    },
  });

  const users = data ?? [];

  // --- MUTATIONS ---
  const addMutation = useMutation({
    mutationFn: async (newData: FormValues) => {
      return await axiosPrivate.post("/api/v1/Users", newData, {
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
      closeModal();
    },
    onError: () => {
      toast.error("Failed to create user");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (user: User) => {
      const action = user.isActive ? "deactivate" : "activate";
      return await axiosPrivate.patch(`/api/v1/Users/${user.id}/${action}`);
    },
    onSuccess: (_res, user) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(
        user.isActive ? "User deactivated" : "User activated",
      );
      setUserToToggle(null);
    },
    onError: () => {
      toast.error("Failed to update user status");
    },
  });

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    form.reset({
      name: "",
      username: "",
      email: "",
      password: "",
      role: "Operator",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    form.reset();
  };

  const onSubmit = (values: FormValues) => {
    addMutation.mutate(values);
  };

  // --- COLUMN DEFINITIONS ---
  const columnDefs = useMemo(
    () => [
      { field: "name", headerName: "Name", flex: 1 },
      { field: "username", headerName: "Username", flex: 1 },
      { field: "email", headerName: "Email", flex: 1.5 },
      { field: "role", headerName: "Role", flex: 1 },
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
          const user = params.data as User;

          if (user.role === "Admin") {
            return null;
          }

          return (
            <div className="flex gap-2 mt-3">
              {user.isActive ? (
                <Button
                  variant="outline"
                  title="deactivate"
                  size="sm"
                  className="flex items-center gap-2 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setUserToToggle(user)}
                >
                  <PowerOff className="size-4" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  title="activate"
                  className="flex items-center gap-2 cursor-pointer text-success hover:bg-success/10 hover:text-success"
                  onClick={() => setUserToToggle(user)}
                >
                  <Power className="size-4" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) {
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
          <h1 className="text-[30px] font-bold text-primary">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage system users and their access
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Plus className="size-5" /> Add User
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <Table
          rowData={users}
          columnDefs={columnDefs}
          totalCount={users.length}
          page={1}
          totalPages={1}
          onPageChange={() => {}}
        />
      </div>

      {/* --- ADD USER MODAL --- */}
      <Modal
        open={isModalOpen}
        title="Add User"
        onCancel={closeModal}
        footer={null}
        centered
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <AntdInput placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              rules={{ required: "Username is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <AntdInput placeholder="Enter username" {...field} />
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
                  message: "Enter a valid email address",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <AntdInput placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              rules={{ required: "Password is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <AntdInput.Password
                      autoComplete="new-password"
                      placeholder="Enter password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              rules={{ required: "Role is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <AntdSelect
                      className="w-full"
                      placeholder="Select role"
                      value={field.value || undefined}
                      onChange={field.onChange}
                      getPopupContainer={(trigger) =>
                        trigger.parentElement as HTMLElement
                      }
                      options={ROLE_OPTIONS}
                    />
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
                disabled={addMutation.isPending}
              >
                {addMutation.isPending ? (
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

      {/* --- ACTIVATE / DEACTIVATE CONFIRMATION --- */}
      <Modal
        open={!!userToToggle}
        title={
          userToToggle?.isActive ? "Deactivate user?" : "Activate user?"
        }
        onCancel={() => setUserToToggle(null)}
        centered
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setUserToToggle(null)}
            >
              Cancel
            </Button>
            <Button
              variant={userToToggle?.isActive ? "destructive" : "default"}
              className="cursor-pointer"
              disabled={toggleMutation.isPending}
              onClick={() => {
                if (userToToggle) toggleMutation.mutate(userToToggle);
              }}
            >
              {toggleMutation.isPending ? (
                <>
                  <Spinner inline iconClassName="size-4" />
                  {userToToggle?.isActive ? "Deactivating..." : "Activating..."}
                </>
              ) : userToToggle?.isActive ? (
                "Deactivate"
              ) : (
                "Activate"
              )}
            </Button>
          </div>
        }
      >
        <p>
          Are you sure you want to{" "}
          {userToToggle?.isActive ? "deactivate" : "activate"}{" "}
          <span className="font-medium">{userToToggle?.name}</span>?
        </p>
      </Modal>
    </div>
  );
}
