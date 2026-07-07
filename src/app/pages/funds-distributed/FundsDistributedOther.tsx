import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Eye, Download, ArrowLeft, FileText } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { queryClient } from "../../App";
import { Table } from "../../components/Table";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { Input, Select, DatePicker } from "antd";
import dayjs from "dayjs";
import { DocumentPreviewModal } from "../../components/DocumentPreviewModal";
import { FileUpload } from "../../components/FileUpload";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import formattedDate from "../../../utils/dateFormatter";
import { DocumentOwnerType, DocumentType } from "../../../../constants/documents";

type RecordType = {
  id: string;
  lineDepartmentId: string;
  utilizationHead?: string;
  allocatedCr: number;
  utilizedCr: number;
  issuingDate: string;
};

// React Hook Form interface
interface UtilizationFormValues {
  lineDepartmentId: string;
  utilizationHead: string;
  allocatedCr: string;
  utilizedCr: string;
  issuingDate: string;
}

export function FundsDistributedOther() {
  const axiosPrivate = useAxiosPrivate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [activeTab, setActiveTab] = useState<"overview" | "new" | "view">(
    "overview",
  );
  const [viewRecord, setViewRecord] = useState<RecordType | null>(null);

  // Pagination states for the Table component
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Initialize React Hook Form
  const form = useForm<UtilizationFormValues>({
    defaultValues: {
      lineDepartmentId: "",
      utilizationHead: "",
      allocatedCr: "",
      utilizedCr: "",
      issuingDate: "",
    },
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // 1. Fetch Departments for Dropdown and Mapping
  const { data: deptData, isLoading: isDepartmentsLoading } = useQuery({
    queryKey: ["departments-dropdown"],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        "/api/v1/masters/line-departments",
        {
          params: { page: 1, pageSize: 100 },
        },
      );
      return response.data;
    },
  });

  const departments = deptData?.items ?? [];
  const departmentsMap = isDepartmentsLoading
    ? {}
    : Object.fromEntries(departments.map((dept: any) => [dept.id, dept.name]));

  // 2. Fetch Utilizations
  const {
    data: utilsData,
    isLoading: isUtilsLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["utilizations", page],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/funds/utilizations", {
        params: { page, pageSize },
      });
      return response.data;
    },
  });

  const records: RecordType[] = utilsData?.items || utilsData || [];
  const totalCount = utilsData?.totalCount || records.length;
  const totalPages =
    utilsData?.totalPages || Math.ceil(totalCount / pageSize) || 1;

  // 3. Fetch Document for View Tab
  const { data: documentsData, isLoading: isDocumentsLoading } = useQuery({
    queryKey: ["documents-other", viewRecord?.id],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Documents/list", {
        params: { ownerType: String(DocumentOwnerType.FundsOthers), ownerId: viewRecord?.id },
      });
      return response.data;
    },
    enabled: !!viewRecord?.id,
  });

  const getDocument = () => {
    const docs = Array.isArray(documentsData)
      ? documentsData
      : documentsData?.items || [];
    return docs.length > 0 ? docs[0] : null;
  };
  const utilDoc = getDocument();

  // --- MUTATIONS ---
  const uploadMutation = useMutation({
    mutationFn: async ({ file, ownerId }: { file: File; ownerId: string }) => {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("ownerId", ownerId);
      uploadData.append("ownerType", String(DocumentOwnerType.FundsOthers));
      uploadData.append("documentType", String(DocumentType.UtilizationCertificate));

      return await axiosPrivate.post("/api/v1/Documents/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newData: any) => {
      const response = await axiosPrivate.post(
        "/api/v1/funds/utilizations",
        newData,
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      return response.data;
    },
    onSuccess: async (responseData) => {
      if (responseData?.id && selectedFile) {
        try {
          await uploadMutation.mutateAsync({
            file: selectedFile,
            ownerId: responseData.id,
          });
        } catch (err) {
          console.error("Document upload failed:", err);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["utilizations"] });

      resetForm();
      setActiveTab("overview");
    },
  });

  // --- HANDLERS ---
  const handleView = (record: RecordType) => {
    setViewRecord(record);
    setActiveTab("view");
  };

  const resetForm = () => {
    form.reset();
    setSelectedFile(null);
  };

  const onSubmit = (data: UtilizationFormValues) => {
    const payload = {
      lineDepartmentId: data.lineDepartmentId,
      utilizationHead: data.utilizationHead,
      allocatedCr: Number(data.allocatedCr),
      utilizedCr: Number(data.utilizedCr),
      issuingDate: data.issuingDate
        ? new Date(data.issuingDate).toISOString()
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

  // --- AG GRID COLUMN DEFINITIONS ---
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Sr No",
        valueGetter: (params) =>
          (params.node?.rowIndex ?? 0) + 1 + (page - 1) * pageSize,
        width: 80,
      },
      {
        headerName: "Utilization Department",
        valueGetter: (params) =>
          departmentsMap[params.data.lineDepartmentId] || "Unknown Dept",
        flex: 1,
      },
      {
        headerName: "Utilization Head",
        field: "utilizationHead",
        valueFormatter: (params) => params.value || "-",
        flex: 1,
      },
      {
        headerName: "Allocated Amount",
        field: "allocatedCr",
        valueFormatter: (params) => `₹${(params.value || 0).toFixed(2)} Cr`,
        flex: 1,
      },
      {
        headerName: "Utilized Amount",
        field: "utilizedCr",
        valueFormatter: (params) => `₹${(params.value || 0).toFixed(2)} Cr`,
        flex: 1,
      },
      {
        headerName: "Date of Issuing",
        field: "issuingDate",
        valueFormatter: (params) => formattedDate(params.value),
        flex: 1,
      },
      {
        headerName: "Action",
        cellRenderer: (params: ICellRendererParams) => (
          <div className="flex h-full items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleView(params.data)}
              className="text-primary hover:bg-info-muted hover:text-primary cursor-pointer"
              title="View"
            >
              <Eye className="size-4" />
            </Button>
          </div>
        ),
        sortable: false,
        filter: false,
        width: 130,
      },
    ],
    [departmentsMap, page, pageSize],
  );

  if (isUtilsLoading) {
    return <Spinner fullPage />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-destructive-border bg-destructive-muted p-4 shadow-sm">
          <h3 className="font-semibold text-destructive-muted-foreground">Something went wrong</h3>
          <p className="mt-1 text-sm text-destructive">
            {(error as Error).message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] font-bold text-primary">
          Funds Distributed to Other Utilizations
        </h1>
        <p className="text-[14px] font-medium text-muted-foreground mt-1">
          Manage and track funds allocated for various specific heads
        </p>
      </div>

      {activeTab !== "view" && (
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-medium text-[14px] transition-colors rounded-[10px] cursor-pointer ${
              activeTab === "overview"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-muted border border-border"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => {
              resetForm();
              setActiveTab("new");
            }}
            className={`px-4 py-2 font-medium text-[14px] transition-colors rounded-[10px] cursor-pointer ${
              activeTab === "new"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-muted border border-border"
            }`}
          >
            New Utilization
          </button>
        </div>
      )}

      {activeTab === "overview" && (
        <div className="mb-6">
          <Table
            rowData={records}
            columnDefs={columnDefs}
            totalCount={totalCount}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {activeTab === "new" && (
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-[20px] font-semibold text-primary mb-6">
            New Utilization
          </h2>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Department Select */}
              <Controller
                control={form.control}
                name="lineDepartmentId"
                rules={{ required: "Please select a department" }}
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col gap-1">
                    <label className="text-[14px] font-medium text-foreground">
                      Utilization Department
                    </label>
                    <Select
                      className="h-10 [&>.ant-select-selector]:rounded-[10px] text-[14px]"
                      value={field.value || undefined}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder={
                        isDepartmentsLoading
                          ? "Loading..."
                          : "Select Department"
                      }
                      options={departments.map((d: any) => ({
                        label: `${d.name} ${d.code ? `(${d.code})` : ""}`,
                        value: d.id,
                      }))}
                      status={error ? "error" : undefined}
                    />
                    {error && (
                      <span className="text-[12px] text-destructive mt-1">
                        {error.message}
                      </span>
                    )}
                  </div>
                )}
              />

              {/* Utilization Head */}
              <Controller
                control={form.control}
                name="utilizationHead"
                rules={{ required: "Utilization Head is required" }}
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col gap-1">
                    <label className="text-[14px] font-medium text-foreground">
                      Utilization Head
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter utilization head"
                      className="h-10 rounded-[10px] text-[14px]"
                      status={error ? "error" : undefined}
                      {...field}
                    />
                    {error && (
                      <span className="text-[12px] text-destructive mt-1">
                        {error.message}
                      </span>
                    )}
                  </div>
                )}
              />

              {/* Issuing Date */}
              <Controller
                control={form.control}
                name="issuingDate"
                rules={{ required: "Issuing date is required" }}
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col gap-1">
                    <label className="text-[14px] font-medium text-foreground">
                      Issuing Date
                    </label>
                    <DatePicker
                      className="w-full h-10 rounded-[10px] text-[14px]"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(_date, dateString) =>
                        field.onChange(dateString)
                      }
                      onBlur={field.onBlur}
                      status={error ? "error" : undefined}
                    />
                    {error && (
                      <span className="text-[12px] text-destructive mt-1">
                        {error.message}
                      </span>
                    )}
                  </div>
                )}
              />

              {/* Budget Allocated */}
              <Controller
                control={form.control}
                name="allocatedCr"
                rules={{
                  required: "Allocated amount is required",
                  min: { value: 0, message: "Cannot be negative" },
                }}
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col gap-1">
                    <label className="text-[14px] font-medium text-foreground">
                      Budget Allocated (Cr)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter allocated amount in Cr"
                      className="h-10 rounded-[10px] text-[14px]"
                      status={error ? "error" : undefined}
                      min={0}
                      {...field}
                    />
                    {error && (
                      <span className="text-[12px] text-destructive mt-1">
                        {error.message}
                      </span>
                    )}
                  </div>
                )}
              />

              {/* Budget Utilized */}
              <Controller
                control={form.control}
                name="utilizedCr"
                rules={{
                  required: "Utilized amount is required",
                  min: { value: 0, message: "Cannot be negative" },
                }}
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col gap-1">
                    <label className="text-[14px] font-medium text-foreground">
                      Budget Utilized (Cr)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter utilized amount in Cr"
                      className="h-10 rounded-[10px] text-[14px]"
                      status={error ? "error" : undefined}
                      min={0}
                      {...field}
                    />
                    {error && (
                      <span className="text-[12px] text-destructive mt-1">
                        {error.message}
                      </span>
                    )}
                  </div>
                )}
              />

              {/* File Upload */}
              <div className="space-y-2 md:col-span-2 mt-2">
                <label className="text-[14px] font-medium text-foreground">
                  Utilization Certificate Upload
                </label>
                <FileUpload
                  variant="compact"
                  value={selectedFile}
                  onChange={setSelectedFile}
                  accept=".pdf,.doc,.docx,image/*"
                  buttonText="Select File"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("overview")}
                className="px-4 h-10 border-primary text-primary rounded-[10px] cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addMutation.isPending || uploadMutation.isPending}
                className="px-4 h-10 rounded-[10px] cursor-pointer"
              >
                {addMutation.isPending || uploadMutation.isPending ? (
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
        </div>
      )}

      {activeTab === "view" && viewRecord && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="link"
              onClick={() => setActiveTab("overview")}
              className="px-0 text-muted-foreground hover:text-primary no-underline hover:no-underline cursor-pointer"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-[20px] font-semibold text-primary mb-6 pb-4 border-b border-border">
              Utilization Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-6">
              <div>
                <p className="text-[14px] font-medium text-muted-foreground mb-1">
                  Utilization Department
                </p>
                <p className="font-semibold text-[16px] text-primary">
                  {departmentsMap[viewRecord.lineDepartmentId] ||
                    "Unknown Dept"}
                </p>
              </div>
              <div>
                <p className="text-[14px] font-medium text-muted-foreground mb-1">
                  Utilization Head
                </p>
                <p className="font-semibold text-[16px] text-primary">
                  {viewRecord.utilizationHead || "-"}
                </p>
              </div>
              <div>
                <p className="text-[14px] font-medium text-muted-foreground mb-1">
                  Allocated Amount
                </p>
                <p className="font-semibold text-[16px] text-primary">
                  ₹{((viewRecord.allocatedCr || 0) / 100).toFixed(2)} Cr
                </p>
              </div>
              <div>
                <p className="text-[14px] font-medium text-muted-foreground mb-1">
                  Utilized Amount
                </p>
                <p className="font-semibold text-[16px] text-primary">
                  ₹{((viewRecord.utilizedCr || 0) / 100).toFixed(2)} Cr
                </p>
              </div>
              <div>
                <p className="text-[14px] font-medium text-muted-foreground mb-1">
                  Date of Issuing
                </p>
                <p className="font-semibold text-[16px] text-primary">
                  {formattedDate(viewRecord.issuingDate)}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-[16px] font-semibold text-primary mb-4">
                Utilization Certificate
                {isDocumentsLoading && (
                  <Spinner iconClassName="size-4" className="ml-2 inline-flex" />
                )}
              </p>

              {utilDoc ? (
                <div className="flex items-center gap-4 p-4 border border-border rounded-[10px] bg-muted/50">
                  <FileText className="size-8 text-destructive" />
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-primary">
                      {utilDoc.fileName || "Utilization_Certificate.pdf"}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      size="lg"
                      onClick={() => handleDownload(utilDoc)}
                      className="cursor-pointer"
                    >
                      <Download className="size-4" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setIsPreviewOpen(true)}
                      className="cursor-pointer"
                    >
                      <Eye className="size-4" />
                      View
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-[14px] text-muted-foreground italic">
                  No document available for this utilization.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        documentId={utilDoc?.id || null}
      />
    </div>
  );
}
