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
import { cn } from "../../components/ui/utils";
import { buttonVariants } from "../../components/ui/button";

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
        params: { ownerType: "9", ownerId: selectedGrant?.id },
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
      documentType: string;
    }) => {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("ownerId", ownerId);
      uploadData.append("ownerType", "9");
      uploadData.append("documentType", documentType);

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
            documentType: "18",
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
          <button
            onClick={() => setSelectedGrant(params.data)}
            className="inline-flex cursor-pointer items-center gap-1.5 px-4 h-8 bg-white border border-[#0B1F4D] text-[#0B1F4D] rounded-[10px] hover:bg-blue-50 transition-colors text-[14px] font-medium mt-1.5"
          >
            <Eye className="size-4" />
            View
          </button>
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
          <button
            onClick={() => setSelectedGrant(null)}
            className="flex items-center gap-2 cursor-pointer bg-white border border-[#0B1F4D] text-[#0B1F4D] px-4 h-10 rounded-[10px] text-[14px] font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-[20px] font-semibold text-[#0B1F4D] mb-6 pb-4 border-b border-gray-200">
            Grant Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6">
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Grant Code
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {selectedGrant.grantCode}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Title
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {selectedGrant.title}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Research/Grant Given To
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {selectedGrant.givenTo}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Date of Issue
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {formatDate(selectedGrant.issuedDate)}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Allocated Amount
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {formatCurrency(selectedGrant.allocatedAmount)}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Utilized Amount
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {formatCurrency(selectedGrant.utilizedAmount)}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Date of Completion
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {formatDate(selectedGrant.completionDate)}
              </p>
            </div>

            <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-2"></div>

            <div>
              <label className="text-[16px] font-semibold text-[#0B1F4D] block mb-4">
                Completion Certificate{" "}
                {isDocumentsLoading && (
                  <span className="text-sm text-gray-400 font-normal ml-2">
                    (Loading...)
                  </span>
                )}
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload(completionDoc)}
                  disabled={!completionDoc || isDocumentsLoading}
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "cursor-pointer",
                  )}
                >
                  <Download className="size-4" /> Download
                </button>
                <button
                  onClick={() => handlePreviewOpen(completionDoc)}
                  disabled={!completionDoc || isDocumentsLoading}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "cursor-pointer",
                  )}
                >
                  <Eye className="size-4" /> View
                </button>
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
        <p className="text-[14px] font-medium text-gray-500 mt-1">
          Manage and monitor Research & Grants activities.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 cursor-pointer font-medium text-[14px] transition-colors rounded-[10px] ${
              activeTab === "list"
                ? "bg-[#0B1F4D] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            Grants List
          </button>

          <button
            onClick={() => setActiveTab("new")}
            className={`flex cursor-pointer items-center gap-2 px-4 py-2 font-medium text-[14px] transition-colors rounded-[10px] ${
              activeTab === "new"
                ? "bg-[#0B1F4D] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
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
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
              <span className="text-[#0B1F4D] font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                Updating...
              </span>
            </div>
          )}

          {isLoading ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 flex justify-center shadow-sm">
              <span className="text-gray-500 font-medium">
                Loading grants...
              </span>
            </div>
          ) : isError ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 flex justify-center shadow-sm">
              <span className="text-red-500 font-medium">
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
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
        >
          <h2 className="text-[20px] font-semibold mb-6 text-[#0B1F4D]">
            Add New Grant
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Grant Code
              </label>
              <Controller
                name="grantCode"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter Grant Code"
                    className="h-10 rounded-[10px] text-[14px] hover:border-[#0B1F4D]/50 focus:border-[#0B1F4D]/50"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Title
              </label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter Title"
                    className="h-10 rounded-[10px] text-[14px] hover:border-[#0B1F4D]/50 focus:border-[#0B1F4D]/50"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Research/Grant Given To
              </label>
              <Controller
                name="givenTo"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter recipient"
                    className="h-10 rounded-[10px] text-[14px] hover:border-[#0B1F4D]/50 focus:border-[#0B1F4D]/50"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
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
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
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
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
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
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
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
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
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

          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                reset();
                setActiveTab("list");
              }}
              className="px-4 h-10 cursor-pointer bg-white border border-[#0B1F4D] text-[#0B1F4D] rounded-[10px] font-medium hover:bg-gray-50 transition-colors text-[14px]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                addMutation.isPending ||
                uploadMutation.isPending ||
                isSubmitting
              }
              className="px-4 h-10 cursor-pointer bg-[#0B1F4D] text-white rounded-[10px] font-medium hover:bg-[#0B1F4D]/90 transition-colors text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
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