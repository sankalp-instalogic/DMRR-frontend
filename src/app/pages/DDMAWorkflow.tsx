import { useState, useRef, useMemo } from "react";
import { Save, Pencil } from "lucide-react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

// Ant Design Imports
import { Input, Select } from "antd";
import type { ColDef } from "ag-grid-community";

// Import your Custom Table Component (adjust path as needed)
import { Table } from "../components/Table";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";
import { DocumentOwnerType, DocumentType } from "../../../constants/documents";
import { FileUpload } from "../components/FileUpload";

export function DDMAWorkflow() {
  const workflowSectionRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState("new");
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [resolutionFile, setResolutionFile] = useState<File | null>(null);
  const [sanctionFile, setSanctionFile] = useState<File | null>(null);
  const [departmentId, setDepartmentId] = useState("");
  const [costEstimation, setCostEstimation] = useState("");

  const [currentPage, setCurrentPage] = useState(1); // Pagination state

  const queryClient = useQueryClient();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  // 1. Fetch NEW proposals (Updated Endpoint)
  const {
    data: newProposalsData,
    isLoading: isLoadingNew,
    isError: isErrorNew,
  } = useQuery({
    queryKey: ["proposals", "new"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/ddma/new");
      return response.data;
    },
  });

  // 2. Fetch REVISED proposals
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

  // 3. Fetch Line Departments
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

      // STEP 2: Execute File Uploads
      const uploadPromises = [];

      const createUploadConfig = (file: File, docType: DocumentType) => {
        const formData = new FormData();
        formData.append("ownerType", String(DocumentOwnerType.Proposal));
        formData.append("ownerId", selectedProposal.id);
        formData.append("documentType", docType.toString());
        formData.append("file", file);

        return axiosPrivate.post("/api/v1/Documents/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      };

      if (resolutionFile)
        uploadPromises.push(
          createUploadConfig(resolutionFile, DocumentType.DDMAResolution),
        );
      if (sanctionFile)
        uploadPromises.push(
          createUploadConfig(sanctionFile, DocumentType.SanctionOrder),
        );

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      // STEP 3: Forward the proposal
      await axiosPrivate.post(`/api/v1/ddma/${selectedProposal.id}/forward`);

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      setSelectedProposal(null);
      setDepartmentId("");
      setCostEstimation("");
      setResolutionFile(null);
      setSanctionFile(null);

      toast.success(
        "Proposal routed, documents uploaded, and forwarded successfully!",
      );
      navigate("/evaluation/pac");
    },
    onError: () => {
      toast.error("Failed to process the workflow. Please try again.");
    },
  });

  // Updated to handle array response directly for "new"
  const currentList =
    activeTab === "new"
      ? (newProposalsData || []).filter(
          (item: any) => item.currentStage !== "PAC",
        )
      : revisedProposalsData?.items || [];

  const isCurrentLoading =
    activeTab === "new" ? isLoadingNew : isLoadingRevised;
  const isCurrentError = activeTab === "new" ? isErrorNew : isErrorRevised;

  const handleProposalSelect = (proposal: any) => {
    setSelectedProposal(proposal);

    const matchedDepartment = departmentsData?.items?.find(
      (dept: any) =>
        dept.name === proposal.lineDepartment ||
        dept.id === proposal.lineDepartment,
    );

    setDepartmentId(
      matchedDepartment ? matchedDepartment.id : proposal.lineDepartment || "",
    );

    setCostEstimation("");
    setResolutionFile(null);
    setSanctionFile(null);

    setTimeout(() => {
      workflowSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  // --- AG Grid Configurations ---
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { headerName: "Proposal ID", field: "proposalRefNo", flex: 1 },
      { headerName: "Project Name", field: "title", flex: 2 },
      { headerName: "Disaster Type", field: "disasterType", flex: 1 },
      { headerName: "District", field: "district", flex: 1 },
      {
        headerName: "Status",
        field: "status",
        flex: 1,
        cellRenderer: (params: any) => {
          const isPending =
            params.value === "Pending" || params.value === "Draft";

          return (
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                isPending
                  ? "bg-info-muted text-info-muted-foreground"
                  : "bg-warning-muted text-warning-muted-foreground"
              }`}
            >
              {params.value}
            </span>
          );
        },
      },
      {
        headerName: "Actions",
        width: 100,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation(); // prevents row click if enabled
              handleProposalSelect(params.data);
            }}
          >
            <Pencil className="size-4" />
          </Button>
        ),
      },
    ],
    [departmentsData],
  );

  const rowClassRules = useMemo(() => {
    return {
      "bg-primary/5": (params: any) =>
        selectedProposal && params.data.id === selectedProposal.id,
    };
  }, [selectedProposal]);

  return (
    <div className="space-y-6">
      {/* Header and Tabs */}
      <div>
        <h1 className="text-[30px] font-bold text-primary">
          DDMA & Line Department Workflow
        </h1>
        <p className="text-sm text-muted-foreground">
          Proposal routing and department assignment
        </p>
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => {
              setActiveTab("new");
              setSelectedProposal(null);
              setCurrentPage(1);
            }}
            className={`px-5 py-2 rounded-lg font-medium ${
              activeTab === "new" ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            New Proposals
          </button>

          <button
            onClick={() => {
              setActiveTab("revised");
              setSelectedProposal(null);
              setCurrentPage(1);
            }}
            className={`px-5 py-2 rounded-lg font-medium ${
              activeTab === "revised" ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            Revised Proposals
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="min-h-50 relative">
        {isCurrentLoading ? (
          <div className="flex items-center justify-center h-48 bg-card border rounded-xl shadow-sm">
            <Spinner iconClassName="size-8" />
          </div>
        ) : isCurrentError ? (
          <div className="flex items-center justify-center h-48 bg-card border rounded-xl shadow-sm text-destructive">
            Failed to load {activeTab} proposals. Please try again.
          </div>
        ) : (
          <Table
            rowData={currentList}
            columnDefs={columnDefs}
            totalCount={currentList.length}
            page={currentPage}
            totalPages={Math.ceil(currentList.length / 10) || 1}
            onPageChange={(p) => setCurrentPage(p)}
            rowClassRules={rowClassRules}
          />
        )}
      </div>

      {/* Selected Proposal Workflow Form */}
      {selectedProposal && (
        <div ref={workflowSectionRef} className="space-y-6">
          {/* Revision Details */}
          {activeTab === "revised" && (
            <div className="mb-8 border rounded-xl p-6 shadow-sm bg-card">
              <h3 className="font-bold mb-5">Revision Details</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-2">Revised At Stage</label>
                  <Input
                    value={
                      selectedProposal.revisedStage ||
                      selectedProposal.currentStage ||
                      "N/A"
                    }
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Date of Revision</label>
                  <Input
                    value={
                      selectedProposal.revisionDate ||
                      new Date(
                        selectedProposal.createdAtUtc,
                      ).toLocaleDateString()
                    }
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">
                    Reason For Revision
                  </label>
                  <Input.TextArea
                    rows={3}
                    value={selectedProposal.revisionReason || "N/A"}
                    readOnly
                    className="bg-muted resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Proposal Routing Configurations */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Proposal Routing</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm mb-2">Proposal ID</label>
                <Input
                  value={selectedProposal.proposalRefNo}
                  disabled
                  size="large"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">
                  Collector Forward To
                </label>
                <Select
                  value={departmentId || undefined}
                  onChange={(val) => setDepartmentId(val)}
                  disabled={
                    isLoadingDepartments || processWorkflowMutation.isPending
                  }
                  size="large"
                  className="w-full"
                  placeholder={
                    isLoadingDepartments
                      ? "Loading departments..."
                      : "Select Department"
                  }
                  options={departmentsData?.items?.map((dept: any) => ({
                    label: dept.name,
                    value: dept.id,
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm mb-2">
                  Cost Estimation (₹ Lakhs)
                </label>
                <Input
                  type="number"
                  value={costEstimation}
                  onChange={(e) => setCostEstimation(e.target.value)}
                  disabled={processWorkflowMutation.isPending}
                  size="large"
                  placeholder="Enter cost estimation"
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>

              {/* UPLOAD RESOLUTION */}
              <div>
                <label className="block text-sm mb-2">Upload Resolution</label>
                <FileUpload
                  variant="compact"
                  value={resolutionFile}
                  onChange={setResolutionFile}
                  accept=".pdf,.doc,.docx,image/*"
                  buttonText="Select File"
                  disabled={processWorkflowMutation.isPending}
                />
              </div>

              {/* UPLOAD TECHNICAL SANCTION */}
              <div>
                <label className="block text-sm mb-2">
                  Upload Technical Sanction
                </label>
                <FileUpload
                  variant="compact"
                  value={sanctionFile}
                  onChange={setSanctionFile}
                  accept=".pdf,.doc,.docx,image/*"
                  buttonText="Select File"
                  disabled={processWorkflowMutation.isPending}
                />
              </div>

              {/* SAVE BUTTON */}
              <div className="flex gap-4 pt-4">
                <Button
                  size="lg"
                  onClick={() => processWorkflowMutation.mutate()}
                  disabled={processWorkflowMutation.isPending || !departmentId}
                >
                  {processWorkflowMutation.isPending ? (
                    <Spinner inline iconClassName="size-5" />
                  ) : (
                    <Save className="size-5" />
                  )}

                  {processWorkflowMutation.isPending ? "Processing..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
