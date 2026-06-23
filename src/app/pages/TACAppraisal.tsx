import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Trash2,
  Loader2,
  Forward,
  Send,
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

export function TACAppraisal() {
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

  // Fetch New Proposals (revised = false) for TAC (Committee ID = 2)
  const { data: pendingProposals = [], isLoading: isLoadingPending } = useQuery(
    {
      queryKey: ["tacProposals", "new"],
      queryFn: async () => {
        const response = await axiosPrivate.get(
          "/api/v1/Committees/2/queue?revised=false"
        );
        return response.data;
      },
    }
  );

  // Fetch Revised Proposals (revised = true) for TAC
  const { data: revisionList = [], isLoading: isLoadingRevised } = useQuery({
    queryKey: ["tacProposals", "revised"],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        "/api/v1/Committees/2/queue?revised=true"
      );
      return response.data;
    },
  });

  // Fetch Timeline Data for Selected Proposal
  const { data: timelineData = [], isLoading: isLoadingTimeline } = useQuery({
    queryKey: ["proposalTimeline", selectedProposal?.proposalId || selectedProposal?.id],
    queryFn: async () => {
      const id = selectedProposal?.proposalId || selectedProposal?.id;
      const response = await axiosPrivate.get(
        `/api/v1/Proposals/${id}/timeline`
      );
      return response.data;
    },
    enabled: !!selectedProposal && activeTab === "revised",
  });

  // Extract TAC Revision details from timeline data
  const tacRevisionDetails = timelineData.find(
    (entry: any) => entry.status === "TAC Revision"
  );

  // Format the date to YYYY-MM-DD for the input[type="date"]
  const lastMeetingDate = tacRevisionDetails?.meetingDate
    ? tacRevisionDetails.meetingDate.substring(0, 10)
    : "";

  const reasonForRevision =
    tacRevisionDetails?.revisionReson || tacRevisionDetails?.revisionReason || "No previous comments available.";

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
        }))
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

      const uploadPromises = [];
      const proposalId = selectedProposal.proposalId || selectedProposal.id;

      const createUploadConfig = (file: File, docType: number) => {
        const formData = new FormData();
        formData.append("ownerType", "1"); // Assuming 1 represents Proposal Type mapping
        formData.append("ownerId", proposalId);
        formData.append("documentType", docType.toString());
        formData.append("file", file);

        return axiosPrivate.post("/api/v1/Documents/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      };

      // Attendance sheet is typically docType 39 globally
      if (attendanceSheet) {
        uploadPromises.push(createUploadConfig(attendanceSheet, 39));
      }

      // MOM file is required only for Approval. TAC MoM DocType is 4
      if (actionDecision === DecisionEnum.Approve && momFile) {
        uploadPromises.push(createUploadConfig(momFile, 4));
      }

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      // Format Dates
      const meetingDateTime =
        meetingDate && meetingTime
          ? new Date(`${meetingDate}T${meetingTime}`).toISOString()
          : new Date().toISOString();

      // Construct API Payload
      const payload = {
        proposalId: proposalId,
        committee: CommitteeType.TAC, 
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

      return actionDecision;
    },
    onSuccess: (actionDecision) => {
      queryClient.invalidateQueries({ queryKey: ["tacProposals"] });

      const propRef = selectedProposal.proposalRefNo || selectedProposal.id;

      if (actionDecision === DecisionEnum.Approve) {
        toast.success(`${propRef} forwarded successfully to SEC`);
        navigate("/sec-review");
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
      const proposalId = selectedProposal.proposalId || selectedProposal.id;

      // 1. Submit the Text Payload First
      const payload = {
        proposalId: proposalId,
        committee: CommitteeType.TAC,
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
        formData.append("ownerId", proposalId);
        formData.append("documentType", "4"); // TAC MoM DocType is 4
        formData.append("file", revisedMomFile);

        await axiosPrivate.post("/api/v1/Documents/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tacProposals"] });
      const propRef = selectedProposal.proposalRefNo || selectedProposal.id;
      toast.success(`${propRef} forwarded successfully to SEC`);
      navigate("/sec-review");
      resetForm();
    },
    onError: (error) => {
      console.error("Revised Evaluation Failed:", error);
      toast.error("Failed to process revised evaluation. Please try again.");
    },
  });


  const handleForwardToSEC = () => {
    if (
      !meetingDate ||
      !meetingTime ||
      !attendanceSheet ||
      !momFile ||
      members.some((m) => !m.name || !m.designation)
    ) {
      toast.error("Please complete all mandatory fields and upload required files.");
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
        "Please complete all mandatory fields, upload required files and enter rejection reasons."
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
        "Please complete all mandatory fields, upload required files and enter observation notes."
      );
      return;
    }
    evaluateMutation.mutate(DecisionEnum.Revision);
  };

  const handleForwardRevisedToSEC = () => {
    if (!revisedApprovalDate || !revisedMomFile) {
      toast.error("Please select an Approval Date and upload the Document.");
      return;
    }
    revisedEvaluateMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>TAC Appraisal</h1>
        <p className="text-sm text-muted-foreground">
          Technical Appraisal Committee Review
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
              <th className="px-6 py-4 text-left text-sm font-medium">Proposal ID</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Project Name</th>
              <th className="px-6 py-4 text-left text-sm font-medium">District</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  <Loader2 className="size-6 animate-spin mx-auto mb-2" />
                  Loading proposals...
                </td>
              </tr>
            ) : currentTableData.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  No {activeTab} proposals found.
                </td>
              </tr>
            ) : (
              currentTableData.map((proposal: any) => (
                <tr
                  key={proposal.id || proposal.proposalId}
                  className={`border-t border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                    (selectedProposal?.id || selectedProposal?.proposalId) === (proposal.id || proposal.proposalId)
                      ? "bg-primary/5"
                      : ""
                  }`}
                  onClick={() => {
                    resetForm();
                    setSelectedProposal(proposal);
                  }}
                >
                  <td className="px-6 py-4 text-sm font-medium">
                    {proposal.proposalRefNo || proposal.id}
                  </td>
                  <td className="px-6 py-4 text-sm max-w-xs truncate" title={proposal.projectName || proposal.title}>
                    {proposal.projectName || proposal.title}
                  </td>
                  <td className="px-6 py-4 text-sm">{proposal.district}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        proposal.status === "Pending"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              <div className="grid md:grid-cols-2 gap-6">
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
                Revised TAC Evaluation : {selectedProposal.proposalRefNo || selectedProposal.id}
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
                    Upload Document (TAC MoM)
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
                    onClick={handleForwardRevisedToSEC}
                    disabled={revisedEvaluateMutation.isPending}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50"
                  >
                    {revisedEvaluateMutation.isPending ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <Forward className="size-5" />
                    )}
                    Forward to SEC Review
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm mt-6">
              <h3 className="mb-4 text-lg font-bold border-b pb-2">
                TAC Committee Evaluation : {selectedProposal.proposalRefNo || selectedProposal.id}
              </h3>
              <div className="space-y-6">
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
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                              placeholder="Enter member name"
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
                              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                              placeholder="Enter designation"
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
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                  {attendanceSheet && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ File selected: {attendanceSheet.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    TAC Committee Decision
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setDecision("approve")}
                      disabled={evaluateMutation.isPending}
                      className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
                        decision === "approve"
                          ? "bg-green-100 border-green-600 text-green-700 shadow-sm"
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
                          ? "bg-red-100 border-red-600 text-red-700 shadow-sm"
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
                          ? "bg-orange-100 border-orange-500 text-orange-700 shadow-sm"
                          : "border-border hover:bg-muted disabled:opacity-50"
                      }`}
                    >
                      <RefreshCw className="size-5 mx-auto mb-1" />
                      Revision
                    </button>
                  </div>
                </div>

                {decision === "approve" && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300 p-4 bg-green-50/50 rounded-xl border border-green-100">
                    <label className="block text-sm font-medium mb-2 text-green-800">
                      Upload TAC Minutes of Meeting (MOM)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      disabled={evaluateMutation.isPending}
                      onChange={(e) => setMomFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 border border-green-200 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-green-500/20 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
                    />
                    {momFile && (
                      <p className="text-sm text-green-600 mt-2 font-medium">
                        ✓ File selected: {momFile.name}
                      </p>
                    )}
                  </div>
                )}

                {decision === "reject" && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300 p-4 bg-red-50/50 rounded-xl border border-red-100">
                    <label className="block text-sm font-medium mb-2 text-red-800">
                      Reason for Rejection
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Enter explicit reason for rejection..."
                      value={comments}
                      disabled={evaluateMutation.isPending}
                      onChange={(e) => setComments(e.target.value)}
                      className="w-full px-4 py-3 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-background disabled:opacity-50"
                    />
                  </div>
                )}

                {decision === "revision" && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300 p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                    <label className="block text-sm font-medium mb-2 text-orange-800">
                      Observation / Revision Notes
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Provide observation notes for necessary revisions..."
                      value={comments}
                      disabled={evaluateMutation.isPending}
                      onChange={(e) => setComments(e.target.value)}
                      className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-background disabled:opacity-50"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <button
                  onClick={resetForm}
                  disabled={evaluateMutation.isPending}
                  className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium text-sm text-foreground disabled:opacity-50"
                >
                  Cancel
                </button>
                
                {decision === "approve" && momFile && (
                  <button
                    onClick={handleForwardToSEC}
                    disabled={evaluateMutation.isPending}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors font-medium text-sm animate-in fade-in zoom-in duration-300 disabled:opacity-50 shadow-sm"
                  >
                    {evaluateMutation.isPending ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <Forward className="size-5" />
                    )}
                    Forward to SEC Review
                  </button>
                )}

                {decision === "reject" && (
                  <button
                    onClick={handleReject}
                    disabled={evaluateMutation.isPending}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors font-medium text-sm animate-in fade-in zoom-in duration-300 disabled:opacity-50 shadow-sm"
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
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors font-medium text-sm animate-in fade-in zoom-in duration-300 disabled:opacity-50 shadow-sm"
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}