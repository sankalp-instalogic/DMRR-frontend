import { useState } from "react";
import {
  Edit,
  Forward,
  XCircle,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Send
} from "lucide-react";
import { useNavigate } from "react-router";

const pendingProposals = [
  {
    id: "DMRR/2025/MUM/001",
    district: "Mumbai",
    department: "PWD",
    cost: "450 Cr",
    status: "Pending",
  },
  {
    id: "DMRR/2025/PUN/021",
    district: "Pune",
    department: "Rural Development",
    cost: "320 Cr",
    status: "Pending",
  },
  {
    id: "DMRR/2025/NAG/015",
    district: "Nagpur",
    department: "Water Resources",
    cost: "275 Cr",
    status: "Pending",
  },
];

interface Member {
  srNo: number;
  name: string;
  designation: string;
}

export function AdministrativeApproval() {
  const navigate = useNavigate();

  const [selectedProposal, setSelectedProposal] = useState<any>(null);

  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  
  const [members, setMembers] = useState<Member[]>([
    { srNo: 1, name: "", designation: "" }
  ]);
  
  const [attendanceSheet, setAttendanceSheet] = useState<File | null>(null);

  const [recommendation, setRecommendation] = useState("");

  const [momFile, setMomFile] = useState<File | null>(null);
  const [comments, setComments] = useState("");


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


  const handleForwardToSDMA = () => {
    if (!meetingDate || !meetingTime || !attendanceSheet || !momFile || members.some(m => !m.name || !m.designation)) {
        alert("Please complete all mandatory fields and upload required files.");
        return;
    }
    
    alert("Proposal forwarded to SDMA successfully");

    setSelectedProposal(null);
    setRecommendation("");
    setMomFile(null);
    setAttendanceSheet(null);
    setComments("");

    navigate("/sdma-approval");
  };

  const handleReject = () => {
     if (!meetingDate || !meetingTime || !attendanceSheet || members.some(m => !m.name || !m.designation) || !comments.trim()) {
        alert("Please complete all mandatory fields, upload required files and enter rejection reasons.");
        return;
    }
    alert("Proposal Rejected.");

    setSelectedProposal(null);
    setRecommendation("");
    setMomFile(null);
    setAttendanceSheet(null);
    setComments("");
  };

  const handleRevision = () => {
     if (!meetingDate || !meetingTime || !attendanceSheet || members.some(m => !m.name || !m.designation) || !comments.trim()) {
        alert("Please complete all mandatory fields, upload required files and enter observation notes.");
        return;
    }
    alert("Proposal sent for revision.");

    setSelectedProposal(null);
    setRecommendation("");
    setMomFile(null);
    setAttendanceSheet(null);
    setComments("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div>
        <h1>Administrative Approval</h1>

        <p className="text-sm text-muted-foreground">
          Administrative Approval review and approval
        </p>
      </div>

      {/* Pending Proposal List */}

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-4 text-left">
                Proposal ID
              </th>

              <th className="px-6 py-4 text-left">
                Project Name
              </th>

              <th className="px-6 py-4 text-left">
                District
              </th>

              <th className="px-6 py-4 text-left">
                Line Department
              </th>

              <th className="px-6 py-4 text-left">
                Estimated Cost
              </th>

              <th className="px-6 py-4 text-left">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {pendingProposals.map((proposal) => (
              <tr
                key={proposal.id}
                className="border-t border-border cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedProposal(proposal)}
              >
                <td className="px-6 py-4">
                  {proposal.id}
                </td>

                <td className="px-6 py-4">
                  Sample Project {proposal.id.slice(-3)}
                </td>

                <td className="px-6 py-4">
                  {proposal.district}
                </td>

                <td className="px-6 py-4">
                  {proposal.department}
                </td>

                <td className="px-6 py-4">
                  ₹ {proposal.cost}
                </td>

                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-xs">
                    {proposal.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SEC Evaluation Form */}

      {selectedProposal && (
        <>
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold border-b pb-2">
              Administrative Approval Evaluation
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm mb-2 font-medium">
                  Proposal ID
                </label>

                <input
                  type="text"
                  value={selectedProposal.id}
                  disabled
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg"
                />
              </div>

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
                <h4 className="font-semibold">
                  Members Present
                </h4>

                <button
                  type="button"
                  onClick={addRow}
                  className="px-3 py-2 bg-primary text-white rounded-lg flex items-center gap-2"
                >
                  <Plus className="size-4" />
                  Add Member
                </button>
              </div>

              <table className="w-full border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 border">Sr No</th>
                    <th className="p-3 border">Name</th>
                    <th className="p-3 border">Designation</th>
                    <th className="p-3 border">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {members.map((member, index) => (
                    <tr key={index}>
                      <td className="border p-2 text-center">
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
                        />
                      </td>

                      <td className="border p-2 text-center">
                        {members.length > 1 && (
                          <button
                            onClick={() => removeRow(index)}
                            className="text-red-600"
                          >
                            <Trash2 className="size-5" />
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
                    className="w-full px-4 py-3 border border-border rounded-lg"
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
                onClick={() => setRecommendation("approve")}
                className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
  recommendation === "approve"
    ? "bg-green-100 border-green-600 text-green-700"
    : "border-border hover:bg-muted"
}`}
                >
                <CheckCircle2 className="size-4 mx-auto mb-1" />
                Approve
                </button>

                <button
                onClick={() => setRecommendation("reject")}
                className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
  recommendation === "reject"
    ? "bg-red-100 border-red-600 text-red-700"
    : "border-border hover:bg-muted"
}`}
                >
                <XCircle className="size-4 mx-auto mb-1" />
                Reject
                </button>

                <button
  onClick={() => setRecommendation("revision")}
  className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
    recommendation === "revision"
      ? "bg-orange-100 border-orange-500 text-orange-700"
      : "border-border hover:bg-muted"
  }`}
>
  <RefreshCw className="size-5 mx-auto mb-2" />
  Revision
</button>
            </div>
            </div>


              {/* APPROVED */}

              {recommendation === "approve" && (
                <div>
                   <label className="block text-sm font-medium mb-2">
                        Upload Administrative Approval Minutes of Meeting
                    </label>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setMomFile(e.target.files?.[0] || null)}
                        className="w-full px-4 py-3 border border-border rounded-lg"
                    />
                    {momFile && (
                        <p className="text-sm text-green-600 mt-2">
                           ✓ File uploaded successfully
                        </p>
                    )}
                </div>
              )}

              {/* REJECT */}

              {recommendation ===
                "reject" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reason for Rejection
                  </label>

                  <textarea
                    rows={4}
                    placeholder="Enter reason for rejection"
                    value={comments}
                    onChange={(e) =>
                      setComments(
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}

              {/* REVISE */}

              {recommendation === "revision" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Observation Notes
                  </label>

                  <textarea
                    rows={4}
                    placeholder="Provide observation notes"
                    value={comments}
                    onChange={(e) =>
                      setComments(
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                   setRecommendation("");
               }}
               className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium text-sm text-foreground"
            >
                Cancel
            </button>

            {recommendation === "approve" &&
              momFile && (
                <button
                  onClick={handleForwardToSDMA}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                  <Send className="size-5" />
                  Forward to SDMA
                </button>
              )}

            {recommendation ===
              "reject" && (
              <button
                onClick={handleReject}
                className="px-6 py-3 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700"
              >
                <XCircle className="size-5" />
                Reject Proposal
              </button>
            )}

            {recommendation === "revision" && (
              <button
                onClick={handleRevision}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg flex items-center gap-2 hover:bg-orange-600"
              >
                <RefreshCw className="size-5" />
                Send For Revision
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}