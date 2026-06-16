import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Send,
  ArrowRight,
  ArrowLeft,
  Save,
  MapPin,
  Building2,
  FileCheck,
  Shield,
  XCircle,
} from "lucide-react";
import { DocumentsStep } from "./proposalInitialiation/DocumentStep";
import { NdmaReferenceStep } from "./proposalInitialiation/NdmaReferenceStep";
import { OfficersStep } from "./proposalInitialiation/OfficerStep";
import { LocationStep } from "./proposalInitialiation/LocationStep";

export function ProposalInitiationWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
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
    proposalDemandFile: null as File | null,
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

  const handleSaveDraft = () => {
    const draftData = {
      step1Data,
      step2Data,
      step3Data,
      step4Data,
      currentStep,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem("proposalDraft", JSON.stringify(draftData));
    alert("Draft saved successfully!");
  };

  const handleRunNdmaValidation = () => {
    setNdmaValidationStatus("running");
    setNdmaValidationMessage("Running NDMA compliance validation...");

    // Simulate validation
    setTimeout(() => {
      setNdmaValidationStatus("success");
      setNdmaValidationMessage(
        `NDMA Validation Passed:\n- Guideline compliance verified\n- Budget alignment confirmed\n- Technical specifications met`,
      );
    }, 2000);
  };

  const handleSubmit = () => {
    if (!step4Data.proposalDemandFile) {
      alert("Please upload the Proposal Demand File before submitting.");
      return;
    }

    if (ndmaValidationStatus !== "success") {
      alert("Please run and pass NDMA validation before submitting.");
      return;
    }

    // Mark as submitted
    setIsSubmitted(true);
    alert("Proposal submitted successfully! Status: S02 - Under Review");

    // Clear draft
    localStorage.removeItem("proposalDraft");

    // Navigate to proposal list after a short delay
    setTimeout(() => {
      navigate("/proposal-list");
    }, 1500);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (25MB max)
      if (file.size > 25 * 1024 * 1024) {
        alert("File size exceeds 25MB limit.");
        return;
      }
      // Validate file type
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

  const stepComponents: Record<number, React.ReactNode> = {
    1: <LocationStep data={step1Data} setData={setStep1Data} />,
    2: <OfficersStep data={step2Data} setData={setStep2Data} />,
    3: <NdmaReferenceStep data={step3Data} setData={setStep3Data} />,
    4: (
      <DocumentsStep
        data={step4Data}
        setData={setStep4Data}
        onValidate={handleRunNdmaValidation}
        onFileUpload={handleFileUpload}
        ndmaValidationStatus={ndmaValidationStatus}
        ndmaValidationMessage={ndmaValidationMessage}
      />
    ),
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return step1Data.disasterType && step1Data.district && step1Data.taluka;
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
        return step3Data.ndmaGuideline;
      case 4:
        return step4Data.proposalDemandFile !== null;
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
        <h1>Proposal Create</h1>
        <p className="text-sm text-muted-foreground">
          Multi-step proposal creation wizard
        </p>
      </div>

      {/* Progress Steps */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex justify-between">
          {[
            { id: 1, label: "Location" },
            { id: 2, label: "Officers" },
            { id: 3, label: "NDMA Ref" },
            { id: 4, label: "Documents" },
          ].map((step, index) => (
            <div
              key={step.id}
              className="relative flex-1 flex flex-col items-center"
            >
              {/* Connector */}
              {index < 3 && (
                <div
                  className={`absolute top-5 left-1/2 w-full h-1 ${
                    currentStep > step.id ? "bg-green-600" : "bg-muted"
                  }`}
                />
              )}

              {/* Circle */}
              <div
                className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : currentStep > step.id
                      ? "bg-green-600 text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="size-5" />
                ) : (
                  step.id
                )}
              </div>

              {/* Label */}
              <div className="mt-3 text-center text-xs font-medium">
                Step {step.id}
                <br />
                {step.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        {stepComponents[currentStep]}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-3 cursor-pointer border border-border rounded-lg hover:bg-muted transition-colors font-medium flex items-center gap-2"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
          )}
          <button
            onClick={handleSaveDraft}
            className="px-6 py-3 cursor-pointer bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2"
          >
            <Save className="size-4" />
            Save Draft
          </button>
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
              disabled={
                !isStepValid(currentStep) || ndmaValidationStatus !== "success"
              }
              className={`px-6 py-3 rounded-lg font-medium transition-opacity flex items-center gap-2 ${
                !isStepValid(currentStep) || ndmaValidationStatus !== "success"
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:opacity-90"
              }`}
            >
              <Send className="size-4" />
              Submit Proposal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
