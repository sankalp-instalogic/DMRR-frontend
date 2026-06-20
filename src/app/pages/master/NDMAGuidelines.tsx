import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate"; // Adjust path as needed
import { Plus, Download } from "lucide-react"; // Removed FileText

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export function NDMAGuidelines() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  // Table State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Modal & File States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form State for Add
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    disasterTypeId: "",
    ruleBody: "",
    version: "",
    effectiveDate: "",
    isActive: true,
  });

  // --- QUERIES ---

  // 1. Fetch Guidelines
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["ndma-guidelines", page, pageSize],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        "/api/v1/masters/ndma-guidelines",
        {
          params: { page, pageSize },
        },
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
        {
          params: { page: 1, pageSize: 100 },
        },
      );
      return response.data;
    },
  });

  const guidelines = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.total ?? 0;
  const disasterTypes = disasterData?.items ?? [];

  const disasterMap = isDisastersLoading
    ? {}
    : Object.fromEntries(
        disasterTypes.map((disaster: any) => [disaster.id, disaster.name]),
      );

  // --- MUTATIONS ---

  // 2. Upload Document Mutation
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
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
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

  // 1. Add Text Data Mutation
  const addMutation = useMutation({
    mutationFn: async (newData: any) => {
      const response = await axiosPrivate.post(
        "/api/v1/masters/ndma-guidelines",
        newData,
        {
          headers: { "Content-Type": "application/json" },
        },
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

  // Handle File Download
  const handleDownload = async (documentId: string, fallbackName: string) => {
    if (!documentId) return;

    try {
      const response = await axiosPrivate.get(
        `/api/v1/Documents/${documentId}/download`,
        {
          responseType: "blob", // Important: Tells axios to handle binary data
        }
      );

      // Create a URL for the downloaded blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Attempt to extract filename from headers, otherwise use a fallback
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
      
      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("File download failed:", error);
      // You might want to add a toast/alert notification here
    }
  };

  const handleOpenAdd = () => {
    setFormData({
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
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      effectiveDate: formData.effectiveDate
        ? new Date(formData.effectiveDate).toISOString()
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-100">
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
          <h1>NDMA Guidelines</h1>
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Guideline Code
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Version
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Effective Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {guidelines.map((guideline: any) => (
                <tr
                  key={guideline.id || guideline.code}
                  className="border-t border-border hover:bg-muted/50"
                >
                  <td className="px-6 py-4 font-medium font-mono text-sm">
                    {guideline.code}
                  </td>
                  <td
                    className="px-6 py-4 max-w-xs truncate"
                    title={guideline.title}
                  >
                    {guideline.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-secondary/20 text-secondary rounded-full text-xs">
                      {guideline.disasterType?.name ||
                        disasterMap[guideline.disasterTypeId] ||
                        "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs">
                      v{guideline.version}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {formatDate(guideline.effectiveDate)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {/* Removed the Preview button and wired up the Download button */}
                      <button
                        className="p-2 hover:bg-muted rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Download"
                        disabled={!guideline.latestDocumentId}
                        onClick={() => handleDownload(guideline.latestDocumentId, guideline.title)}
                      >
                        <Download className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {guidelines.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No guidelines found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {guidelines.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <span className="text-sm text-muted-foreground">
              Total Records: {totalCount}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* --- ADD MODAL --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Guideline</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSave}
            className="grid gap-4 py-4 md:grid-cols-2"
          >
            <div className="space-y-2">
              <Label htmlFor="code">Guideline Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="e.g. NDMA-FL-2024"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) =>
                  setFormData({ ...formData, version: e.target.value })
                }
                placeholder="e.g. 1.0"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="disasterType">Disaster Category</Label>
              <select
                id="disasterType"
                value={formData.disasterTypeId}
                onChange={(e) =>
                  setFormData({ ...formData, disasterTypeId: e.target.value })
                }
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>
                  Select Disaster Type
                </option>
                {disasterTypes.map((type: any) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="effectiveDate">Effective Date</Label>
              <Input
                id="effectiveDate"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) =>
                  setFormData({ ...formData, effectiveDate: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="ruleBody">Rule Body / Description</Label>
              <textarea
                id="ruleBody"
                value={formData.ruleBody}
                onChange={(e) =>
                  setFormData({ ...formData, ruleBody: e.target.value })
                }
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="document">Upload Document (Optional)</Label>
              <Input
                id="document"
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
            </div>

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
        </DialogContent>
      </Dialog>
    </div>
  );
}