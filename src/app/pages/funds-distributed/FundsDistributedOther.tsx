import { useState } from "react";
import { Eye, Printer, Download, ArrowLeft, Plus, FileText } from "lucide-react";

type RecordType = {
  id: string;
  srNo: number;
  department: string;
  head: string;
  allocatedAmount: string;
  utilizedAmount: string;
  date: string;
};

const DUMMY_RECORDS: RecordType[] = [
  { id: "1", srNo: 1, department: "PWD", head: "Flood Protection", allocatedAmount: "₹500 Cr", utilizedAmount: "₹350 Cr", date: "20-05-2026" },
  { id: "2", srNo: 2, department: "WRD", head: "Emergency Materials", allocatedAmount: "₹300 Cr", utilizedAmount: "₹200 Cr", date: "18-05-2026" },
  { id: "3", srNo: 3, department: "Health", head: "Equipment Purchase", allocatedAmount: "₹150 Cr", utilizedAmount: "₹100 Cr", date: "15-05-2026" },
  { id: "4", srNo: 4, department: "Forest", head: "Relief Activities", allocatedAmount: "₹80 Cr", utilizedAmount: "₹60 Cr", date: "10-05-2026" },
  { id: "5", srNo: 5, department: "Urban Development", head: "Monitoring Systems", allocatedAmount: "₹200 Cr", utilizedAmount: "₹150 Cr", date: "05-05-2026" },
];

const DEPARTMENTS = [
  "PWD", "WRD", "Health", "Forest", "Urban Development", "Rural Development"
];

export function FundsDistributedOther() {
  const [activeTab, setActiveTab] = useState<"overview" | "new" | "view">("overview");
  const [records, setRecords] = useState<RecordType[]>(DUMMY_RECORDS);
  const [viewRecord, setViewRecord] = useState<RecordType | null>(null);

  // Form states
  const [formDepartment, setFormDepartment] = useState("");
  const [formHead, setFormHead] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formAllocated, setFormAllocated] = useState("");
  const [formUtilized, setFormUtilized] = useState("");

  const handleView = (record: RecordType) => {
    setViewRecord(record);
    setActiveTab("view");
  };

  const handleSave = () => {
    const newEntry: RecordType = {
      id: Math.random().toString(),
      srNo: records.length + 1,
      department: formDepartment,
      head: formHead,
      allocatedAmount: `₹${formAllocated} Cr`,
      utilizedAmount: `₹${formUtilized} Cr`,
      date: formDate.split("-").reverse().join("-"), // basic format
    };
    setRecords([newEntry, ...records]);
    
    // reset form
    setFormDepartment("");
    setFormHead("");
    setFormDate("");
    setFormAllocated("");
    setFormUtilized("");

    setActiveTab("overview");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1F4D]">Funds Distributed to Other Utilizations</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and track funds allocated for various specific heads</p>
      </div>

      {activeTab !== "view" && (
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeTab === "overview" ? "text-[#0B1F4D]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview
            {activeTab === "overview" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0B1F4D] rounded-t-full"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeTab === "new" ? "text-[#0B1F4D]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            New Utilization
            {activeTab === "new" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0B1F4D] rounded-t-full"></span>
            )}
          </button>
        </div>
      )}

      {activeTab === "overview" && (
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#0B1F4D] text-white">
                <tr>
                  <th className="px-4 py-4 font-medium whitespace-nowrap">Sr No</th>
                  <th className="px-4 py-4 font-medium whitespace-nowrap">Utilization Department</th>
                  <th className="px-4 py-4 font-medium whitespace-nowrap">Utilization Head</th>
                  <th className="px-4 py-4 font-medium whitespace-nowrap">Allocated Amount</th>
                  <th className="px-4 py-4 font-medium whitespace-nowrap">Utilized Amount</th>
                  <th className="px-4 py-4 font-medium whitespace-nowrap">Date of Issuing</th>
                  <th className="px-4 py-4 font-medium whitespace-nowrap text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((row, index) => (
                  <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-[#0B1F4D] whitespace-nowrap">{index + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{row.department}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{row.head}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{row.allocatedAmount}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{row.utilizedAmount}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{row.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleView(row)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors text-xs font-medium"
                      >
                        <Eye className="size-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "new" && (
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-[#0B1F4D] mb-6">New Utilization</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Utilization Department</label>
              <select
                value={formDepartment}
                onChange={(e) => setFormDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] bg-white"
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Utilization Head</label>
              <input
                type="text"
                value={formHead}
                onChange={(e) => setFormHead(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D]"
                placeholder="Enter utilization head"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Issuing Date</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Budget Allocated (Cr)</label>
              <input
                type="number"
                value={formAllocated}
                onChange={(e) => setFormAllocated(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D]"
                placeholder="Enter allocated amount in Cr"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Budget Utilized (Cr)</label>
              <input
                type="number"
                value={formUtilized}
                onChange={(e) => setFormUtilized(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D]"
                placeholder="Enter utilized amount in Cr"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Utilization Certificate Upload</label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/30 transition-colors">
                <input type="file" className="hidden" id="cert-upload" accept=".pdf,.doc,.docx" />
                <label htmlFor="cert-upload" className="cursor-pointer flex flex-col items-center">
                  <Plus className="size-8 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-[#0B1F4D]">Click to upload Utilization Certificate</span>
                  <span className="text-xs text-muted-foreground mt-1">Accepts PDF, DOC, DOCX</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3 justify-end pt-4 border-t border-border">
            <button
              onClick={() => setActiveTab("overview")}
              className="px-6 py-2 border border-border text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#0B1F4D] text-white rounded-lg font-medium hover:bg-[#0B1F4D]/90 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {activeTab === "view" && viewRecord && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveTab("overview")}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#0B1F4D] transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Printer className="size-4" />
              Print
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-lg font-semibold text-[#0B1F4D] mb-6 pb-4 border-b border-border">Utilization Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Utilization Department</p>
                <p className="font-medium text-base text-[#0B1F4D]">{viewRecord.department}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Utilization Head</p>
                <p className="font-medium text-base text-[#0B1F4D]">{viewRecord.head}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Allocated Amount</p>
                <p className="font-medium text-base text-[#0B1F4D]">{viewRecord.allocatedAmount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Utilized Amount</p>
                <p className="font-medium text-base text-[#0B1F4D]">{viewRecord.utilizedAmount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date of Issuing</p>
                <p className="font-medium text-base text-[#0B1F4D]">{viewRecord.date}</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm font-medium text-gray-700 mb-3">Utilization Certificate</p>
              <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-gray-50/50">
                <FileText className="size-8 text-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#0B1F4D]">Utilization_Certificate.pdf</p>
                  <p className="text-xs text-muted-foreground">1.8 MB</p>
                </div>
                <div className="flex gap-2">
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <Eye className="size-3.5" />
                    View
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded transition-colors text-sm font-medium">
                    <Download className="size-3.5" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
