import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "./useAxiosPrivate";

/* ------------------------------------------------------------------ *
 * Types (loose; the .NET API serializes camelCase). Read defensively. *
 * ------------------------------------------------------------------ */
export interface MatchingProject {
  projectId?: string | null;
  title?: string | null;
  similarity: number;
  department?: string | null;
  snippet?: string | null;
}
export interface ExistenceResult {
  similarityScore: number;
  duplicateRisk: "High" | "Medium" | "Low" | string;
  matchingProjects: MatchingProject[];
  recommendations: string[];
}
export interface DimensionScore {
  dimension: string;
  score: number;
  rationale?: string | null;
}
export interface Citation {
  source?: string | null;
  snippet?: string | null;
  score: number;
}
export interface ReadinessResult {
  readinessScore: number;
  category: "Ready" | "Partially Ready" | "Not Ready" | string;
  dimensions: DimensionScore[];
  missingItems: string[];
  recommendations: string[];
  executiveSummary?: string | null;
  guidelinesUsed: Citation[];
}
export interface PreflightResult {
  canProceed: boolean;
  stage: "ExactDuplicate" | "AiDuplicate" | "ReadinessChecked" | string;
  blockReason?: string | null;
  exactDuplicate: boolean;
  existence?: ExistenceResult | null;
  readiness?: ReadinessResult | null;
  readinessPassed: boolean;
}

export interface PreflightPayload {
  proposalRefNo?: string | null;
  title?: string | null;
  financialYear: string;
  disasterTypeId?: string | null;
  districtId?: string | null;
  talukaId?: string | null;
  lineDepartmentId?: string | null;
  receivedFromSourceId?: string | null;
  proposalReceivedDate?: string | null;
  sourceName?: string | null;
  markedToAuthorityId?: string | null;
  dateReceivedByAuthority?: string | null;
  receivingOfficerId?: string | null;
  receivingOfficerName?: string | null;
  ndmaGuidelineId?: string | null;
  costOfProjectLakhs?: number | null;
  costEstimationLakhs?: number | null;
  forwardedToDepartmentId?: string | null;
  description?: string | null;
  documentTypeName: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
export interface ChatResult {
  answer: string;
  intent?: string | null;
  toolCalled?: string | null;
  projectData?: unknown;
  citations: Citation[];
  language?: string | null;
  sessionId?: string | null;
}

export interface IngestionRecord {
  id: string;
  documentId?: string | null;
  ownerType?: string | null;
  ownerId?: string | null;
  documentTypeName?: string | null;
  title: string;
  collection: string;
  status:
    | "Pending"
    | "Submitted"
    | "Processing"
    | "Ingested"
    | "Failed"
    | string;
  chunkCount: number;
  errorMessage?: string | null;
  submittedAtUtc?: string | null;
  completedAtUtc?: string | null;
  requestedBy?: string | null;
  createdAtUtc: string;
}

/* ------------------------------------------------------------------ *
 * 1. Pre-initiation gate: deterministic duplicate -> existence -> readiness
 * ------------------------------------------------------------------ */
export function useAiPreflight() {
  const axiosPrivate = useAxiosPrivate();
  return useMutation({
    mutationFn: async (args: {
      payload: PreflightPayload;
      file?: File | null;
    }): Promise<PreflightResult> => {
      // With a file, readiness is assessed against the actual document (bot OCRs it).
      if (args.file) {
        const fd = new FormData();
        fd.append("payload", JSON.stringify(args.payload));
        fd.append("file", args.file);
        const { data } = await axiosPrivate.post(
          "/api/v1/Ai/preflight-file",
          fd,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        return data;
      }
      // No file: readiness falls back to form-text assessment.
      const { data } = await axiosPrivate.post(
        "/api/v1/Ai/preflight",
        args.payload,
      );
      return data;
    },
  });
}

/* Build the aiAssessment object to persist with POST /api/v1/Proposals. */
export function toAiAssessment(r: PreflightResult | null) {
  if (!r) return null;
  return {
    existenceSimilarity: r.existence?.similarityScore ?? 0,
    existenceRisk: r.existence?.duplicateRisk ?? "Low",
    matchingProjects: r.existence?.matchingProjects ?? [],
    readinessScore: r.readiness?.readinessScore ?? 0,
    readinessCategory: r.readiness?.category ?? "Not Ready",
    readinessPassed: r.readinessPassed,
    dimensions: r.readiness?.dimensions ?? [],
    missingItems: r.readiness?.missingItems ?? [],
    recommendations: r.readiness?.recommendations ?? [],
    executiveSummary: r.readiness?.executiveSummary ?? null,
    guidelinesUsed: r.readiness?.guidelinesUsed ?? [],
  };
}

/* ------------------------------------------------------------------ *
 * 2. Chatbot (DMRR_Bot /ask via .NET)
 * ------------------------------------------------------------------ */
export function useAiAsk() {
  const axiosPrivate = useAxiosPrivate();
  return useMutation({
    mutationFn: async (req: {
      question: string;
      sessionId?: string | null;
      history?: ChatMessage[];
    }): Promise<ChatResult> => {
      const { data } = await axiosPrivate.post("/api/v1/Ai/ask", {
        question: req.question,
        sessionId: req.sessionId ?? null,
        history: req.history ?? [],
      });
      return data;
    },
  });
}

/* Optional direct checks (if you want them outside the gate). */
export function useExistenceCheck() {
  const axiosPrivate = useAxiosPrivate();
  return useMutation({
    mutationFn: async (req: {
      title: string;
      text: string;
      topK?: number;
    }): Promise<ExistenceResult> => {
      const { data } = await axiosPrivate.post(
        "/api/v1/Ai/existence/check",
        req,
      );
      return data;
    },
  });
}
export function useAssessProposal() {
  const axiosPrivate = useAxiosPrivate();
  return useMutation({
    mutationFn: async (req: {
      title: string;
      text: string;
      department?: string;
    }): Promise<ReadinessResult> => {
      const { data } = await axiosPrivate.post(
        "/api/v1/Ai/proposal/assess",
        req,
      );
      return data;
    },
  });
}

/* ------------------------------------------------------------------ *
 * 3. Document ingestion into the AI corpus + status tracking
 * ------------------------------------------------------------------ */
export function useIngestDocument() {
  const axiosPrivate = useAxiosPrivate();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: {
      documentId: string;
      collection: "projects" | "guidelines";
      text?: string;
      title?: string;
      department?: string;
    }): Promise<string> => {
      const { data } = await axiosPrivate.post(
        "/api/v1/ai/ingestions/document",
        req,
      );
      return data?.id as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai", "ingestions"] }),
  });
}

export function useIngestions(params?: {
  collection?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: ["ai", "ingestions", params],
    queryFn: async (): Promise<IngestionRecord[]> => {
      const { data } = await axiosPrivate.get("/api/v1/ai/ingestions", {
        params,
      });
      return data;
    },
  });
}

export function useAiHealth() {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: ["ai", "health"],
    queryFn: async () => {
      const { data } = await axiosPrivate.get("/api/v1/Ai/health");
      return data;
    },
  });
}
