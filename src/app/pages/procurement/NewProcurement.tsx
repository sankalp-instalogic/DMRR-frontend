import { useNavigate } from "react-router";
import { Save, X, Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Input, Select, DatePicker, InputNumber } from "antd";
import dayjs from "dayjs";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";

interface DetailRow {
  quantity: string | number;
  location: string;
}

interface ProcurementFormValues {
  financialYear: string | undefined;
  itemName: string;
  demandType: "Districts" | "Other Departments" | "";
  selectedDistrictId: string | undefined; // Update this
  selectedDeptId: string | undefined; // Update this
  rows: DetailRow[];
  awardCost: string | number;
  savingAA: string | number;
  deliveryDeadline: dayjs.Dayjs | null;
}

export function NewProcurement() {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  // --- REACT HOOK FORM SETUP ---
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProcurementFormValues>({
    defaultValues: {
      financialYear: undefined,
      itemName: "",
      demandType: "",
      selectedDistrictId: undefined, // Change from "" to undefined
      selectedDeptId: undefined, // Change from "" to undefined
      rows: [{ quantity: "", location: "" }],
      awardCost: "",
      savingAA: "",
      deliveryDeadline: null,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rows",
  });

  const demandType = watch("demandType");

  // --- API QUERIES ---
  const { data: districtsData, isLoading: isDistrictsLoading } = useQuery({
    queryKey: ["districts-dropdown"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/districts", {
        params: { page: 1, pageSize: 100 },
      });
      return response.data;
    },
  });

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

  const districts = districtsData?.items ?? [];
  const departments = deptData?.items ?? [];

  // --- SUBMIT MUTATION ---
  const createProcurementMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await axiosPrivate.post("/api/v1/Procurements", payload, {
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      navigate("/procurement-list");
    },
  });

  // --- FORM SUBMISSION ---
  const onSubmit = (data: ProcurementFormValues) => {
    // Mapping items for payload
    const itemsPayload = data.rows.map((r) => ({
      quantity: Number(r.quantity) || 0,
      location: r.location,
    }));

    const totalQuantity = itemsPayload.reduce(
      (acc, curr) => acc + curr.quantity,
      0,
    );

    const payload = {
      financialYear: data.financialYear,
      itemName: data.itemName,
      demandFrom: data.demandType === "Districts" ? "1" : "2",
      beneficiaryDistrictId:
        data.demandType === "Districts" ? data.selectedDistrictId : null,
      beneficiaryDepartmentId:
        data.demandType === "Other Departments" ? data.selectedDeptId : null,
      aaValueLakhs: 0,
      awardCostInclGstLakhs: Number(data.awardCost) || 0,
      quantity: totalQuantity || Number(data.savingAA) || 0,
      deliveryDeadline: data.deliveryDeadline
        ? data.deliveryDeadline.toISOString()
        : null,
      deliveryLocation: data.rows[0]?.location || "",
      items: itemsPayload,
    };

    createProcurementMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">New Procurement</h1>
        <p className="text-sm text-muted-foreground">
          Capture procurement details and initiate the approval workflow
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Section 1: Basic Information */}
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-primary mb-5">
            Section 1: Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Financial Year */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Financial Year <span className="text-destructive">*</span>
              </label>
              <Controller
                name="financialYear"
                control={control}
                rules={{ required: "Required" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    className="w-full h-10"
                    placeholder="Select Financial Year"
                    status={errors.financialYear ? "error" : undefined}
                    options={[
                      { label: "2025-26", value: "2025-26" },
                      { label: "2024-25", value: "2024-25" },
                      { label: "2023-24", value: "2023-24" },
                    ]}
                  />
                )}
              />
              {errors.financialYear && (
                <p className="text-xs text-destructive mt-1">
                  {errors.financialYear.message}
                </p>
              )}
            </div>

            {/* Name of Item */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Name of Item <span className="text-destructive">*</span>
              </label>
              <Controller
                name="itemName"
                control={control}
                rules={{ required: "Required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    className="h-10"
                    placeholder="Enter item name"
                    status={errors.itemName ? "error" : undefined}
                  />
                )}
              />
              {errors.itemName && (
                <p className="text-xs text-destructive mt-1">
                  {errors.itemName.message}
                </p>
              )}
            </div>

            {/* Demand From */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Demand From <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-3 mb-4">
                {(["Districts", "Other Departments"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setValue("demandType", type, { shouldValidate: true });
                      setValue("selectedDistrictId", undefined); // Change from "" to undefined
                      setValue("selectedDeptId", undefined); // Change from "" to undefined
                    }}
                    className={`px-5 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      demandType === type
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Hidden field for DemandType validation */}
              <Controller
                name="demandType"
                control={control}
                rules={{ required: "Demand Type is Required" }}
                render={() => <></>}
              />
              {errors.demandType && (
                <p className="text-xs text-destructive mb-2">
                  {errors.demandType.message}
                </p>
              )}

              {demandType === "Districts" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">
                    Select District <span className="text-destructive">*</span>
                  </label>
                  <Controller
                    name="selectedDistrictId"
                    control={control}
                    rules={{ required: "District is Required" }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        className="w-full h-10 md:w-1/2"
                        placeholder={
                          isDistrictsLoading ? "Loading..." : "Select District"
                        }
                        disabled={isDistrictsLoading}
                        status={errors.selectedDistrictId ? "error" : undefined}
                        options={districts.map((d: any) => ({
                          label: d.name,
                          value: d.id,
                        }))}
                      />
                    )}
                  />
                  {errors.selectedDistrictId && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.selectedDistrictId.message}
                    </p>
                  )}
                </div>
              )}

              {demandType === "Other Departments" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">
                    Select Department{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <Controller
                    name="selectedDeptId"
                    control={control}
                    rules={{ required: "Department is Required" }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        className="w-full h-10 md:w-1/2"
                        placeholder={
                          isDepartmentsLoading
                            ? "Loading..."
                            : "Select Department"
                        }
                        disabled={isDepartmentsLoading}
                        status={errors.selectedDeptId ? "error" : undefined}
                        options={departments.map((d: any) => ({
                          label: `${d.name} ${d.code ? `(${d.code})` : ""}`,
                          value: d.id,
                        }))}
                      />
                    )}
                  />
                  {errors.selectedDeptId && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.selectedDeptId.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Procurement Details */}
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-primary mb-5">
            Section 2: Procurement Details
          </h2>

          {/* Item Table */}
          <div className="overflow-x-auto mb-5">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead className="bg-muted text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium w-16">
                    Sr No
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    Item Quantity
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Location</th>
                  <th className="px-4 py-3 text-center font-medium w-16">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fields.map((field, idx) => (
                  <tr key={field.id}>
                    <td className="px-4 py-2 text-muted-foreground">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2">
                      <Controller
                        name={`rows.${idx}.quantity` as const}
                        control={control}
                        rules={{ required: "Required" }}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            className="w-full"
                            style={{ width: "100%" }}
                            placeholder="e.g. 50"
                            status={
                              errors.rows?.[idx]?.quantity ? "error" : undefined
                            }
                          />
                        )}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Controller
                        name={`rows.${idx}.location` as const}
                        control={control}
                        rules={{ required: "Required" }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="e.g. Pune District HQ"
                            status={
                              errors.rows?.[idx]?.location ? "error" : undefined
                            }
                          />
                        )}
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(idx)}
                        disabled={fields.length === 1}
                        className="text-destructive hover:bg-destructive-muted disabled:opacity-30"
                        title="Remove row"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => append({ quantity: "", location: "" })}
            className="border-dashed border-primary text-primary hover:bg-info-muted mb-6"
          >
            <Plus className="size-4" />
            Add Row
          </Button>

          {/* Financial Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Award Cost Including GST (₹){" "}
                <span className="text-destructive">*</span>
              </label>
              <Controller
                name="awardCost"
                control={control}
                rules={{ required: "Required" }}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    className="w-full"
                    style={{ width: "100%" }}
                    placeholder="Enter amount"
                    status={errors.awardCost ? "error" : undefined}
                  />
                )}
              />
              {errors.awardCost && (
                <p className="text-xs text-destructive mt-1">
                  {errors.awardCost.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Total Items Qty
              </label>
              <Controller
                name="savingAA"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    className="w-full"
                    style={{ width: "100%" }}
                    placeholder="Enter Total Items Qty"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Delivery Deadline <span className="text-destructive">*</span>
              </label>
              <Controller
                name="deliveryDeadline"
                control={control}
                rules={{ required: "Required" }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    className="w-full"
                    status={errors.deliveryDeadline ? "error" : undefined}
                  />
                )}
              />
              {errors.deliveryDeadline && (
                <p className="text-xs text-destructive mt-1">
                  {errors.deliveryDeadline.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="p-6 bg-muted/20 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/procurement-list")}
          >
            <X className="size-4" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={createProcurementMutation.isPending}
          >
            {createProcurementMutation.isPending ? (
              <>
                <Spinner inline iconClassName="size-4" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
