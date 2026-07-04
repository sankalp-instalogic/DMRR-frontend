import { useState, useMemo, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Eye, Download, ArrowLeft, Plus, FileText } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import type { ColDef } from "ag-grid-community";
import { Table } from "../../components/Table";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import { Input, Select, DatePicker } from "antd";
import { DocumentPreviewModal } from "../../components/DocumentPreviewModal";
import dayjs from "dayjs";
import formattedDate from "../../../utils/dateFormatter";
import { DocumentOwnerType, DocumentType } from "../../../../constants/documents";

// Defined the shape of the payload based on your form
interface FundRecord {
  id?: string;
  districtId: string;
  issuingDate: string;
  allocatedLakhs: number;
  utilizedLakhs: number;
}

interface PaginatedResponse {
  items: FundRecord[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// React Hook Form interface
interface AllocationFormValues {
  allocatedLakhs: string;
  districtId: string;
  issuingDate: string;
  utilizedLakhs: string;
}

export function FundsDistributedDistricts() {
  const [activeTab, setActiveTab] = useState<"overview" | "new" | "view">(
    "overview",
  );
  const [viewRecord, setViewRecord] = useState<FundRecord | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // File upload state
  const [utilizationCertificate, setUtilizationCertificate] =
    useState<File | null>(null);

  // --- NEW: Modal State ---
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  // Initialize React Hook Form
  const form = useForm<AllocationFormValues>({
    defaultValues: {
      allocatedLakhs: "",
      districtId: "",
      issuingDate: "",
      utilizedLakhs: "",
    },
  });

  // --- QUERIES ---

  // 1. Fetch Funds List
  const { data, isLoading, isError, isFetching } = useQuery<PaginatedResponse>({
    queryKey: ["funds-distributed", page, pageSize],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/funds/districts", {
        params: { page, pageSize },
      });
      return response.data;
    },
  });

  // 2. Fetch Districts for Dropdown and Mapping
  const { data: districtsData, isLoading: isDistrictsLoading } = useQuery({
    queryKey: ["districts"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/districts", {
        params: { page: 1, pageSize: 100 },
      });
      return response.data;
    },
  });

  // 3. Fetch Document for View Tab
  const { data: documentsData, isLoading: isDocumentsLoading } = useQuery({
    queryKey: ["documents", viewRecord?.id],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Documents/list", {
        params: { ownerType: String(DocumentOwnerType.Fund), ownerId: viewRecord?.id },
      });
      return response.data;
    },
    enabled: !!viewRecord?.id,
  });

  const records = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 0;
  const districtsList = districtsData?.items || [];

  // Memoized District Map for AG Grid Lookups
  const districtMap = useMemo(() => {
    if (isDistrictsLoading || !districtsData?.items)
      return {} as Record<string, string>;
    return Object.fromEntries(
      districtsData.items.map((district: any) => [district.id, district.name]),
    );
  }, [districtsData, isDistrictsLoading]);

  // --- AG GRID COLUMN DEFINITIONS ---
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Sr No",
        valueGetter: (params) => {
          if (
            params.node?.rowIndex !== null &&
            params.node?.rowIndex !== undefined
          ) {
            return (page - 1) * pageSize + params.node.rowIndex + 1;
          }
          return "";
        },
        width: 90,
      },
      {
        headerName: "District",
        valueGetter: (params) =>
          districtMap[params.data?.districtId] || params.data?.districtId,
        flex: 1,
      },
      {
        headerName: "Date of Issuing",
        field: "issuingDate",
        valueFormatter: (params) =>formattedDate(params.value) ,
        flex: 1,
      },
      {
        headerName: "Utilized Amount",
        field: "utilizedLakhs",
        valueFormatter: (params) => `₹${params.value} Lakhs`,
        flex: 1,
      },
      {
        headerName: "Action",
        cellRenderer: (params: any) => (
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
        width: 130,
        sortable: false,
        filter: false,
      },
    ],
    [page, pageSize, districtMap],
  );

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
      uploadData.append("ownerType", String(DocumentOwnerType.Fund));
      uploadData.append("documentType", String(DocumentType.UtilizationCertificate));

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

  const addMutation = useMutation({
    mutationFn: async (newData: any) => {
      const response = await axiosPrivate.post(
        "/api/v1/funds/districts",
        newData,
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      return response.data;
    },
    onSuccess: async (responseData) => {
      if (responseData?.id && utilizationCertificate) {
        try {
          await uploadMutation.mutateAsync({
            file: utilizationCertificate,
            ownerId: responseData.id,
          });
        } catch (err) {
          console.error("Document upload failed:", err);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["funds-distributed"] });
      resetForm();
      setActiveTab("overview");
    },
    onError: (err) => {
      console.error("Failed to save record:", err);
    },
  });

  // --- HANDLERS ---

  const handleView = (record: FundRecord) => {
    setViewRecord(record);
    setActiveTab("view");
  };

  const resetForm = () => {
    form.reset();
    setUtilizationCertificate(null);
  };

  const onSubmit = (data: AllocationFormValues) => {
    const payload = {
      districtId: data.districtId,
      allocatedLakhs: Number(data.allocatedLakhs),
      utilizedLakhs: Number(data.utilizedLakhs),
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] font-bold text-primary">
          Funds Distributed to Districts
        </h1>
        <p className="text-[14px] font-medium text-muted-foreground mt-1">
          Manage and track funds allocated to districts
        </p>
      </div>

      {activeTab !== "view" && (
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-medium text-[14px] cursor-pointer transition-colors rounded-[10px] ${
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
            className={`px-4 py-2 cursor-pointer font-medium text-[14px] transition-colors rounded-[10px] ${
              activeTab === "new"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-muted border border-border"
            }`}
          >
            New Allocation
          </button>
        </div>
      )}

      {activeTab === "overview" && (
        <div className="relative mb-6">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-card/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
              <div className="bg-card px-4 py-2 rounded-lg shadow-sm border border-border">
                <Spinner iconClassName="size-6" label="Updating..." />
              </div>
            </div>
          )}

          <div className="flex justify-end mb-4"></div>

          {isLoading ? (
            <div className="p-8 flex justify-center bg-card rounded-xl border border-border">
              <Spinner label="Loading records..." />
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-destructive font-medium bg-card rounded-xl border border-border">
              Failed to load records.
            </div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground font-medium bg-card rounded-xl border border-border">
              No records found. Click "New Allocation" to add one.
            </div>
          ) : (
            <Table
              rowData={records}
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
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-[20px] font-semibold text-primary mb-6">
            New District Allocation
          </h2>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Funds Allocated */}
              <Controller
                control={form.control}
                name="allocatedLakhs"
                rules={{
                  required: "Allocated amount is required",
                  min: { value: 0, message: "Cannot be negative" },
                }}
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col gap-1">
                    <label className="text-[14px] font-medium text-foreground">
                      Funds Allocated (Lakhs)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter allocated amount"
                      className="h-10 rounded-[10px] text-[14px]"
                      status={error ? "error" : undefined}
                      min={0}
                      max={50}
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

              {/* District Select */}
              <Controller
                control={form.control}
                name="districtId"
                rules={{ required: "Please select a district" }}
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col gap-1">
                    <label className="text-[14px] font-medium text-foreground">
                      To District
                    </label>
                    <Select
                      className="h-10 [&>.ant-select-selector]:rounded-[10px] text-[14px]"
                      value={field.value || undefined}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder={
                        isDistrictsLoading ? "Loading..." : "Select District"
                      }
                      options={districtsList.map((d: any) => ({
                        label: d.name,
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

              {/* Funds Utilized */}
              <Controller
                control={form.control}
                name="utilizedLakhs"
                rules={{
                  required: "Utilized amount is required",
                  min: { value: 0, message: "Cannot be negative" },
                }}
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col gap-1">
                    <label className="text-[14px] font-medium text-foreground">
                      Funds Utilized (Lakhs)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter utilized amount"
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

              {/* Custom File Upload UI */}
              <div className="space-y-2 md:col-span-2 mt-2">
                <label className="text-[14px] font-medium text-foreground">
                  Utilization Certificate Upload
                </label>
                <div className="border-2 border-dashed border-border rounded-[10px] p-6 text-center hover:bg-muted transition-colors">
                  <input
                    type="file"
                    className="hidden"
                    id="gr-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) =>
                      setUtilizationCertificate(e.target.files?.[0] || null)
                    }
                  />
                  <label
                    htmlFor="gr-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Plus className="size-6 text-primary mb-2" />
                    <span className="text-[14px] font-medium text-primary">
                      {utilizationCertificate
                        ? utilizationCertificate.name
                        : "Click to upload Utilization Certificate Document"}
                    </span>
                    <span className="text-[12px] text-muted-foreground mt-1">
                      Accepts PDF, DOC, DOCX
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setActiveTab("overview")}
                className="px-4 h-10 cursor-pointer border-primary text-primary rounded-[10px]"
              >
                Cancel
              </Button>
              <Button
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

          <div
            ref={printRef}
            className="bg-card rounded-xl shadow-sm border border-border p-6"
          >
            <h2 className="text-[20px] font-semibold text-primary mb-6 pb-4 border-b border-border">
              Allocation Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-6">
              <div>
                <p className="text-[14px] font-medium text-muted-foreground mb-1">
                  Budget Utilized
                </p>
                <p className="font-semibold text-[16px] text-primary">
                  ₹{viewRecord.utilizedLakhs} L
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
              <div>
                <p className="text-[14px] font-medium text-muted-foreground mb-1">
                  District
                </p>
                <p className="font-semibold text-[16px] text-primary">
                  {districtMap[viewRecord.districtId] || viewRecord.districtId}
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
                      {utilDoc.fileName || "Utilization Certificate.pdf"}
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
                    {/* --- NEW: Wired the View button to set isPreviewOpen to true --- */}
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
                  No document available for this allocation.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- NEW: Render the modal at the root of the component --- */}
      <DocumentPreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        documentId={utilDoc?.id || null} 
      />
    </div>
  );
}