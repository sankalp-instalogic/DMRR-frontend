import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Printer, Download, FileText } from "lucide-react";
import { Button } from "../../components/ui/button";

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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="size-5 text-muted-foreground" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary">Procurement Details</h1>
            <p className="text-sm text-muted-foreground">Read-only view of procurement record {mockData.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Printer className="size-4" /> Print
          </Button>
          <Button>
            <Download className="size-4" /> Download Summary
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden pointer-events-none">
        {/* SECTION 1: Basic Information */}
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-primary mb-4">Section 1: Basic Information</h2>
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
          <h2 className="text-lg font-semibold text-primary mb-4">Section 2: Approvals</h2>
          
          <div className="space-y-6">
            {/* SEC Approval */}
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-4 mb-4">
                <label className="font-medium text-sm">A. SEC Approval?</label>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-primary">{mockData.secApproval}</span>
                </div>
              </div>
              
              {mockData.secApproval === "Yes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-4 border-l-2 border-primary">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Date of Approval</label>
                    <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm">{mockData.secApprovalDate}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Approval Document</label>
                    <div className="w-full pointer-events-auto">
                      {mockData.secDocumentAvailable ? (
                        <Button variant="outline" className="w-full bg-info-muted text-info-muted-foreground border-info-border hover:bg-info-muted">
                          <Download className="size-4" /> Download SEC Approval Document
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 w-full px-3 py-2 bg-muted text-muted-foreground border border-border rounded-lg text-sm">
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
                  <span className="font-medium text-primary">{mockData.aaApproval}</span>
                </div>
              </div>
              
              {mockData.aaApproval === "Yes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-4 border-l-2 border-primary">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Date of Approval</label>
                    <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm">{mockData.aaApprovalDate}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Approval Document</label>
                    <div className="w-full pointer-events-auto">
                      {mockData.aaDocumentAvailable ? (
                        <Button variant="outline" className="w-full bg-info-muted text-info-muted-foreground border-info-border hover:bg-info-muted">
                          <Download className="size-4" /> Download AA Approval Document
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 w-full px-3 py-2 bg-muted text-muted-foreground border border-border rounded-lg text-sm">
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
                  <span className="font-medium text-primary">{mockData.contractAwarded}</span>
                </div>
              </div>
              
              {mockData.contractAwarded === "Yes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-4 border-l-2 border-primary">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Date of Award</label>
                    <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm">{mockData.contractAwardDate}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Contract Document</label>
                    <div className="w-full pointer-events-auto">
                      {mockData.contractDocumentAvailable ? (
                        <Button variant="outline" className="w-full bg-info-muted text-info-muted-foreground border-info-border hover:bg-info-muted">
                          <Download className="size-4" /> Download Contract Award Document
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 w-full px-3 py-2 bg-muted text-muted-foreground border border-border rounded-lg text-sm">
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
          <h2 className="text-lg font-semibold text-primary mb-4">Section 3: Procurement Details</h2>
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
              <div className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm min-h-20">{mockData.remarks}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
