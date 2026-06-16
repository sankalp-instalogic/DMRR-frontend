import { useState } from "react";
import { CheckCircle2, Upload, Eye, FileText, Forward, RefreshCw, Plus, Trash2, XCircle} from "lucide-react"; 
import { useNavigate } from "react-router";

const newProposals = [
  {
    id: "DMRR/2025/MUM/001",
    district: "Mumbai",
    techSanction: "TS-2025-01",
    dpr: "DPR-MUM-01",
    status: "Pending",
  },
  {
    id: "DMRR/2025/PUN/021",
    district: "Pune",
    techSanction: "TS-2025-02",
    dpr: "DPR-PUN-01",
    status: "Pending",
  },
  {
    id: "DMRR/2025/NAG/015",
    district: "Nagpur",
    techSanction: "TS-2025-03",
    dpr: "DPR-NAG-01",
    status: "Pending",
  },
  {
    id: "DMRR/2025/THA/009",
    district: "Thane",
    techSanction: "TS-2025-04",
    dpr: "DPR-THA-01",
    status: "Pending",
  },
];

const revisedProposals = [
  {
    id: "DMRR/2025/MUM/011",
    district: "Mumbai",
    techSanction: "TS-2025-11",
    dpr: "DPR-MUM-11",
    status: "Revised",
    lastMeetingDate: "10-06-2025",
    revisionReason:
      "Technical drawings incomplete.",
  },
  {
    id: "DMRR/2025/PUN/012",
    district: "Pune",
    techSanction: "TS-2025-12",
    dpr: "DPR-PUN-12",
    status: "Revised",
    lastMeetingDate: "15-06-2025",
    revisionReason:
      "Cost estimates to be revised.",
  },
  {
    id: "DMRR/2025/NAG/013",
    district: "Nagpur",
    techSanction: "TS-2025-13",
    dpr: "DPR-NAG-13",
    status: "Revised",
    lastMeetingDate: "18-06-2025",
    revisionReason:
      "Missing supporting documents.",
  },
  {
    id: "DMRR/2025/THA/014",
    district: "Thane",
    techSanction: "TS-2025-14",
    dpr: "DPR-THA-14",
    status: "Revised",
    lastMeetingDate: "20-06-2025",
    revisionReason:
      "Design modifications required.",
  },
];

