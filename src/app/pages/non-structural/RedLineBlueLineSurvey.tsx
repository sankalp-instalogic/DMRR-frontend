import { useState } from "react";
import {
  Plus,
  Eye,
  Download,
  ArrowLeft,
  Printer,
  Save,
  X,
} from "lucide-react";

interface Survey {
  surveyId: string;
  title: string;
  district: string;
  grIssuedDate: string;
  allocatedBudget: string;
  utilizedBudget: string;
  completionDate: string;
  grDocument?: File | null;
  completionCertificate?: File | null;
}

export function RedLineBlueLineSurvey() {
  const [activeTab, setActiveTab] = useState<"list" | "new">("list");
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  const [surveys, setSurveys] = useState<Survey[]>([
    {
      surveyId: "RBL001",
      title: "Red Line Blue Line Survey Mumbai",
      district: "Mumbai",
      grIssuedDate: "2025-01-10",
      allocatedBudget: "₹50 Lakhs",
      utilizedBudget: "₹42 Lakhs",
      completionDate: "2025-03-15",
    },
    {
      surveyId: "RBL002",
      title: "Red Line Blue Line Survey Pune",
      district: "Pune",
      grIssuedDate: "2025-02-01",
      allocatedBudget: "₹50 Lakhs",
      utilizedBudget: "₹38 Lakhs",
      completionDate: "2025-04-20",
    },
    {
      surveyId: "RBL003",
      title: "Red Line Blue Line Survey Nagpur",
      district: "Nagpur",
      grIssuedDate: "2025-02-18",
      allocatedBudget: "₹50 Lakhs",
      utilizedBudget: "₹46 Lakhs",
      completionDate: "2025-05-01",
    },
    {
      surveyId: "RBL004",
      title: "Red Line Blue Line Survey Nashik",
      district: "Nashik",
      grIssuedDate: "2025-03-10",
      allocatedBudget: "₹50 Lakhs",
      utilizedBudget: "₹35 Lakhs",
      completionDate: "2025-05-18",
    },
    {
      surveyId: "RBL005",
      title: "Red Line Blue Line Survey Thane",
      district: "Thane",
      grIssuedDate: "2025-04-05",
      allocatedBudget: "₹50 Lakhs",
      utilizedBudget: "₹40 Lakhs",
      completionDate: "2025-06-01",
    },
  ]);

  const [formData, setFormData] = useState<Survey>({
    surveyId: "",
    title: "",
    district: "",
    grIssuedDate: "",
    allocatedBudget: "",
    utilizedBudget: "",
    completionDate: "",
    grDocument: null,
    completionCertificate: null,
  });

  const handleSave = () => {
    setSurveys([...surveys, formData]);

    setFormData({
      surveyId: "",
      title: "",
      district: "",
      grIssuedDate: "",
      allocatedBudget: "",
      utilizedBudget: "",
      completionDate: "",
      grDocument: null,
      completionCertificate: null,
    });

    setActiveTab("list");
  };

  const handleCancel = () => {
    setActiveTab("list");
  };

  if (selectedSurvey) {
    return (
      <div className="space-y-[24px]">
        <div className="flex items-center justify-between">

          <button
            onClick={() => setSelectedSurvey(null)}
            className="flex items-center gap-2 bg-white border border-[#0B1F4D] text-[#0B1F4D] px-[16px] h-[40px] rounded-[10px] text-[14px] font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white border border-[#0B1F4D] text-[#0B1F4D] px-[16px] h-[40px] rounded-[10px] text-[14px] font-medium hover:bg-gray-50 transition-colors"
          >
            <Printer className="size-4" />
            Print
          </button>

        </div>

        <div className="bg-white border border-gray-200 rounded-[12px] p-[24px] shadow-sm">
          <h2 className="text-[20px] font-semibold text-[#0B1F4D] mb-[24px] pb-[16px] border-b border-gray-200">
            Survey Details
          </h2>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-y-[24px] gap-x-[24px]">

  <div>
    <label className="text-[14px] font-medium text-gray-500 mb-1 block">Survey ID</label>
    <p className="font-semibold text-[16px] text-[#0B1F4D]">{selectedSurvey.surveyId}</p>
  </div>

  <div>
    <label className="text-[14px] font-medium text-gray-500 mb-1 block">District</label>
    <p className="font-semibold text-[16px] text-[#0B1F4D]">{selectedSurvey.district}</p>
  </div>

  <div>
    <label className="text-[14px] font-medium text-gray-500 mb-1 block">Title</label>
    <p className="font-semibold text-[16px] text-[#0B1F4D]">{selectedSurvey.title}</p>
  </div>

  <div>
    <label className="text-[14px] font-medium text-gray-500 mb-1 block">Date of GR Issued</label>
    <p className="font-semibold text-[16px] text-[#0B1F4D]">{selectedSurvey.grIssuedDate}</p>
  </div>

  <div>
    <label className="text-[14px] font-medium text-gray-500 mb-1 block">Allocated Budget</label>
    <p className="font-semibold text-[16px] text-[#0B1F4D]">{selectedSurvey.allocatedBudget}</p>
  </div>

  <div>
    <label className="text-[14px] font-medium text-gray-500 mb-1 block">Utilized Budget</label>
    <p className="font-semibold text-[16px] text-[#0B1F4D]">{selectedSurvey.utilizedBudget}</p>
  </div>

  <div>
    <label className="text-[14px] font-medium text-gray-500 mb-1 block">Date of Completion</label>
    <p className="font-semibold text-[16px] text-[#0B1F4D]">{selectedSurvey.completionDate}</p>
  </div>
  
  <div className="md:col-span-2 border-t border-gray-200 pt-[16px] mt-[8px]"></div>

  <div>
    <label className="text-[16px] font-semibold text-[#0B1F4D] block mb-[16px]">
      GR Issued
    </label>

    <div className="flex gap-[12px]">
      <button className="flex items-center gap-1.5 bg-white border border-[#0B1F4D] text-[#0B1F4D] px-[16px] h-[40px] rounded-[10px] text-[14px] font-medium hover:bg-gray-50 transition-colors">
        <Eye className="size-4" />
        View
      </button>

      <button className="flex items-center gap-1.5 bg-[#0B1F4D] text-white px-[16px] h-[40px] rounded-[10px] text-[14px] font-medium hover:bg-[#0B1F4D]/90 transition-colors">
        <Download className="size-4" />
        Download
      </button>
    </div>
  </div>

  <div>
    <label className="text-[16px] font-semibold text-[#0B1F4D] block mb-[16px]">
      Completion Certificate
    </label>

    <div className="flex gap-[12px]">
      <button className="flex items-center gap-1.5 bg-white border border-[#0B1F4D] text-[#0B1F4D] px-[16px] h-[40px] rounded-[10px] text-[14px] font-medium hover:bg-gray-50 transition-colors">
        <Eye className="size-4" />
        View
      </button>

      <button className="flex items-center gap-1.5 bg-[#0B1F4D] text-white px-[16px] h-[40px] rounded-[10px] text-[14px] font-medium hover:bg-[#0B1F4D]/90 transition-colors">
        <Download className="size-4" />
        Download
      </button>
    </div>
  </div>

</div>
        </div>
      </div>
    );
  }
    return (
    <div className="space-y-[24px]">
      <div>
        <h1 className="text-[30px] font-bold text-[#0B1F4D]">Red Line Blue Line Survey</h1>
        <p className="text-[14px] font-medium text-gray-500 mt-1">Manage and monitor Red Line Blue Line Survey activities.</p>
      </div>

      {/* Top Buttons as Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-[16px] py-[8px] font-medium text-[14px] transition-colors rounded-[10px] ${
            activeTab === "list"
              ? "bg-[#0B1F4D] text-white"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          Survey List
        </button>

        <button
          onClick={() => setActiveTab("new")}
          className={`flex items-center gap-2 px-[16px] py-[8px] font-medium text-[14px] transition-colors rounded-[10px] ${
            activeTab === "new"
              ? "bg-[#0B1F4D] text-white"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <Plus className="size-4" />
          New Survey
        </button>

      </div>

      {/* Survey List */}
      {activeTab === "list" && (
        <div className="bg-white rounded-[12px] shadow-sm border border-gray-200 overflow-hidden mb-[24px]">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] text-left">
              <thead className="bg-[#F5F7FA] text-[#0B1F4D]">
                <tr className="h-[56px]">
                  <th className="px-4 font-semibold whitespace-nowrap">Sr No</th>
                   <th className="px-4 font-semibold whitespace-nowrap">Survey ID</th>
                   <th className="px-4 font-semibold whitespace-nowrap">District</th>
                   <th className="px-4 font-semibold whitespace-nowrap">Date of GR Issued</th>
                   <th className="px-4 font-semibold whitespace-nowrap">Allocated Budget</th>
                   <th className="px-4 font-semibold whitespace-nowrap">Utilized Budget</th>
                   <th className="px-4 font-semibold whitespace-nowrap">Date of Completion</th>
                   <th className="px-4 font-semibold whitespace-nowrap text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
  {surveys.map((survey, index) => (
    <tr key={index} className="hover:bg-blue-50/50 transition-colors h-[56px] even:bg-gray-50/50">
      <td className="px-4 font-medium text-[#0B1F4D] whitespace-nowrap">{index + 1}</td>
      <td className="px-4">{survey.surveyId}</td>
      <td className="px-4">{survey.district}</td>
      <td className="px-4">{survey.grIssuedDate}</td>
      <td className="px-4">{survey.allocatedBudget}</td>
      <td className="px-4">{survey.utilizedBudget}</td>
      <td className="px-4">{survey.completionDate}</td>

      <td className="px-4 whitespace-nowrap text-center">
        <button
          onClick={() => setSelectedSurvey(survey)}
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

      {/* New Survey Form */}
{/* Add New Survey */}
{activeTab === "new" && (
  <div className="bg-white border border-gray-200 rounded-[12px] p-[24px] shadow-sm">
    <h2 className="text-[20px] font-semibold mb-[24px] text-[#0B1F4D]">
      Add New Survey
    </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">

  <div>
    <label className="block text-[14px] font-medium text-gray-700 mb-1">
      Survey ID
    </label>
    <input
      type="text"
      className="w-full px-3 h-[40px] border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
      value={formData.surveyId}
      onChange={(e) =>
        setFormData({
          ...formData,
          surveyId: e.target.value,
        })
      }
    />
  </div>

  <div>
    <label className="block text-[14px] font-medium text-gray-700 mb-1">
      Title
    </label>
    <input
      type="text"
      className="w-full px-3 h-[40px] border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
      value={formData.title}
      onChange={(e) =>
        setFormData({
          ...formData,
          title: e.target.value,
        })
      }
    />
  </div>

  <div>
    <label className="block text-[14px] font-medium text-gray-700 mb-1">
      District
    </label>
    <input
      type="text"
      className="w-full px-3 h-[40px] border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
      value={formData.district}
      onChange={(e) =>
        setFormData({
          ...formData,
          district: e.target.value,
        })
      }
    />
  </div>

  <div>
    <label className="block text-[14px] font-medium text-gray-700 mb-1">
      Date of GR Issued
    </label>
    <input
      type="date"
      className="w-full px-3 h-[40px] border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
      value={formData.grIssuedDate}
      onChange={(e) =>
        setFormData({
          ...formData,
          grIssuedDate: e.target.value,
        })
      }
    />
  </div>

  <div>
    <label className="block text-[14px] font-medium text-gray-700 mb-1">
      Allocated Budget
    </label>
    <input
      type="text"
      className="w-full px-3 h-[40px] border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
      value={formData.allocatedBudget}
      onChange={(e) =>
        setFormData({
          ...formData,
          allocatedBudget: e.target.value,
        })
      }
    />
  </div>

  <div>
    <label className="block text-[14px] font-medium text-gray-700 mb-1">
      Utilized Budget
    </label>
    <input
      type="text"
      className="w-full px-3 h-[40px] border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
      value={formData.utilizedBudget}
      onChange={(e) =>
        setFormData({
          ...formData,
          utilizedBudget: e.target.value,
        })
      }
    />
  </div>

  <div>
    <label className="block text-[14px] font-medium text-gray-700 mb-1">
      Date of Completion
    </label>
    <input
      type="date"
      className="w-full px-3 h-[40px] border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
      value={formData.completionDate}
      onChange={(e) =>
        setFormData({
          ...formData,
          completionDate: e.target.value,
        })
      }
    />
  </div>

  <div>
    <label className="block text-[14px] font-medium text-gray-700 mb-1">
      GR Issued Upload
    </label>
    <input
      type="file"
      className="w-full text-[14px] file:mr-4 file:py-2 file:px-4 file:rounded-[10px] file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      onChange={(e) =>
        setFormData({
          ...formData,
          grDocument: e.target.files?.[0] || null,
        })
      }
    />
  </div>

  <div className="md:col-span-2">
    <label className="block text-[14px] font-medium text-gray-700 mb-1">
      Completion Certificate Upload
    </label>
    <input
      type="file"
      className="w-full text-[14px] file:mr-4 file:py-2 file:px-4 file:rounded-[10px] file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      onChange={(e) =>
        setFormData({
          ...formData,
          completionCertificate:
            e.target.files?.[0] || null,
        })
      }
    />
  </div>

</div>

    {/* Buttons */}
    <div className="flex gap-[12px] justify-end mt-[24px] pt-[16px] border-t border-gray-200">
      <button
        onClick={() => setActiveTab("list")}
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
           </div>)}
      