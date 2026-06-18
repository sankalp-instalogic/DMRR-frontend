import { useState } from "react";
import {
  Eye,
  Printer,
  Download,
  ArrowLeft,
  Plus,
  FileText,
} from "lucide-react";

type RecordType = {
  id: string;
  srNo: number;
  district: string;
  date: string;
  utilizedAmount: string;
};

const DUMMY_RECORDS: RecordType[] = [
  {
    id: "1",
    srNo: 1,
    district: "Pune",
    date: "15-06-2026",
    utilizedAmount: "₹32 Lakhs",
  },
  {
    id: "2",
    srNo: 2,
    district: "Mumbai",
    date: "10-06-2026",
    utilizedAmount: "₹45 Lakhs",
  },
  {
    id: "3",
    srNo: 3,
    district: "Nashik",
    date: "05-06-2026",
    utilizedAmount: "₹28 Lakhs",
  },
  {
    id: "4",
    srNo: 4,
    district: "Nagpur",
    date: "01-06-2026",
    utilizedAmount: "₹39 Lakhs",
  },
  {
    id: "5",
    srNo: 5,
    district: "Thane",
    date: "28-05-2026",
    utilizedAmount: "₹22 Lakhs",
  },
];

const MAHARASHTRA_DISTRICTS = [
  "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli",
  "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai", "Nagpur", "Nanded", "Nandurbar", "Nashik",
  "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane",
  "Wardha", "Washim", "Yavatmal"
];

