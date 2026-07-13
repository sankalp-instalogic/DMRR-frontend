import { useState, useMemo } from "react";
import { Plus, Eye, Download, ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { DocumentPreviewModal } from "../../components/DocumentPreviewModal";
import { FileUpload } from "../../components/FileUpload";
import { Input, Select, DatePicker, InputNumber } from "antd";
import dayjs from "dayjs";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { Table } from "../../components/Table";
import type { ColDef } from "ag-grid-community";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import formattedDate from "../../../utils/dateFormatter";
import { DocumentOwnerType, DocumentType } from "../../../../constants/documents";

interface NBS {
  id?: string;
  nbsCode: string;
  title: string;
  districtId: string | undefined;
  grIssuedDate: string | null;
  allocatedBudget: number | string;
  utilizedBudget: number | string;
  completionDate: string | null;
  grDocument?: File | null;
  completionCertificate?: File | null;
}

interface PaginatedResponse {
  items: NBS[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

const formatCurrency = (amount: number | string) => {
  if (amount === undefined || amount === null || amount === "") return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

export function NatureBasedSolutions() {
  const [activeTab, setActiveTab] = useState<"list" | "new">("list");
  const [selectedNBS, setSelectedNBS] = useState<NBS | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(
    null,
  );

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
  } = useForm<NBS>({
    defaultValues: {
      nbsCode: "",
      title: "",
      districtId: undefined,
      grIssuedDate: null,
      allocatedBudget: "",
      utilizedBudget: "",
      completionDate: null,
      grDocument: null,
      completionCertificate: null,
    },
  });

  const grDocumentFile = watch("grDocument");
  const completionCertificateFile = watch("completionCertificate");

  // --- QUERIES ---
  const { data, isLoading, isError, isFetching } = useQuery<PaginatedResponse>({
    queryKey: ["nbs-list", page, pageSize],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/nbs", {
        params: { page, pageSize },
      });
      return response.data;
    },
  });

  const { data: districtsData, isLoading: isDistrictsLoading } = useQuery({
    queryKey: ["districts"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/districts", {
        params: { page: 1, pageSize: 100 },
      });
      return response.data;
    },
  });

  const { data: documentsData, isLoading: isDocumentsLoading } = useQuery({
    queryKey: ["documents", selectedNBS?.id],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Documents/list", {
        params: { ownerType: String(DocumentOwnerType.Nbs), ownerId: selectedNBS?.id },
      });
      return response.data;
    },
    enabled: !!selectedNBS?.id,
  });

  const nbsList = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 0;
  const districtsList = districtsData?.items || [];

  // Memoize districtMap for AG Grid performance
  const districtMap = useMemo(() => {
    if (isDistrictsLoading || !districtsData?.items) return {};
    return Object.fromEntries(
      districtsData.items.map((district: any) => [district.id, district.name]),
    );
  }, [districtsData, isDistrictsLoading]);

  const getDocumentByType = (typeName: string) => {
    const docs = Array.isArray(documentsData)
      ? documentsData
      : documentsData?.items || [];
    return docs.find((doc: any) => doc.documentTypeName === typeName);
  };

  const grDocumentObj = getDocumentByType("GRCopy");
  const completionDocObj = getDocumentByType("CompletionReport");

  // --- MUTATIONS ---
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
      uploadData.append("ownerType", String(DocumentOwnerType.Nbs));
      uploadData.append("documentType", String(documentType));

      const response = await axiosPrivate.post(
        "/api/v1/Documents/upload",
        uploadData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newData: any) => {
      const response = await axiosPrivate.post("/api/v1/nbs", newData, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    },
    onSuccess: async (responseData) => {
      if (responseData?.id) {
        const uploadPromises = [];

        if (grDocumentFile) {
          uploadPromises.push(
            uploadMutation.mutateAsync({
              file: grDocumentFile,
              ownerId: responseData.id,
              documentType: DocumentType.NBS_GR,
            }),
          );
        }

        if (completionCertificateFile) {
          uploadPromises.push(
            uploadMutation.mutateAsync({
              file: completionCertificateFile,
              ownerId: responseData.id,
              documentType: DocumentType.NBS_CompletionCertificate,
            }),
          );
        }

        try {
          if (uploadPromises.length > 0) {
            await Promise.all(uploadPromises);
          }
        } catch (err) {
          console.error("Document upload failed:", err);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["nbs-list"] });
      reset();
      setActiveTab("list");
    },
    onError: (err) => {
      console.error("Failed to save NBS:", err);
    },
  });

  // --- HANDLERS ---
  const onSubmit = (formData: NBS) => {
    const { grDocument, completionCertificate, ...textData } = formData;

    const payload = {
      ...textData,
      grIssuedDate: textData.grIssuedDate
        ? new Date(textData.grIssuedDate).toISOString()
        : null,
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
        { responseType: "blob" },
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
      { headerName: "NBS Code", field: "nbsCode" },
      { headerName: "Title", field: "title" },
      {
        headerName: "District",
        field: "districtId",
        valueGetter: (params) =>
          districtMap[params.data.districtId] || params.data.districtId,
      },
      {
        headerName: "Date of GR Issued",
        field: "grIssuedDate",
        valueFormatter: (params) => formattedDate(params.value),
      },
      {
        headerName: "Allocated Budget",
        field: "allocatedBudget",
        valueFormatter: (params) => formatCurrency(params.value),
      },
      {
        headerName: "Utilized Budget",
        field: "utilizedBudget",
        valueFormatter: (params) => formatCurrency(params.value),
      },
      {
        headerName: "Date of Completion",
        field: "completionDate",
        valueFormatter: (params) => formattedDate(params.value),
      },
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
              onClick={() => setSelectedNBS(params.data)}
              className="text-primary hover:bg-info-muted hover:text-primary"
              title="View"
            >
              <Eye className="size-4" />
            </Button>
          </div>
        ),
      },
    ],
    [districtMap],
  );

  const handleViewDocument = (doc: any) => {
    if (!doc?.id) return;
    setPreviewDocumentId(doc.id);
    setPreviewModalOpen(true);
  };

  if (selectedNBS) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setSelectedNBS(null)}
            className="border-primary text-primary px-4 h-10 rounded-[10px]"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-[20px] font-semibold text-primary mb-6 pb-4 border-b border-border">
            Nature Based Solution Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6">
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1 block">
                NBS Code
              </label>
              <p className="font-semibold text-[16px] text-primary">
                {selectedNBS.nbsCode}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1 block">
                District
              </label>
              <p className="font-semibold text-[16px] text-primary">
                {districtMap[selectedNBS.districtId as string] ||
                  selectedNBS.districtId}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1 block">
                Title
              </label>
              <p className="font-semibold text-[16px] text-primary">
                {selectedNBS.title}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1 block">
                Date of GR Issued
              </label>
              <p className="font-semibold text-[16px] text-primary">
                {formattedDate(selectedNBS.grIssuedDate!)}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1 block">
                Allocated Budget
              </label>
              <p className="font-semibold text-[16px] text-primary">
                {formatCurrency(selectedNBS.allocatedBudget)}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1 block">
                Utilized Budget
              </label>
              <p className="font-semibold text-[16px] text-primary">
                {formatCurrency(selectedNBS.utilizedBudget)}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1 block">
                Date of Completion
              </label>
              <p className="font-semibold text-[16px] text-primary">
                {formattedDate(selectedNBS.completionDate!)}
              </p>
            </div>

            <div className="md:col-span-2 border-t border-border pt-4 mt-2"></div>

            <div>
              <label className="text-[16px] font-semibold text-primary block mb-4">
                GR Issued{" "}
                {isDocumentsLoading && (
                  <Spinner iconClassName="size-4" className="ml-2 inline-flex" />
                )}
              </label>
              <div className="flex gap-3">
                <Button
                  size="lg"
                  onClick={() => handleDownload(grDocumentObj)}
                  disabled={!grDocumentObj || isDocumentsLoading}
                >
                  <Download className="size-4" /> Download
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleViewDocument(grDocumentObj)}
                >
                  <Eye className="size-4" /> View
                </Button>
              </div>
            </div>

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
                  onClick={() => handleDownload(completionDocObj)}
                  disabled={!completionDocObj || isDocumentsLoading}
                >
                  <Download className="size-4" /> Download
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleViewDocument(completionDocObj)}
                >
                  <Eye className="size-4" /> View
                </Button>
              </div>
            </div>
          </div>
        </div>
        <DocumentPreviewModal
          isOpen={previewModalOpen}
          onClose={() => {
            setPreviewModalOpen(false);
            setPreviewDocumentId(null);
          }}
          documentId={previewDocumentId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] font-bold text-primary">
          Nature Based Solutions
        </h1>
        <p className="text-[14px] font-medium text-muted-foreground mt-1">
          Manage and monitor Nature Based Solutions projects and budgets.
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
            NBS List
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={`flex cursor-pointer items-center gap-2 px-4 py-2 font-medium text-[14px] transition-colors rounded-[10px] ${
              activeTab === "new"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-muted border border-border"
            }`}
          >
            <Plus className="size-4" /> New Solution
          </button>
        </div>
      </div>

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
              <Spinner label="Loading solutions..." />
            </div>
          ) : isError ? (
            <div className="bg-card border border-border rounded-xl p-12 flex justify-center shadow-sm">
              <span className="text-destructive font-medium">
                Failed to load solutions. Please try again.
              </span>
            </div>
          ) : (
            <Table
              rowData={nbsList}
              columnDefs={columnDefs}
              totalCount={totalCount}
              page={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}
        </div>
      )}

      {activeTab === "new" && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-card border border-border rounded-xl p-6 shadow-sm"
        >
          <h2 className="text-[20px] font-semibold mb-6 text-primary">
            Add New Nature Based Solution
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-medium text-foreground mb-1">
                NBS Code
              </label>
              <Controller
                name="nbsCode"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter NBS Code"
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
                District
              </label>
              <Controller
                name="districtId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    className="w-full h-10 [&>.ant-select-selector]:rounded-[10px] text-[14px]"
                    placeholder={
                      isDistrictsLoading
                        ? "Loading districts..."
                        : "Select District"
                    }
                    disabled={isDistrictsLoading}
                    options={districtsList.map((district: any) => ({
                      value: district.id,
                      label: district.name,
                    }))}
                  />
                )}
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-foreground mb-1">
                Date of GR Issued
              </label>
              <Controller
                name="grIssuedDate"
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
                Allocated Budget
              </label>
              <Controller
                name="allocatedBudget"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    style={{ width: "100%" }}
                    className="w-full h-10 rounded-[10px] text-[14px] flex items-center"
                    placeholder="Enter Allocated Budget"
                  />
                )}
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-foreground mb-1">
                Utilized Budget
              </label>
              <Controller
                name="utilizedBudget"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    style={{ width: "100%" }}
                    className="w-full h-10 rounded-[10px] text-[14px] flex items-center"
                    placeholder="Enter Utilized Budget"
                  />
                )}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[14px] font-medium text-foreground mb-1">
                Date of Completion
              </label>
              <Controller
                name="completionDate"
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
                GR Issued Upload
              </label>
              <Controller
                name="grDocument"
                control={control}
                render={({ field }) => (
                  <FileUpload
                    variant="compact"
                    value={(field.value as File | null) ?? null}
                    onChange={field.onChange}
                    accept=".pdf,.doc,.docx,image/*"
                    buttonText="Select File"
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
                  <FileUpload
                    variant="compact"
                    value={(field.value as File | null) ?? null}
                    onChange={field.onChange}
                    accept=".pdf,.doc,.docx,image/*"
                    buttonText="Select File"
                  />
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
