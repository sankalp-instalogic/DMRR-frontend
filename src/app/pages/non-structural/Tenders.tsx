import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { Input, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { Table } from "../../components/Table";
import type { ColDef } from "ag-grid-community";
import { DocumentPreviewModal } from "../../components/DocumentPreviewModal";
import {
  Save,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Plus,
  Loader2,
} from "lucide-react";

// Document Type Mapping (ownerType is 8 for Tenders)
const DOCUMENT_TYPES: Record<string, string> = {
  "Technical Bid Opening": "30",
  "Technical Evaluation": "31",
  "Financial Bid Opening": "32",
  "Financial Evaluation": "33",
};

const stageList = [
  "Technical Bid Opening",
  "Technical Evaluation",
  "Financial Bid Opening",
  "Financial Evaluation",
];

interface Tender {
  id?: string;
  organizationChain: string;
  tenderTitle: string;
  tenderRefNo: string;
  tenderCode: string;
}

// Extended interface to handle the form's file inputs
interface TenderForm extends Tender {
  docTechnicalBidOpening: File | null;
  docTechnicalEvaluation: File | null;
  docFinancialBidOpening: File | null;
  docFinancialEvaluation: File | null;
}

interface PaginatedResponse {
  items: Tender[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export function Tenders() {
  const [activeTab, setActiveTab] = useState<"tenders" | "new">("tenders");
  const [viewTender, setViewTender] = useState<Tender | null>(null);
  
  // Modal State for Previewing Document
  const [previewDocId, setPreviewDocId] = useState<string | null>(null);

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  // --- REACT HOOK FORM SETUP ---
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<TenderForm>({
    defaultValues: {
      organizationChain: "",
      tenderTitle: "",
      tenderRefNo: "",
      tenderCode: "",
      docTechnicalBidOpening: null,
      docTechnicalEvaluation: null,
      docFinancialBidOpening: null,
      docFinancialEvaluation: null,
    },
  });

  const watchedDocs = watch([
    "docTechnicalBidOpening",
    "docTechnicalEvaluation",
    "docFinancialBidOpening",
    "docFinancialEvaluation",
  ]);

  // Consider all uploaded if at least the 4 mandatory ones are present
  const allUploaded = watchedDocs.every((doc) => doc !== null);

  const uploadStages = [
    {
      name: "Technical Bid Opening",
      key: "docTechnicalBidOpening" as const,
      type: "30",
      file: watchedDocs[0],
    },
    {
      name: "Technical Evaluation",
      key: "docTechnicalEvaluation" as const,
      type: "31",
      file: watchedDocs[1],
    },
    {
      name: "Financial Bid Opening",
      key: "docFinancialBidOpening" as const,
      type: "32",
      file: watchedDocs[2],
    },
    {
      name: "Financial Evaluation",
      key: "docFinancialEvaluation" as const,
      type: "33",
      file: watchedDocs[3],
    },
  ];

  // ==========================================
  // QUERIES
  // ==========================================

  // Fetch Tenders List
  const { data, isLoading, isError, isFetching } = useQuery<
    PaginatedResponse | Tender[]
  >({
    queryKey: ["tenders", page, pageSize],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/data-tenders", {
        params: { page, pageSize },
      });
      return response.data;
    },
  });

  const tenders = Array.isArray(data) ? data : data?.items || [];
  const totalCount = Array.isArray(data) ? data.length : data?.totalCount || 0;
  const totalPages = Array.isArray(data)
    ? Math.ceil(data.length / pageSize)
    : data?.totalPages || 0;

  // Fetch Documents for selected tender (View Mode)
  const { data: documentsData, isLoading: isDocumentsLoading } = useQuery({
    queryKey: ["tenderDocuments", viewTender?.id],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Documents/list", {
        params: { ownerType: "8", ownerId: viewTender?.id },
      });
      return response.data;
    },
    enabled: !!viewTender?.id,
  });

  const getDocumentForStage = (stageName: string) => {
    const docs = Array.isArray(documentsData)
      ? documentsData
      : documentsData?.items || [];

    const normalizedStageName = stageName.replace(/\s/g, "");

    return docs.find(
      (doc: any) =>
        doc.documentTypeName === normalizedStageName ||
        doc.documentTypeName === stageName ||
        doc.documentType?.toString() === DOCUMENT_TYPES[stageName],
    );
  };

  // ==========================================
  // MUTATIONS
  // ==========================================

  // Upload Document Mutation
  const uploadMutation = useMutation({
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
      uploadData.append("ownerType", "8");
      uploadData.append("documentType", documentType);

      const response = await axiosPrivate.post(
        "/api/v1/Documents/upload",
        uploadData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    },
  });

  // Add Tender Mutation
  const addMutation = useMutation({
    mutationFn: async ({
      payload,
      formFiles,
    }: {
      payload: Tender;
      formFiles: TenderForm;
    }) => {
      const response = await axiosPrivate.post(
        "/api/v1/data-tenders",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return { responseData: response.data, formFiles };
    },
    onSuccess: async ({ responseData, formFiles }) => {
      if (responseData?.id) {
        // Map form keys back to their backend stage types for uploading
        const fileMap = [
          { file: formFiles.docTechnicalBidOpening, type: "30" },
          { file: formFiles.docTechnicalEvaluation, type: "31" },
          { file: formFiles.docFinancialBidOpening, type: "32" },
          { file: formFiles.docFinancialEvaluation, type: "33" },
        ];

        const uploadPromises = fileMap.map(({ file, type }) => {
          if (file && type) {
            return uploadMutation.mutateAsync({
              file,
              ownerId: responseData.id,
              documentType: type,
            });
          }
          return Promise.resolve();
        });

        try {
          await Promise.all(uploadPromises);
        } catch (err) {
          console.error("One or more document uploads failed:", err);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["tenders"] });
      reset();
      setActiveTab("tenders");
    },
    onError: (err) => {
      console.error("Failed to save tender:", err);
    },
  });

  // ==========================================
  // HANDLERS
  // ==========================================

  const onSubmit = (formData: TenderForm) => {
    const payload = {
      organizationChain: formData.organizationChain,
      tenderTitle: formData.tenderTitle,
      tenderRefNo: formData.tenderRefNo,
      tenderCode: formData.tenderCode,
    };

    addMutation.mutate({ payload, formFiles: formData });
  };

  const handleDownload = async (doc: any) => {
    if (!doc?.id) return;
    try {
      const response = await axiosPrivate.get(
        `/api/v1/Documents/${doc.id}/download`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", doc.fileName || `document-${doc.id}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download document:", error);
    }
  };

  // --- AG GRID COLUMNS ---
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { headerName: "Tender Title", field: "tenderTitle", flex: 1 },
      { headerName: "Tender Ref No", field: "tenderRefNo" },
      { headerName: "Tender Code", field: "tenderCode" },
      { headerName: "Organization Chain", field: "organizationChain", flex: 1 },
      {
        headerName: "Action",
        field: "id",
        sortable: false,
        filter: false,
        width: 120,
        cellRenderer: (params: any) => (
          <button
            onClick={() => setViewTender(params.data)}
            className="inline-flex cursor-pointer items-center gap-1.5 px-4 h-8 bg-white border border-primary text-primary rounded-[10px] hover:bg-blue-50 transition-colors text-[14px] font-medium mt-1.5"
          >
            <Eye className="size-4" />
            View
          </button>
        ),
      },
    ],
    []
  );

  // ==========================================
  // VIEW RENDER
  // ==========================================

  if (viewTender) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setViewTender(null)}
            className="flex items-center gap-2 cursor-pointer bg-white border border-primary text-primary px-4 h-10 rounded-[10px] text-[14px] font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-[20px] font-semibold text-primary mb-6 pb-4 border-b border-gray-200 flex items-center gap-2">
            Tender Details
            {isDocumentsLoading && (
              <Loader2 className="size-4 animate-spin text-gray-400" />
            )}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6">
            <div className="md:col-span-2">
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Organization Chain
              </label>
              <p className="font-semibold text-[16px] text-primary">
                {viewTender.organizationChain}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Tender Title
              </label>
              <p className="font-semibold text-[16px] text-primary">
                {viewTender.tenderTitle}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Tender Ref No
              </label>
              <p className="font-semibold text-[16px] text-primary">
                {viewTender.tenderRefNo}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Tender Code
              </label>
              <p className="font-semibold text-[16px] text-primary">
                {viewTender.tenderCode}
              </p>
            </div>
          </div>
        </div>

        {/* Stage Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] text-left">
              <thead className="bg-[#F5F7FA] text-primary">
                <tr className="h-14">
                  <th className="px-4 font-semibold whitespace-nowrap">
                    Stages
                  </th>
                  <th className="px-4 font-semibold whitespace-nowrap text-center">
                    Status
                  </th>
                  <th className="px-4 font-semibold whitespace-nowrap text-center">
                    Preview
                  </th>
                  <th className="px-4 font-semibold whitespace-nowrap text-center">
                    Download
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* PROCESS 1 */}
                <tr className="bg-[#F5F7FA] border-y border-gray-200">
                  <td
                    colSpan={4} // Increased colSpan to 4
                    className="px-4 py-3 font-semibold text-primary"
                  >
                    Process 1
                  </td>
                </tr>
                {stageList.slice(0, 2).map((stage, index) => {
                  const doc = getDocumentForStage(stage);
                  return (
                    <tr
                      key={`p1-${index}`}
                      className="hover:bg-blue-50/50 transition-colors h-14 even:bg-gray-50/50"
                    >
                      <td className="px-8 font-medium text-primary whitespace-nowrap">
                        {stage}
                      </td>
                      <td className="px-4 text-center">
                        {doc ? (
                          <CheckCircle2 className="size-5 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="size-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="px-4 text-center">
                        <button
                          onClick={() => doc?.id && setPreviewDocId(doc.id)}
                          disabled={!doc}
                          className="text-gray-500 cursor-pointer hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Preview Document"
                        >
                          <Eye className="size-4 mx-auto" />
                        </button>
                      </td>
                      <td className="px-4 text-center">
                        <button
                          onClick={() => handleDownload(doc)}
                          disabled={!doc}
                          className="text-gray-500 cursor-pointer hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Download Document"
                        >
                          <Download className="size-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* PROCESS 2 */}
                <tr className="bg-[#F5F7FA] border-y border-gray-200">
                  <td
                    colSpan={4} // Increased colSpan to 4
                    className="px-4 py-3 font-semibold text-primary"
                  >
                    Process 2
                  </td>
                </tr>
                {stageList.slice(2).map((stage, index) => {
                  const doc = getDocumentForStage(stage);
                  return (
                    <tr
                      key={`p2-${index}`}
                      className="hover:bg-blue-50/50 transition-colors h-14 even:bg-gray-50/50"
                    >
                      <td className="px-8 font-medium text-primary whitespace-nowrap">
                        {stage}
                      </td>
                      <td className="px-4 text-center">
                        {doc ? (
                          <CheckCircle2 className="size-5 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="size-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="px-4 text-center">
                        <button
                          onClick={() => doc?.id && setPreviewDocId(doc.id)}
                          disabled={!doc}
                          className="text-gray-500 cursor-pointer hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Preview Document"
                        >
                          <Eye className="size-4 mx-auto" />
                        </button>
                      </td>
                      <td className="px-4 text-center">
                        <button
                          onClick={() => handleDownload(doc)}
                          disabled={!doc}
                          className="text-gray-500 hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Download Document"
                        >
                          <Download className="size-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Document Preview Modal Component */}
        <DocumentPreviewModal
          isOpen={!!previewDocId}
          onClose={() => setPreviewDocId(null)}
          documentId={previewDocId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] font-bold text-primary">Tendering</h1>
        <p className="text-[14px] font-medium text-gray-500 mt-1">
          Manage Tender Activities
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("tenders")}
            className={`px-4 py-2 cursor-pointer font-medium text-[14px] transition-colors rounded-[10px] ${
              activeTab === "tenders"
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            Tenders
          </button>

          <button
            onClick={() => setActiveTab("new")}
            className={`flex cursor-pointer items-center gap-2 px-4 py-2 font-medium text-[14px] transition-colors rounded-[10px] ${
              activeTab === "new"
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <Plus className="size-4" />
            New Tender
          </button>
        </div>
      </div>

      {/* ==========================
          TENDER LIST (AG-GRID TABLE)
      ========================== */}
      {activeTab === "tenders" && (
        <div className="relative mb-6">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
              <span className="text-primary font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                Updating...
              </span>
            </div>
          )}

          {isLoading ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 flex justify-center shadow-sm">
              <span className="text-gray-500 font-medium">
                Loading tenders...
              </span>
            </div>
          ) : isError ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 flex justify-center shadow-sm">
              <span className="text-red-500 font-medium">
                Failed to load tenders. Please try again.
              </span>
            </div>
          ) : (
            <Table
              rowData={tenders}
              columnDefs={columnDefs}
              totalCount={totalCount}
              page={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}
        </div>
      )}

      {/* ==========================
          NEW TENDER FORM
      ========================== */}
      {activeTab === "new" && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6"
        >
          <h2 className="text-[20px] font-semibold text-primary">
            Create New Tender
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Organization Chain
              </label>
              <Controller
                name="organizationChain"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter Organization Chain"
                    className="h-10 rounded-[10px] text-[14px] hover:border-primary/50 focus:border-primary/50"
                  />
                )}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Tender Title
              </label>
              <Controller
                name="tenderTitle"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter Tender Title"
                    className="h-10 rounded-[10px] text-[14px] hover:border-primary/50 focus:border-primary/50"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Tender Ref No
              </label>
              <Controller
                name="tenderRefNo"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter Tender Reference Number"
                    className="h-10 rounded-[10px] text-[14px] hover:border-primary/50 focus:border-primary/50"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Tender Code
              </label>
              <Controller
                name="tenderCode"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter Tender Code"
                    className="h-10 rounded-[10px] text-[14px] hover:border-primary/50 focus:border-primary/50"
                  />
                )}
              />
            </div>
          </div>

          {/* Upload Stage Table embedded in the form */}
          <div className="border border-gray-200 rounded-xl overflow-hidden mt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] text-left">
                <thead className="bg-[#F5F7FA] text-primary">
                  <tr className="h-14">
                    <th className="px-4 font-semibold whitespace-nowrap">
                      Stages
                    </th>
                    <th className="px-4 font-semibold whitespace-nowrap text-center">
                      Upload
                    </th>
                    <th className="px-4 font-semibold whitespace-nowrap text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {uploadStages.map((stage) => (
                    <tr
                      key={stage.key}
                      className="hover:bg-blue-50/50 transition-colors h-14 even:bg-gray-50/50"
                    >
                      <td className="px-4 font-medium text-primary whitespace-nowrap">
                        {stage.name}
                      </td>
                      <td className="px-4 text-center">
                        <Controller
                          name={stage.key}
                          control={control}
                          render={({ field }) => (
                            <Upload
                              beforeUpload={(file) => {
                                field.onChange(file);
                                return false; // Prevent automatic upload
                              }}
                              onRemove={() => field.onChange(null)}
                              fileList={field.value ? [field.value as any] : []}
                              maxCount={1}
                              showUploadList={false} // Hidden so we rely on custom checkmark column below
                            >
                              <button
                                type="button"
                                className="inline-flex cursor-pointer items-center gap-1.5 px-4 h-10 bg-white border border-primary text-primary rounded-[10px] hover:bg-blue-50 transition-colors text-[14px] font-medium"
                              >
                                <UploadOutlined />
                                Upload
                              </button>
                            </Upload>
                          )}
                        />
                      </td>
                      <td className="px-4 text-center">
                        {stage.file ? (
                          <CheckCircle2 className="size-5 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="size-5 text-red-500 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                reset();
                setActiveTab("tenders");
              }}
              className="px-4 h-10 cursor-pointer bg-white border border-primary text-primary rounded-[10px] font-medium hover:bg-gray-50 transition-colors text-[14px]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                !allUploaded ||
                addMutation.isPending ||
                uploadMutation.isPending ||
                isSubmitting
              }
              className="flex items-center gap-1.5 px-4 h-10 cursor-pointer bg-primary text-white rounded-[10px] font-medium hover:bg-primary/90 transition-colors text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addMutation.isPending ||
              uploadMutation.isPending ||
              isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {addMutation.isPending || uploadMutation.isPending || isSubmitting
                ? "Saving..."
                : "Save"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
