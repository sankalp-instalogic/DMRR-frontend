import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Trash2,
  Send,
  Forward
} from "lucide-react";
import { useNavigate } from "react-router";

const initialNewProposals = [
  {
    id: "DMRR/2025/MUM/001",
    projectName: "Flood Protection Wall",
    district: "Mumbai",
    department: "PWD",
    cost: "450 Cr",
    status: "Pending",
  },
  {
    id: "DMRR/2025/PUN/021",
    projectName: "River Deepening Project",
    district: "Pune",
    department: "Rural Development",
    cost: "320 Cr",
    status: "Pending",
  },
  {
    id: "DMRR/2025/NAG/015",
    projectName: "Storm Water Drainage",
    district: "Nagpur",
    department: "Water Resources",
    cost: "275 Cr",
    status: "Pending",
  },
];

const initialRevisedProposals = [
  {
    id: "DMRR/2025/MUM/011",
    projectName: "Dam Strengthening",
    district: "Mumbai",
    department: "PWD",
    cost: "450 Cr",
    status: "Revised",
    lastMeetingDate: "10-06-2025",
    revisionReason: "Requires financial re-evaluation.",
    lastMembers: [
      { srNo: 1, name: "Dr. A. Sharma", designation: "Finance Secretary" },
    ]
  },
];

interface Member {
  srNo: number;
  name: string;
  designation: string;
}

