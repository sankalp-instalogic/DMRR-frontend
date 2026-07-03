import { useState } from "react";
import { useNavigate } from "react-router";
import { Save, RotateCcw, Upload, FileText } from "lucide-react";
import { Button } from "../../components/ui/button";

export function CreateProcurement() {
  const navigate = useNavigate();
  const [secApproval, setSecApproval] = useState("No");
  const [aaApproval, setAaApproval] = useState("No");
  const [contractAwarded, setContractAwarded] = useState("No");

  const handleSave = () => {
    alert("Procurement Record Saved Successfully");
    navigate("/procurement");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Create Procurement</h1>
        <p className="text-sm text-muted-foreground">Capture procurement details</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* SECTION 1: Basic Information */}
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-primary mb-4">Section 1: Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Financial Year</label>
              <select className="w-full px-3 py-2 bg-input-background border border-border rounded-lg">
                <option value="">Select Financial Year</option>
                <option value="2025-26">2025-26</option>
                <option value="2024-25">2024-25</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name of Item</label>
              <input type="text" placeholder="Enter item name" className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Beneficiary Department</label>
              <select className="w-full px-3 py-2 bg-input-background border border-border rounded-lg">
                <option value="">Select Department</option>
                <option value="Rural Development">Rural Development</option>
                <option value="Health">Health Department</option>
                <option value="Disaster Management">Disaster Management</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vendor Name</label>
              <input type="text" placeholder="Enter vendor name" className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
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
                    <input type="radio" name="secApproval" value="Yes" checked={secApproval === "Yes"} onChange={(e) => setSecApproval(e.target.value)} className="text-primary" /> Yes
                  </label>
                  <label className="flex items-center gap-1.5 text-sm">
                    <input type="radio" name="secApproval" value="No" checked={secApproval === "No"} onChange={(e) => setSecApproval(e.target.value)} className="text-primary" /> No
                  </label>
                </div>
              </div>
              
              {secApproval === "Yes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-4 border-l-2 border-primary">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date of Approval</label>
                    <input type="date" className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">File Upload</label>
                    <div className="flex items-center gap-2">
                      <input type="file" id="sec-file" className="hidden" />
                      <label htmlFor="sec-file" className="cursor-pointer flex items-center justify-center gap-2 w-full px-3 py-2 bg-input-background border border-border border-dashed rounded-lg hover:bg-muted text-sm text-muted-foreground transition-colors">
                        <Upload className="size-4" /> Upload SEC Document
                      </label>
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
                    <input type="radio" name="aaApproval" value="Yes" checked={aaApproval === "Yes"} onChange={(e) => setAaApproval(e.target.value)} className="text-primary" /> Yes
                  </label>
                  <label className="flex items-center gap-1.5 text-sm">
                    <input type="radio" name="aaApproval" value="No" checked={aaApproval === "No"} onChange={(e) => setAaApproval(e.target.value)} className="text-primary" /> No
                  </label>
                </div>
              </div>
              
              {aaApproval === "Yes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-4 border-l-2 border-primary">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date of Approval</label>
                    <input type="date" className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">File Upload</label>
                    <div className="flex items-center gap-2">
                      <input type="file" id="aa-file" className="hidden" />
                      <label htmlFor="aa-file" className="cursor-pointer flex items-center justify-center gap-2 w-full px-3 py-2 bg-input-background border border-border border-dashed rounded-lg hover:bg-muted text-sm text-muted-foreground transition-colors">
                        <Upload className="size-4" /> Upload AA Document
                      </label>
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
                    <input type="radio" name="contractAwarded" value="Yes" checked={contractAwarded === "Yes"} onChange={(e) => setContractAwarded(e.target.value)} className="text-primary" /> Yes
                  </label>
                  <label className="flex items-center gap-1.5 text-sm">
                    <input type="radio" name="contractAwarded" value="No" checked={contractAwarded === "No"} onChange={(e) => setContractAwarded(e.target.value)} className="text-primary" /> No
                  </label>
                </div>
              </div>
              
              {contractAwarded === "Yes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-4 border-l-2 border-primary">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date of Award</label>
                    <input type="date" className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">File Upload</label>
                    <div className="flex items-center gap-2">
                      <input type="file" id="contract-file" className="hidden" />
                      <label htmlFor="contract-file" className="cursor-pointer flex items-center justify-center gap-2 w-full px-3 py-2 bg-input-background border border-border border-dashed rounded-lg hover:bg-muted text-sm text-muted-foreground transition-colors">
                        <Upload className="size-4" /> Upload Contract Document
                      </label>
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
              <input type="number" placeholder="Enter quantity" className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Award Cost Including GST (₹)</label>
              <input type="number" placeholder="Enter cost" className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Saving Against AA (₹)</label>
              <input type="number" placeholder="Enter savings amount" className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Saving Against AA (%)</label>
              <input type="number" placeholder="Enter savings percentage" className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Delivery Deadline as per Contract</label>
              <input type="date" className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Number of Items Delivered</label>
              <input type="number" placeholder="Enter delivered items" className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Delivery Completion (%)</label>
              <input type="number" placeholder="Enter completion percentage" className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Delivery Location</label>
              <input type="text" placeholder="Enter delivery location" className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Remarks</label>
              <textarea rows={3} placeholder="Enter any additional remarks..." className="w-full px-3 py-2 bg-input-background border border-border rounded-lg resize-none"></textarea>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="p-6 bg-muted/20 flex justify-end gap-4">
          <Button variant="outline">
            <RotateCcw className="size-4" /> Reset to Default
          </Button>
          <Button onClick={handleSave}>
            <Save className="size-4" /> Save
          </Button>
        </div>
      </div>
    </div>
  );
}
