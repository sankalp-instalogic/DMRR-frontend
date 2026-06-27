import { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
import { useNavigate, useParams, Navigate } from "react-router";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import dayjs from "dayjs"; // Required for Ant Design DatePicker/TimePicker parsing

// Ant Design & Table Imports
import { Input, Spin, DatePicker, TimePicker } from "antd";
import type { ColDef } from "ag-grid-community";
import { Table } from "../components/Table"; // Adjust path as needed
import { cn } from "../components/ui/utils";
import { buttonVariants } from "../components/ui/button";

const { TextArea } = Input;

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

// --- CONFIGURATION MAP ---
// This handles all the unique variables for each committee type
const COMMITTEE_CONFIG: Record<string, any> = {
  pac: {
    id: 1,
    title: "PAC Evaluation",
    subtitle: "High-Powered Committee Review and Allocation Validation",
    nextRoute: "/evaluation/tac",
    nextStageName: "TAC",
    momDocType: 3,
    attendanceDocType: 39,
    timelineSearchStr: "PAC Revision",
  },
  tac: {
    id: 2,
    title: "TAC Appraisal",
    subtitle: "Technical Appraisal Committee Review",
    nextRoute: "/evaluation/sec",
    nextStageName: "SEC",
    momDocType: 4,
    attendanceDocType: 39,
    timelineSearchStr: "TAC Revision",
  },
  sec: {
    id: 3,
    title: "SEC Review",
    subtitle: "State Empowered Committee review and approval",
    nextRoute: "/evaluation/aa",
    nextStageName: "Administrative Approval",
    momDocType: 5,
    attendanceDocType: 39,
    timelineSearchStr: "SEC Revision",
  },
  aa: {
    id: 4,
    title: "Administrative Approval",
    subtitle: "Administrative Approval review and evaluation",
    nextRoute: "/evaluation/sdma",
    nextStageName: "SDMA",
    momDocType: 6,
    attendanceDocType: 39,
    timelineSearchStr: "AdministrativeApproval Revision", // Adjust to match API exactly
  },
  sdma: {
    id: 5,
    title: "SDMA Approval",
    subtitle: "State Disaster Management Authority Final Approval",
    nextRoute: "/tendering", // Exits the evaluation flow
    nextStageName: "Tendering & Procurement",
    momDocType: 7,
    attendanceDocType: 39,
    timelineSearchStr: "SDMA Revision",
  },
};

export function GenericEvaluation() {
  const { committeeType } = useParams<{ committeeType: string }>();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  // Validate the URL parameter
  const configKey = committeeType?.toLowerCase() || "";
  const config = COMMITTEE_CONFIG[configKey];

  const [activeTab, setActiveTab] = useState("new");
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [momDate, setMomDate] = useState("");

  const [members, setMembers] = useState<Member[]>([
    { srNo: 1, name: "", designation: "" },
  ]);

  const [attendanceSheet, setAttendanceSheet] = useState<File | null>(null);
  const [decision, setDecision] = useState(""); // 'approve' | 'reject' | 'revision'
  const [momFile, setMomFile] = useState<File | null>(null);
  const [comments, setComments] = useState("");

  // --- REVISED STATES ---
  const [revisedApprovalDate, setRevisedApprovalDate] = useState("");
  const [revisedMomFile, setRevisedMomFile] = useState<File | null>(null);

  // 👇 ADD THESE LINES FOR SMOOTH SCROLLING 👇
  const evaluationContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedProposal && evaluationContainerRef.current) {
      // A small timeout ensures the DOM is fully painted and animations
      // have started so the scroll position is calculated correctly.
      setTimeout(() => {
        evaluationContainerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    }
  }, [selectedProposal]);
  // 👆 END OF SMOOTH SCROLLING LOGIC 👆

  // Fallback if URL is invalid
  if (!config) {
    return <Navigate to="/" replace />;
  }

  // --- DYNAMIC QUERIES ---
  const { data: pendingProposals = [], isLoading: isLoadingPending } = useQuery(
    {
      queryKey: [`${configKey}Proposals`, "new"],
      queryFn: async () => {
        const response = await axiosPrivate.get(
          `/api/v1/Committees/${config.id}/queue?revised=false`,
        );
        return response.data;
      },
    },
  );

  const { data: revisionList = [], isLoading: isLoadingRevised } = useQuery({
    queryKey: [`${configKey}Proposals`, "revised"],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        `/api/v1/Committees/${config.id}/queue?revised=true`,
      );
      return response.data;
    },
  });

  const selectedProposalId =
    selectedProposal?.proposalId || selectedProposal?.id;

  const { data: timelineData = [], isLoading: isLoadingTimeline } = useQuery({
    queryKey: ["proposalTimeline", selectedProposalId],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        `/api/v1/Proposals/${selectedProposalId}/timeline`,
      );
      return response.data;
    },
    enabled: !!selectedProposalId && activeTab === "revised",
  });

  const revisionDetails = timelineData.find(
    (entry: any) => entry.status === config.timelineSearchStr,
  );

  const lastMeetingDate = revisionDetails?.meetingDate
    ? revisionDetails.meetingDate.substring(0, 10)
    : selectedProposal?.lastMeetingDate?.substring(0, 10) || "";

  const reasonForRevision =
    revisionDetails?.revisionReson ||
    revisionDetails?.revisionReason ||
    selectedProposal?.revisionReason ||
    selectedProposal?.lastComments ||
    "No previous comments available.";

  const isLoading = activeTab === "new" ? isLoadingPending : isLoadingRevised;
  const currentTableData =
    activeTab === "new" ? pendingProposals : revisionList;

  // --- AG GRID ---

  const rowClassRules = useMemo(() => {
    return {
      "bg-primary/5": (params: any) =>
        selectedProposal &&
        (params.data.id || params.data.proposalId) ===
          (selectedProposal.id || selectedProposal.proposalId),
    };
  }, [selectedProposal]);

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
        .map((m, idx) => ({ ...m, srNo: idx + 1 })),
    );
  };

  const resetForm = useCallback(() => {
    setSelectedProposal(null);
    setDecision("");
    setMomFile(null);
    setAttendanceSheet(null);
    setComments("");
    setMeetingDate("");
    setMeetingTime("");
    setMomDate("");
    setMembers([{ srNo: 1, name: "", designation: "" }]);
    setRevisedApprovalDate("");
    setRevisedMomFile(null);
  }, []);

  // ADD THIS EFFECT: Listen for route changes and reset the UI
  useEffect(() => {
    resetForm();
    setActiveTab("new"); // Optional: Also resets the tab to "new" on route change
    setCurrentPage(1); // Optional: Resets pagination on route change
  }, [committeeType, resetForm]);

  // --- AG GRID ---
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Proposal ID",
        field: "proposalRefNo",
        flex: 1,
        valueGetter: (params) => params.data.proposalRefNo || params.data.id,
      },
      {
        headerName: "Project Name",
        field: "title",
        flex: 2,
        valueGetter: (params) => params.data.projectName || params.data.title,
      },
      { headerName: "District", field: "district", flex: 1 },
      {
        headerName: "Status",
        field: "status",
        flex: 1,
        cellRenderer: (params: any) => {
          const isPending = params.value === "Pending";
          return (
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                isPending
                  ? "bg-blue-100 text-blue-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              {params.value}
            </span>
          );
        },
      },
      // NEW ACTION COLUMN
      {
        headerName: "Action",
        field: "action",
        flex: 1,
        cellRenderer: (params: any) => {
          return (
            <button
              onClick={() => {
                resetForm();
                setSelectedProposal(params.data);
              }}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "cursor-pointer",
              )}
            >
              Evaluate
            </button>
          );
        },
      },
    ],
    // ADD DEPENDENCIES HERE
    [resetForm],
  );

  // --- MUTATIONS ---
  const evaluateMutation = useMutation({
    mutationFn: async (actionDecision: number) => {
      if (!selectedProposal) throw new Error("No proposal selected");

      const uploadPromises = [];
      const proposalId = selectedProposal.proposalId || selectedProposal.id;

      const createUploadConfig = (file: File, docType: number) => {
        const formData = new FormData();
        formData.append("ownerType", "1");
        formData.append("ownerId", proposalId);
        formData.append("documentType", docType.toString());
        formData.append("file", file);

        return axiosPrivate.post("/api/v1/Documents/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      };

      if (attendanceSheet) {
        uploadPromises.push(
          createUploadConfig(attendanceSheet, config.attendanceDocType),
        );
      }

      if (actionDecision === DecisionEnum.Approve && momFile) {
        uploadPromises.push(createUploadConfig(momFile, config.momDocType));
      }

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      const meetingDateTime =
        meetingDate && meetingTime
          ? new Date(`${meetingDate}T${meetingTime}`).toISOString()
          : new Date().toISOString();

      const finalMomDate = momDate
        ? new Date(momDate).toISOString()
        : meetingDateTime;

      const payload = {
        proposalId: proposalId,
        committee: config.id,
        meetingDate: meetingDateTime,
        meetingTime: meetingTime,
        decision: actionDecision,
        momDate: finalMomDate,
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
      queryClient.invalidateQueries({ queryKey: [`${configKey}Proposals`] });
      const propRef = selectedProposal.proposalRefNo || selectedProposal.id;

      if (actionDecision === DecisionEnum.Approve) {
        toast.success(
          `${propRef} forwarded successfully to ${config.nextStageName}`,
        );
        navigate(config.nextRoute);
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

  const revisedEvaluateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProposal) throw new Error("No proposal selected");
      const proposalId = selectedProposal.proposalId || selectedProposal.id;

      const payload = {
        proposalId: proposalId,
        committee: config.id,
        decision: DecisionEnum.Approve,
        meetingDate: lastMeetingDate
          ? new Date(lastMeetingDate).toISOString()
          : new Date().toISOString(),
        momDate: revisedApprovalDate
          ? new Date(revisedApprovalDate).toISOString()
          : new Date().toISOString(),
        isRevisedRound: true,
        members: [],
      };

      await axiosPrivate.post("/api/v1/Committees/evaluation", payload);

      if (revisedMomFile) {
        const formData = new FormData();
        formData.append("ownerType", "1");
        formData.append("ownerId", proposalId);
        formData.append("documentType", config.momDocType.toString());
        formData.append("file", revisedMomFile);

        await axiosPrivate.post("/api/v1/Documents/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${configKey}Proposals`] });
      const propRef = selectedProposal.proposalRefNo || selectedProposal.id;
      toast.success(
        `${propRef} forwarded successfully to ${config.nextStageName}`,
      );
      navigate(config.nextRoute);
      resetForm();
    },
    onError: (error) => {
      console.error("Revised Evaluation Failed:", error);
      toast.error("Failed to process revised evaluation. Please try again.");
    },
  });

  // --- VALIDATION HANDLERS ---
  const handleForwardToNextStage = () => {
    if (
      !meetingDate ||
      !meetingTime ||
      !attendanceSheet ||
      !momFile ||
      members.some((m) => !m.name || !m.designation)
    ) {
      console.log(meetingDate, meetingTime, attendanceSheet, momFile, members);
      toast.error(
        "Please complete all mandatory fields and upload required files.",
      );
      return;
    }
    evaluateMutation.mutate(DecisionEnum.Approve);
  };

  const handleRevisedForward = () => {
    // Add any specific validation for the revised tab here
    if (!revisedApprovalDate || !revisedMomFile) {
      toast.error(
        "Please provide the approval date and upload the revised MoM document.",
      );
      return;
    }

    // Trigger the correct mutation for revised proposals
    revisedEvaluateMutation.mutate();
  };

  const handleRejectOrRevision = (type: number) => {
    if (
      !meetingDate ||
      !meetingTime ||
      !attendanceSheet ||
      members.some((m) => !m.name || !m.designation) ||
      !comments.trim()
    ) {
      toast.error(
        `Please complete all mandatory fields, upload required files and enter ${
          type === DecisionEnum.Reject
            ? "rejection reasons"
            : "observation notes"
        }.`,
      );
      return;
    }
    evaluateMutation.mutate(type);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>{config.title}</h1>
        <p className="text-sm text-muted-foreground">{config.subtitle}</p>
      </div>

      <div className="flex gap-4 mt-4">
        <button
          onClick={() => {
            setActiveTab("new");
            resetForm();
            setCurrentPage(1);
          }}
          className={`px-5 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "new"
              ? "bg-primary text-white"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          New Proposals
        </button>
        <button
          onClick={() => {
            setActiveTab("revised");
            resetForm();
            setCurrentPage(1);
          }}
          className={`px-5 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "revised"
              ? "bg-primary text-white"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Revised Proposals
        </button>
      </div>

      <div className="min-h-50 relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 bg-card border rounded-xl shadow-sm">
            <Spin indicator={<Loader2 className="size-8 animate-spin" />} />
          </div>
        ) : currentTableData.length === 0 ? (
          <div className="flex items-center justify-center h-48 bg-card border rounded-xl shadow-sm text-muted-foreground">
            No {activeTab} proposals found.
          </div>
        ) : (
          <Table
            rowData={currentTableData}
            columnDefs={columnDefs}
            totalCount={currentTableData.length}
            page={currentPage}
            totalPages={Math.ceil(currentTableData.length / 10) || 1}
            onPageChange={(p) => setCurrentPage(p)}
            rowClassRules={rowClassRules}
          />
        )}
      </div>

      {selectedProposal && (
        <div
          ref={evaluationContainerRef}
          className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {/* REVISED TAB: Last Meeting Details */}
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
                  <DatePicker
                    value={lastMeetingDate ? dayjs(lastMeetingDate) : null}
                    disabled
                    size="large"
                    className="w-full bg-muted border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reason for Revision
                  </label>
                  <TextArea
                    value={reasonForRevision}
                    disabled
                    rows={3}
                    className="w-full bg-muted border-border rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* EVALUATION FORM (Revised or New) */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm mt-6">
            <h3 className="mb-4 text-lg font-bold border-b pb-2">
              {activeTab === "revised"
                ? `Revised ${config.title}`
                : `${config.title} Evaluation`}{" "}
              : {selectedProposal.proposalRefNo || selectedProposal.id}
            </h3>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {activeTab === "revised"
                      ? "Approval Date (MoM Date)"
                      : "Meeting Date"}
                  </label>
                  <DatePicker
                    size="large"
                    value={
                      activeTab === "revised"
                        ? revisedApprovalDate
                          ? dayjs(revisedApprovalDate)
                          : null
                        : meetingDate
                          ? dayjs(meetingDate)
                          : null
                    }
                    onChange={(_date, dateString) =>
                      activeTab === "revised"
                        ? setRevisedApprovalDate(dateString as string)
                        : setMeetingDate(dateString as string)
                    }
                    disabled={
                      evaluateMutation.isPending ||
                      revisedEvaluateMutation.isPending
                    }
                    className="w-full border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {activeTab === "revised"
                      ? "Committee Decision"
                      : "Meeting Time"}
                  </label>
                  {activeTab === "revised" ? (
                    <Input
                      size="large"
                      value="Approved"
                      readOnly
                      className="w-full cursor-no-drop border-border rounded-lg bg-muted text-green-700 font-semibold"
                    />
                  ) : (
                    <TimePicker
                      size="large"
                      format="HH:mm"
                      value={meetingTime ? dayjs(meetingTime, "HH:mm") : null}
                      onChange={(_time, timeString) =>
                        setMeetingTime(timeString as string)
                      }
                      disabled={evaluateMutation.isPending}
                      className="w-full border-border rounded-lg"
                    />
                  )}
                </div>
              </div>

              {activeTab === "new" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm">Members Present</h4>
                    <button
                      type="button"
                      onClick={addRow}
                      disabled={evaluateMutation.isPending}
                      className="px-3 py-2 bg-primary text-white text-sm rounded-lg flex items-center gap-2 disabled:opacity-50"
                    >
                      <Plus className="size-4" /> Add Member
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
                            <Input
                              value={member.name}
                              disabled={evaluateMutation.isPending}
                              onChange={(e) => {
                                const updated = [...members];
                                updated[index].name = e.target.value;
                                setMembers(updated);
                              }}
                              className="w-full rounded"
                              placeholder="Enter member name"
                            />
                          </td>
                          <td className="border p-2">
                            <Input
                              value={member.designation}
                              disabled={evaluateMutation.isPending}
                              onChange={(e) => {
                                const updated = [...members];
                                updated[index].designation = e.target.value;
                                setMembers(updated);
                              }}
                              className="w-full rounded"
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
              )}

              {activeTab === "new" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload Attendance Sheet
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    disabled={evaluateMutation.isPending}
                    onChange={(e) =>
                      setAttendanceSheet(e.target.files?.[0] || null)
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                  {attendanceSheet && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ File selected: {attendanceSheet.name}
                    </p>
                  )}
                </div>
              )}

              {activeTab === "new" ? (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Committee Decision
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
                      <CheckCircle2 className="size-5 mx-auto mb-1" /> Approve
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
                      <XCircle className="size-5 mx-auto mb-1" /> Reject
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
                      <RefreshCw className="size-5 mx-auto mb-1" /> Revision
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload Document (MoM)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) =>
                      setRevisedMomFile(e.target.files?.[0] || null)
                    }
                    disabled={revisedEvaluateMutation.isPending}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                  {revisedMomFile && (
                    <p className="text-sm text-green-600 mt-2 font-medium">
                      ✓ File selected: {revisedMomFile.name}
                    </p>
                  )}
                </div>
              )}

              {/* DYNAMIC DECISION UI (Only for New Tab) */}
              {activeTab === "new" && decision === "approve" && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-4 p-4 bg-green-50/50 rounded-xl border border-green-100">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-green-800">
                      Date of Minutes of Meeting
                    </label>
                    <DatePicker
                      size="large"
                      value={momDate ? dayjs(momDate) : null}
                      onChange={(_date, dateString) =>
                        setMomDate(dateString as string)
                      }
                      disabled={evaluateMutation.isPending}
                      className="w-full border-green-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-green-800">
                      Upload MoM file
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      disabled={evaluateMutation.isPending}
                      onChange={(e) => setMomFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 border border-green-200 rounded-lg bg-background file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
                    />
                    {momFile && (
                      <p className="text-sm text-green-600 mt-2 font-medium">
                        ✓ File selected: {momFile.name}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "new" &&
                (decision === "reject" || decision === "revision") && (
                  <div
                    className={`animate-in fade-in slide-in-from-top-4 duration-300 p-4 rounded-xl border ${decision === "reject" ? "bg-red-50/50 border-red-100" : "bg-orange-50/50 border-orange-100"}`}
                  >
                    <label
                      className={`block text-sm font-medium mb-2 ${decision === "reject" ? "text-red-800" : "text-orange-800"}`}
                    >
                      {decision === "reject"
                        ? "Reason for Rejection"
                        : "Observation / Revision Notes"}
                    </label>
                    <TextArea
                      rows={4}
                      placeholder={`Enter ${decision === "reject" ? "explicit reason for rejection" : "observation notes for necessary revisions"}...`}
                      value={comments}
                      disabled={evaluateMutation.isPending}
                      onChange={(e) => setComments(e.target.value)}
                      className={`w-full ${decision === "reject" ? "border-red-200" : "border-orange-200"}`}
                    />
                  </div>
                )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <button
                onClick={resetForm}
                disabled={
                  evaluateMutation.isPending ||
                  revisedEvaluateMutation.isPending
                }
                className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium text-sm text-foreground disabled:opacity-50"
              >
                Cancel
              </button>

              {/* Action buttons for 'Revised' Tab */}
              {activeTab === "revised" && (
                <button
                  onClick={handleRevisedForward}
                  disabled={revisedEvaluateMutation.isPending}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm disabled:opacity-50"
                >
                  {revisedEvaluateMutation.isPending ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : config.id === 5 ? (
                    <Send className="size-5" />
                  ) : (
                    <Forward className="size-5" />
                  )}
                  Forward to {config.nextStageName}
                </button>
              )}

              {/* Action buttons for 'New' Tab */}
              {activeTab === "new" && decision === "approve" && momFile && (
                <button
                  onClick={handleForwardToNextStage}
                  disabled={evaluateMutation.isPending}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors font-medium text-sm animate-in fade-in zoom-in duration-300 disabled:opacity-50 shadow-sm"
                >
                  {evaluateMutation.isPending ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : config.id === 5 ? (
                    <Send className="size-5" />
                  ) : (
                    <Forward className="size-5" />
                  )}
                  Forward to {config.nextStageName}
                </button>
              )}

              {activeTab === "new" &&
                decision === "reject" &&
                comments.trim().length > 0 && (
                  <button
                    onClick={() => handleRejectOrRevision(DecisionEnum.Reject)}
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

              {activeTab === "new" &&
                decision === "revision" &&
                comments.trim().length > 0 && (
                  <button
                    onClick={() =>
                      handleRejectOrRevision(DecisionEnum.Revision)
                    }
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
        </div>
      )}
    </div>
  );
}
