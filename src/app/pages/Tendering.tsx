import { useState, useEffect } from "react";
import {
  Save,
  FileText,
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import useAxPrivate from "../../hooks/useAxiosPrivate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Document Type Mapping Configuration
const DOCUMENT_TYPES: Record<string, string> = {
  bidEvaluationReport: "41",
  workOrderCopy: "8",
  tenderNotice: "9",
  dmrrLetter: "40",
};

export function Tendering() {
  const axios = useAxPrivate();
  const queryClient = useQueryClient();
  const [selectedTender, setSelectedTender] = useState<any>(null);

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
      documentType: string;
    }) => {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("ownerId", ownerId);
      uploadData.append("ownerType", "1"); // Owner type 1 as per requirements
      uploadData.append("documentType", documentType);

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

    // Find vendor name from the selected identifier code
    const selectedVendor = vendors.find(
      (v: any) => String(v.id) === String(formData.vendorId),
    );

    // Structure payload parameters matching specified model contracts
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

  const handleDocumentUpload =
    (docKey: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        setDocuments({ ...documents, [docKey]: e.target.files[0] });
      }
    };

  // Helper function to render table rows for documents
  const renderDocumentRow = (docName: string, docKey: string) => {
    const isUploaded = documents[docKey] !== null;

    return (
      <tr className="hover:bg-gray-50/50 transition-colors" key={docKey}>
        <td className="px-6 py-4 font-medium text-gray-700">{docName}</td>
        <td className="px-6 py-4 text-center">
          <label className="inline-flex items-center gap-2 bg-[#1E5AA8] text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-xs font-medium">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
            <input
              type="file"
              className="hidden"
              onChange={handleDocumentUpload(docKey)}
            />
          </label>
        </td>
        <td className="px-6 py-4 text-center">
          {isUploaded ? (
            <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500 mx-auto" />
          )}
        </td>
      </tr>
    );
  };

  if (isTendersLoading)
    return <div className="p-4 text-gray-500">Loading tenders...</div>;
  if (isTendersError)
    return <div className="p-4 text-red-500">Failed to load tenders.</div>;

  const isSaving =
    saveDetailsMutation.isPending || uploadDocumentMutation.isPending;
  const isCompleting = completeTenderMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] font-bold text-[#0B1F4D]">Tendering</h1>
        <p className="text-[14px] font-medium text-gray-500 mt-1">
          Manage tender activities
        </p>
      </div>

      {/* Tender List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left">
            <thead className="bg-[#F5F7FA] text-[#0B1F4D]">
              <tr className="h-14">
                <th className="px-4 font-semibold whitespace-nowrap">
                  Tender ID
                </th>
                <th className="px-4 font-semibold whitespace-nowrap">
                  Project Name
                </th>
                <th className="px-4 font-semibold whitespace-nowrap">
                  L1 Bidder
                </th>
                <th className="px-4 font-semibold whitespace-nowrap">
                  L1 Amount
                </th>
                <th className="px-4 font-semibold whitespace-nowrap">Status</th>
                <th className="px-4 font-semibold whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {tenders.map((tender: any) => (
                <tr
                  key={tender.id || tender.proposalId}
                  className="hover:bg-blue-50/50 transition-colors h-14 even:bg-gray-50/50"
                >
                  <td className="px-4 font-medium text-[#0B1F4D] whitespace-nowrap">
                    {tender.proposalRefNo}
                  </td>
                  <td className="px-4 max-w-xs truncate" title={tender.title}>
                    {tender.title}
                  </td>
                  <td className="px-4 text-gray-400">-</td>
                  <td className="px-4 text-gray-400">-</td>
                  <td className="px-4">
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-medium border inline-block ${
                        tender.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : "bg-blue-50 text-blue-700 border-blue-100"
                      }`}
                    >
                      {tender.status}
                    </span>
                  </td>
                  <td className="px-4">
                    {!tender.isEnsured ? (
                      <button
                        onClick={() => ensureMutation.mutate(tender.proposalId)}
                        disabled={ensureMutation.isPending}
                        className="px-3 py-1.5 bg-[#0B1F4D] cursor-pointer text-white rounded-lg flex items-center justify-center gap-1.5 hover:bg-[#0B1F4D]/90 transition-all text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {ensureMutation.isPending &&
                        ensureMutation.variables === tender.proposalId
                          ? "Ensuring..."
                          : "Ensure"}
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedTender(tender)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-all text-xs font-medium"
                      >
                        <FileText size={14} />
                        Open Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {tenders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No tenders in the queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tender Form */}
      {selectedTender && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-[20px] text-[#0B1F4D] mb-6">
            Tendering : {selectedTender.proposalRefNo} - {selectedTender.title}
          </h3>

          <h4 className="font-semibold text-[16px] text-gray-900 mb-4 border-b pb-2">
            Tender Details
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                L1 Vendor Identified?
              </label>
              <div className="flex gap-6 h-10 items-center">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="l1VendorIdentified"
                    value="yes"
                    checked={formData.l1VendorIdentified === "yes"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        l1VendorIdentified: e.target.value,
                      })
                    }
                    className="w-4 h-4 text-[#0B1F4D] accent-[#0B1F4D] cursor-pointer"
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="l1VendorIdentified"
                    value="no"
                    checked={formData.l1VendorIdentified === "no"}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        l1VendorIdentified: e.target.value,
                        vendorId: "",
                        l1CostLakhs: "",
                      });
                    }}
                    className="w-4 h-4 text-[#0B1F4D] accent-[#0B1F4D] cursor-pointer"
                  />
                  No
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name
              </label>
              <select
                value={formData.vendorId}
                onChange={(e) =>
                  setFormData({ ...formData, vendorId: e.target.value })
                }
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 disabled:bg-gray-50 disabled:text-gray-400"
                disabled={
                  formData.l1VendorIdentified === "no" || isVendorsLoading
                }
              >
                <option value="">
                  {isVendorsLoading ? "Loading vendors..." : "Select a vendor"}
                </option>
                {vendors.map((vendor: any) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.legalName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                L1 Cost (Lakhs)
              </label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 disabled:bg-gray-50 disabled:text-gray-400"
                value={formData.l1CostLakhs}
                onChange={(e) =>
                  setFormData({ ...formData, l1CostLakhs: e.target.value })
                }
                disabled={formData.l1VendorIdentified === "no"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Order Issued?
              </label>
              <div className="flex gap-6 h-10 items-center">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="workOrderIssued"
                    value="yes"
                    checked={formData.workOrderIssued === "yes"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        workOrderIssued: e.target.value,
                      })
                    }
                    className="w-4 h-4 text-[#0B1F4D] accent-[#0B1F4D] cursor-pointer"
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="workOrderIssued"
                    value="no"
                    checked={formData.workOrderIssued === "no"}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        workOrderIssued: e.target.value,
                        workOrderDate: "",
                      });
                    }}
                    className="w-4 h-4 text-[#0B1F4D] accent-[#0B1F4D] cursor-pointer"
                  />
                  No
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Order Date
              </label>
              <input
                type="date"
                className="w-full px-3 h-10 border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 disabled:bg-gray-50 disabled:text-gray-400"
                value={formData.workOrderDate}
                onChange={(e) =>
                  setFormData({ ...formData, workOrderDate: e.target.value })
                }
                disabled={formData.workOrderIssued === "no"}
              />
            </div>
          </div>

          {/* Documents Table Section */}
          <h4 className="font-semibold text-[16px] text-gray-900 mb-4 border-b pb-2">
            Supporting Documents
          </h4>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
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
                <tbody className="divide-y divide-gray-200">
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

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving || isCompleting}
              className="px-6 h-10 bg-[#0B1F4D] cursor-pointer text-white rounded-[10px] flex items-center justify-center gap-2 hover:bg-[#0B1F4D]/90 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? "Saving..." : "Save Details"}
            </button>
            <button
              onClick={() =>
                completeTenderMutation.mutate(selectedTender.proposalId)
              }
              disabled={isCompleting || isSaving}
              className="px-6 h-10 bg-[#0B1F4D] cursor-pointer text-white rounded-[10px] flex items-center justify-center gap-2 hover:bg-[#0B1F4D]/90 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCompleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {isCompleting ? "Closing..." : "Mark As Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