export function AdministrativeApproval() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("new");
  const [pendingProposals, setPendingProposals] = useState(initialNewProposals);
  const [revisionList, setRevisionList] = useState(initialRevisedProposals);

  const [selectedProposal, setSelectedProposal] = useState<any>(null);

  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  
  const [members, setMembers] = useState<Member[]>([
    { srNo: 1, name: "", designation: "" }
  ]);
  
  const [attendanceSheet, setAttendanceSheet] = useState<File | null>(null);

  const [decision, setDecision] = useState("");
  const [momFile, setMomFile] = useState<File | null>(null);
  const [comments, setComments] = useState("");
  const [momDate, setMomDate] = useState("");

  const clearForm = () => {
    setDecision("");
    setComments("");
    setMeetingDate("");
    setMeetingTime("");
    setMomDate("");
    setMomFile(null);
    setAttendanceSheet(null);
    setMembers([
      { srNo: 1, name: "", designation: "" }
    ]);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedProposal(null);
    clearForm();
  };

  const handleProposalSelect = (proposal: any) => {
    setSelectedProposal(proposal);
    clearForm();
  };

  const addRow = () => {
    setMembers([
      ...members,
      {
        srNo: members.length + 1,
        name: "",
        designation: "",
      },
    ]);
  };

  const removeRow = (index: number) => {
    setMembers(
      members
        .filter((_, i) => i !== index)
        .map((m, idx) => ({
          ...m,
          srNo: idx + 1,
        }))
    );
  };

  const removeFromList = () => {
    if (activeTab === "new") {
      setPendingProposals(pendingProposals.filter((p) => p.id !== selectedProposal.id));
    } else {
      setRevisionList(revisionList.filter((p) => p.id !== selectedProposal.id));
    }
  };

  const handleForwardToNextStage = () => {
    if (!meetingDate || !meetingTime || !attendanceSheet || !momDate || !momFile || members.some(m => !m.name || !m.designation)) {
        alert("Please complete all mandatory fields and upload required files.");
        return;
    }
    
    alert(`Proposal forwarded to SDMA Approval successfully`);
    removeFromList();
    clearForm();
    setSelectedProposal(null);
    navigate("/sdma-approval");
  };

  const handleReject = () => {
     if (!meetingDate || !meetingTime || !attendanceSheet || members.some(m => !m.name || !m.designation) || !comments.trim()) {
        alert("Please complete all mandatory fields, upload required files and enter rejection reasons.");
        return;
    }
    alert("Proposal Rejected.");
    removeFromList();
    clearForm();
    setSelectedProposal(null);
  };

  const handleRevision = () => {
     if (!meetingDate || !meetingTime || !attendanceSheet || members.some(m => !m.name || !m.designation) || !comments.trim()) {
        alert("Please complete all mandatory fields, upload required files and enter observation notes.");
        return;
    }
    alert("Proposal sent for revision.");
    removeFromList();
    clearForm();
    setSelectedProposal(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Administrative Approval</h1>
        <p className="text-sm text-muted-foreground">Administrative Approval review and approval</p>
      </div>

      <div className="flex gap-4 mt-4">
        <button
          onClick={() => handleTabChange("new")}
          className={`px-5 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "new"
              ? "bg-primary text-white"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          New Proposals
        </button>
        <button
          onClick={() => handleTabChange("revised")}
          className={`px-5 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "revised"
              ? "bg-primary text-white"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Revised Proposals
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium">Proposal ID</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Project Name</th>
              <th className="px-6 py-4 text-left text-sm font-medium">District</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Line Department</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Estimated Cost</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {(activeTab === "new" ? pendingProposals : revisionList).map((proposal) => (
              <tr 
                key={proposal.id} 
                className={`border-t border-border hover:bg-muted/50 cursor-pointer transition-colors ${selectedProposal?.id === proposal.id ? 'bg-primary/5' : ''}`}
                onClick={() => handleProposalSelect(proposal)}
              >
                <td className="px-6 py-4 text-sm font-medium">{proposal.id}</td>
                <td className="px-6 py-4 text-sm max-w-xs truncate" title={proposal.projectName}>{proposal.projectName}</td>
                <td className="px-6 py-4 text-sm">{proposal.district}</td>
                <td className="px-6 py-4 text-sm">{proposal.department}</td>
                <td className="px-6 py-4 text-sm font-bold text-accent">₹ {proposal.cost}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${proposal.status === 'Pending' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
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
          {/* Section 1: For Revised Proposals Only */}
          {selectedProposal.status === "Revised" && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold border-b pb-2">
                Last Meeting Details
              </h3>
              
              <div className="space-y-6">
                 <div>
                    <label className="block text-sm font-medium mb-2">Last Meeting Date</label>
                    <input
                        type="text"
                        value={selectedProposal.lastMeetingDate}
                        disabled
                        className="w-full px-4 py-3 bg-muted border border-border rounded-lg"
                    />
                </div>
                
                {/* <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Last Members Present</h4>
                  <table className="w-full border border-border rounded-lg overflow-hidden">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 border text-left text-sm font-medium">Sr No</th>
                        <th className="p-3 border text-left text-sm font-medium">Name</th>
                        <th className="p-3 border text-left text-sm font-medium">Designation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProposal.lastMembers.map((member: any, index: number) => (
                        <tr key={index}>
                          <td className="border p-3 text-sm">{member.srNo}</td>
                          <td className="border p-3 text-sm">{member.name}</td>
                          <td className="border p-3 text-sm">{member.designation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div> */}
                
                 <div>
                    <label className="block text-sm font-medium mb-2">Reason for Revision</label>
                    <textarea
                        value={selectedProposal.revisionReason}
                        disabled
                        rows={3}
                        className="w-full px-4 py-3 bg-muted border border-border rounded-lg"
                    />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Latest Evaluation */}
{activeTab === "revised" ? (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold border-b pb-2">
              Revised Administrative Approval Evaluation
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Approval Date</label>
                  <input type="date" className="w-full px-4 py-3 border border-border rounded-lg bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Committee Decision</label>
                  <input type="text" value="Approved" readOnly className="w-full px-4 py-3 border border-border rounded-lg bg-muted text-green-700 font-semibold" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Upload Document</label>
                <input type="file" accept=".pdf,.doc,.docx" className="w-full px-4 py-3 border border-border rounded-lg bg-background" />
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={() => { alert("Proposal forwarded successfully to SDMA"); navigate("/sdma-approval"); }} className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors font-medium text-sm">
                  <Forward className="size-5" /> Forward to SDMA
                </button>
              </div>
            </div>
          </div>
) : (
  <>
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold border-b pb-2">
              Administrative Approval Evaluation : {selectedProposal.id} - {selectedProposal.projectName}
            </h3>

            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Meeting Date</label>
                    <input
                        type="date"
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                        className="w-full px-4 py-3 border border-border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Meeting Time</label>
                    <input
                        type="time"
                        value={meetingTime}
                        onChange={(e) => setMeetingTime(e.target.value)}
                        className="w-full px-4 py-3 border border-border rounded-lg"
                    />
                </div>
              </div>

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
                      <th className="p-3 border text-left text-sm font-medium">Sr No</th>
                      <th className="p-3 border text-left text-sm font-medium">Name</th>
                      <th className="p-3 border text-left text-sm font-medium">Designation</th>
                      <th className="p-3 border text-center text-sm font-medium">Action</th>
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

              <div>
                  <label className="block text-sm font-medium mb-2">Upload Attendance Sheet</label>
                  <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                         setAttendanceSheet(e.target.files?.[0] || null)
                      }}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background"
                  />
                   {attendanceSheet && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ File uploaded successfully
                        </p>
                  )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                    AA Recommendation
                </label>
                <div className="flex gap-4">
                  <button
                  onClick={() => setDecision("approve")}
                  className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
                    decision === "approve"
                      ? "bg-green-100 border-green-600 text-green-700"
                      : "border-border hover:bg-muted"
                  }`}
                  >
                  <CheckCircle2 className="size-5 mx-auto mb-1" />
                  Approve
                  </button>

                  <button
                  onClick={() => setDecision("reject")}
                  className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
                    decision === "reject"
                      ? "bg-red-100 border-red-600 text-red-700"
                      : "border-border hover:bg-muted"
                  }`}
                  >
                  <XCircle className="size-5 mx-auto mb-1" />
                  Reject
                  </button>

                  <button
                    onClick={() => setDecision("revision")}
                    className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
                      decision === "revision"
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
              {decision === "approve" && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Date of Minutes of Meeting
                    </label>
                    <input
                      type="date"
                      value={momDate}
                      onChange={(e) => setMomDate(e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background"
                    />
                  </div>
                   <div>
                     <label className="block text-sm font-medium mb-2">
                          Upload MoM file
                      </label>
                      <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setMomFile(e.target.files?.[0] || null)}
                          className="w-full px-4 py-3 border border-border rounded-lg bg-background"
                      />
                      {momFile && (
                          <p className="text-sm text-green-600 mt-2">
                             Uploaded: {momFile.name}
                          </p>
                      )}
                   </div>
                </div>
              )}

              {/* REJECT */}
              {decision === "reject" && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className="block text-sm font-medium mb-2">
                    Reason for Rejection
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter reason for rejection"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                  />
                </div>
              )}

              {/* REVISE */}
              {decision === "revision" && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className="block text-sm font-medium mb-2">
                    Observation / Comments
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide observation notes"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6">
            <button
               onClick={() => {
                 setSelectedProposal(null);
                 clearForm();
               }}
               className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium text-sm text-foreground"
            >
                Cancel
            </button>

            {decision === "approve" && momFile && (
                <button
                  onClick={handleForwardToNextStage}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors font-medium text-sm animate-in fade-in zoom-in duration-300"
                >
                  <Forward className="size-5" />
                  Forward to Next Stage
                </button>
            )}

            {decision === "reject" && comments.trim().length > 0 && (
              <button
                onClick={handleReject}
                className="px-6 py-3 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors font-medium text-sm animate-in fade-in zoom-in duration-300"
              >
                <XCircle className="size-5" />
                Reject Proposal
              </button>
            )}

            {decision === "revision" && comments.trim().length > 0 && (
              <button
                onClick={handleRevision}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors font-medium text-sm animate-in fade-in zoom-in duration-300"
              >
                <RefreshCw className="size-5" />
                Send for Revision
              </button>
            )}
          </div>
  </>
)}
        </div>
      )}
    </div>
  );
}
