import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Printer, Download, FileText } from "lucide-react";

export function ProcurementOpen() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data based on the ID for demo purposes
  const mockData = {
    id: id || "PROC-2025-001",
    financialYear: "2025-26",
    itemName: "Heavy Duty Excavator",
    beneficiaryDepartment: "Rural Development",
    vendorName: "Tata Hitachi",
    
    secApproval: "Yes",
    secApprovalDate: "2025-04-10",
    secDocumentAvailable: true,

    aaApproval: "Yes",
    aaApprovalDate: "2025-04-15",
    aaDocumentAvailable: true,

    contractAwarded: "Yes",
    contractAwardDate: "2025-05-01",
    contractDocumentAvailable: false,

    qty: "5",
    awardCost: "4500000",
    savingAmount: "500000",
    savingPercentage: "10",
    deliveryDeadline: "2025-10-01",
    itemsDelivered: "5",
    deliveryCompletion: "100",
    deliveryLocation: "Mumbai Central Depot",
    remarks: "All units delivered ahead of schedule and inspected. No issues found."
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="size-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#0B1F4D]">Procurement Details</h1>
            <p className="text-sm text-muted-foreground">Read-only view of procurement record {mockData.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-border text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
            <Printer className="size-4" /> Print
          </button>
          <button className="px-4 py-2 bg-[#0B1F4D] text-white font-medium rounded-lg hover:bg-opacity-90 flex items-center gap-2 transition-colors">
            <Download className="size-4" /> Download Summary
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden pointer-events-none">
        {/* SECTION 1: Basic Information */}
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-[#0B1F4D] mb-4">Section 1: Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Financial Year</label>
              <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm">{mockData.financialYear}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Name of Item</label>
              <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm">{mockData.itemName}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Beneficiary Department</label>
              <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm">{mockData.beneficiaryDepartment}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Vendor Name</label>
              <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm">{mockData.vendorName}</div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Approvals */}
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-[#0B1F4D] mb-4">Section 2: Approvals</h2>
          
          <div className="space-y-6">
            {/* SEC Approval */}
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-4 mb-4">
                <label className="font-medium text-sm">A. SEC Approval?</label>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-[#0B1F4D]">{mockData.secApproval}</span>
                </div>
              </div>
              
              {mockData.secApproval === "Yes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-4 border-l-2 border-[#0B1F4D]">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Date of Approval</label>
                    <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm">{mockData.secApprovalDate}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Approval Document</label>
                    <div className="w-full pointer-events-auto">
                      {mockData.secDocumentAvailable ? (
                        <button className="flex items-center gap-2 w-full px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors">
                          <Download className="size-4" /> Download SEC Approval Document
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 w-full px-3 py-2 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg text-sm">
                          <FileText className="size-4" /> No Document Uploaded
                        </div>
                      )}
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
                  <span className="font-medium text-[#0B1F4D]">{mockData.aaApproval}</span>
                </div>
              </div>
              
              {mockData.aaApproval === "Yes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-4 border-l-2 border-[#0B1F4D]">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Date of Approval</label>
                    <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm">{mockData.aaApprovalDate}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Approval Document</label>
                    <div className="w-full pointer-events-auto">
                      {mockData.aaDocumentAvailable ? (
                        <button className="flex items-center gap-2 w-full px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors">
                          <Download className="size-4" /> Download AA Approval Document
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 w-full px-3 py-2 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg text-sm">
                          <FileText className="size-4" /> No Document Uploaded
                        </div>
                      )}
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
                  <span className="font-medium text-[#0B1F4D]">{mockData.contractAwarded}</span>
                </div>
              </div>
              
              {mockData.contractAwarded === "Yes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-4 border-l-2 border-[#0B1F4D]">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Date of Award</label>
                    <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm">{mockData.contractAwardDate}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Contract Document</label>
                    <div className="w-full pointer-events-auto">
                      {mockData.contractDocumentAvailable ? (
                        <button className="flex items-center gap-2 w-full px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors">
                          <Download className="size-4" /> Download Contract Award Document
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 w-full px-3 py-2 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg text-sm">
                          <FileText className="size-4" /> No Document Uploaded
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: Procurement Details */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-[#0B1F4D] mb-4">Section 3: Procurement Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Qty (No)</label>
              <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm">{mockData.qty}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Award Cost Including GST (₹)</label>
              <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm">{mockData.awardCost}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Saving Against AA (₹)</label>
              <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm">{mockData.savingAmount}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Saving Against AA (%)</label>
              <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm">{mockData.savingPercentage}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Delivery Deadline as per Contract</label>
              <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm">{mockData.deliveryDeadline}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Number of Items Delivered</label>
              <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm">{mockData.itemsDelivered}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Delivery Completion (%)</label>
              <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm">{mockData.deliveryCompletion}</div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Delivery Location</label>
              <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm">{mockData.deliveryLocation}</div>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Remarks</label>
              <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm min-h-[80px]">{mockData.remarks}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
