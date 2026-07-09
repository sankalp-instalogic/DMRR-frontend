import { useState, useEffect, useMemo, useRef } from "react";
import { Save, FileText, CheckCircle2, XCircle } from "lucide-react";
import toast from "../../utils/toast";
import useAxPrivate from "../../hooks/useAxiosPrivate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input, Select, Radio, DatePicker } from "antd";
import dayjs from "dayjs";
import { Table } from "../components/Table";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";
import { DocumentOwnerType, DocumentType } from "../../../constants/documents";
import { FileUpload } from "../components/FileUpload";

// Document Type Mapping Configuration
const DOCUMENT_TYPES: Record<string, DocumentType> = {
  bidEvaluationReport: DocumentType.BidevaluationReport,
  workOrderCopy: DocumentType.WorkOrder,
  tenderNotice: DocumentType.TenderNotice,
  dmrrLetter: DocumentType.DMRRLetter,
};

export function Tendering() {
  const axios = useAxPrivate();
  const queryClient = useQueryClient();
  const [selectedTender, setSelectedTender] = useState<any>(null);

  // Ref for smooth scrolling to the form when a tender row is selected
  const formContainerRef = useRef<HTMLDivElement>(null);

  // Table pagination state
  const [page, setPage] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    tenderRefNo: "",
    l1VendorIdentified: "no",
    vendorId: "",
    l1CostLakhs: "",
    workOrderIssued: "no",
    workOrderDate: "",
    biddingCost: "",
  });

  // Track dynamic file upload states
  const [documents, setDocuments] = useState<{ [key: string]: File | null }>({
    bidEvaluationReport: null,
    workOrderCopy: null,
    tenderNotice: null,
    dmrrLetter: null,
  });

  // Reset form states whenever selected tender row changes
  useEffect(() => {
    if (selectedTender) {
      setFormData({
        tenderRefNo: selectedTender.proposalRefNo || "",
        l1VendorIdentified: "no",
        vendorId: "",
        l1CostLakhs: "",
        workOrderIssued: "no",
        workOrderDate: "",
        biddingCost: "",
      });
      setDocuments({
        bidEvaluationReport: null,
        workOrderCopy: null,
        tenderNotice: null,
        dmrrLetter: null,
      });
    }
  }, [selectedTender]);

  // Smooth scroll to the form whenever a tender row is selected
  useEffect(() => {
    if (selectedTender && formContainerRef.current) {
      // A small timeout ensures the DOM has updated before scrolling
      setTimeout(() => {
        formContainerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [selectedTender]);

  // 1. Fetch tenders using React Query
  const {
    data: tenders = [],
    isLoading: isTendersLoading,
    isError: isTendersError,
  } = useQuery({
    queryKey: ["tendersQueue"],
    queryFn: async () => {
      const response = await axios.get("/api/v1/Tendering/queue");
      return response.data;
    },
  });

  // 2. Fetch vendors for the dropdown
  const { data: vendorsResponse, isLoading: isVendorsLoading } = useQuery({
    queryKey: ["vendorsDropdown"],
    queryFn: async () => {
      const response = await axios.get("/api/v1/masters/vendors", {
        params: { page: 1, pageSize: 100 },
      });
      return response.data;
    },
  });

  const vendors = vendorsResponse?.items || [];

  // 3. Mutation for ensuring the tender
  const ensureMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      const response = await axios.post(
        `/api/v1/Tendering/${proposalId}/ensure`,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Tender ensured successfully!");
      queryClient.invalidateQueries({ queryKey: ["tendersQueue"] });
    },
    onError: () => {
      toast.error("Failed to ensure tender. Please try again.");
    },
  });

  // 4. Mutation for uploading documents
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({
      file,
      ownerId,
      documentType,
    }: {
      file: File;
      ownerId: string;
      documentType: DocumentType;
    }) => {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("ownerId", ownerId);
      uploadData.append("ownerType", String(DocumentOwnerType.Proposal)); // Owner type 1 as per requirements
      uploadData.append("documentType", String(documentType));

      const response = await axios.post(
        "/api/v1/Documents/upload",
        uploadData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    },
  });

  // 5. Mutation for saving tender details
  const saveDetailsMutation = useMutation({
    mutationFn: async ({
      proposalId,
      payload,
    }: {
      proposalId: string;
      payload: any;
    }) => {
      const response = await axios.post(
        `/api/v1/Tendering/${proposalId}/details`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      return response.data;
    },
    onSuccess: async (_, variables) => {
      const proposalId = variables.proposalId;

      // Map through uploaded documents sequentially via Promise processing structure
      const uploadPromises = Object.entries(documents).map(([docKey, file]) => {
        const documentType = DOCUMENT_TYPES[docKey];
        if (file && documentType) {
          return uploadDocumentMutation.mutateAsync({
            file,
            ownerId: proposalId,
            documentType,
          });
        }
        return Promise.resolve();
      });

      try {
        await Promise.all(uploadPromises);
        toast.success("Tender details and documents saved successfully");
      } catch (err) {
        console.error("One or more document uploads failed:", err);
        toast.error(
          "Tender details saved, but some documents failed to upload.",
        );
      }

      setSelectedTender(null);
      queryClient.invalidateQueries({ queryKey: ["tendersQueue"] });
    },
    onError: (err) => {
      console.error("Failed to save tender details:", err);
      toast.error("Failed to save tender details. Please try again.");
    },
  });

  // 6. Mutation for completing/closing the tender
  const completeTenderMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      const response = await axios.post(
        `/api/v1/Tendering/${proposalId}/complete`,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Tender completed successfully!");
      setSelectedTender(null);
      queryClient.invalidateQueries({ queryKey: ["tendersQueue"] });
    },
    onError: (err) => {
      console.error("Failed to complete tender:", err);
      toast.error("Failed to complete tender. Please try again.");
    },
  });

  const handleSave = async () => {
    if (!selectedTender) return;

    const selectedVendor = vendors.find(
      (v: any) => String(v.id) === String(formData.vendorId),
    );

    const payload = {
      l1VendorIdentified: formData.l1VendorIdentified === "yes",
      vendorName: selectedVendor ? selectedVendor.legalName : "",
      l1CostLakhs: formData.l1CostLakhs ? parseFloat(formData.l1CostLakhs) : 0,
      workOrderIssued: formData.workOrderIssued === "yes",
      workOrderDate:
        formData.workOrderIssued === "yes" && formData.workOrderDate
          ? new Date(formData.workOrderDate).toISOString()
          : new Date().toISOString(),
    };

    saveDetailsMutation.mutate({
      proposalId: selectedTender.proposalId,
      payload,
    });
  };

  // Helper function to render table rows for documents
  const renderDocumentRow = (docName: string, docKey: string) => {
    const isUploaded = documents[docKey] !== null;

    return (
      <tr className="hover:bg-muted/50 transition-colors" key={docKey}>
        <td className="px-6 py-4 font-medium text-foreground">{docName}</td>
        <td className="px-6 py-4 text-center">
          <FileUpload
            variant="compact"
            value={documents[docKey] ?? null}
            onChange={(f) =>
              setDocuments((prev) => ({ ...prev, [docKey]: f }))
            }
            accept=".csv,.xls,.xlsx,.pdf,image/*"
            buttonText="Upload"
          />
        </td>
        <td className="px-6 py-4 text-center">
          {isUploaded ? (
            <CheckCircle2 className="w-5 h-5 text-success mx-auto" />
          ) : (
            <XCircle className="w-5 h-5 text-destructive mx-auto" />
          )}
        </td>
      </tr>
    );
  };

  // AG Grid Column Definitions
  const columnDefs = useMemo(
    () => [
      {
        headerName: "Tender ID",
        field: "proposalRefNo",
        flex: 1,
      },
      {
        headerName: "Project Name",
        field: "title",
        tooltipField: "title",
        flex: 2,
      },
      {
        headerName: "L1 Bidder",
        valueGetter: () => "-",
        flex: 1,
      },
      {
        headerName: "L1 Amount",
        valueGetter: () => "-",
        flex: 1,
      },
      {
        headerName: "Status",
        field: "status",
        flex: 1,
        cellRenderer: (params: any) => {
          return (
            <div className="flex items-center h-full">
              <span
                className={`px-3 py-1 rounded-md text-xs font-medium border inline-block ${
                  params.value === "Pending"
                    ? "bg-warning-muted text-warning-muted-foreground border-warning-border"
                    : "bg-info-muted text-info-muted-foreground border-info-border"
                }`}
              >
                {params.value}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Actions",
        flex: 1,
        cellRenderer: (params: any) => {
          const tender = params.data;
          if (!tender.isEnsured) {
            return (
              <div className="flex items-center h-full">
                <Button
                  size="sm"
                  onClick={() => ensureMutation.mutate(tender.proposalId)}
                  disabled={ensureMutation.isPending}
                  className="rounded-lg text-xs cursor-pointer"
                >
                  {ensureMutation.isPending &&
                  ensureMutation.variables === tender.proposalId ? (
                    <>
                      <Spinner inline iconClassName="size-4" />
                      Ensuring...
                    </>
                  ) : (
                    "Ensure"
                  )}
                </Button>
              </div>
            );
          } else {
            return (
              <div className="flex items-center h-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTender(tender)}
                  className="cursor-pointer bg-info-muted text-info-muted-foreground border-info-border rounded-lg text-xs hover:bg-info-muted"
                >
                  <FileText size={14} />
                  Open Details
                </Button>
              </div>
            );
          }
        },
      },
    ],
    [ensureMutation],
  );

  if (isTendersLoading) return <Spinner fullPage label="Loading tenders..." />;
  if (isTendersError)
    return <div className="p-4 text-destructive">Failed to load tenders.</div>;

  const isSaving =
    saveDetailsMutation.isPending || uploadDocumentMutation.isPending;
  const isCompleting = completeTenderMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] font-bold text-primary">Tendering</h1>
        <p className="text-[14px] font-medium text-muted-foreground mt-1">
          Manage tender activities
        </p>
      </div>

      {/* Tender List - Replacing HTML table with the custom Table */}
      <div className="mb-6">
        <Table
          rowData={tenders}
          columnDefs={columnDefs}
          totalCount={tenders.length}
          page={page}
          totalPages={1} // Modify dynamically if your queue endpoint paginates in the future
          onPageChange={setPage}
          rowHeight={64} // Matches the previous h-14/16 visual feel
        />
      </div>

      {/* Tender Form */}
      {selectedTender && (
        <div
          ref={formContainerRef}
          className="bg-card border border-border rounded-xl p-6 shadow-sm"
        >
          <h3 className="font-semibold text-[20px] text-primary mb-6">
            Tendering : {selectedTender.proposalRefNo} - {selectedTender.title}
          </h3>

          <h4 className="font-semibold text-[16px] text-foreground mb-4 border-b pb-2">
            Tender Details
          </h4>

          <div className="grid grid-cols-1 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                L1 Vendor Identified?
                <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center h-10">
                <Radio.Group
                  value={formData.l1VendorIdentified}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "no") {
                      setFormData({
                        ...formData,
                        l1VendorIdentified: val,
                        vendorId: "",
                        l1CostLakhs: "",
                      });
                    } else {
                      setFormData({ ...formData, l1VendorIdentified: val });
                    }
                  }}
                >
                  <Radio value="yes">Yes</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-foreground">
                  Vendor Name
                </label>
                <Link
                  to="/master/vendor"
                  className="text-xs text-secondary hover:text-info-muted-foreground hover:underline font-medium"
                >
                  + Add new vendor
                </Link>
              </div>
              <Select
                value={formData.vendorId || undefined}
                onChange={(val) => setFormData({ ...formData, vendorId: val })}
                className="w-full h-10"
                disabled={
                  formData.l1VendorIdentified === "no" || isVendorsLoading
                }
                placeholder={
                  isVendorsLoading ? "Loading vendors..." : "Select a vendor"
                }
                options={vendors.map((vendor: any) => ({
                  label: vendor.legalName,
                  value: vendor.id,
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                L1 Cost (Lakhs)
                <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                placeholder="0.00"
                className="w-full h-10 rounded-[10px]"
                value={formData.l1CostLakhs}
                onChange={(e) =>
                  setFormData({ ...formData, l1CostLakhs: e.target.value })
                }
                disabled={formData.l1VendorIdentified === "no"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Work Order Issued?
                <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center h-10">
                <Radio.Group
                  value={formData.workOrderIssued}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "no") {
                      setFormData({
                        ...formData,
                        workOrderIssued: val,
                        workOrderDate: "",
                      });
                    } else {
                      setFormData({ ...formData, workOrderIssued: val });
                    }
                  }}
                >
                  <Radio value="yes">Yes</Radio>
                  <Radio value="no">No</Radio>
                </Radio.Group>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Work Order Date
              </label>
              <DatePicker
                className="w-full h-10 rounded-[10px]"
                value={
                  formData.workOrderDate ? dayjs(formData.workOrderDate) : null
                }
                onChange={(_, dateString) =>
                  setFormData({
                    ...formData,
                    workOrderDate: dateString as string,
                  })
                }
                disabled={formData.workOrderIssued === "no"}
                format="YYYY-MM-DD"
              />
            </div>
          </div>

          {/* Documents Table Section */}
          <h4 className="font-semibold text-[16px] text-foreground mb-4 border-b pb-2">
            Supporting Documents
          </h4>

          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-3 font-medium">Document Name</th>
                    <th className="px-6 py-3 font-medium text-center">
                      Upload Document
                    </th>
                    <th className="px-6 py-3 font-medium text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {renderDocumentRow(
                    "Bid Evaluation Report",
                    "bidEvaluationReport",
                  )}
                  {renderDocumentRow("Work Order Copy", "workOrderCopy")}
                  {renderDocumentRow("Tender Notice", "tenderNotice")}
                  {renderDocumentRow("DMRR letter", "dmrrLetter")}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving || isCompleting}
              className="px-6 h-10 rounded-[10px] cursor-pointer"
            >
              {isSaving ? (
                <Spinner inline iconClassName="size-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? "Saving..." : "Save Details"}
            </Button>
            <Button
              onClick={() =>
                completeTenderMutation.mutate(selectedTender.proposalId)
              }
              disabled={isCompleting || isSaving}
              className="px-6 h-10 rounded-[10px] cursor-pointer"
            >
              {isCompleting ? (
                <Spinner inline iconClassName="size-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {isCompleting ? "Closing..." : "Mark As Close"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