export function TACAppraisal() {
  const navigate = useNavigate();
const [activeTab, setActiveTab] = useState("new");

const [pendingProposals, setPendingProposals] =
  useState(newProposals);

const [revisionList, setRevisionList] =
  useState(revisedProposals);
  
const [selectedProposal, setSelectedProposal] = useState<any>(null);
    const [members, setMembers] = useState([
  {
    srNo: 1,
    name: "",
    designation: "",
  },

]);
  const [recommendation, setRecommendation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [momUploaded, setMomUploaded] = useState(false);

  const [tacDecision, setTacDecision] = useState("");
const [momDate, setMomDate] = useState("");

const [rejectionReason, setRejectionReason] = useState("");
const [revisionObservation, setRevisionObservation] = useState("");

const [momFile, setMomFile] = useState<File | null>(null);


const [approvedProposals, setApprovedProposals] = useState<any[]>([]);
const [rejectedProposals, setRejectedProposals] = useState<any[]>([]);
const [revisionProposals, setRevisionProposals] = useState<any[]>([]);

const handleAction = (action: string) => {
  if (!selectedProposal) {
    alert("Please select a proposal first.");
    return;
  }

  if (action === "Forward" && !momUploaded) {
    alert("TAC MoM must be uploaded before forwarding.");
    return;
  }

  if (action === "Forward") {

    // Remove proposal from current list
    if (activeTab === "new") {
      setPendingProposals(
        pendingProposals.filter(
          (p) => p.id !== selectedProposal.id
        )
      );
    } else {
      setRevisionList(
        revisionList.filter(
          (p) => p.id !== selectedProposal.id
        )
      );
    }

    setSelectedProposal(null);

    alert(
      `${selectedProposal.id} forwarded successfully to SEC Review`
    );

    navigate("/sec-review");
  }
};




const addRow = () => {
  setMembers([
    ...members,
    {
      srNo: members.length + 1,
      name: "",
      designation: "",
    }
  ]);
};

const removeRow = (index: number) => {
  const updated = members.filter((_, i) => i !== index);

  const renumbered = updated.map((member, idx) => ({
    ...member,
    srNo: idx + 1,
  }));

  setMembers(renumbered);
};
  
  return (
    <div className="space-y-6">
      <div>
        <h1>TAC Appraisal</h1>
        <p className="text-sm text-muted-foreground">Technical Appraisal Committee Review</p>
      </div>

<div className="flex gap-4 mt-4">
  <button
    onClick={() => {
      setActiveTab("new");
      setSelectedProposal(null);
    }}
    className={`px-5 py-2 rounded-lg font-medium ${
      activeTab === "new"
        ? "bg-primary text-white"
        : "bg-muted"
    }`}
  >
    New Proposals
  </button>

  <button
    onClick={() => {
      setActiveTab("revised");
      setSelectedProposal(null);
    }}
    className={`px-5 py-2 rounded-lg font-medium ${
      activeTab === "revised"
        ? "bg-primary text-white"
        : "bg-muted"
    }`}
  >
    Revised Proposals
  </button>
</div>
      
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-4 text-left text-sm">Proposal ID</th>
              <th className="px-6 py-4 text-left text-sm">District</th>
              <th className="px-6 py-4 text-left text-sm">Tech Sanction</th>
              <th className="px-6 py-4 text-left text-sm">Final DPR</th>
              <th className="px-6 py-4 text-left text-sm">Status</th>
            </tr>
          </thead>
          <tbody>
        {(activeTab === "new"
  ? pendingProposals
  : revisionList
).map((proposal) => (
              <tr 
                key={proposal.id} 
                className={`border-t border-border hover:bg-muted/50 cursor-pointer ${selectedProposal?.id === proposal.id ? 'bg-primary/5' : ''}`}
                onClick={() => {
  setSelectedProposal(proposal);

  setTacDecision("");
  setMomDate("");
  setMomUploaded(false);
  setMomFile(null);
  setRejectionReason("");
  setRevisionObservation("");

  setMembers([
    {
      srNo: 1,
      name: "",
      designation: "",
    },
  ]);
}}
              >
                <td className="px-6 py-4 text-sm font-medium">{proposal.id}</td>
                <td className="px-6 py-4 text-sm">{proposal.district}</td>
                <td className="px-6 py-4 text-sm">{proposal.techSanction}</td>
                <td className="px-6 py-4 text-sm">{proposal.dpr}</td>
                <td className="px-6 py-4">
                <span
  className={`px-2 py-1 rounded-full text-xs font-medium ${
    proposal.status === "Pending"
      ? "bg-blue-100 text-blue-700"
      : "bg-orange-100 text-orange-700"
  }`}
>
                    {proposal.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedProposal && (
  <div className="space-y-6">

    {/* TAC Evaluation */}
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
    <h3 className="mb-4 text-lg font-bold border-b pb-2">
  {activeTab === "new"
    ? `TAC Committee Evaluation : ${selectedProposal.id}`
    : `Revised TAC Evaluation : ${selectedProposal.id}`}
</h3>

{activeTab === "revised" && (
  <div className="mb-8 border rounded-xl p-6 shadow-sm">
    <h4 className="font-bold text-black-700 mb-4">
      Last TAC Meeting Details
    </h4>

    <div className="grid md:grid-cols-2 gap-4">

      <div>
        <label className="block text-sm font-medium mb-2">
          Last Meeting Date
        </label>

        <input
          value={selectedProposal.lastMeetingDate}
          readOnly
          className="w-full px-4 py-2 border rounded-lg bg-muted"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Reason For Revision
        </label>

        <textarea
          value={selectedProposal.revisionReason}
          readOnly
          rows={3}
          className="w-full px-4 py-2 border rounded-lg bg-muted"
        />
      </div>
    </div>

    <div className="mt-5">
      <h5 className="font-semibold mb-3">
        Members Present (Previous Meeting)
      </h5>

      <table className="w-full border">
        <thead className="bg-muted">
          <tr>
            <th className="border px-3 py-2">Sr No</th>
            <th className="border px-3 py-2">Member Name</th>
            <th className="border px-3 py-2">Designation</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="border px-3 py-2">1</td>
            <td className="border px-3 py-2">
              Chief Engineer
            </td>
            <td className="border px-3 py-2">
              Chairman
            </td>
          </tr>

          <tr>
            <td className="border px-3 py-2">2</td>
            <td className="border px-3 py-2">
              Technical Officer
            </td>
            <td className="border px-3 py-2">
              Member
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
)}


      <h4 className="font-bold text-primary mb-4">
  Latest Evaluation
</h4>

      <div className="mb-4">
  <label className="block mb-2">
    Meeting Date
  </label>

  <input
    type="date"
    className="w-full px-4 py-2 border rounded-lg"
  />
</div>

      <div className="mb-4">
  <label className="block mb-2">
    Meeting Time
  </label>

  <input
    type="time"
    className="w-full px-4 py-2 border rounded-lg"
  />
</div>

    {/* Members Present Table */}

<div className="space-y-3">

  <div className="flex justify-between items-center">
    <h4 className="font-semibold text-sm">
      Members Present
    </h4>

    <button
      type="button"
      onClick={addRow}
      className="px-3 py-2 bg-primary text-white text-sm rounded-lg flex items-center gap-2"
    >
      <Plus className="size-4" />
      Add Member
    </button>
  </div>

  <table className="w-full border border-border rounded-lg overflow-hidden">

    <thead className="bg-muted">
      <tr>
        <th className="p-3 border text-left text-sm font-medium">
          Sr No
        </th>

        <th className="p-3 border text-left text-sm font-medium">
          Name
        </th>

        <th className="p-3 border text-left text-sm font-medium">
          Designation
        </th>

        <th className="p-3 border text-center text-sm font-medium">
          Action
        </th>
      </tr>
    </thead>

    <tbody>
      {members.map((member, index) => (
        <tr key={index}>

          <td className="border p-2 text-center text-sm">
            {member.srNo}
          </td>

          <td className="border p-2">
            <input
              type="text"
              value={member.name}
              onChange={(e) => {
                const updated = [...members];
                updated[index].name = e.target.value;
                setMembers(updated);
              }}
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter member name"
            />
          </td>

          <td className="border p-2">
            <input
              type="text"
              value={member.designation}
              onChange={(e) => {
                const updated = [...members];
                updated[index].designation = e.target.value;
                setMembers(updated);
              }}
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter designation"
            />
          </td>

          <td className="border p-2 text-center">
            {members.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 className="size-5 mx-auto" />
              </button>
            )}
          </td>

        </tr>
      ))}
    </tbody>

  </table>

</div>
      
{/* Attendance Sheet Upload */}
      <div className="mb-6">
  <label className="block mb-2">
    Attendance Sheet
  </label>

  <input
    type="file"
    className="w-full px-4 py-2 border rounded-lg"
  />
</div>
      
      {/* <div>
        <label className="block text-sm mb-2 font-medium">
          TAC Committee Evaluation Decision *
        </label>

        <select
          value={tacDecision}
          onChange={(e) => setTacDecision(e.target.value)}
          className="w-full px-4 py-2 bg-input-background border border-border rounded-lg"
        >
          <option value="">Select Decision</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="revision">Revision</option>
        </select>
      </div> */}


 <div>
  <label className="block text-sm font-medium mb-2">
    TAC Committee Decision
  </label>

  <div className="flex gap-4">

    {/* APPROVE */}
    <button
      onClick={() => setTacDecision("approved")}
      className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
        tacDecision === "approved"
          ? "bg-green-100 border-green-600 text-green-700"
          : "border-border hover:bg-muted"
      }`}
    >
      <CheckCircle2 className="size-5 mx-auto mb-1" />
      Approve
    </button>


    {/* REJECT */}
    <button
      onClick={() => setTacDecision("rejected")}
      className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
        tacDecision === "rejected"
          ? "bg-red-100 border-red-600 text-red-700"
          : "border-border hover:bg-muted"
      }`}
    >
      <XCircle className="size-5 mx-auto mb-1" />
      Reject
    </button>


    {/* REVISION */}
    <button
      onClick={() => setTacDecision("revision")}
      className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
        tacDecision === "revision"
          ? "bg-orange-100 border-orange-500 text-orange-700"
          : "border-border hover:bg-muted"
      }`}
    >
      <RefreshCw className="size-5 mx-auto mb-1" />
      Revision
    </button>

  </div>
</div>
      

      {/* APPROVED */}
{/* APPROVED */}
{tacDecision === "approved" && (
  <>
    <div className="mt-6 border rounded-lg p-4 bg-green-50">
      <h4 className="font-semibold text-green-700 mb-4">
        Approved Proposal Details
      </h4>

      {/* Date Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Date of TAC MoM Issued *
        </label>

        <input
          type="date"
          value={momDate}
          onChange={(e) => setMomDate(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-lg"
        />
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Upload TAC MoM *
        </label>

        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              setMomFile(file);
              setMomUploaded(true);

              const exists = approvedProposals.find(
                (p) => p.id === selectedProposal.id
              );

              if (!exists) {
                setApprovedProposals([
                  ...approvedProposals,
                  {
                    ...selectedProposal,
                    momDate,
                  },
                ]);
              }
            }
          }}
          className="w-full px-4 py-2 border border-border rounded-lg"
        />

        {momUploaded && momFile && (
          <p className="text-green-600 mt-2 text-sm">
            Uploaded: {momFile.name}
          </p>
        )}
      </div>
    </div>

 
    {momDate && momUploaded && (
  <div className="flex gap-4 mt-4">
    <button
      onClick={() => handleAction("Forward")}
      className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2"
    >
      <Forward className="size-5" />
      Forward to SEC Review
    </button>
  </div>
)}
  </>
)}

      {/* REJECTED */}
     {tacDecision === "rejected" && (
  <>
    <div className="mt-6 border rounded-lg p-4 bg-red-50">
      <h4 className="font-semibold text-red-700 mb-4">
        Rejection Details
      </h4>

      <textarea
        value={rejectionReason}
        onChange={(e) => setRejectionReason(e.target.value)}
        rows={4}
        placeholder="Enter reason for rejection..."
        className="w-full px-4 py-2 border border-border rounded-lg"
      />
    </div>

    {/* Reject Button */}
    {rejectionReason.trim() !== "" && (
      <div className="flex justify-end mt-6">
        <button
          className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center gap-2"
        >
          <CheckCircle2 className="size-5" />
          Reject Proposal
        </button>
      </div>
    )}
  </>
)}

      {/* REVISION */}
   {tacDecision === "revision" && (
  <>
    <div className="mt-6 border rounded-lg p-4 bg-orange-50">
      <h4 className="font-semibold text-orange-700 mb-4">
        Revision Observation
      </h4>

      <textarea
        value={revisionObservation}
        onChange={(e) =>
          setRevisionObservation(e.target.value)
        }
        rows={4}
        placeholder="Note observations for revision..."
        className="w-full px-4 py-2 border border-border rounded-lg"
      />
    </div>

    {/* Revision Button */}
    {revisionObservation.trim() !== "" && (
      <div className="flex justify-end mt-6">
        <button
          className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 flex items-center gap-2"
        >
          <RefreshCw className="size-5" />
          Send For Revision
        </button>
      </div>
    )}
  </>
)}
    </div>
    
          </div>
      
      )}
    </div>
  );
}