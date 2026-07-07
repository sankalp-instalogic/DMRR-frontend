import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { Input } from "antd";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { Table } from "../../components/Table";
import type { ColDef } from "ag-grid-community";
import { DocumentPreviewModal } from "../../components/DocumentPreviewModal";
import { FileUpload } from "../../components/FileUpload";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import {
  Save,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { DocumentOwnerType, DocumentType } from "../../../../constants/documents";

// Document Type Mapping (ownerType is 8 for Tenders)
const DOCUMENT_TYPES: Record<string, DocumentType> = {
  "Technical Bid Opening": DocumentType.TechnicalBidOpening,
  "Technical Evaluation": DocumentType.TechnicalEvaluation,
  "Financial Bid Opening": DocumentType.FinancialBidOpening,
  "Financial Evaluation": DocumentType.FinancialEvaluation,
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
      type: DocumentType.TechnicalBidOpening,
      file: watchedDocs[0],
    },
    {
      name: "Technical Evaluation",
      key: "docTechnicalEvaluation" as const,
      type: DocumentType.TechnicalEvaluation,
      file: watchedDocs[1],
    },
    {
      name: "Financial Bid Opening",
      key: "docFinancialBidOpening" as const,
      type: DocumentType.FinancialBidOpening,
      file: watchedDocs[2],
    },
    {
      name: "Financial Evaluation",
      key: "docFinancialEvaluation" as const,
      type: DocumentType.FinancialEvaluation,
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
        params: { ownerType: String(DocumentOwnerType.DataTender), ownerId: viewTender?.id },
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
        doc.documentType?.toString() === String(DOCUMENT_TYPES[stageName]),
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
      documentType: DocumentType;
    }) => {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("ownerId", ownerId);
      uploadData.append("ownerType", String(DocumentOwnerType.DataTender));
      uploadData.append("documentType", String(documentType));

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
          { file: formFiles.docTechnicalBidOpening, type: DocumentType.TechnicalBidOpening },
          { file: formFiles.docTechnicalEvaluation, type: DocumentType.TechnicalEvaluation },
          { file: formFiles.docFinancialBidOpening, type: DocumentType.FinancialBidOpening },
          { file: formFiles.docFinancialEvaluation, type: DocumentType.FinancialEvaluation },
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
          <div className="flex h-full items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewTender(params.data)}
              className="text-primary hover:bg-info-muted hover:text-primary"
              title="View"
            >
              <Eye className="size-4" />
            </Button>
          </div>
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
          <Button
            variant="outline"
            onClick={() => setViewTender(null)}
            className="border-primary text-primary px-4 h-10 rounded-[10px]"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-[20px] font-semibold text-primary mb-6 pb-4 border-b border-border flex items-center gap-2">
            Tender Details
            {isDocumentsLoading && <Spinner iconClassName="size-4" />}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6">
            <div className="md:col-span-2">
              <label className="text-[14px] font-medium text-muted-foreground mb-1 block">
                Organization Chain
              </label>
              <p className="font-semibold text-[16px] text-primary">
                {viewTender.organizationChain}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1 block">
                Tender Title
              </label>
              <p className="font-semibold text-[16px] text-primary">
                {viewTender.tenderTitle}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1 block">
                Tender Ref No
              </label>
              <p className="font-semibold text-[16px] text-primary">
                {viewTender.tenderRefNo}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1 block">
                Tender Code
              </label>
              <p className="font-semibold text-[16px] text-primary">
                {viewTender.tenderCode}
              </p>
            </div>
          </div>
        </div>

        {/* Stage Table */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden flex flex-col relative">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] text-left">
              <thead className="bg-muted text-primary">
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
              <tbody className="divide-y divide-border">
                {/* PROCESS 1 */}
                <tr className="bg-muted border-y border-border">
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
                      className="hover:bg-info-muted/50 transition-colors h-14 even:bg-muted/50"
                    >
                      <td className="px-8 font-medium text-primary whitespace-nowrap">
                        {stage}
                      </td>
                      <td className="px-4 text-center">
                        {doc ? (
                          <CheckCircle2 className="size-5 text-success mx-auto" />
                        ) : (
                          <XCircle className="size-5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                      <td className="px-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => doc?.id && setPreviewDocId(doc.id)}
                          disabled={!doc}
                          className="mx-auto text-muted-foreground hover:text-primary disabled:opacity-30"
                          title="Preview Document"
                        >
                          <Eye className="size-4" />
                        </Button>
                      </td>
                      <td className="px-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(doc)}
                          disabled={!doc}
                          className="mx-auto text-muted-foreground hover:text-primary disabled:opacity-30"
                          title="Download Document"
                        >
                          <Download className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}

                {/* PROCESS 2 */}
                <tr className="bg-muted border-y border-border">
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
                      className="hover:bg-info-muted/50 transition-colors h-14 even:bg-muted/50"
                    >
                      <td className="px-8 font-medium text-primary whitespace-nowrap">
                        {stage}
                      </td>
                      <td className="px-4 text-center">
                        {doc ? (
                          <CheckCircle2 className="size-5 text-success mx-auto" />
                        ) : (
                          <XCircle className="size-5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                      <td className="px-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => doc?.id && setPreviewDocId(doc.id)}
                          disabled={!doc}
                          className="mx-auto text-muted-foreground hover:text-primary disabled:opacity-30"
                          title="Preview Document"
                        >
                          <Eye className="size-4" />
                        </Button>
                      </td>
                      <td className="px-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(doc)}
                          disabled={!doc}
                          className="mx-auto text-muted-foreground hover:text-primary disabled:opacity-30"
                          title="Download Document"
                        >
                          <Download className="size-4" />
                        </Button>
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
        <p className="text-[14px] font-medium text-muted-foreground mt-1">
          Manage Tender Activities
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("tenders")}
            className={`px-4 py-2 cursor-pointer font-medium text-[14px] transition-colors rounded-[10px] ${
              activeTab === "tenders"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-muted border border-border"
            }`}
          >
            Tenders
          </button>

          <button
            onClick={() => setActiveTab("new")}
            className={`flex cursor-pointer items-center gap-2 px-4 py-2 font-medium text-[14px] transition-colors rounded-[10px] ${
              activeTab === "new"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-muted border border-border"
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
            <div className="absolute inset-0 bg-card/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
              <div className="bg-card px-4 py-2 rounded-lg shadow-sm border border-border">
                <Spinner iconClassName="size-6" label="Updating..." />
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="bg-card border border-border rounded-xl p-12 flex justify-center shadow-sm">
              <Spinner label="Loading tenders..." />
            </div>
          ) : isError ? (
            <div className="bg-card border border-border rounded-xl p-12 flex justify-center shadow-sm">
              <span className="text-destructive font-medium">
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
          className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6"
        >
          <h2 className="text-[20px] font-semibold text-primary">
            Create New Tender
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[14px] font-medium text-foreground mb-1">
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
              <label className="block text-[14px] font-medium text-foreground mb-1">
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
              <label className="block text-[14px] font-medium text-foreground mb-1">
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
              <label className="block text-[14px] font-medium text-foreground mb-1">
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
          <div className="border border-border rounded-xl overflow-hidden mt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] text-left">
                <thead className="bg-muted text-primary">
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
                <tbody className="divide-y divide-border">
                  {uploadStages.map((stage) => (
                    <tr
                      key={stage.key}
                      className="hover:bg-info-muted/50 transition-colors h-14 even:bg-muted/50"
                    >
                      <td className="px-4 font-medium text-primary whitespace-nowrap">
                        {stage.name}
                      </td>
                      <td className="px-4 text-center">
                        <Controller
                          name={stage.key}
                          control={control}
                          render={({ field }) => (
                            <FileUpload
                              variant="compact"
                              value={(field.value as File | null) ?? null}
                              onChange={field.onChange}
                              accept=".csv,.xls,.xlsx,.pdf,image/*"
                              buttonText="Select File"
                            />
                          )}
                        />
                      </td>
                      <td className="px-4 text-center">
                        {stage.file ? (
                          <CheckCircle2 className="size-5 text-success mx-auto" />
                        ) : (
                          <XCircle className="size-5 text-destructive mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setActiveTab("tenders");
              }}
              className="px-4 h-10 border-primary text-primary rounded-[10px]"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                !allUploaded ||
                addMutation.isPending ||
                uploadMutation.isPending ||
                isSubmitting
              }
              className="px-4 h-10 rounded-[10px]"
            >
              {addMutation.isPending ||
              uploadMutation.isPending ||
              isSubmitting ? (
                <Spinner inline iconClassName="size-4" />
              ) : (
                <Save className="size-4" />
              )}
              {addMutation.isPending || uploadMutation.isPending || isSubmitting
                ? "Saving..."
                : "Save"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
