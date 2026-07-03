import { useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircle2, ArrowRight, ArrowLeft, Send } from "lucide-react";
import toast from "react-hot-toast";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import {
  useAiPreflight,
  useIngestDocument,
  toAiAssessment,
  type PreflightResult,
} from "../../hooks/useAi";

import { ProposalStepper } from "./proposalInitialiation/ProposalStepper";
import { LocationStep } from "./proposalInitialiation/LocationStep";
import { OfficersStep } from "./proposalInitialiation/OfficerStep";
import { NdmaReferenceStep } from "./proposalInitialiation/NdmaReferenceStep";
import { DocumentsStep } from "./proposalInitialiation/DocumentStep";

function currentFinancialYear(): string {
  const now = new Date();
  const y = now.getFullYear();
  const startYear = now.getMonth() >= 3 ? y : y - 1;
  const endYY = String((startYear + 1) % 100).padStart(2, "0");
  return `${startYear}-${endYY}`;
}

export function ProposalInitiationWizard() {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const preflight = useAiPreflight();
  const ingestDocument = useIngestDocument();
  const [aiResult, setAiResult] = useState<PreflightResult | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ndmaValidationStatus, setNdmaValidationStatus] = useState<
    "idle" | "running" | "success" | "failed"
  >("idle");
  const [ndmaValidationMessage, setNdmaValidationMessage] = useState("");

  const [step1Data, setStep1Data] = useState({
    disasterType: "",
    district: "",
    taluka: "",
  });

  const [step2Data, setStep2Data] = useState({
    lineDepartment: "",
    proposalReceivedFrom: "",
    sourceName: "",
    proposalReceivedDate: "",
    receivingAuthority: "",
    authorityReceivedDate: "",
    officerInCharge: "",
  });

  const [step3Data, setStep3Data] = useState({
    ndmaGuideline: "",
  });

  const [step4Data, setStep4Data] = useState({
    projectCost: "",
<<<<<<< HEAD
    proposalDemandFile: null as File | null,
=======
    proposalDemandFile: null as File | null, // Kept in state for UI compatibility, but ignored in submission
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRunNdmaValidation = async () => {
    setNdmaValidationStatus("running");
    setNdmaValidationMessage(
      step4Data.proposalDemandFile
        ? "Running AI checks: duplicate detection + reading your document (OCR) + NDMA readiness. Large scans may take a minute or two..."
        : "Running AI checks: duplicate detection + NDMA readiness...",
    );
    setAiResult(null);

    const toISO = (d: string) => (d ? new Date(d).toISOString() : null);

    try {
      const result = await preflight.mutateAsync({
        payload: {
          proposalRefNo: null,
          title: step2Data.sourceName
            ? `Structural Mitigation - ${step2Data.sourceName}`
            : "Structural Mitigation Proposal",
          financialYear: currentFinancialYear(),
          disasterTypeId: step1Data.disasterType || null,
          districtId: step1Data.district || null,
          talukaId: step1Data.taluka || null,
          lineDepartmentId: step2Data.lineDepartment || null,
          receivedFromSourceId: step2Data.proposalReceivedFrom || null,
          proposalReceivedDate: toISO(step2Data.proposalReceivedDate),
          sourceName: step2Data.sourceName || null,
          markedToAuthorityId: step2Data.receivingAuthority || null,
          dateReceivedByAuthority: toISO(step2Data.authorityReceivedDate),
          receivingOfficerId: step2Data.officerInCharge || null,
          receivingOfficerName: null,
          ndmaGuidelineId: step3Data.ndmaGuideline || null,
          costOfProjectLakhs: step4Data.projectCost ? Number(step4Data.projectCost) : null,
          costEstimationLakhs: null,
          forwardedToDepartmentId: null,
          description: step2Data.sourceName || null,
<<<<<<< HEAD
          documentTypeName: "ProposalDocument"
        },
=======
          documentTypeName:"ProposalDocument"
        },
        // The uploaded proposal document — readiness is assessed against this (bot OCRs it).
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
        file: step4Data.proposalDemandFile,
      });

      setAiResult(result);

<<<<<<< HEAD
      // --- CASE 1: BLOCKED STATUS ---
=======
      // Stage 1/2 — duplicate blocks initiation.
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
      if (!result.canProceed) {
        setNdmaValidationStatus("failed");
        const matches =
          result.existence?.matchingProjects
            ?.slice(0, 3)
            .map((m) => `• ${m.title ?? m.projectId} (${Math.round((m.similarity ?? 0) * 100)}%)`)
            .join("\n") ?? "";
        setNdmaValidationMessage(
          `${result.blockReason ?? "This proposal appears to be a duplicate."}` +
            (matches ? `\n\nClosest existing proposals:\n${matches}` : ""),
        );
        return;
      }

<<<<<<< HEAD
      // --- CASE 2: SUCCESS STATUS (PROCESS ALL METRICS) ---
      setNdmaValidationStatus("success");
      let messageOutput = "";

      // Displays existence notes regardless of risk tier if data/recommendations exist
      if (result.existence) {
        const risk = result.existence.duplicateRisk || "Low";
        const existRecs = result.existence.recommendations?.map((r) => `• ${r}`).join("\n") || "";
        const matches = result.existence.matchingProjects
          ?.slice(0, 3)
          .map((m) => `• ${m.title ?? m.projectId} (${Math.round((m.similarity ?? 0) * 100)}%)`)
          .join("\n") ?? "";

        const riskEmoji = risk.toLowerCase() === "low" ? "✅" : "⚠️";
        messageOutput += `${riskEmoji} Duplicate Risk Assessment: ${risk}\n`;
        
        if (existRecs) {
          messageOutput += `\nRecommendations:\n${existRecs}\n`;
        }
        if (matches) {
          messageOutput += `\nClosest Reference Documents Found:\n${matches}\n`;
        }
      }

      // Append Readiness Matrix if evaluated
      if (result.readiness) {
        const r = result.readiness;
        const score = r?.readinessScore ?? 0;
        const passed = result.readinessPassed;
        const missing = (r?.missingItems ?? []).slice(0, 6).map((m) => `• ${m}`).join("\n");
        const recs = (r?.recommendations ?? []).slice(0, 6).map((m) => `• ${m}`).join("\n");

        if (messageOutput) messageOutput += "\n----------------------------------------\n\n";

        messageOutput += `📊 Readiness Check: ${score}/100 (${r?.category ?? "Assessed"})${passed ? " — meets threshold" : " — below threshold (allowed to submit; metrics will log to database)"}.` +
          (r?.executiveSummary ? `\n\n${r.executiveSummary}` : "") +
          (missing ? `\n\nMissing items:\n${missing}` : "") +
          (recs ? `\n\nRecommendations:\n${recs}` : "");
      } else {
        if (messageOutput) {
          messageOutput += "\nNote: Duplicate system validation verified. Comprehensive readiness profile parameters skipped or unassigned.";
        } else {
          messageOutput = "✅ AI Preflight checks passed. Document ready for processing.";
        }
      }

      setNdmaValidationMessage(messageOutput);

    } catch (err: any) {
=======
      // Stage 3 — readiness is non-blocking; surface the score + observations.
      const r = result.readiness;
      const score = r?.readinessScore ?? 0;
      const passed = result.readinessPassed;
      const missing = (r?.missingItems ?? []).slice(0, 6).map((m) => `• ${m}`).join("\n");
      const recs = (r?.recommendations ?? []).slice(0, 6).map((m) => `• ${m}`).join("\n");

      setNdmaValidationStatus("success");
      setNdmaValidationMessage(
        `Readiness: ${score}/100 (${r?.category ?? "Assessed"})${passed ? " — meets threshold" : " — below threshold (you can still submit; AI notes will be saved)"}.` +
          (r?.executiveSummary ? `\n\n${r.executiveSummary}` : "") +
          (missing ? `\n\nMissing items:\n${missing}` : "") +
          (recs ? `\n\nRecommendations:\n${recs}` : ""),
      );
    } catch (err: any) {
      // AI service unreachable: the .NET side fails soft, but guard the UI too.
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
      setNdmaValidationStatus("failed");
      setNdmaValidationMessage(
        err?.response?.data?.message ||
          err?.message ||
          "Could not run AI checks. Please try again.",
      );
    }
  };

  const handleSubmit = async () => {
    if (ndmaValidationStatus !== "success") {
      toast.error("Please run and pass NDMA validation before submitting.");
      return;
    }

<<<<<<< HEAD
=======
    // Convert dates to ISO string to match the JSON example, assuming YYYY-MM-DD input
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
    const formatToISO = (dateString: string) => {
      return dateString
        ? new Date(dateString).toISOString()
        : new Date().toISOString();
    };

<<<<<<< HEAD
=======
    // Build the payload matching the required JSON structure exactly
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
    const payload = {
      financialYear: currentFinancialYear(),
      disasterTypeId: step1Data.disasterType || null,
      districtId: step1Data.district || null,
      talukaId: step1Data.taluka || null,
      lineDepartmentId: step2Data.lineDepartment || null,
      receivedFromSourceId: step2Data.proposalReceivedFrom || null,
      proposalReceivedDate: formatToISO(step2Data.proposalReceivedDate),
      sourceName: step2Data.sourceName || "",
      markedToAuthorityId: step2Data.receivingAuthority || null,
      dateReceivedByAuthority: formatToISO(step2Data.authorityReceivedDate),
      receivingOfficerId: step2Data.officerInCharge || null,
<<<<<<< HEAD
      receivingOfficerName: "", 
      ndmaGuidelineId: step3Data.ndmaGuideline || null,
      costOfProjectLakhs: step4Data.projectCost ? Number(step4Data.projectCost) : 0,
      title: step2Data.sourceName
        ? `Structural Mitigation - ${step2Data.sourceName}`
        : "Structural Mitigation Proposal",
=======
      receivingOfficerName: "", // Placeholder as per example
      ndmaGuidelineId: step3Data.ndmaGuideline || null,
      costOfProjectLakhs: step4Data.projectCost
        ? Number(step4Data.projectCost)
        : 0,
      title: step2Data.sourceName
        ? `Structural Mitigation - ${step2Data.sourceName}`
        : "Structural Mitigation Proposal",
      // Persist the AI assessment captured during the preflight gate.
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
      aiAssessment: toAiAssessment(aiResult),
    };

    setIsSubmitting(true);
    const toastId = toast.loading("Creating proposal...");

    try {
<<<<<<< HEAD
=======
      // 1. Post the text data to get the proposal ID
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
      const proposalResponse = await axiosPrivate.post(
        "/api/v1/Proposals",
        payload,
      );

<<<<<<< HEAD
=======
      // Extract the ID from the response (adjust .data.id if your API nests it differently)
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
      const proposalId = proposalResponse.data?.id;

      if (!proposalId) {
        throw new Error(
          "Proposal was created but no ID was returned from the server.",
        );
      }

<<<<<<< HEAD
      if (step4Data.proposalDemandFile) {
        toast.loading("Uploading document...", { id: toastId });
=======
      // 2. If a file was selected, upload it using the returned ID
      if (step4Data.proposalDemandFile) {
        toast.loading("Uploading document...", { id: toastId }); // Update the toast message
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac

        const formData = new FormData();
        formData.append("ownerType", "1");
        formData.append("ownerId", proposalId);
        formData.append("documentType", "1");
        formData.append("file", step4Data.proposalDemandFile);

        const uploadResponse = await axiosPrivate.post("/api/v1/Documents/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

<<<<<<< HEAD
=======
        // 3. Ingest the uploaded proposal document into the AI "projects" corpus
        //    (powers future duplicate/existence detection). Best-effort: never blocks submit.
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
        const documentId = uploadResponse.data?.id;
        if (documentId) {
          toast.loading("Indexing document for AI...", { id: toastId });
          try {
            await ingestDocument.mutateAsync({
              documentId,
              collection: "projects",
              title: payload.title,
            });
          } catch {
<<<<<<< HEAD
            // Non-blocking catch block for best-effort storage
=======
            // ingestion is best-effort; the proposal is already saved
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
          }
        }
      }

      toast.success("Proposal and document submitted successfully!", {
        id: toastId,
      });
      localStorage.removeItem("proposalDraft");
      setIsSubmitted(true);
      setTimeout(() => navigate("/proposal-list"), 1500);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        (typeof err?.response?.data === "string" ? err.response.data : null) ||
        err?.message ||
        "Failed to submit the proposal. Please try again.";
      toast.error(message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
<<<<<<< HEAD
=======
      // Validate file size (25MB max)
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
      if (file.size > 25 * 1024 * 1024) {
        alert("File size exceeds 25MB limit.");
        return;
      }
<<<<<<< HEAD
=======
      // Validate file type
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Only PDF, DOC, and DOCX files are allowed.");
        return;
      }
      setStep4Data({ ...step4Data, proposalDemandFile: file });
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return Boolean(
          step1Data.disasterType && step1Data.district && step1Data.taluka,
        );
      case 2:
        return Boolean(
          step2Data.lineDepartment &&
          step2Data.proposalReceivedFrom &&
          step2Data.sourceName &&
          step2Data.proposalReceivedDate &&
          step2Data.receivingAuthority &&
          step2Data.authorityReceivedDate &&
          step2Data.officerInCharge,
        );
      case 3:
        return Boolean(step3Data.ndmaGuideline);
      case 4:
<<<<<<< HEAD
=======
        // Cost of project and file validation are optional for enabling the Next/Submit button
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
        return true;
      default:
        return false;
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle2 className="size-16 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-3">
              Proposal Submitted Successfully!
            </h2>
            <p className="text-muted-foreground mb-4">
              Your proposal has been submitted and is now in read-only mode.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-blue-900">
                Status: S02 - Under Review
              </p>
              <p className="text-xs text-blue-700 mt-1">
                The proposal will be processed by the next committee.
              </p>
            </div>
            <button
              onClick={() => navigate("/proposal-list")}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              View All Proposals
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[30px] font-bold text-[#0B1F4D]">Proposal Create</h1>
        <p className="text-sm text-muted-foreground">
          Multi-step proposal creation wizard
        </p>
      </div>

      {/* Progress Steps */}
      <ProposalStepper currentStep={currentStep} />

      {/* Step Content */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        {currentStep === 1 && (
          <LocationStep data={step1Data} setData={setStep1Data} />
        )}

        {currentStep === 2 && (
          <OfficersStep data={step2Data} setData={setStep2Data} />
        )}

        {currentStep === 3 && (
          <NdmaReferenceStep data={step3Data} setData={setStep3Data} />
        )}

        {currentStep === 4 && (
          <DocumentsStep
            data={step4Data}
            setData={setStep4Data}
            ndmaValidationStatus={ndmaValidationStatus}
            ndmaValidationMessage={ndmaValidationMessage}
            onValidate={handleRunNdmaValidation}
            onFileUpload={handleFileUpload}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium flex items-center gap-2"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
          )}
<<<<<<< HEAD
=======
          {/* <button
            onClick={handleSaveDraft}
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2"
          >
            <Save className="size-4" />
            Save Draft
          </button> */}
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
        </div>

        <div className="flex gap-3">
          {currentStep < totalSteps && (
            <button
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className={`px-6 py-3 rounded-lg font-medium transition-opacity flex items-center gap-2 ${
                !isStepValid(currentStep)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
              }`}
            >
              Next
              <ArrowRight className="size-4" />
            </button>
          )}

          {currentStep === totalSteps && (
            <button
              onClick={handleSubmit}
              disabled={!isStepValid(currentStep) || isSubmitting}
              className={`px-6 py-3 rounded-lg font-medium transition-opacity flex items-center gap-2 ${
                !isStepValid(currentStep) ||
                ndmaValidationStatus !== "success" ||
                isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:opacity-90 cursor-pointer"
              }`}
            >
              <Send className="size-4" />
              {isSubmitting ? "Submitting..." : "Submit Proposal"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
