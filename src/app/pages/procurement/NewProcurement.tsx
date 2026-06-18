import { useState } from "react";
import { useNavigate } from "react-router";
import { Save, X, Plus, Trash2 } from "lucide-react";

const maharashtraDistricts = [
  "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara",
  "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli",
  "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban",
  "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar",
  "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara",
  "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal",
];

const otherDepartments = ["Army", "NDRF", "SDRF"];

interface DetailRow {
  id: number;
  quantity: string;
  location: string;
}

export function NewProcurement() {
  const navigate = useNavigate();

  const [financialYear, setFinancialYear] = useState("");
  const [itemName, setItemName] = useState("");
  const [demandType, setDemandType] = useState<"Districts" | "Other Departments" | "">("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [rows, setRows] = useState<DetailRow[]>([{ id: 1, quantity: "", location: "" }]);
  const [awardCost, setAwardCost] = useState("");
  const [savingAA, setSavingAA] = useState("");
  const [deliveryDeadline, setDeliveryDeadline] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addRow = () => {
    setRows((prev) => [...prev, { id: Date.now(), quantity: "", location: "" }]);
  };

  const removeRow = (id: number) => {
    if (rows.length > 1) setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = (id: number, field: keyof DetailRow, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!financialYear) e.financialYear = "Required";
    if (!itemName.trim()) e.itemName = "Required";
    if (!demandType) e.demandType = "Required";
    if (demandType === "Districts" && !selectedDistrict) e.selectedDistrict = "Required";
    if (demandType === "Other Departments" && !selectedDept) e.selectedDept = "Required";
    rows.forEach((r, i) => {
      if (!r.quantity.trim()) e[`qty_${i}`] = "Required";
      if (!r.location.trim()) e[`loc_${i}`] = "Required";
    });
    if (!awardCost.trim()) e.awardCost = "Required";
    if (!deliveryDeadline) e.deliveryDeadline = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    if (demandType === "Districts") {
      navigate("/procurement/psc");
    } else {
      navigate("/procurement/tac");
    }
  };

  const fieldClass = (key: string) =>
    `w-full px-3 py-2 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
      errors[key] ? "border-red-400" : "border-border"
    }`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1F4D]">New Procurement</h1>
        <p className="text-sm text-muted-foreground">Capture procurement details and initiate the approval workflow</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Section 1: Basic Information */}
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-[#0B1F4D] mb-5">Section 1: Basic Information</h2>
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
              {errors.financialYear && <p className="text-xs text-destructive mt-1">{errors.financialYear}</p>}
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
              {errors.itemName && <p className="text-xs text-destructive mt-1">{errors.itemName}</p>}
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
                    onClick={() => { setDemandType(type); setSelectedDistrict(""); setSelectedDept(""); }}
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
              {errors.demandType && <p className="text-xs text-destructive mb-2">{errors.demandType}</p>}

              {demandType === "Districts" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select District <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className={fieldClass("selectedDistrict")}
                  >
                    <option value="">Select District</option>
                    {maharashtraDistricts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.selectedDistrict && <p className="text-xs text-destructive mt-1">{errors.selectedDistrict}</p>}
                </div>
              )}

              {demandType === "Other Departments" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select Department <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className={fieldClass("selectedDept")}
                  >
                    <option value="">Select Department</option>
                    {otherDepartments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.selectedDept && <p className="text-xs text-destructive mt-1">{errors.selectedDept}</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Procurement Details */}
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-[#0B1F4D] mb-5">Section 2: Procurement Details</h2>

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
                        placeholder="e.g. 50 Units"
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
              {errors.awardCost && <p className="text-xs text-destructive mt-1">{errors.awardCost}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Items Qty</label>
              <input
                type="number"
                placeholder="Enter Total Items Qty "
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
              {errors.deliveryDeadline && <p className="text-xs text-destructive mt-1">{errors.deliveryDeadline}</p>}
            </div>
          </div>

          {demandType && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <strong>Routing Notice:</strong>{" "}
              {demandType === "Districts"
                ? "After saving, this procurement will be forwarded to the Proposal Scrutiny Committee (PSC)."
                : "After saving, this procurement will be forwarded to the Technical Appraisal Committee (TAC)."}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="p-6 bg-muted/20 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/procurement/list")}
            className="px-6 py-2 bg-white border border-border text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <X className="size-4" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-[#0B1F4D] text-white font-medium rounded-lg hover:bg-opacity-90 flex items-center gap-2 transition-colors"
          >
            <Save className="size-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
