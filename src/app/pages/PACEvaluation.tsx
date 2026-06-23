import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Trash2,
  Send,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface Member {
  srNo: number;
  name: string;
  designation: string;
}

// Enums mapping
const DecisionEnum = {
  Approve: 1,
  Reject: 2,
  Revision: 3,
};

const CommitteeType = {
  PAC: 1,
  TAC: 2,
  SEC: 3,
  AdministrativeApproval: 4,
  SDMA: 5,
};

export function PACEvaluation() {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("new");
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");

  const [members, setMembers] = useState<Member[]>([
    { srNo: 1, name: "", designation: "" },
  ]);

  const [attendanceSheet, setAttendanceSheet] = useState<File | null>(null);
  const [decision, setDecision] = useState(""); // 'approve' | 'reject' | 'revision'
  const [momFile, setMomFile] = useState<File | null>(null);
  const [comments, setComments] = useState("");

  // --- NEW STATES FOR REVISED SECTION ---
  const [revisedApprovalDate, setRevisedApprovalDate] = useState("");
  const [revisedMomFile, setRevisedMomFile] = useState<File | null>(null);

  // Fetch New Proposals (revised = false)
  const { data: pendingProposals = [], isLoading: isLoadingPending } = useQuery(
    {
      queryKey: ["pacProposals", "new"],
      queryFn: async () => {
        const response = await axiosPrivate.get(
          "/api/v1/Committees/1/queue?revised=false",
        );
        return response.data;
      },
    },
  );

  // Fetch Revised Proposals (revised = true)
  const { data: revisionList = [], isLoading: isLoadingRevised } = useQuery({
    queryKey: ["pacProposals", "revised"],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        "/api/v1/Committees/1/queue?revised=true",
      );
      return response.data;
    },
  });

  // Fetch Timeline Data for Selected Proposal
  const { data: timelineData = [], isLoading: isLoadingTimeline } = useQuery({
    queryKey: ["proposalTimeline", selectedProposal?.proposalId],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        `/api/v1/Proposals/${selectedProposal.proposalId}/timeline`,
      );
      return response.data;
    },
    enabled: !!selectedProposal && activeTab === "revised",
  });

  // Extract PAC Revision details from timeline data
  const pacRevisionDetails = timelineData.find(
    (entry: any) => entry.status === "PAC Revision",
  );

  // Format the date to YYYY-MM-DD for the input[type="date"]
  const lastMeetingDate = pacRevisionDetails?.meetingDate
    ? pacRevisionDetails.meetingDate.substring(0, 10)
    : "";

  const reasonForRevision =
    pacRevisionDetails?.revisionReson || "No previous comments available.";

  const isLoading = activeTab === "new" ? isLoadingPending : isLoadingRevised;
  const currentTableData =
    activeTab === "new" ? pendingProposals : revisionList;

  const addRow = () => {
    setMembers([
      ...members,
      { srNo: members.length + 1, name: "", designation: "" },
    ]);
  };

  const removeRow = (index: number) => {
    setMembers(
      members
        .filter((_, i) => i !== index)
        .map((m, idx) => ({
          ...m,
          srNo: idx + 1,
        })),
    );
  };

  const resetForm = () => {
    setSelectedProposal(null);
    setDecision("");
    setMomFile(null);
    setAttendanceSheet(null);
    setComments("");
    setMeetingDate("");
    setMeetingTime("");
    setMembers([{ srNo: 1, name: "", designation: "" }]);
    // Reset revised states
    setRevisedApprovalDate("");
    setRevisedMomFile(null);
  };

  // --- INTEGRATED MUTATION LOGIC (NEW TAB) ---
  const evaluateMutation = useMutation({
    mutationFn: async (actionDecision: number) => {
      if (!selectedProposal) throw new Error("No proposal selected");

      const meetingDateTime =
        meetingDate && meetingTime
          ? new Date(`${meetingDate}T${meetingTime}`).toISOString()
          : new Date().toISOString();

      // 1. Submit the Evaluation Payload First
      const payload = {
        proposalId: selectedProposal.proposalId,
        committee: CommitteeType.PAC,
        meetingDate: meetingDateTime,
        meetingTime: meetingTime,
        decision: actionDecision,
        momDate: meetingDateTime,
        rejectionReason: actionDecision === DecisionEnum.Reject ? comments : "",
        revisionReason:
          actionDecision === DecisionEnum.Revision ? comments : "",
        members: members.map((m) => ({
          memberName: m.name,
          designation: m.designation,
        })),
      };

      await axiosPrivate.post("/api/v1/Committees/evaluation", payload);

      // 2. Only if evaluation succeeds, proceed with document uploads
      const uploadPromises = [];

      const createUploadConfig = (file: File, docType: number) => {
        const formData = new FormData();
        formData.append("ownerType", "1");
        formData.append("ownerId", selectedProposal.proposalId);
        formData.append("documentType", docType.toString());
        formData.append("file", file);

        return axiosPrivate.post("/api/v1/Documents/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      };

      if (attendanceSheet) {
        uploadPromises.push(createUploadConfig(attendanceSheet, 39));
      }

      if (actionDecision === DecisionEnum.Approve && momFile) {
        uploadPromises.push(createUploadConfig(momFile, 3));
      }

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      return actionDecision;
    },
    onSuccess: (actionDecision) => {
      queryClient.invalidateQueries({ queryKey: ["pacProposals"] });

      if (actionDecision === DecisionEnum.Approve) {
        toast.success(
          `${selectedProposal.proposalRefNo} forwarded successfully to TAC`,
        );
        navigate("/tac-appraisal");
      } else if (actionDecision === DecisionEnum.Reject) {
        toast.success("Proposal Rejected.");
      } else if (actionDecision === DecisionEnum.Revision) {
        toast.success("Proposal sent for revision.");
      }

      resetForm();
    },
    onError: (error) => {
      console.error("Evaluation Failed:", error);
      toast.error("Failed to process evaluation. Please try again.");
    },
  });

  // --- INTEGRATED MUTATION LOGIC (REVISED TAB) ---
  const revisedEvaluateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProposal) throw new Error("No proposal selected");

      // 1. Submit the Text Payload First
      const payload = {
        proposalId: selectedProposal.proposalId,
        committee: CommitteeType.PAC,
        decision: DecisionEnum.Approve,
        meetingDate: lastMeetingDate
          ? new Date(lastMeetingDate).toISOString()
          : new Date().toISOString(),
        momDate: revisedApprovalDate
          ? new Date(revisedApprovalDate).toISOString()
          : new Date().toISOString(),
        isRevisedRound: true, 
        members: [], // Added empty members array
      };

      await axiosPrivate.post("/api/v1/Committees/evaluation", payload);

      // 2. Only if evaluation succeeds, upload MOM Document
      if (revisedMomFile) {
        const formData = new FormData();
        formData.append("ownerType", "1"); // Proposal
        formData.append("ownerId", selectedProposal.proposalId);
        formData.append("documentType", "3"); // PACMoM
        formData.append("file", revisedMomFile);

        await axiosPrivate.post("/api/v1/Documents/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pacProposals"] });
      toast.success(
        `${selectedProposal.proposalRefNo} forwarded successfully to TAC`,
      );
      navigate("/tac-appraisal");
      resetForm();
    },
    onError: (error) => {
      console.error("Revised Evaluation Failed:", error);
      toast.error("Failed to process revised evaluation. Please try again.");
    },
  });

  // --- VALIDATION HANDLERS ---
  const handleForwardToTAC = () => {
    if (
      !meetingDate ||
      !meetingTime ||
      !attendanceSheet ||
      !momFile ||
      members.some((m) => !m.name || !m.designation)
    ) {
      toast.error(
        "Please complete all mandatory fields and upload required files.",
      );
      return;
    }
    evaluateMutation.mutate(DecisionEnum.Approve);
  };

  const handleReject = () => {
    if (
      !meetingDate ||
      !meetingTime ||
      !attendanceSheet ||
      members.some((m) => !m.name || !m.designation) ||
      !comments.trim()
    ) {
      toast.error(
        "Please complete all mandatory fields, upload required files and enter rejection reasons.",
      );
      return;
    }
    evaluateMutation.mutate(DecisionEnum.Reject);
  };

  const handleRevision = () => {
    if (
      !meetingDate ||
      !meetingTime ||
      !attendanceSheet ||
      members.some((m) => !m.name || !m.designation) ||
      !comments.trim()
    ) {
      toast.error(
        "Please complete all mandatory fields, upload required files and enter observation notes.",
      );
      return;
    }
    evaluateMutation.mutate(DecisionEnum.Revision);
  };

  const handleForwardRevisedToTAC = () => {
    if (!revisedApprovalDate || !revisedMomFile) {
      toast.error("Please select an Approval Date and upload the Document.");
      return;
    }
    revisedEvaluateMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>PAC Evaluation</h1>
        <p className="text-sm text-muted-foreground">
          High-Powered Committee Review and Allocation Validation
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => {
            setActiveTab("new");
            resetForm();
          }}
          className={`px-5 py-2 rounded-lg font-medium ${
            activeTab === "new" ? "bg-primary text-white" : "bg-muted"
          }`}
        >
          New Proposals
        </button>
        <button
          onClick={() => {
            setActiveTab("revised");
            resetForm();
          }}
          className={`px-5 py-2 rounded-lg font-medium ${
            activeTab === "revised" ? "bg-primary text-white" : "bg-muted"
          }`}
        >
          Revised Proposals
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium">
                Proposal ID
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium">
                Project Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium">
                District
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  <Loader2 className="size-6 animate-spin mx-auto mb-2" />
                  Loading proposals...
                </td>
              </tr>
            ) : currentTableData.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  No {activeTab} proposals found.
                </td>
              </tr>
            ) : (
              currentTableData.map((proposal: any) => (
                <tr
                  key={proposal.proposalId}
                  className={`border-t border-border hover:bg-muted/50 cursor-pointer transition-colors ${selectedProposal?.proposalId === proposal.proposalId ? "bg-primary/5" : ""}`}
                  onClick={() => {
                    resetForm();
                    setSelectedProposal(proposal);
                  }}
                >
                  <td className="px-6 py-4 text-sm font-medium">
                    {proposal.proposalRefNo}
                  </td>
                  <td className="px-6 py-4 text-sm">{proposal.title}</td>
                  <td className="px-6 py-4 text-sm">{proposal.district}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${proposal.status === "Pending" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}
                    >
                      {proposal.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedProposal && (
        <div className="space-y-6">
          {activeTab === "revised" && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm relative">
              {isLoadingTimeline && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-xl z-10">
                  <Loader2 className="size-6 animate-spin text-primary" />
                </div>
              )}
              <h3 className="mb-4 text-lg font-bold border-b pb-2">
                Last Meeting Details
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Last Meeting Date
                  </label>
                  <input
                    type="date"
                    value={lastMeetingDate}
                    disabled
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reason for Revision
                  </label>
                  <textarea
                    value={reasonForRevision}
                    disabled
                    rows={3}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "revised" ? (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm mt-6">
              <h3 className="mb-4 text-lg font-bold border-b pb-2">
                Revised PAC Evaluation
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Approval Date (MoM Date)
                    </label>
                    <input
                      type="date"
                      value={revisedApprovalDate}
                      onChange={(e) => setRevisedApprovalDate(e.target.value)}
                      disabled={revisedEvaluateMutation.isPending}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Committee Decision
                    </label>
                    <input
                      type="text"
                      value="Approved"
                      readOnly
                      className="w-full cursor-no-drop px-4 py-3 border border-border rounded-lg bg-muted text-green-700 font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload Document (PAC MoM)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) =>
                      setRevisedMomFile(e.target.files?.[0] || null)
                    }
                    disabled={revisedEvaluateMutation.isPending}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background"
                  />
                  {revisedMomFile && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ File selected: {revisedMomFile.name}
                    </p>
                  )}
                </div>
                <div className="flex justify-between mt-6">
                  <button
                    onClick={resetForm}
                    disabled={revisedEvaluateMutation.isPending}
                    className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium text-sm text-foreground disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleForwardRevisedToTAC}
                    disabled={revisedEvaluateMutation.isPending}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50"
                  >
                    {revisedEvaluateMutation.isPending ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <Send className="size-5" />
                    )}
                    Forward to TAC
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* --- REMAINDER OF NEW EVALUATION UI REMAINS IDENTICAL --- */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold border-b pb-2">
                  PAC Committee Evaluation : {selectedProposal.proposalRefNo}
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm mb-2 font-medium">
                      Proposal ID
                    </label>
                    <input
                      type="text"
                      value={selectedProposal.proposalRefNo}
                      disabled
                      className="w-full px-4 py-3 bg-muted border border-border rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Meeting Date
                      </label>
                      <input
                        type="date"
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                        disabled={evaluateMutation.isPending}
                        className="w-full px-4 py-3 border border-border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Meeting Time
                      </label>
                      <input
                        type="time"
                        value={meetingTime}
                        onChange={(e) => setMeetingTime(e.target.value)}
                        disabled={evaluateMutation.isPending}
                        className="w-full px-4 py-3 border border-border rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-sm">Members Present</h4>
                      <button
                        type="button"
                        onClick={addRow}
                        disabled={evaluateMutation.isPending}
                        className="px-3 py-2 bg-primary text-white text-sm rounded-lg flex items-center gap-2 disabled:opacity-50"
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
                                disabled={evaluateMutation.isPending}
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
                                disabled={evaluateMutation.isPending}
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
                                  disabled={evaluateMutation.isPending}
                                  className="text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
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
                    <label className="block text-sm font-medium mb-2">
                      Upload Attendance Sheet
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      disabled={evaluateMutation.isPending}
                      onChange={(e) => {
                        setAttendanceSheet(e.target.files?.[0] || null);
                      }}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background"
                    />
                    {attendanceSheet && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ File selected: {attendanceSheet.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      PAC Committee Decision
                    </label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setDecision("approve")}
                        disabled={evaluateMutation.isPending}
                        className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
                          decision === "approve"
                            ? "bg-green-100 border-green-600 text-green-700"
                            : "border-border hover:bg-muted disabled:opacity-50"
                        }`}
                      >
                        <CheckCircle2 className="size-5 mx-auto mb-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => setDecision("reject")}
                        disabled={evaluateMutation.isPending}
                        className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
                          decision === "reject"
                            ? "bg-red-100 border-red-600 text-red-700"
                            : "border-border hover:bg-muted disabled:opacity-50"
                        }`}
                      >
                        <XCircle className="size-5 mx-auto mb-1" />
                        Reject
                      </button>
                      <button
                        onClick={() => setDecision("revision")}
                        disabled={evaluateMutation.isPending}
                        className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
                          decision === "revision"
                            ? "bg-orange-100 border-orange-500 text-orange-700"
                            : "border-border hover:bg-muted disabled:opacity-50"
                        }`}
                      >
                        <RefreshCw className="size-5 mx-auto mb-1" />
                        Revision
                      </button>
                    </div>
                  </div>

                  {decision === "approve" && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                      <label className="block text-sm font-medium mb-2">
                        Upload PAC Minutes of Meeting (MOM)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        disabled={evaluateMutation.isPending}
                        onChange={(e) =>
                          setMomFile(e.target.files?.[0] || null)
                        }
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background"
                      />
                      {momFile && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ File selected: {momFile.name}
                        </p>
                      )}
                    </div>
                  )}

                  {decision === "reject" && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                      <label className="block text-sm font-medium mb-2">
                        Reason for Rejection
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Enter reason for rejection"
                        value={comments}
                        disabled={evaluateMutation.isPending}
                        onChange={(e) => setComments(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background disabled:opacity-50"
                      />
                    </div>
                  )}

                  {decision === "revision" && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                      <label className="block text-sm font-medium mb-2">
                        Observation / Comments
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Provide observation notes"
                        value={comments}
                        disabled={evaluateMutation.isPending}
                        onChange={(e) => setComments(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background disabled:opacity-50"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={resetForm}
                  disabled={evaluateMutation.isPending}
                  className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium text-sm text-foreground disabled:opacity-50"
                >
                  Cancel
                </button>
                {decision === "approve" && momFile && (
                  <button
                    onClick={handleForwardToTAC}
                    disabled={evaluateMutation.isPending}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors font-medium text-sm animate-in fade-in zoom-in duration-300 disabled:opacity-50"
                  >
                    {evaluateMutation.isPending ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <Send className="size-5" />
                    )}
                    Forward to TAC
                  </button>
                )}
                {decision === "reject" && (
                  <button
                    onClick={handleReject}
                    disabled={evaluateMutation.isPending}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors font-medium text-sm animate-in fade-in zoom-in duration-300 disabled:opacity-50"
                  >
                    {evaluateMutation.isPending ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <XCircle className="size-5" />
                    )}
                    Reject Proposal
                  </button>
                )}
                {decision === "revision" && (
                  <button
                    onClick={handleRevision}
                    disabled={evaluateMutation.isPending}
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors font-medium text-sm animate-in fade-in zoom-in duration-300 disabled:opacity-50"
                  >
                    {evaluateMutation.isPending ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <RefreshCw className="size-5" />
                    )}
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
