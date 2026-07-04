import { useState, useMemo } from "react";
import { Plus, Eye, Download, ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import {
  Input,
  DatePicker,
  InputNumber,
  Upload,
  Button as AntButton,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { Table } from "../../components/Table";
import type { ColDef } from "ag-grid-community";
import { DocumentPreviewModal } from "../../components/DocumentPreviewModal";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import { DocumentOwnerType, DocumentType } from "../../../../constants/documents";

interface Grant {
  id?: string;
  grantCode: string;
  title: string;
  givenTo: string;
  issuedDate: string | null;
  allocatedAmount: number | string;
  utilizedAmount: number | string;
  completionDate: string | null;
  completionCertificate?: File | null;
}

interface PaginatedResponse {
  items: Grant[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  return dateString.split("T")[0];
};

const formatCurrency = (amount: number | string) => {
  if (amount === undefined || amount === null || amount === "") return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

export function ResearchAndGrants() {
  const [activeTab, setActiveTab] = useState<"list" | "new">("list");
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);

  // --- PREVIEW MODAL STATE ---
  const [previewDocId, setPreviewDocId] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  // --- REACT HOOK FORM SETUP ---
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
    watch,
  } = useForm<Grant>({
    defaultValues: {
      grantCode: "",
      title: "",
      givenTo: "",
      issuedDate: null,
      allocatedAmount: "",
      utilizedAmount: "",
      completionDate: null,
      completionCertificate: null,
    },
  });

  const completionCertificateFile = watch("completionCertificate");

  // --- QUERIES ---
  const { data, isLoading, isError, isFetching } = useQuery<PaginatedResponse>({
    queryKey: ["grants", page, pageSize],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/grants", {
        params: { page, pageSize },
      });
      return response.data;
    },
  });

  // Fetch Documents for selected grant
  const { data: documentsData, isLoading: isDocumentsLoading } = useQuery({
    queryKey: ["documents", selectedGrant?.id],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Documents/list", {
        params: { ownerType: String(DocumentOwnerType.Grant), ownerId: selectedGrant?.id },
      });
      return response.data;
    },
    enabled: !!selectedGrant?.id,
  });

  const grants = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 0;

  const getDocumentByType = (typeName: string) => {
    const docs = Array.isArray(documentsData)
      ? documentsData
      : documentsData?.items || [];
    return docs.find((doc: any) => doc.documentTypeName === typeName);
  };

  const completionDoc =
    getDocumentByType("CompletionReport") ||
    (Array.isArray(documentsData)
      ? documentsData[0]
      : documentsData?.items?.[0]);

  // --- MUTATIONS ---

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
      uploadData.append("ownerType", String(DocumentOwnerType.Grant));
      uploadData.append("documentType", String(documentType));

      const response = await axiosPrivate.post(
        "/api/v1/Documents/upload",
        uploadData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    },
  });

  // Add Grant Data Mutation
  const addMutation = useMutation({
    mutationFn: async (newData: any) => {
      const response = await axiosPrivate.post("/api/v1/grants", newData, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    },
    onSuccess: async (responseData) => {
      if (responseData?.id && completionCertificateFile) {
        try {
          await uploadMutation.mutateAsync({
            file: completionCertificateFile,
            ownerId: responseData.id,
            documentType: DocumentType.CompletionCertificate,
          });
        } catch (err) {
          console.error("Document upload failed:", err);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["grants"] });
      reset();
      setActiveTab("list");
    },
    onError: (err) => {
      console.error("Failed to save grant:", err);
    },
  });

  // --- HANDLERS ---
  const onSubmit = (formData: Grant) => {
    const { completionCertificate, ...textData } = formData;

    const payload = {
      grantCode: textData.grantCode,
      title: textData.title,
      givenTo: textData.givenTo,
      issuedDate: textData.issuedDate
        ? new Date(textData.issuedDate).toISOString()
        : null,
      allocatedAmount: Number(textData.allocatedAmount) || 0,
      utilizedAmount: Number(textData.utilizedAmount) || 0,
      completionDate: textData.completionDate
        ? new Date(textData.completionDate).toISOString()
        : null,
    };

    addMutation.mutate(payload);
  };

  const handleDownload = async (doc: any) => {
    if (!doc?.id) return;
    try {
      const response = await axiosPrivate.get(
        `/api/v1/Documents/${doc.id}/download`,
        {
          responseType: "blob",
        },
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

  const handlePreviewOpen = (doc: any) => {
    if (doc?.id) {
      setPreviewDocId(doc.id);
      setIsPreviewModalOpen(true);
    }
  };

  // --- AG GRID COLUMNS ---
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { headerName: "Grant Code", flex: 1, field: "grantCode" },
      { headerName: "Research/Grant Given To", flex: 1, field: "givenTo" },
      {
        headerName: "Date of Issue",
        field: "issuedDate",
        flex: 1,
        valueFormatter: (params) => formatDate(params.value),
      },
      {
        headerName: "Allocated Amount",
        field: "allocatedAmount",
        flex: 1,
        valueFormatter: (params) => formatCurrency(params.value),
      },
      {
        headerName: "Utilized Amount",
        field: "utilizedAmount",
        flex: 1,
        valueFormatter: (params) => formatCurrency(params.value),
      },
      {
        headerName: "Date of Completion",
        field: "completionDate",
        flex: 1,
        valueFormatter: (params) => formatDate(params.value),
      },
      {
        headerName: "Action",
        field: "id",
        flex: 1,
        sortable: false,
        filter: false,
        width: 120,
        cellRenderer: (params: any) => (
          <div className="flex h-full items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedGrant(params.data)}
              className="text-primary hover:bg-info-muted hover:text-primary"
              title="View"
            >
              <Eye className="size-4" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  // ==========================
  // VIEW PAGE
  // ==========================

  if (selectedGrant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setSelectedGrant(null)}
            className="border-primary text-primary px-4 h-10 rounded-[10px]"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-[20px] font-semibold text-primary mb-6 pb-4 border-b border-border">
            Grant Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6">
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1 block">
                Grant Code
              </label>
              <p className="font-semibold text-[16px] text-primary">
                {selectedGrant.grantCode}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1 block">
                Title
              </label>
              <p className="font-semibold text-[16px] text-primary">
                {selectedGrant.title}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1 block">
                Research/Grant Given To
              </label>
              <p className="font-semibold text-[16px] text-primary">
                {selectedGrant.givenTo}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1 block">
                Date of Issue
              </label>
              <p className="font-semibold text-[16px] text-primary">
                {formatDate(selectedGrant.issuedDate)}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1 block">
                Allocated Amount
              </label>
              <p className="font-semibold text-[16px] text-primary">
                {formatCurrency(selectedGrant.allocatedAmount)}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1 block">
                Utilized Amount
              </label>
              <p className="font-semibold text-[16px] text-primary">
                {formatCurrency(selectedGrant.utilizedAmount)}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1 block">
                Date of Completion
              </label>
              <p className="font-semibold text-[16px] text-primary">
                {formatDate(selectedGrant.completionDate)}
              </p>
            </div>

            <div className="md:col-span-2 border-t border-border pt-4 mt-2"></div>

            <div>
              <label className="text-[16px] font-semibold text-primary block mb-4">
                Completion Certificate{" "}
                {isDocumentsLoading && (
                  <Spinner iconClassName="size-4" className="ml-2 inline-flex" />
                )}
              </label>
              <div className="flex gap-3">
                <Button
                  size="lg"
                  onClick={() => handleDownload(completionDoc)}
                  disabled={!completionDoc || isDocumentsLoading}
                >
                  <Download className="size-4" /> Download
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handlePreviewOpen(completionDoc)}
                  disabled={!completionDoc || isDocumentsLoading}
                >
                  <Eye className="size-4" /> View
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* --- Document Preview Modal Component --- */}
        <DocumentPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => {
            setIsPreviewModalOpen(false);
            setPreviewDocId(null);
          }}
          documentId={previewDocId}
        />
      </div>
    );
  }

  // ==========================
  // MAIN PAGE
  // ==========================

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] font-bold text-primary">
          Research & Grants
        </h1>
        <p className="text-[14px] font-medium text-muted-foreground mt-1">
          Manage and monitor Research & Grants activities.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 cursor-pointer font-medium text-[14px] transition-colors rounded-[10px] ${
              activeTab === "list"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-muted border border-border"
            }`}
          >
            Grants List
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
            New Grant
          </button>
        </div>
      </div>

      {/* ==========================
          GRANTS LIST
      ========================== */}

      {activeTab === "list" && (
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
              <Spinner label="Loading grants..." />
            </div>
          ) : isError ? (
            <div className="bg-card border border-border rounded-xl p-12 flex justify-center shadow-sm">
              <span className="text-destructive font-medium">
                Failed to load grants. Please try again.
              </span>
            </div>
          ) : (
            <Table
              rowData={grants}
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
          NEW GRANT
      ========================== */}

      {activeTab === "new" && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-card border border-border rounded-xl p-6 shadow-sm"
        >
          <h2 className="text-[20px] font-semibold mb-6 text-primary">
            Add New Grant
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-medium text-foreground mb-1">
                Grant Code
              </label>
              <Controller
                name="grantCode"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter Grant Code"
                    className="h-10 rounded-[10px] text-[14px] hover:border-primary/50 focus:border-primary/50"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-foreground mb-1">
                Title
              </label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter Title"
                    className="h-10 rounded-[10px] text-[14px] hover:border-primary/50 focus:border-primary/50"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-foreground mb-1">
                Research/Grant Given To
              </label>
              <Controller
                name="givenTo"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter recipient"
                    className="h-10 rounded-[10px] text-[14px] hover:border-primary/50 focus:border-primary/50"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-foreground mb-1">
                Date of Issue
              </label>
              <Controller
                name="issuedDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    className="w-full h-10 rounded-[10px] text-[14px]"
                    format="YYYY-MM-DD"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(_date, dateString) => {
                      field.onChange(
                        typeof dateString === "string" ? dateString : "",
                      );
                    }}
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-foreground mb-1">
                Allocated Amount
              </label>
              <Controller
                name="allocatedAmount"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    style={{ width: "100%" }}
                    className="w-full h-10 rounded-[10px] text-[14px] flex items-center"
                    placeholder="Enter Allocated Amount"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-foreground mb-1">
                Utilized Amount
              </label>
              <Controller
                name="utilizedAmount"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    style={{ width: "100%" }}
                    className="w-full h-10 rounded-[10px] text-[14px] flex items-center"
                    placeholder="Enter Utilized Amount"
                  />
                )}
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-[14px] font-medium text-foreground mb-1">
                Date of Completion
              </label>
              <Controller
                name="completionDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    className="w-full md:w-[calc(50%-0.5rem)] h-10 rounded-[10px] text-[14px]"
                    format="YYYY-MM-DD"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(_date, dateString) => {
                      field.onChange(
                        typeof dateString === "string" ? dateString : "",
                      );
                    }}
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-foreground mb-1">
                Completion Certificate Upload
              </label>
              <Controller
                name="completionCertificate"
                control={control}
                render={({ field }) => (
                  <Upload
                    beforeUpload={(file) => {
                      field.onChange(file);
                      return false;
                    }}
                    onRemove={() => field.onChange(null)}
                    fileList={field.value ? [field.value as any] : []}
                    maxCount={1}
                  >
                    <AntButton icon={<UploadOutlined />}>Select File</AntButton>
                  </Upload>
                )}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setActiveTab("list");
              }}
              className="px-4 h-10 border-primary text-primary rounded-[10px]"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                addMutation.isPending ||
                uploadMutation.isPending ||
                isSubmitting
              }
              className="px-4 h-10 rounded-[10px]"
            >
              {addMutation.isPending || uploadMutation.isPending || isSubmitting ? (
                <>
                  <Spinner inline iconClassName="size-4" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}