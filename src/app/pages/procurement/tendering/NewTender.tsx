import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, CheckCircle2, Download, Eye, Upload, XCircle } from "lucide-react";

export function NewTender() {
  const navigate = useNavigate();

  // Basic Information State
  const [basicInfo, setBasicInfo] = useState({
    orgChain: "",
    title: "",
    refNo: "",
    id: "",
  });

  // Track file uploads for each stage
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    techBidOpening: null,
    techEvaluation: null,
    finBidOpening: null,
    finEvaluation: null,
    aoc: null,
  });

  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (stageKey: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles({ ...files, [stageKey]: e.target.files[0] });
    }
  };

  const isAllUploaded = Object.values(files).every((file) => file !== null);

  const handleSave = () => {
    // In a real app, we would make an API call to save here
    navigate("/procurement-tendering/tenders");
  };

  const renderStageRow = (stageName: string, stageKey: string) => {
    const isUploaded = files[stageKey] !== null;

    return (
      <tr className="hover:bg-muted/50 transition-colors" key={stageKey}>
        <td className="px-6 py-4 pl-10">{stageName}</td>
        <td className="px-6 py-4 text-center">
          <label className="inline-flex items-center gap-2 bg-[#1E5AA8] text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-xs font-medium">
            <Upload className="size-3.5" />
            <span>Upload Document</span>
            <input type="file" className="hidden" onChange={handleFileUpload(stageKey)} />
          </label>
        </td>
        <td className="px-6 py-4 text-center">
          {isUploaded ? (
            <CheckCircle2 className="size-5 text-green-500 mx-auto" />
          ) : (
            <XCircle className="size-5 text-red-500 mx-auto" />
          )}
        </td>
        <td className="px-6 py-4 text-center">
          <button 
            disabled={!isUploaded}
            className={`p-2 inline-flex justify-center rounded-lg transition-colors ${isUploaded ? 'text-muted-foreground hover:bg-muted hover:text-[#0B1F4D] cursor-pointer' : 'text-gray-300 cursor-not-allowed'}`}
            title="View Document"
          >
            <Eye className="size-4" />
          </button>
        </td>
        <td className="px-6 py-4 text-center">
          <button 
            disabled={!isUploaded}
            className={`p-2 inline-flex justify-center rounded-lg transition-colors ${isUploaded ? 'text-muted-foreground hover:bg-muted hover:text-[#0B1F4D] cursor-pointer' : 'text-gray-300 cursor-not-allowed'}`}
            title="Download Document"
          >
            <Download className="size-4" />
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link 
          to="/procurement-tendering/tenders" 
          className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-[#0B1F4D]"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F4D]">Create New Tender</h1>
          <p className="text-muted-foreground mt-1">Fill in the details to create a new tender</p>
        </div>
      </div>

      {/* Basic Information Section */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-gray-50/50">
          <h2 className="text-lg font-semibold text-[#0B1F4D]">Basic Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Organization Chain</label>
              <input 
                type="text" 
                name="orgChain"
                value={basicInfo.orgChain}
                onChange={handleBasicInfoChange}
                placeholder="Enter organization chain" 
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Tender Title</label>
              <input 
                type="text" 
                name="title"
                value={basicInfo.title}
                onChange={handleBasicInfoChange}
                placeholder="Enter tender title" 
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Tender Ref No</label>
              <input 
                type="text" 
                name="refNo"
                value={basicInfo.refNo}
                onChange={handleBasicInfoChange}
                placeholder="Enter tender ref no" 
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Tender ID</label>
              <input 
                type="text" 
                name="id"
                value={basicInfo.id}
                onChange={handleBasicInfoChange}
                placeholder="Enter tender id" 
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tender Process Table */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-gray-50/50">
          <h2 className="text-lg font-semibold text-[#0B1F4D]">Tender Process</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Stages</th>
                <th className="px-6 py-3 font-medium text-center">Upload Document</th>
                <th className="px-6 py-3 font-medium text-center">Status</th>
                <th className="px-6 py-3 font-medium text-center">View</th>
                <th className="px-6 py-3 font-medium text-center">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* Process 1 */}
              <tr className="bg-gray-50/30">
                <td colSpan={5} className="px-6 py-2 font-medium text-[#0B1F4D] text-xs uppercase tracking-wider">Process 1</td>
              </tr>
              {renderStageRow("Technical Bid Opening", "techBidOpening")}
              {renderStageRow("Technical Evaluation", "techEvaluation")}

              {/* Process 2 */}
              <tr className="bg-gray-50/30">
                <td colSpan={5} className="px-6 py-2 font-medium text-[#0B1F4D] text-xs uppercase tracking-wider">Process 2</td>
              </tr>
              {renderStageRow("Financial Bid Opening", "finBidOpening")}
              {renderStageRow("Financial Evaluation", "finEvaluation")}
              {renderStageRow("AOC", "aoc")}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-white p-4 border-t border-border shadow-lg z-10 -mx-6 -mb-6 px-6">
        <button 
          onClick={() => navigate("/procurement-tendering/tenders")}
          className="px-6 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        {isAllUploaded && (
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-[#1E5AA8] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Save
          </button>
        )}
      </div>
    </div>
  );
}
