import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Save, RotateCcw, Upload, Download, FileText, ArrowLeft } from "lucide-react";

export function EditProcurement() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Initialize with some mock data based on ID
  const [formData, setFormData] = useState({
    financialYear: "2025-26",
    itemName: "Heavy Duty Excavator",
    beneficiaryDepartment: "Rural Development",
    vendorName: "Tata Hitachi",
    
    secApproval: "Yes",
    secApprovalDate: "2025-04-10",
    
    aaApproval: "Yes",
    aaApprovalDate: "2025-04-15",

    contractAwarded: "Yes",
    contractAwardDate: "2025-05-01",

    qty: "5",
    awardCost: "4500000",
    savingAmount: "500000",
    savingPercentage: "10",
    deliveryDeadline: "2025-10-01",
    itemsDelivered: "5",
    deliveryCompletion: "100",
    deliveryLocation: "Mumbai Central Depot",
    remarks: "All units delivered ahead of schedule and inspected. No issues found."
  });

  const handleSave = () => {
    alert("Procurement Record Updated Successfully");
    navigate("/procurement");
  };

  const handleReset = () => {
    // Logic to reset to original data
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="size-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-primary">Edit Procurement</h1>
          <p className="text-sm text-muted-foreground">Modify procurement information for {id || "PROC-2025-001"}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* SECTION 1: Basic Information */}
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-primary mb-4">Section 1: Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Financial Year</label>
              <select name="financialYear" value={formData.financialYear} onChange={handleChange} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg">
                <option value="">Select Financial Year</option>
                <option value="2025-26">2025-26</option>
                <option value="2024-25">2024-25</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name of Item</label>
              <input type="text" name="itemName" value={formData.itemName} onChange={handleChange} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Beneficiary Department</label>
              <select name="beneficiaryDepartment" value={formData.beneficiaryDepartment} onChange={handleChange} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg">
                <option value="">Select Department</option>
                <option value="Rural Development">Rural Development</option>
                <option value="Health">Health Department</option>
                <option value="Disaster Management">Disaster Management</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vendor Name</label>
              <input type="text" name="vendorName" value={formData.vendorName} onChange={handleChange} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
            </div>
          </div>
        </div>

        {/* SECTION 2: Approvals */}
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-primary mb-4">Section 2: Approvals</h2>
          
          <div className="space-y-6">
            {/* SEC Approval */}
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-4 mb-4">
                <label className="font-medium text-sm">A. SEC Approval?</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-sm">
                    <input type="radio" name="secApproval" value="Yes" checked={formData.secApproval === "Yes"} onChange={handleChange} className="text-primary" /> Yes
                  </label>
                  <label className="flex items-center gap-1.5 text-sm">
                    <input type="radio" name="secApproval" value="No" checked={formData.secApproval === "No"} onChange={handleChange} className="text-primary" /> No
                  </label>
                </div>
              </div>
              
              {formData.secApproval === "Yes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-4 border-l-2 border-primary">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date of Approval</label>
                    <input type="date" name="secApprovalDate" value={formData.secApprovalDate} onChange={handleChange} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Approval Document</label>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-100 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <FileText className="size-4" /> Current Document
                        </div>
                        <button className="p-1 text-blue-700 hover:bg-blue-100 rounded" title="Download">
                          <Download className="size-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="file" id="sec-file" className="hidden" />
                        <label htmlFor="sec-file" className="cursor-pointer flex items-center justify-center gap-2 w-full px-3 py-2 bg-input-background border border-border border-dashed rounded-lg hover:bg-muted text-sm text-muted-foreground transition-colors">
                          <Upload className="size-4" /> Replace File Upload
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AA Approval */}
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-4 mb-4">
                <label className="font-medium text-sm">B. AA Approval?</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-sm">
                    <input type="radio" name="aaApproval" value="Yes" checked={formData.aaApproval === "Yes"} onChange={handleChange} className="text-primary" /> Yes
                  </label>
                  <label className="flex items-center gap-1.5 text-sm">
                    <input type="radio" name="aaApproval" value="No" checked={formData.aaApproval === "No"} onChange={handleChange} className="text-primary" /> No
                  </label>
                </div>
              </div>
              
              {formData.aaApproval === "Yes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-4 border-l-2 border-primary">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date of Approval</label>
                    <input type="date" name="aaApprovalDate" value={formData.aaApprovalDate} onChange={handleChange} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Approval Document</label>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-100 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <FileText className="size-4" /> Current Document
                        </div>
                        <button className="p-1 text-blue-700 hover:bg-blue-100 rounded" title="Download">
                          <Download className="size-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="file" id="aa-file" className="hidden" />
                        <label htmlFor="aa-file" className="cursor-pointer flex items-center justify-center gap-2 w-full px-3 py-2 bg-input-background border border-border border-dashed rounded-lg hover:bg-muted text-sm text-muted-foreground transition-colors">
                          <Upload className="size-4" /> Replace File Upload
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Contract Awarded */}
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-4 mb-4">
                <label className="font-medium text-sm">C. Contract Awarded?</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-sm">
                    <input type="radio" name="contractAwarded" value="Yes" checked={formData.contractAwarded === "Yes"} onChange={handleChange} className="text-primary" /> Yes
                  </label>
                  <label className="flex items-center gap-1.5 text-sm">
                    <input type="radio" name="contractAwarded" value="No" checked={formData.contractAwarded === "No"} onChange={handleChange} className="text-primary" /> No
                  </label>
                </div>
              </div>
              
              {formData.contractAwarded === "Yes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-4 border-l-2 border-primary">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date of Award</label>
                    <input type="date" name="contractAwardDate" value={formData.contractAwardDate} onChange={handleChange} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contract Document</label>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <input type="file" id="contract-file" className="hidden" />
                        <label htmlFor="contract-file" className="cursor-pointer flex items-center justify-center gap-2 w-full px-3 py-2 bg-input-background border border-border border-dashed rounded-lg hover:bg-muted text-sm text-muted-foreground transition-colors">
                          <Upload className="size-4" /> Upload Button
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: Procurement Details */}
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-primary mb-4">Section 3: Procurement Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Qty (No)</label>
              <input type="number" name="qty" value={formData.qty} onChange={handleChange} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Award Cost Including GST (₹)</label>
              <input type="number" name="awardCost" value={formData.awardCost} onChange={handleChange} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Saving Against AA (₹)</label>
              <input type="number" name="savingAmount" value={formData.savingAmount} onChange={handleChange} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Saving Against AA (%)</label>
              <input type="number" name="savingPercentage" value={formData.savingPercentage} onChange={handleChange} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Delivery Deadline as per Contract</label>
              <input type="date" name="deliveryDeadline" value={formData.deliveryDeadline} onChange={handleChange} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Number of Items Delivered</label>
              <input type="number" name="itemsDelivered" value={formData.itemsDelivered} onChange={handleChange} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Delivery Completion (%)</label>
              <input type="number" name="deliveryCompletion" value={formData.deliveryCompletion} onChange={handleChange} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Delivery Location</label>
              <input type="text" name="deliveryLocation" value={formData.deliveryLocation} onChange={handleChange} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Remarks</label>
              <textarea name="remarks" rows={3} value={formData.remarks} onChange={handleChange} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg resize-none"></textarea>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="p-6 bg-muted/20 flex justify-end gap-4">
          <button onClick={handleReset} className="px-6 py-2 bg-white border border-border text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
            <RotateCcw className="size-4" /> Reset Changes
          </button>
          <button onClick={handleSave} className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-opacity-90 flex items-center gap-2 transition-colors">
            <Save className="size-4" /> Update Procurement
          </button>
        </div>
      </div>
    </div>
  );
}
