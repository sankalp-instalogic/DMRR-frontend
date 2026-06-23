import { useState, useRef } from "react";
import { Upload, Save, Loader2 } from "lucide-react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

export function DDMAWorkflow() {
  const resolutionFileInputRef = useRef<HTMLInputElement>(null);
  const technicalSanctionFileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("new");
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [resolutionFile, setResolutionFile] = useState<File | null>(null);
  const [sanctionFile, setSanctionFile] = useState<File | null>(null);
  const [departmentId, setDepartmentId] = useState("");
  const [costEstimation, setCostEstimation] = useState("");
  const queryClient = useQueryClient();

  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  // 1. Fetch NEW proposals from original API
  const {
    data: newProposalsData,
    isLoading: isLoadingNew,
    isError: isErrorNew,
  } = useQuery({
    queryKey: ["proposals", "new"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Proposals");
      return response.data;
    },
  });

  // 2. Fetch REVISED proposals from the new API
  const {
    data: revisedProposalsData,
    isLoading: isLoadingRevised,
    isError: isErrorRevised,
  } = useQuery({
    queryKey: ["proposals", "revised"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/ddma/revised");
      return response.data;
    },
  });

  // 3. Fetch Line Departments for the dropdown
  const { data: departmentsData, isLoading: isLoadingDepartments } = useQuery({
    queryKey: ["lineDepartments"],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        "/api/v1/masters/line-departments",
      );
      return response.data;
    },
  });

  // 4. Integrated Routing & File Upload Mutation
  // 4. Integrated Routing, File Upload & Forwarding Mutation
  const processWorkflowMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProposal || !departmentId) {
        throw new Error("Missing required fields");
      }

      // STEP 1: Execute Routing API
      const routingPayload = {
        forwardToDepartmentId: departmentId,
        costEstimationLakhs: Number(costEstimation) || 0,
      };

      await axiosPrivate.post(
        `/api/v1/ddma/${selectedProposal.id}/routing`,
        routingPayload,
      );

      // STEP 2: Execute File Uploads (if files are selected)
      const uploadPromises = [];

      // Helper function to build form data
      const createUploadConfig = (file: File, docType: number) => {
        const formData = new FormData();
        formData.append("ownerType", "1");
        formData.append("ownerId", selectedProposal.id);
        formData.append("documentType", docType.toString());
        formData.append("file", file);

        return axiosPrivate.post("/api/v1/Documents/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      };

      if (resolutionFile) {
        uploadPromises.push(createUploadConfig(resolutionFile, 2));
      }

      if (sanctionFile) {
        uploadPromises.push(createUploadConfig(sanctionFile, 17));
      }

      // Wait for all file uploads to complete successfully
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      // STEP 3: Forward the proposal
      // Called after uploads finish, with no body payload
      await axiosPrivate.post(`/api/v1/ddma/${selectedProposal.id}/forward`);

      return true;
    },
    onSuccess: () => {
      // Refresh the proposal lists
      queryClient.invalidateQueries({ queryKey: ["proposals"] });

      // Reset form and selection
      setSelectedProposal(null);
      setDepartmentId("");
      setCostEstimation("");
      setResolutionFile(null);
      setSanctionFile(null);

      toast.success(
        "Proposal routed, documents uploaded, and forwarded successfully!",
      );
      navigate("/pac-evaluation");
    },
    onError: () => {
      toast.error("Failed to process the workflow. Please try again.");
    },
  });

  const currentList =
    activeTab === "new"
      ? newProposalsData?.items?.filter(
          (item: any) => item.currentStage !== "PAC",
        ) || []
      : revisedProposalsData?.items || [];

  const isCurrentLoading =
    activeTab === "new" ? isLoadingNew : isLoadingRevised;
  const isCurrentError = activeTab === "new" ? isErrorNew : isErrorRevised;

  return (
    <div className="space-y-6">
      {/* Header and Tabs - Unchanged */}
      <div>
        <h1>DDMA & Line Department Workflow</h1>
        <p className="text-sm text-muted-foreground">
          Proposal routing and department assignment
        </p>
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => {
              setActiveTab("new");
              setSelectedProposal(null);
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
              setSelectedProposal(null);
            }}
            className={`px-5 py-2 rounded-lg font-medium ${
              activeTab === "revised" ? "bg-primary text-white" : "bg-muted"
            }`}
          >
            Revised Proposals
          </button>
        </div>
      </div>

      {/* Table - Unchanged */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-4 text-left text-sm">Proposal ID</th>
              <th className="px-6 py-4 text-left text-sm">Project Name</th>
              <th className="px-6 py-4 text-left text-sm">Disaster Type</th>
              <th className="px-6 py-4 text-left text-sm">District</th>
              <th className="px-6 py-4 text-left text-sm">Status</th>
            </tr>
          </thead>
          <tbody>
            {isCurrentLoading && (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  <Loader2 className="size-6 animate-spin mx-auto text-muted-foreground" />
                </td>
              </tr>
            )}

            {isCurrentError && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-destructive">
                  Failed to load {activeTab} proposals. Please try again.
                </td>
              </tr>
            )}

            {!isCurrentLoading &&
              !isCurrentError &&
              currentList.map((proposal: any) => (
                <tr
                  key={proposal.id}
                  className={`border-t border-border hover:bg-muted/50 cursor-pointer ${
                    selectedProposal?.id === proposal.id ? "bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    setSelectedProposal(proposal);
                    // Reset inputs when changing selection
                    setDepartmentId(proposal.lineDepartment || "");
                    setCostEstimation("");
                    setResolutionFile(null);
                    setSanctionFile(null);
                  }}
                >
                  <td className="px-6 py-4 text-sm font-medium">
                    {proposal.proposalRefNo}
                  </td>
                  <td className="px-6 py-4 text-sm">{proposal.title}</td>
                  <td className="px-6 py-4 text-sm">{proposal.disasterType}</td>
                  <td className="px-6 py-4 text-sm">{proposal.district}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        proposal.status === "Pending" ||
                        proposal.status === "Draft"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {proposal.status}
                    </span>
                  </td>
                </tr>
              ))}

            {!isCurrentLoading &&
              !isCurrentError &&
              currentList.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No {activeTab} proposals found.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>

      {selectedProposal && (
        <div className="space-y-6">
          {/* Revision Details - Unchanged */}
          {activeTab === "revised" && (
            <div className="mb-8 border rounded-xl p-6 shadow-sm">
              <h3 className="font-bold mb-5">Revision Details</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-2">Revised At Stage</label>
                  <input
                    value={
                      selectedProposal.revisedStage ||
                      selectedProposal.currentStage ||
                      "N/A"
                    }
                    readOnly
                    className="w-full px-4 py-2 border rounded-lg bg-muted"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Date of Revision</label>
                  <input
                    value={
                      selectedProposal.revisionDate ||
                      new Date(
                        selectedProposal.createdAtUtc,
                      ).toLocaleDateString()
                    }
                    readOnly
                    className="w-full px-4 py-2 border rounded-lg bg-muted"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">
                    Reason For Revision
                  </label>
                  <textarea
                    rows={3}
                    value={selectedProposal.revisionReason || "N/A"}
                    readOnly
                    className="w-full px-4 py-2 border rounded-lg bg-muted"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Proposal Routing</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm mb-2">Proposal ID</label>
                <input
                  type="text"
                  value={selectedProposal.proposalRefNo}
                  disabled
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">
                  Collector Forward To
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  disabled={
                    isLoadingDepartments || processWorkflowMutation.isPending
                  }
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                >
                  <option value="">
                    {isLoadingDepartments
                      ? "Loading departments..."
                      : "Select Department"}
                  </option>
                  {departmentsData?.items?.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">
                  Cost Estimation (₹ Lakhs)
                </label>
                <input
                  type="number"
                  value={costEstimation}
                  onChange={(e) => setCostEstimation(e.target.value)}
                  disabled={processWorkflowMutation.isPending}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  placeholder="Enter cost estimation"
                />
              </div>

              {/* --- UPLOAD RESOLUTION --- */}
              <div>
                <label className="block text-sm mb-2">Upload Resolution</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="size-8 text-muted-foreground mx-auto mb-3" />
                    <input
                      type="file"
                      className="hidden"
                      ref={resolutionFileInputRef}
                      disabled={processWorkflowMutation.isPending}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setResolutionFile(e.target.files[0]);
                        }
                      }}
                    />
                    <button
                      type="button"
                      disabled={processWorkflowMutation.isPending}
                      onClick={() => resolutionFileInputRef.current?.click()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
                    >
                      {resolutionFile
                        ? resolutionFile.name
                        : "Upload DDMA Resolution"}
                    </button>
                  </div>
                </div>
              </div>

              {/* --- UPLOAD TECHNICAL SANCTION --- */}
              <div>
                <label className="block text-sm mb-2">
                  Upload Technical Sanction
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="size-8 text-muted-foreground mx-auto mb-3" />
                    <input
                      type="file"
                      className="hidden"
                      ref={technicalSanctionFileInputRef}
                      disabled={processWorkflowMutation.isPending}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setSanctionFile(e.target.files[0]);
                        }
                      }}
                    />
                    <button
                      type="button"
                      disabled={processWorkflowMutation.isPending}
                      onClick={() =>
                        technicalSanctionFileInputRef.current?.click()
                      }
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
                    >
                      {sanctionFile
                        ? sanctionFile.name
                        : "Upload Technical Sanction"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => processWorkflowMutation.mutate()}
                  disabled={processWorkflowMutation.isPending || !departmentId}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                >
                  {processWorkflowMutation.isPending ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Save className="size-5" />
                  )}
                  {processWorkflowMutation.isPending ? "Processing..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
