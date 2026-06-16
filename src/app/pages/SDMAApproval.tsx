import { useState } from "react";
import { CheckCircle2, Upload, Forward, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";

const initialProposals = [
  { id: "DMRR/2025/MUM/001", district: "Mumbai", tacRec: "Recommended", cost: "450", status: "Pending SDMA" },
];



export function SDMAApproval() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState(initialProposals);
  const [selectedProposal, setSelectedProposal] = useState(null);

  const [sdmaDecision, setSdmaDecision] = useState("");

const [momDate, setMomDate] = useState("");
const [momFile, setMomFile] = useState<File | null>(null);

const [comments, setComments] = useState("");

// const [rejectedProposals, setRejectedProposals] = useState([]);
// const [revisedProposals, setRevisedProposals] = useState([]);
  
  // const [minutesUploaded, setMinutesUploaded] = useState(false);
  // const [forwardToFinance, setForwardToFinance] = useState(true);
  const [rejectedProposals, setRejectedProposals] = useState([]);
  const [revisedProposals, setRevisedProposals] = useState([]);

  const handleAction = (action) => {
    if (!selectedProposal) {
      alert("Please select a proposal first.");
      return;
    }
    
    // if (action === 'Forward' && !minutesUploaded) {
    //   alert("SDMA Minutes must be uploaded before forwarding to Finance.");
    //   return;
    // }

if (
  action === "Forward" &&
  (!momDate || !momFile)
) {
  alert("Upload SDMA MoM and select Date before forwarding.");
  return;
}
    
    alert(`Action '${action}' applied to ${selectedProposal.id}`);
    
    const updated = proposals.filter(p => p.id !== selectedProposal.id);
    setProposals(updated);
    setSelectedProposal(null);
    if (action === "Forward") {
  navigate("/tendering");
}
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>SDMA Approval</h1>
        <p className="text-sm text-muted-foreground">State Disaster Management Authority Final Approval</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-4 text-left text-sm">Proposal ID</th>
              <th className="px-6 py-4 text-left text-sm">District</th>
              <th className="px-6 py-4 text-left text-sm">Cost (₹ Lakhs)</th>
              <th className="px-6 py-4 text-left text-sm">TAC Rec.</th>
              <th className="px-6 py-4 text-left text-sm">Status</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((proposal) => (
              <tr 
                key={proposal.id} 
                className={`border-t border-border hover:bg-muted/50 cursor-pointer ${selectedProposal?.id === proposal.id ? 'bg-primary/5' : ''}`}
                onClick={() => setSelectedProposal(proposal)}
              >
                <td className="px-6 py-4 text-sm font-medium">{proposal.id}</td>
                <td className="px-6 py-4 text-sm">{proposal.district}</td>
                <td className="px-6 py-4 text-sm">₹{proposal.cost}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-accent/20 text-accent rounded-full text-xs">
                    {proposal.tacRec}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-secondary/20 text-secondary rounded-full text-xs">
                    {proposal.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* {selectedProposal && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold border-b pb-2">SDMA Decision: {selectedProposal.id}</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="finance" 
                  checked={forwardToFinance} 
                  onChange={(e) => setForwardToFinance(e.target.checked)} 
                  className="size-4"
                />
                <label htmlFor="finance" className="text-sm font-medium">Forward to Finance Department after SDMA approval</label>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="font-medium mb-3">SDMA Minutes Upload *</h4>
              <div className="flex items-center gap-4 p-4 border border-dashed border-border rounded-lg bg-muted/30">
                <button 
                  onClick={() => { alert('SDMA Minutes Uploaded'); setMinutesUploaded(true); }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded flex items-center gap-2 hover:opacity-90 text-sm"
                >
                  <Upload className="size-4" /> Upload SDMA Minutes
                </button>
                {minutesUploaded && <span className="text-sm text-accent flex items-center gap-1"><CheckCircle2 className="size-4" /> Uploaded successfully</span>}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => handleAction('Approve')} className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 flex items-center gap-2">
              <CheckCircle2 className="size-5" /> Approve locally
            </button>
            <button onClick={() => handleAction('Forward')} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2">
              <Forward className="size-5" /> Forward to Finance
            </button>
            <button onClick={() => handleAction('Revise')} className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 flex items-center gap-2">
              <RefreshCw className="size-5" /> Revise
            </button>
          </div>
        </div>
      )} */}

      {selectedProposal && (
  <div className="space-y-6">
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-bold border-b pb-2">
        SDMA Decision : {selectedProposal.id}
      </h3>

      {/* SDMA Recommendation */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          SDMA Recommendation *
        </label>

        <select
          value={sdmaDecision}
          onChange={(e) => setSdmaDecision(e.target.value)}
          className="w-full px-4 py-2 bg-input-background border border-border rounded-lg"
        >
          <option value="">Select Decision</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="revise">Revise</option>
        </select>
      </div>

      {/* APPROVED */}
      {sdmaDecision === "approved" && (
        <div className="border rounded-lg p-4 bg-green-50">
          <h4 className="font-semibold text-green-700 mb-4">
            Approved Proposal Details
          </h4>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Date of SDMA MoM Issued *
            </label>

            <input
              type="date"
              value={momDate}
              onChange={(e) => setMomDate(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Upload SDMA MoM *
            </label>

            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) =>
                setMomFile(e.target.files?.[0] || null)
              }
              className="w-full px-4 py-2 border border-border rounded-lg"
            />

            {momFile && (
              <p className="text-green-600 mt-2 text-sm">
                Uploaded: {momFile.name}
              </p>
            )}
          </div>
        </div>
      )}

      {/* REJECTED */}
      {sdmaDecision === "rejected" && (
        <div className="border rounded-lg p-4 bg-red-50">
          <label className="block text-sm font-medium mb-2">
            Rejection Comments *
          </label>

          <textarea
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Enter rejection reason..."
            className="w-full px-4 py-2 border border-border rounded-lg"
          />
        </div>
      )}

      {/* REVISE */}
      {sdmaDecision === "revise" && (
        <div className="border rounded-lg p-4 bg-yellow-50">
          <label className="block text-sm font-medium mb-2">
            Revision Comments *
          </label>

          <textarea
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Enter revision remarks..."
            className="w-full px-4 py-2 border border-border rounded-lg"
          />
        </div>
      )}
    </div>

    {/* ACTION BUTTONS */}

    <div className="flex gap-4 flex-wrap">

      {/* APPROVED */}
      {sdmaDecision === "approved" &&
        momDate &&
        momFile && (
          <button
            onClick={() => handleAction("Forward")}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2"
          >
            <Forward className="size-5" />
            Forward to Finance Department
          </button>
        )}

      {/* REJECTED */}
      {sdmaDecision === "rejected" && (
        <button
          onClick={() => {
            setRejectedProposals([
              ...rejectedProposals,
              {
                ...selectedProposal,
                comments,
                status: "Rejected",
              },
            ]);

            alert("Proposal moved to Rejection Listing");
          }}
          className="px-6 py-3 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 flex items-center gap-2"
        >
          Reject Proposal
        </button>
      )}

      {/* REVISE */}
      {sdmaDecision === "revise" && (
        <button
          onClick={() => {
            setRevisedProposals([
              ...revisedProposals,
              {
                ...selectedProposal,
                comments,
                status: "Revision Requested",
              },
            ]);

            alert("Proposal moved to Revision Listing");
          }}
          className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 flex items-center gap-2"
        >
          Revise Proposal
        </button>
      )}
    </div>
  </div>
)}
      
    </div>
  );
}