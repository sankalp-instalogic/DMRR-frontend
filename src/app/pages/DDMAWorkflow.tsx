import { useState } from "react";
import { Forward, Upload, Save, FileText } from "lucide-react";

export function DDMAWorkflow() {
  return (
    <div className="space-y-6">
      <div>
        <h1>DDMA & Line Department Workflow</h1>
        <p className="text-sm text-muted-foreground">Proposal routing and department assignment</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="mb-4">Proposal Routing</h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm mb-2">Proposal ID</label>
            <input
              type="text"
              value="DMRR/2025/MUM/001"
              disabled
              className="w-full px-4 py-2 bg-muted border border-border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Collector Forward To</label>
            <select className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select Department</option>
              <option value="pwd">Public Works Department (PWD)</option>
              <option value="wrd">Water Resources Department (WRD)</option>
              <option value="swcd">Soil & Water Conservation (SWCD)</option>
              <option value="forest">Forest Department</option>
              <option value="urban">Urban Development</option>
              <option value="local">Local Bodies</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2">Cost Estimation (₹ Lakhs)</label>
            <input
              type="number"
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter cost estimation"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Upload Resolution</label>
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              <div className="text-center">
                <Upload className="size-8 text-muted-foreground mx-auto mb-3" />
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
                  Upload DDMA Resolution
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Upload Technical Sanction</label>
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              <div className="text-center">
                <Upload className="size-8 text-muted-foreground mx-auto mb-3" />
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
                  Upload Technical Sanction
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            {/* <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2">
              <Forward className="size-5" />
              Forward to Department
            </button>
            <button className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 flex items-center gap-2">
              <FileText className="size-5" />
              Revise Proposal
            </button> */}
            <button className="px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 flex items-center gap-2">
              <Save className="size-5" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
