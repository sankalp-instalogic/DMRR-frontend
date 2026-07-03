import { useState } from "react";
import {
  Search,
  Filter,
  Forward,
  XCircle,
  Clock,
  Eye,
  ArrowLeft,
  Upload
} from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";

const initialProposals = [
  { id: "DMRR/2025/MUM/001", district: "Mumbai", department: "PWD", cost: "450", compliance: "Pass", pendingDays: 12, status: "Under Review" },
  { id: "DMRR/2025/PUN/034", district: "Pune", department: "WRD", cost: "680", compliance: "Warning", pendingDays: 23, status: "Deficiency Found" },
  { id: "DMRR/2025/NAG/087", district: "Nagpur", department: "SWCD", cost: "340", compliance: "Pass", pendingDays: 8, status: "Under Review" },
  { id: "DMRR/2025/NAS/045", district: "Nashik", department: "Forest", cost: "560", compliance: "Pass", pendingDays: 15, status: "Under Review" },
];

export function PMUScrutiny() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [proposals, setProposals] = useState(initialProposals);
  const [selectedProposal, setSelectedProposal] = useState(null);
  
  // const [expertComments, setExpertComments] = useState("");
  // const [deficiencyNotes, setDeficiencyNotes] = useState("");
const [complianceFlag, setComplianceFlag] = useState("");
const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);

  const handleAction = (action) => {
    if (!selectedProposal) {
      alert("Please select a proposal first.");
      return;
    }
    alert(`Action '${action}' applied to ${selectedProposal.id}`);
    
    // Update workflow state simulation
    const updated = proposals.map(p => {
      if(p.id === selectedProposal.id) {
        return { ...p, status: action === 'Forward' ? 'Forwarded to PAC' : action === 'Hold' ? 'On Hold' : action === 'Reject' ? 'Rejected' : 'Returned' };
      }
      return p;
    });
    setProposals(updated);
    setSelectedProposal(null);
    if(action === 'Forward') navigate("/evaluation/pac");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>PMU Preliminary Scrutiny</h1>
        <p className="text-sm text-muted-foreground">Review and scrutinize incoming proposals</p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Proposal ID, District, Department..."
            className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button className="px-4 py-2 bg-muted rounded-lg flex items-center gap-2 hover:bg-muted/80">
          <Filter className="size-5" /> Filters
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm">Proposal ID</th>
                <th className="px-6 py-4 text-left text-sm">District</th>
                <th className="px-6 py-4 text-left text-sm">Cost (₹ Lakhs)</th>
                <th className="px-6 py-4 text-left text-sm">NDMA Compliance</th>
                <th className="px-6 py-4 text-left text-sm">Status</th>
                <th className="px-6 py-4 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal) => (
                <tr 
                  key={proposal.id} 
                  className={`border-t border-border hover:bg-muted/50 transition-colors cursor-pointer ${selectedProposal?.id === proposal.id ? 'bg-primary/5' : ''}`}
                  onClick={() => setSelectedProposal(proposal)}
                >
                  <td className="px-6 py-4 text-sm font-medium">{proposal.id}</td>
                  <td className="px-6 py-4 text-sm">{proposal.district}</td>
                  <td className="px-6 py-4 text-sm">₹{proposal.cost}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      proposal.compliance === 'Pass' ? 'bg-accent/20 text-accent' : 'bg-secondary/20 text-secondary'
                    }`}>
                      {proposal.compliance}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs">
                      {proposal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedProposal(proposal); }} title="View"><Eye className="size-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProposal && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold border-b pb-2">Scrutiny Panel: {selectedProposal.id}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm mb-2 font-medium">Compliance Flag *</label>
                <select
                  value={complianceFlag}
                  onChange={(e) => setComplianceFlag(e.target.value)}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg"
                >
                  <option value="pass">Pass</option>
                  <option value="warning">Warning / Conditional</option>
                  <option value="fail">Fail</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 font-medium">Domain Expert Comments</label>
                <textarea
                  value={expertComments}
                  onChange={(e) => setExpertComments(e.target.value)}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg"
                  rows={3}
                  placeholder="Enter expert observations..."
                />
              </div>

              <div>
                <label className="block text-sm mb-2 font-medium text-secondary">Deficiency Notes (If any)</label>
                <textarea
                  value={deficiencyNotes}
                  onChange={(e) => setDeficiencyNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg border-secondary/50 focus:ring-secondary"
                  rows={3}
                  placeholder="List any deficiencies found..."
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => handleAction('Forward')} className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 flex items-center gap-2">
              <Forward className="size-5" /> Forward to PAC
            </button>
            <Button variant="secondary" size="lg" onClick={() => handleAction('Return')}>
              <ArrowLeft className="size-5" /> Return for Correction
            </Button>
            <button onClick={() => handleAction('Hold')} className="px-6 py-3 bg-muted text-foreground border border-border rounded-lg hover:bg-muted/80 flex items-center gap-2">
              <Clock className="size-5" /> Hold
            </button>
            <Button variant="destructive" size="lg" onClick={() => handleAction('Reject')}>
              <XCircle className="size-5" /> Reject
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}