import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, CheckCircle2, Download, Eye } from "lucide-react";

export function TenderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    // Simulate action
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
          <h1 className="text-2xl font-bold text-[#0B1F4D]">Tender Details</h1>
          <p className="text-muted-foreground mt-1">View details and documents for the selected tender</p>
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
              <input type="text" value="Department of Health" readOnly className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Tender Title</label>
              <input type="text" value="Procurement of Medical Supplies" readOnly className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Tender Ref No</label>
              <input type="text" value="REF-2024-001" readOnly className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Tender ID</label>
              <input type="text" value={id || "TND-2024-001"} readOnly className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Tender Process Tracking Table */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-gray-50/50">
          <h2 className="text-lg font-semibold text-[#0B1F4D]">Tender Process Tracking</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Stages</th>
                <th className="px-6 py-3 font-medium text-center">Status</th>
                <th className="px-6 py-3 font-medium text-center">View</th>
                <th className="px-6 py-3 font-medium text-center">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* Process 1 */}
              <tr className="bg-gray-50/30">
                <td colSpan={4} className="px-6 py-2 font-medium text-[#0B1F4D] text-xs uppercase tracking-wider">Process 1</td>
              </tr>
              <tr className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 pl-10">Technical Bid Opening</td>
                <td className="px-6 py-4 text-center">
                  <CheckCircle2 className="size-5 text-green-500 mx-auto" />
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={handleAction} className="p-2 inline-flex justify-center hover:bg-muted rounded-lg text-muted-foreground hover:text-[#0B1F4D] transition-colors" title="View Document">
                    <Eye className="size-4" />
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={handleAction} className="p-2 inline-flex justify-center hover:bg-muted rounded-lg text-muted-foreground hover:text-[#0B1F4D] transition-colors" title="Download Document">
                    <Download className="size-4" />
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 pl-10">Technical Evaluation</td>
                <td className="px-6 py-4 text-center">
                  <CheckCircle2 className="size-5 text-green-500 mx-auto" />
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={handleAction} className="p-2 inline-flex justify-center hover:bg-muted rounded-lg text-muted-foreground hover:text-[#0B1F4D] transition-colors" title="View Document">
                    <Eye className="size-4" />
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={handleAction} className="p-2 inline-flex justify-center hover:bg-muted rounded-lg text-muted-foreground hover:text-[#0B1F4D] transition-colors" title="Download Document">
                    <Download className="size-4" />
                  </button>
                </td>
              </tr>

              {/* Process 2 */}
              <tr className="bg-gray-50/30">
                <td colSpan={4} className="px-6 py-2 font-medium text-[#0B1F4D] text-xs uppercase tracking-wider">Process 2</td>
              </tr>
              <tr className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 pl-10">Financial Bid Opening</td>
                <td className="px-6 py-4 text-center">
                  <CheckCircle2 className="size-5 text-green-500 mx-auto" />
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={handleAction} className="p-2 inline-flex justify-center hover:bg-muted rounded-lg text-muted-foreground hover:text-[#0B1F4D] transition-colors" title="View Document">
                    <Eye className="size-4" />
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={handleAction} className="p-2 inline-flex justify-center hover:bg-muted rounded-lg text-muted-foreground hover:text-[#0B1F4D] transition-colors" title="Download Document">
                    <Download className="size-4" />
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 pl-10">Financial Evaluation</td>
                <td className="px-6 py-4 text-center">
                  <CheckCircle2 className="size-5 text-green-500 mx-auto" />
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={handleAction} className="p-2 inline-flex justify-center hover:bg-muted rounded-lg text-muted-foreground hover:text-[#0B1F4D] transition-colors" title="View Document">
                    <Eye className="size-4" />
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={handleAction} className="p-2 inline-flex justify-center hover:bg-muted rounded-lg text-muted-foreground hover:text-[#0B1F4D] transition-colors" title="Download Document">
                    <Download className="size-4" />
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 pl-10">AOC</td>
                <td className="px-6 py-4 text-center">
                  <CheckCircle2 className="size-5 text-green-500 mx-auto" />
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={handleAction} className="p-2 inline-flex justify-center hover:bg-muted rounded-lg text-muted-foreground hover:text-[#0B1F4D] transition-colors" title="View Document">
                    <Eye className="size-4" />
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={handleAction} className="p-2 inline-flex justify-center hover:bg-muted rounded-lg text-muted-foreground hover:text-[#0B1F4D] transition-colors" title="Download Document">
                    <Download className="size-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Bottom Action Bar */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-white p-4 border-t border-border shadow-lg z-10 -mx-6 -mb-6 px-6">
        <button 
          onClick={() => navigate("/procurement-tendering/tenders")}
          className="px-6 py-2 bg-muted text-[#0B1F4D] rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}
