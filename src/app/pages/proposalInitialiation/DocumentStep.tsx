import React from "react";
import { Input } from "antd";
import { Button } from "../../components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  FileCheck,
  FileText,
  Shield,
  Upload,
  XCircle,
} from "lucide-react";

export interface Step4Data {
  projectCost: string;
  proposalDemandFile: File | null;
}

interface DocumentsStepProps {
  data: Step4Data;
  setData: React.Dispatch<React.SetStateAction<Step4Data>>;
  ndmaValidationStatus: "idle" | "running" | "success" | "failed";
  ndmaValidationMessage: string;
  onValidate: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DocumentsStep(props: DocumentsStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
        <FileText className="size-5" />
        Step 4: Document & Cost
      </h3>

      <div>
        <label className="block text-sm font-medium mb-2">
          Cost of Project
        </label>

        {/* Ant Design Input replaces native input here */}
        <Input
          type="number"
          size="large"
          value={props.data.projectCost}
          placeholder="Optional"
          onChange={(e) =>
            props.setData({
              ...props.data,
              projectCost: e.target.value,
            })
          }
          className="w-full rounded-lg"
          onWheel={(e) => e.currentTarget.blur()}
        />
      </div>

      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
        <Upload className="size-12 mx-auto text-muted-foreground mb-4" />
        <h4 className="font-semibold mb-2">
          Proposal Demand File <span className="text-destructive">*</span>
        </h4>
        <p className="text-sm text-muted-foreground mb-4">
          Allowed formats: PDF, DOC, DOCX | Maximum size: 25 MB
        </p>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={props.onFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity cursor-pointer font-medium"
        >
          <Upload className="size-4" />
          Choose File
        </label>

        {props.data.proposalDemandFile && (
          <div className="mt-6 bg-success-muted border border-success-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCheck className="size-5 text-success" />
                <div className="text-left">
                  <p className="font-medium text-sm text-success-muted-foreground">
                    {props.data.proposalDemandFile.name}
                  </p>
                  <p className="text-xs text-success-muted-foreground">
                    {(props.data.proposalDemandFile.size / 1024 / 1024).toFixed(
                      2
                    )}{" "}
                    MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  props.setData({ ...props.data, proposalDemandFile: null })
                }
                className="text-destructive hover:bg-destructive-muted"
              >
                <XCircle className="size-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* NDMA Validation */}
      <div className="border border-border rounded-lg p-6 mt-6">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Shield className="size-5 text-primary" />
          NDMA Validation
        </h4>
        <p className="text-sm text-muted-foreground mb-4">
          Run automated validation against NDMA guidelines before submission.
        </p>

        <button
          onClick={props.onValidate}
          disabled={
            props.ndmaValidationStatus === "running" ||
            !props.data.proposalDemandFile
          }
          className={`px-6 py-3 cursor-pointer rounded-lg font-medium transition-opacity flex items-center gap-2 ${
            props.ndmaValidationStatus === "running"
              ? "bg-muted-foreground text-primary-foreground cursor-not-allowed"
              : "bg-secondary text-secondary-foreground hover:opacity-90"
          }`}
        >
          {props.ndmaValidationStatus === "running" ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-card border-t-transparent" />
              Running Validation...
            </>
          ) : (
            <>
              <Shield className="size-4" />
              Run NDMA Validation
            </>
          )}
        </button>

        {props.ndmaValidationStatus === "success" && (
          <div className="mt-4 bg-success-muted border border-success-border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-success-muted-foreground mb-1">
                  Validation Passed
                </p>
                <p className="text-sm text-success-muted-foreground whitespace-pre-line">
                  {props.ndmaValidationMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {props.ndmaValidationStatus === "failed" && (
          <div className="mt-4 bg-destructive-muted border border-destructive-border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive-muted-foreground mb-1">
                  Validation Failed
                </p>
                <p className="text-sm text-destructive-muted-foreground">
                  {props.ndmaValidationMessage}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}