export function FundsDistributedDistricts() {
  const [activeTab, setActiveTab] = useState<"overview" | "new" | "view">("overview");
  const [records, setRecords] = useState<RecordType[]>(DUMMY_RECORDS);
  const [viewRecord, setViewRecord] = useState<RecordType | null>(null);

  // Form states
const [formFundsAllocated] = useState("₹50 Lakhs");
const [formFundsUtilized, setFormFundsUtilized] = useState("");
const [utilizationCertificate, setUtilizationCertificate] = useState<File | null>(null);
  const [formDistrict, setFormDistrict] = useState("");
  const [formDate, setFormDate] = useState("");
  

  const handleView = (record: RecordType) => {
    setViewRecord(record);
    setActiveTab("view");
  };

  const handleSave = () => {
   const newEntry: RecordType = {
  id: Math.random().toString(),
  srNo: records.length + 1,
  district: formDistrict,
  date: formDate.split("-").reverse().join("-"),
  utilizedAmount: `₹${formFundsUtilized} Lakhs`,
};
    setRecords([newEntry, ...records]);
    
    // reset form
   setFormFundsUtilized("");
setUtilizationCertificate(null);
    setFormDistrict("");
    setFormDate("");
   

    setActiveTab("overview");
  };

  return (
    <div className="space-y-[24px]">
      <div>
        <h1 className="text-[30px] font-bold text-[#0B1F4D]">Funds Distributed to Districts</h1>
        <p className="text-[14px] font-medium text-gray-500 mt-1">Manage and track funds allocated to districts</p>
      </div>

      {activeTab !== "view" && (
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-[16px] py-[8px] font-medium text-[14px] transition-colors rounded-[10px] ${
              activeTab === "overview" ? "bg-[#0B1F4D] text-white" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={`px-[16px] py-[8px] font-medium text-[14px] transition-colors rounded-[10px] ${
              activeTab === "new" ? "bg-[#0B1F4D] text-white" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            New Allocation
          </button>
        </div>
      )}

      {activeTab === "overview" && (
        <div className="bg-white rounded-[12px] shadow-sm border border-gray-200 overflow-hidden mb-[24px]">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] text-left">
              <thead className="bg-[#F5F7FA] text-[#0B1F4D]">
                <tr className="h-[56px]">
                  <th className="px-4 font-semibold whitespace-nowrap">Sr No</th>
                  <th className="font-semibold">District</th>
                  <th className="font-semibold">Date of Issuing</th>
                  <th className="font-semibold">Utilized Amount</th>
                  <th className="px-4 font-semibold whitespace-nowrap text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((row, index) => (
                  <tr key={row.id} className="hover:bg-blue-50/50 transition-colors h-[56px] even:bg-gray-50/50">
                    <td className="px-4 font-medium text-[#0B1F4D] whitespace-nowrap">{index + 1}</td>
                    <td>{row.district}</td>
<td>{row.date}</td>
<td>{row.utilizedAmount}</td>
                    <td className="px-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleView(row)}
                        className="inline-flex items-center gap-1.5 px-[16px] h-[40px] bg-white border border-[#0B1F4D] text-[#0B1F4D] rounded-[10px] hover:bg-blue-50 transition-colors text-[14px] font-medium"
                      >
                        <Eye className="size-4" />
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
        <div className="bg-white rounded-[12px] shadow-sm border border-gray-200 p-[24px]">
          <h2 className="text-[20px] font-semibold text-[#0B1F4D] mb-[24px]">New District Allocation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
      <div className="space-y-2">
  <label className="text-[14px] font-medium text-gray-700">
    Funds Allocated
  </label>

  <input
    value={formFundsAllocated}
    readOnly
    className="w-full px-3 h-[40px] border border-gray-200 rounded-[10px] bg-gray-100 cursor-not-allowed text-[14px]"
  />
</div>
            
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-gray-700">To District</label>
              <select
                value={formDistrict}
                onChange={(e) => setFormDistrict(e.target.value)}
                className="w-full px-3 h-[40px] border border-gray-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] bg-white text-[14px]"
              >
                <option value="">Select District</option>
                {MAHARASHTRA_DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-medium text-gray-700">Issuing Date</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 h-[40px] border border-gray-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] text-[14px]"
              />
            </div>

            <div className="space-y-2">
  <label className="text-[14px] font-medium text-gray-700">
    Funds Utilized (Lakhs)
  </label>

  <input
    type="number"
    max="50"
    value={formFundsUtilized}
    onChange={(e) => setFormFundsUtilized(e.target.value)}
    className="w-full px-3 h-[40px] border border-gray-200 rounded-[10px] text-[14px]"
    placeholder="Enter utilized amount"
  />
</div>

            <div className="space-y-2 md:col-span-2 mt-4">
              <label className="text-[14px] font-medium text-gray-700">Utilization Certificate Upload</label>
              <div className="border-2 border-dashed border-gray-300 rounded-[10px] p-[24px] text-center hover:bg-gray-50 transition-colors">
                <input type="file" className="hidden" id="gr-upload" accept=".pdf,.doc,.docx" />
                <label htmlFor="gr-upload" className="cursor-pointer flex flex-col items-center">
                  <Plus className="size-6 text-[#0B1F4D] mb-2" />
                  <span className="text-[14px] font-medium text-[#0B1F4D]">Click to upload Utilization Certificate Document</span>
                  <span className="text-[12px] text-gray-500 mt-1">Accepts PDF, DOC, DOCX</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-[24px] flex gap-[12px] justify-end pt-[16px] border-t border-gray-200">
            <button
              onClick={() => setActiveTab("overview")}
              className="px-[16px] h-[40px] bg-white border border-[#0B1F4D] text-[#0B1F4D] rounded-[10px] font-medium hover:bg-gray-50 transition-colors text-[14px]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-[16px] h-[40px] bg-[#0B1F4D] text-white rounded-[10px] font-medium hover:bg-[#0B1F4D]/90 transition-colors text-[14px]"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {activeTab === "view" && viewRecord && (
        <div className="space-y-[24px]">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveTab("overview")}
              className="inline-flex items-center gap-2 text-[14px] font-medium text-gray-600 hover:text-[#0B1F4D] transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-[16px] h-[40px] bg-white border border-[#0B1F4D] text-[#0B1F4D] rounded-[10px] text-[14px] font-medium hover:bg-gray-50 transition-colors"
            >
              <Printer className="size-4" />
              Print
            </button>
          </div>

          <div className="bg-white rounded-[12px] shadow-sm border border-gray-200 p-[24px]">
            <h2 className="text-[20px] font-semibold text-[#0B1F4D] mb-[24px] pb-[16px] border-b border-gray-200">Allocation Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-[24px] gap-x-[24px]">
              <div>
                <p className="text-[14px] font-medium text-gray-500 mb-1">Budget Utilized </p>
                <p className="font-semibold text-[16px] text-[#0B1F4D]">₹32 L</p>
              </div>
              <div>
                <p className="text-[14px] font-medium text-gray-500 mb-1">Date of Issuing</p>
                <p className="font-semibold text-[16px] text-[#0B1F4D]">{viewRecord.date}</p>
              </div>
              <div>
                <p className="text-[14px] font-medium text-gray-500 mb-1">District</p>
                <p className="font-semibold text-[16px] text-[#0B1F4D]">{viewRecord.district}</p>
              </div>
            </div>

            <div className="mt-[24px] pt-[24px] border-t border-gray-200">
              <p className="text-[16px] font-semibold text-[#0B1F4D] mb-[16px]">Utlization Certificate </p>
              <div className="flex items-center gap-[16px] p-[16px] border border-gray-200 rounded-[10px] bg-gray-50/50">
                <FileText className="size-8 text-red-500" />
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-[#0B1F4D]">Utilization Certificate.pdf</p>
                  <p className="text-[12px] text-gray-500">1.2 MB</p>
                </div>
                <div className="flex gap-[12px]">
                  <button className="inline-flex items-center gap-1.5 px-[16px] h-[40px] bg-white border border-[#0B1F4D] text-[#0B1F4D] rounded-[10px] text-[14px] font-medium hover:bg-gray-50 transition-colors">
                    <Eye className="size-4" />
                    View
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-[16px] h-[40px] bg-[#0B1F4D] text-white rounded-[10px] transition-colors text-[14px] font-medium hover:bg-[#0B1F4D]/90">
                    <Download className="size-4" />
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
