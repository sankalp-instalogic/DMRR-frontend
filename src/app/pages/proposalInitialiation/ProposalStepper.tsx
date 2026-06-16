import { CheckCircle2 } from "lucide-react";

const steps = [
  { id: 1, label: "Location" },
  { id: 2, label: "Officers" },
  { id: 3, label: "NDMA Ref" },
  { id: 4, label: "Documents" },
];

export function ProposalStepper({
  currentStep,
}: {
  currentStep: number;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex justify-between">
        {steps.map((step, index) => (
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
  );
}