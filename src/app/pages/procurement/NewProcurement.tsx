import { useState } from "react";
import { useNavigate } from "react-router";
import { Save, X, Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

interface DetailRow {
  id: number;
  quantity: string;
  location: string;
}

export function NewProcurement() {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  // --- FORM STATE ---
  const [financialYear, setFinancialYear] = useState("");
  const [itemName, setItemName] = useState("");
  const [demandType, setDemandType] = useState<"Districts" | "Other Departments" | "">("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [rows, setRows] = useState<DetailRow[]>([
    { id: 1, quantity: "", location: "" },
  ]);
  const [awardCost, setAwardCost] = useState("");
  const [savingAA, setSavingAA] = useState(""); // Captures Total Items Qty as per existing UI label
  const [deliveryDeadline, setDeliveryDeadline] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- API QUERIES ---
  // Fetch Districts List
  const { data: districtsData, isLoading: isDistrictsLoading } = useQuery({
    queryKey: ["districts-dropdown"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/districts", {
        params: { page: 1, pageSize: 100 },
      });
      return response.data;
    },
  });

  // Fetch Line Departments List
  const { data: deptData, isLoading: isDepartmentsLoading } = useQuery({
    queryKey: ["departments-dropdown"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/line-departments", {
        params: { page: 1, pageSize: 100 },
      });
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

  // --- TABLE ACTIONS ---
  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: Date.now(), quantity: "", location: "" },
    ]);
  };

  const removeRow = (id: number) => {
    if (rows.length > 1) setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = (id: number, field: keyof DetailRow, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  // --- VALIDATION ---
  const validate = () => {
    const e: Record<string, string> = {};
    if (!financialYear) e.financialYear = "Required";
    if (!itemName.trim()) e.itemName = "Required";
    if (!demandType) e.demandType = "Required";
    if (demandType === "Districts" && !selectedDistrictId)
      e.selectedDistrictId = "Required";
    if (demandType === "Other Departments" && !selectedDeptId)
      e.selectedDeptId = "Required";
    
    rows.forEach((r, i) => {
      if (!r.quantity.trim()) e[`qty_${i}`] = "Required";
      if (!r.location.trim()) e[`loc_${i}`] = "Required";
    });
    
    if (!awardCost.trim()) e.awardCost = "Required";
    if (!deliveryDeadline) e.deliveryDeadline = "Required";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // --- SAVE / HANDLER ---
  const handleSave = () => {
    if (!validate()) return;

    // Mapping items for payload
    const itemsPayload = rows.map((r) => ({
      quantity: Number(r.quantity) || 0, // Fallback to 0 if input string contains characters
      location: r.location,
    }));

    // Summing quantities up or falling back to the total quantity provided
    const totalQuantity = itemsPayload.reduce((acc, curr) => acc + curr.quantity, 0);

    // Build POST request schema layout
    const payload = {
      financialYear,
      itemName,
      demandFrom: demandType === "Districts" ? "1" : "2",
      beneficiaryDistrictId: demandType === "Districts" ? selectedDistrictId : null,
      beneficiaryDepartmentId: demandType === "Other Departments" ? selectedDeptId : null,
      aaValueLakhs: 0, // Fallback placeholder standard value
      awardCostInclGstLakhs: Number(awardCost) || 0,
      quantity: totalQuantity || Number(savingAA) || 0,
      deliveryDeadline: new Date(deliveryDeadline).toISOString(),
      deliveryLocation: rows[0]?.location || "", // Root location fallback to primary first item location
      items: itemsPayload,
    };

    createProcurementMutation.mutate(payload);
  };

  const fieldClass = (key: string) =>
    `w-full px-3 py-2 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
      errors[key] ? "border-red-400" : "border-border"
    }`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1F4D]">New Procurement</h1>
        <p className="text-sm text-muted-foreground">
          Capture procurement details and initiate the approval workflow
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Section 1: Basic Information */}
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-[#0B1F4D] mb-5">
            Section 1: Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Financial Year */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Financial Year <span className="text-destructive">*</span>
              </label>
              <select
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className={fieldClass("financialYear")}
              >
                <option value="">Select Financial Year</option>
                <option value="2025-26">2025-26</option>
                <option value="2024-25">2024-25</option>
                <option value="2023-24">2023-24</option>
              </select>
              {errors.financialYear && (
                <p className="text-xs text-destructive mt-1">
                  {errors.financialYear}
                </p>
              )}
            </div>

            {/* Name of Item */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Name of Item <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter item name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className={fieldClass("itemName")}
              />
              {errors.itemName && (
                <p className="text-xs text-destructive mt-1">
                  {errors.itemName}
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
                      setDemandType(type);
                      setSelectedDistrictId("");
                      setSelectedDeptId("");
                    }}
                    className={`px-5 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      demandType === type
                        ? "bg-[#0B1F4D] text-white border-[#0B1F4D]"
                        : "bg-white text-gray-700 border-border hover:bg-muted"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {errors.demandType && (
                <p className="text-xs text-destructive mb-2">
                  {errors.demandType}
                </p>
              )}

              {demandType === "Districts" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select District <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={selectedDistrictId}
                    onChange={(e) => setSelectedDistrictId(e.target.value)}
                    className={fieldClass("selectedDistrictId")}
                    disabled={isDistrictsLoading}
                  >
                    <option value="">
                      {isDistrictsLoading ? "Loading Districts..." : "Select District"}
                    </option>
                    {districts.map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  {errors.selectedDistrictId && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.selectedDistrictId}
                    </p>
                  )}
                </div>
              )}

              {demandType === "Other Departments" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select Department <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className={fieldClass("selectedDeptId")}
                    disabled={isDepartmentsLoading}
                  >
                    <option value="">
                      {isDepartmentsLoading ? "Loading Departments..." : "Select Department"}
                    </option>
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.name} {d.code ? `(${d.code})` : ""}
                      </option>
                    ))}
                  </select>
                  {errors.selectedDeptId && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.selectedDeptId}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Procurement Details */}
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-[#0B1F4D] mb-5">
            Section 2: Procurement Details
          </h2>

          {/* Item Table */}
          <div className="overflow-x-auto mb-5">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead className="bg-muted text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium w-16">Sr No</th>
                  <th className="px-4 py-3 text-left font-medium">Item Quantity</th>
                  <th className="px-4 py-3 text-left font-medium">Location</th>
                  <th className="px-4 py-3 text-center font-medium w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row, idx) => (
                  <tr key={row.id}>
                    <td className="px-4 py-2 text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        placeholder="e.g. 50"
                        value={row.quantity}
                        onChange={(e) => updateRow(row.id, "quantity", e.target.value)}
                        className={`w-full px-3 py-1.5 bg-input-background border rounded-lg text-sm ${
                          errors[`qty_${idx}`] ? "border-red-400" : "border-border"
                        }`}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        placeholder="e.g. Pune District HQ"
                        value={row.location}
                        onChange={(e) => updateRow(row.id, "location", e.target.value)}
                        className={`w-full px-3 py-1.5 bg-input-background border rounded-lg text-sm ${
                          errors[`loc_${idx}`] ? "border-red-400" : "border-border"
                        }`}
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        disabled={rows.length === 1}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded disabled:opacity-30 transition-colors"
                        title="Remove row"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={addRow}
            className="px-4 py-2 border border-dashed border-[#0B1F4D] text-[#0B1F4D] rounded-lg text-sm hover:bg-blue-50 flex items-center gap-2 transition-colors mb-6"
          >
            <Plus className="size-4" />
            Add Row
          </button>

          {/* Financial Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Award Cost Including GST (₹) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                placeholder="Enter amount"
                value={awardCost}
                onChange={(e) => setAwardCost(e.target.value)}
                className={fieldClass("awardCost")}
              />
              {errors.awardCost && (
                <p className="text-xs text-destructive mt-1">
                  {errors.awardCost}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Items Qty</label>
              <input
                type="number"
                placeholder="Enter Total Items Qty"
                value={savingAA}
                onChange={(e) => setSavingAA(e.target.value)}
                className={fieldClass("savingAA")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Delivery Deadline as per Contract <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                value={deliveryDeadline}
                onChange={(e) => setDeliveryDeadline(e.target.value)}
                className={fieldClass("deliveryDeadline")}
              />
              {errors.deliveryDeadline && (
                <p className="text-xs text-destructive mt-1">
                  {errors.deliveryDeadline}
                </p>
              )}
            </div>
          </div>

        </div>

        {/* Buttons */}
        <div className="p-6 bg-muted/20 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/procurement-list")}
            className="px-6 py-2 bg-white border border-border text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <X className="size-4" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={createProcurementMutation.isPending}
            className="px-6 py-2 bg-[#0B1F4D] text-white font-medium rounded-lg hover:bg-opacity-90 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="size-4" />
            {createProcurementMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}