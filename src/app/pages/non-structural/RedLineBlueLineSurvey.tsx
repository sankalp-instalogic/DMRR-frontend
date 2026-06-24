import { useState, useMemo } from "react";
import { Plus, Eye, Download, ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import {
  Input,
  Select,
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

interface Survey {
  id?: string;
  surveyCode: string;
  title: string;
  districtId: string;
  grIssuedDate: string | null;
  allocatedBudget: number | string;
  utilizedBudget: number | string;
  completionDate: string | null;
  grDocument?: File | null;
  completionCertificate?: File | null;
}

interface PaginatedResponse {
  items: Survey[];
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

export function RedLineBlueLineSurvey() {
  const [activeTab, setActiveTab] = useState<"list" | "new">("list");
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

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
  } = useForm<Survey>({
    defaultValues: {
      surveyCode: "",
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
    queryKey: ["rlbl-surveys", page, pageSize],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/surveys/rlbl", {
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
    queryKey: ["documents", selectedSurvey?.id],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Documents/list", {
        params: { ownerType: "6", ownerId: selectedSurvey?.id },
      });
      return response.data;
    },
    enabled: !!selectedSurvey?.id,
  });

  const surveys = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 0;
  const districtsList = districtsData?.items || [];

  // Memoize districtMap so AG Grid columns don't unnecessarily re-render
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

  const grDocumentInfo = getDocumentByType("GRCopy");
  const completionDocInfo = getDocumentByType("CompletionReport");

  // --- MUTATIONS ---
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
      uploadData.append("ownerType", "6");
      uploadData.append("documentType", documentType);

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
      const response = await axiosPrivate.post(
        "/api/v1/surveys/rlbl",
        newData,
        { headers: { "Content-Type": "application/json" } },
      );
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
              documentType: "25",
            }),
          );
        }

        if (completionCertificateFile) {
          uploadPromises.push(
            uploadMutation.mutateAsync({
              file: completionCertificateFile,
              ownerId: responseData.id,
              documentType: "18",
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

      queryClient.invalidateQueries({ queryKey: ["rlbl-surveys"] });
      reset();
      setActiveTab("list");
    },
    onError: (err) => {
      console.error("Failed to save survey:", err);
    },
  });

  // --- HANDLERS ---
  const onSubmit = (formData: Survey) => {
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
      { headerName: "Survey Code", field: "surveyCode" },
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
        valueFormatter: (params) => formatDate(params.value),
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
        valueFormatter: (params) => formatDate(params.value),
      },
      {
        headerName: "Action",
        field: "id",
        sortable: false,
        filter: false,
        width: 120,
        cellRenderer: (params: any) => (
          <button
            onClick={() => setSelectedSurvey(params.data)}
            className="inline-flex cursor-pointer items-center gap-1.5 px-4 h-8 bg-white border border-[#0B1F4D] text-[#0B1F4D] rounded-[10px] hover:bg-blue-50 transition-colors text-[14px] font-medium mt-1.5"
          >
            <Eye className="size-4" />
            View
          </button>
        ),
      },
    ],
    [districtMap],
  );

  if (selectedSurvey) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedSurvey(null)}
            className="flex items-center gap-2 cursor-pointer bg-white border border-[#0B1F4D] text-[#0B1F4D] px-4 h-10 rounded-[10px] text-[14px] font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-[20px] font-semibold text-[#0B1F4D] mb-6 pb-4 border-b border-gray-200">
            Survey Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6">
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Survey Code
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {selectedSurvey.surveyCode}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                District
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {districtMap[selectedSurvey.districtId] ||
                  selectedSurvey.districtId}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Title
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {selectedSurvey.title}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Date of GR Issued
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {formatDate(selectedSurvey.grIssuedDate)}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Allocated Budget
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {formatCurrency(selectedSurvey.allocatedBudget)}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Utilized Budget
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {formatCurrency(selectedSurvey.utilizedBudget)}
              </p>
            </div>
            <div>
              <label className="text-[14px] font-medium text-gray-500 mb-1 block">
                Date of Completion
              </label>
              <p className="font-semibold text-[16px] text-[#0B1F4D]">
                {formatDate(selectedSurvey.completionDate)}
              </p>
            </div>

            <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-2"></div>

            <div>
              <label className="text-[16px] font-semibold text-[#0B1F4D] block mb-4">
                GR Issued{" "}
                {isDocumentsLoading && (
                  <span className="text-sm text-gray-400 font-normal ml-2">
                    (Loading...)
                  </span>
                )}
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload(grDocumentInfo)}
                  disabled={!grDocumentInfo || isDocumentsLoading}
                  className="flex cursor-pointer items-center gap-1.5 bg-[#0B1F4D] text-white px-4 h-10 rounded-[10px] text-[14px] font-medium hover:bg-[#0B1F4D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="size-4" /> Download
                </button>
              </div>
            </div>

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
                  onClick={() => handleDownload(completionDocInfo)}
                  disabled={!completionDocInfo || isDocumentsLoading}
                  className="flex cursor-pointer items-center gap-1.5 bg-[#0B1F4D] text-white px-4 h-10 rounded-[10px] text-[14px] font-medium hover:bg-[#0B1F4D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="size-4" /> Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] font-bold text-[#0B1F4D]">
          Red Line Blue Line Survey
        </h1>
        <p className="text-[14px] font-medium text-gray-500 mt-1">
          Manage and monitor Red Line Blue Line Survey activities.
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
            Survey List
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={`flex cursor-pointer items-center gap-2 px-4 py-2 font-medium text-[14px] transition-colors rounded-[10px] ${
              activeTab === "new"
                ? "bg-[#0B1F4D] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <Plus className="size-4" /> New Survey
          </button>
        </div>
      </div>

      {activeTab === "list" && (
        <div className="relative mb-6">
          {/* Faded Background Data Updater */}
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
                Loading surveys...
              </span>
            </div>
          ) : isError ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 flex justify-center shadow-sm">
              <span className="text-red-500 font-medium">
                Failed to load surveys. Please try again.
              </span>
            </div>
          ) : (
            <Table
              rowData={surveys}
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
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
        >
          <h2 className="text-[20px] font-semibold mb-6 text-[#0B1F4D]">
            Add New Survey
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
                Survey Code
              </label>
              <Controller
                name="surveyCode"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter Survey Code"
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
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
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
                    onChange={(date, dateString) => {
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
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
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
              <label className="block text-[14px] font-medium text-gray-700 mb-1">
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
                    onChange={(date, dateString) => {
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
                GR Issued Upload
              </label>
              <Controller
                name="grDocument"
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
