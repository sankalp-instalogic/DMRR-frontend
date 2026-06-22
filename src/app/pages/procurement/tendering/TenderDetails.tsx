import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  XCircle,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

// Constants pulled from the reference component
const DOCUMENT_TYPES: Record<string, string> = {
  "Technical Bid Opening": "30",
  "Technical Evaluation": "31",
  "Financial Bid Opening": "32",
  "Financial Evaluation": "33",
  AOC: "34", // Added AOC mapping
};

// Added AOC to the end of the stage list
const stageList = [
  "Technical Bid Opening",
  "Technical Evaluation",
  "Financial Bid Opening",
  "Financial Evaluation",
  "AOC",
];

export function TenderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  // 1. Fetch Tender Basic Details
  const { data: tenderData, isLoading: isTenderLoading } = useQuery({
    queryKey: ["tender", id],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        `/api/v1/procurement-tenders/${id}`,
      );
      return response.data;
    },
    enabled: !!id, // Only fetch if ID exists
  });

  // 2. Fetch Document List for this Tender
  const { data: documentsData, isLoading: isDocsLoading } = useQuery({
    queryKey: ["tenderDocuments", id],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Documents/list", {
        params: { ownerType: "15", ownerId: id },
      });
      return response.data;
    },
    enabled: !!id,
  });

  // 3. Mutation for Project Closure
  const completeStageMutation = useMutation({
    mutationFn: async () => {
      // Assuming a POST request based on standard REST action routes.
      // Change to .put() or .patch() if your API requires it.
      const response = await axiosPrivate.post(
        `/api/v1/procurement-tenders/${id}/stages/complete`,
        { stageName: "Completed", documentId: null },
      );
      return response.data;
    },
    onSuccess: () => {
      // Redirect to the project closure route upon successful API execution
      navigate("/procurement-closure");
    },
    onError: (error) => {
      // Handle any API errors here (e.g., triggering a toast notification)
      console.error("Failed to mark project for closure:", error);
    },
  });

  // Helper function to find the corresponding document
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

  // Download Handler
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
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link
          to="/procurement-tendering/tenders"
          className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-[#0B1F4D]"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F4D] flex items-center gap-2">
            Tender Details
            {(isTenderLoading || isDocsLoading) && (
              <Loader2 className="size-5 animate-spin text-gray-400" />
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            View details and documents for the selected tender
          </p>
        </div>
      </div>

      {/* Basic Information Section */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-gray-50/50">
          <h2 className="text-lg font-semibold text-[#0B1F4D]">
            Basic Information
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Organization Chain
              </label>
              <input
                type="text"
                value={tenderData?.organizationChain || ""}
                readOnly
                placeholder={isTenderLoading ? "Loading..." : "N/A"}
                className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Tender Title
              </label>
              <input
                type="text"
                value={tenderData?.tenderTitle || ""}
                readOnly
                placeholder={isTenderLoading ? "Loading..." : "N/A"}
                className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Tender Ref No
              </label>
              <input
                type="text"
                value={tenderData?.tenderRefNo || ""}
                readOnly
                placeholder={isTenderLoading ? "Loading..." : "N/A"}
                className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Tender Code / ID
              </label>
              <input
                type="text"
                value={tenderData?.tenderCode || id || ""}
                readOnly
                placeholder={isTenderLoading ? "Loading..." : "N/A"}
                className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tender Process Tracking Table */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-gray-50/50">
          <h2 className="text-lg font-semibold text-[#0B1F4D]">
            Tender Process Tracking
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Stages</th>
                <th className="px-6 py-3 font-medium text-center">Status</th>
                <th className="px-6 py-3 font-medium text-center">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* Process 1 (Technical) */}
              <tr className="bg-gray-50/30">
                <td
                  colSpan={3}
                  className="px-6 py-2 font-medium text-[#0B1F4D] text-xs uppercase tracking-wider"
                >
                  Process 1
                </td>
              </tr>
              {stageList.slice(0, 2).map((stage, index) => {
                const doc = getDocumentForStage(stage);
                return (
                  <tr
                    key={`p1-${index}`}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 pl-10 font-medium">{stage}</td>
                    <td className="px-6 py-4 text-center">
                      {doc ? (
                        <CheckCircle2 className="size-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="size-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDownload(doc)}
                        disabled={!doc}
                        className="p-2 inline-flex justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-[#0B1F4D] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Download Document"
                      >
                        <Download className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {/* Process 2 (Financial) */}
              <tr className="bg-gray-50/30">
                <td
                  colSpan={3}
                  className="px-6 py-2 font-medium text-[#0B1F4D] text-xs uppercase tracking-wider"
                >
                  Process 2
                </td>
              </tr>
              {stageList.slice(2, 4).map((stage, index) => {
                const doc = getDocumentForStage(stage);
                return (
                  <tr
                    key={`p2-${index}`}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 pl-10 font-medium">{stage}</td>
                    <td className="px-6 py-4 text-center">
                      {doc ? (
                        <CheckCircle2 className="size-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="size-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDownload(doc)}
                        disabled={!doc}
                        className="p-2 inline-flex justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-[#0B1F4D] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Download Document"
                      >
                        <Download className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {/* Process 3 (AOC) */}
              {stageList.slice(4).map((stage, index) => {
                const doc = getDocumentForStage(stage);
                return (
                  <tr
                    key={`p3-${index}`}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 pl-10 font-medium">{stage}</td>
                    <td className="px-6 py-4 text-center">
                      {doc ? (
                        <CheckCircle2 className="size-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="size-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDownload(doc)}
                        disabled={!doc}
                        className="p-2 inline-flex justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-[#0B1F4D] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Download Document"
                      >
                        <Download className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-white p-4 border-t border-border shadow-lg z-10 -mx-6 -mb-6 px-6">
        <button
          onClick={() => navigate("/procurement-tendering/tenders")}
          className="px-6 py-2 cursor-pointer bg-muted text-[#0B1F4D] rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => completeStageMutation.mutate()}
          disabled={completeStageMutation.isPending}
          className="px-6 py-2 flex items-center gap-2 cursor-pointer bg-[#0B1F4D] text-white rounded-lg text-sm font-medium hover:bg-[#0B1F4D]/80 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {completeStageMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Mark for Closure"
          )}
        </button>
      </div>
    </div>
  );
}
