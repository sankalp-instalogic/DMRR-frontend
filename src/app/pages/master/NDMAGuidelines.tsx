import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate"; // Adjust path as needed
import { Plus, Download, Eye } from "lucide-react"; // Added Eye icon here
import { Table } from "../../components/Table";
import dayjs from "dayjs";
import { DocumentPreviewModal } from "../../components/DocumentPreviewModal";
import type { ColDef } from "ag-grid-community";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import {
  Input as AntdInput,
  Select as AntdSelect,
  Checkbox as AntdCheckbox,
  DatePicker as AntdDatePicker,
} from "antd";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";

// --- TYPES ---
type FormValues = {
  code: string;
  title: string;
  disasterTypeId: string;
  ruleBody: string;
  version: string;
  effectiveDate: string;
  isActive: boolean;
};

export function NDMAGuidelines() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  // Table State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Add Guideline Modal & File States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Document Preview States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(
    null,
  );

  const form = useForm<FormValues>({
    defaultValues: {
      code: "",
      title: "",
      disasterTypeId: "",
      ruleBody: "",
      version: "",
      effectiveDate: "",
      isActive: true,
    },
  });

  // --- QUERIES ---

  // 1. Fetch Guidelines
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["ndma-guidelines", page, pageSize],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        "/api/v1/masters/ndma-guidelines",
        { params: { page, pageSize } },
      );
      return response.data;
    },
  });

  // 2. Fetch Disaster Types for Dropdown
  const { data: disasterData, isLoading: isDisastersLoading } = useQuery({
    queryKey: ["disaster-types-dropdown"],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        "/api/v1/masters/disaster-types",
        { params: { page: 1, pageSize: 100 } },
      );
      return response.data;
    },
  });

  const guidelines = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? data?.total ?? guidelines.length;
  const disasterTypes = disasterData?.items ?? [];

  const disasterMap = useMemo(() => {
    return Object.fromEntries(
      disasterTypes.map((disaster: any) => [disaster.id, disaster.name]),
    );
  }, [disasterTypes]);

  // --- MUTATIONS ---

  // 1. Upload Document Mutation
  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      ownerId,
    }: {
      file: File;
      ownerId: string;
      ownerType: string;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("ownerId", ownerId);
      formData.append("ownerType", "13");
      formData.append("documentType", "29");

      const response = await axiosPrivate.post(
        "/api/v1/Documents/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ndma-guidelines"] });
      closeModal();
    },
    onError: (err) => {
      console.error("Document upload failed:", err);
      queryClient.invalidateQueries({ queryKey: ["ndma-guidelines"] });
      closeModal();
    },
  });

  // 2. Add Text Data Mutation
  const addMutation = useMutation({
    mutationFn: async (newData: any) => {
      const response = await axiosPrivate.post(
        "/api/v1/masters/ndma-guidelines",
        newData,
        { headers: { "Content-Type": "application/json" } },
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.id && selectedFile) {
        uploadMutation.mutate({
          file: selectedFile,
          ownerId: data.id,
          ownerType: "NDMAGuideline",
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["ndma-guidelines"] });
        closeModal();
      }
    },
  });

  // --- HANDLERS ---

  const handleDownload = async (documentId: string, fallbackName: string) => {
    if (!documentId) return;
    try {
      const response = await axiosPrivate.get(
        `/api/v1/Documents/${documentId}/download`,
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      let fileName = `${fallbackName.replace(/\s+/g, "_")}_Document.pdf`;
      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch && fileNameMatch.length === 2) {
          fileName = fileNameMatch[1];
        }
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("File download failed:", error);
    }
  };

  const handlePreview = (documentId: string) => {
    if (!documentId) return;
    setPreviewDocumentId(documentId);
    setIsPreviewOpen(true);
  };

  const handleOpenAdd = () => {
    form.reset({
      code: "",
      title: "",
      disasterTypeId: "",
      ruleBody: "",
      version: "",
      effectiveDate: "",
      isActive: true,
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    form.reset();
  };

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      effectiveDate: data.effectiveDate
        ? new Date(data.effectiveDate).toISOString()
        : null,
    };
    addMutation.mutate(payload);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, "-");
  };

  // --- AG GRID COLUMN DEFINITIONS ---
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: "code", headerName: "Guideline Code", flex: 1 },
      {
        field: "title",
        headerName: "Title",
        flex: 2,
        tooltipField: "title",
      },
      {
        field: "disasterTypeId",
        headerName: "Category",
        flex: 1,
        cellRenderer: (params: any) => {
          const typeName =
            params.data.disasterType?.name || disasterMap[params.value] || "-";
          return (
            <span className="px-2 py-1 bg-secondary/20 text-secondary rounded-full text-xs">
              {typeName}
            </span>
          );
        },
      },
      {
        field: "version",
        headerName: "Version",
        flex: 0.5,
        cellRenderer: (params: any) => (
          <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs">
            v{params.value}
          </span>
        ),
      },
      {
        field: "effectiveDate",
        headerName: "Effective Date",
        flex: 1,
        cellRenderer: (params: any) => formatDate(params.value),
      },
      {
        headerName: "Actions",
        flex: 0.5,
        sortable: false,
        filter: false,
        pinned: "right",
        cellRenderer: (params: any) => {
          const isDownloadable = !!params.data.latestDocumentId;
          return (
            <div className="flex gap-2 mt-1">
              <button
                className="p-2 hover:bg-muted rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Preview"
                disabled={!isDownloadable}
                onClick={() => handlePreview(params.data.latestDocumentId)}
              >
                <Eye className="size-4" />
              </button>
              <button
                className="p-2 hover:bg-muted rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download"
                disabled={!isDownloadable}
                onClick={() =>
                  handleDownload(
                    params.data.latestDocumentId,
                    params.data.title,
                  )
                }
              >
                <Download className="size-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [disasterMap],
  );

  if (isLoading || isDisastersLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-25">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="text-red-500">⚠️</div>
            <div>
              <h3 className="font-semibold text-red-800">
                Something went wrong
              </h3>
              <p className="mt-1 text-sm text-red-600">
                {(error as Error).message}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[30px] font-bold text-primary">NDMA Guidelines</h1>
          <p className="text-sm text-muted-foreground">
            National Disaster Management Authority guidelines repository
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Plus className="size-5" /> Add Guideline
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <Table
          rowData={guidelines}
          columnDefs={columnDefs}
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* --- ADD MODAL --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Guideline</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4 py-4 md:grid-cols-2"
            >
              <FormField
                control={form.control}
                name="code"
                rules={{ required: "Guideline code is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guideline Code</FormLabel>
                    <FormControl>
                      <AntdInput placeholder="e.g. NDMA-FL-2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="version"
                rules={{ required: "Version is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version</FormLabel>
                    <FormControl>
                      <AntdInput placeholder="e.g. 1.0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                rules={{ required: "Title is required" }}
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <AntdInput
                        placeholder="Enter guideline title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="disasterTypeId"
                rules={{ required: "Disaster Category is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disaster Category</FormLabel>
                    <FormControl>
                      <AntdSelect
                        className="w-full"
                        placeholder="Select Disaster Type"
                        value={field.value || undefined}
                        onChange={field.onChange}
                        getPopupContainer={(trigger) =>
                          trigger.parentElement as HTMLElement
                        }
                        options={disasterTypes.map((type: any) => ({
                          label: type.name,
                          value: type.id,
                        }))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="effectiveDate"
                rules={{ required: "Effective Date is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective Date</FormLabel>
                    <FormControl>
                      <AntdDatePicker
                        className="w-full"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(_date, dateString) =>
                          field.onChange(dateString)
                        }
                        getPopupContainer={(trigger) =>
                          trigger.parentElement as HTMLElement
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ruleBody"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Rule Body / Description</FormLabel>
                    <FormControl>
                      <AntdInput.TextArea
                        {...field}
                        rows={3}
                        placeholder="Enter guideline details..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem className="md:col-span-2">
                <FormLabel>Upload Document (Optional)</FormLabel>
                <FormControl>
                  <AntdInput
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                </FormControl>
              </FormItem>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormControl>
                      <AntdCheckbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      >
                        Is Active?
                      </AntdCheckbox>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6 md:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="cursor-pointer"
                  disabled={addMutation.isPending || uploadMutation.isPending}
                >
                  {addMutation.isPending || uploadMutation.isPending
                    ? "Saving..."
                    : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* --- PREVIEW MODAL --- */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewDocumentId(null);
        }}
        documentId={previewDocumentId}
      />
    </div>
  );
}
