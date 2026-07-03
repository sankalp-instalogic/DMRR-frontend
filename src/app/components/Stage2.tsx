import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";

import type { Stage2Data, StageProps } from "../../../constants/stageTypes";

export function Stage2({ data, setData }: StageProps<Stage2Data>) {
  return (
    <div className="space-y-6">
      {/* Proposal Received Date & Time */}
      <div>
        <label
          htmlFor="stage2-proposal-received-datetime"
          className="block text-sm font-medium mb-2"
        >
          Date & Time Proposal Received by PMU Team
        </label>
        <input
          id="stage2-proposal-received-datetime"
          type="datetime-local"
          value={data.proposalReceivedDateTime}
          onChange={(e) =>
            setData({ ...data, proposalReceivedDateTime: e.target.value })
          }
          className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* PMU Observation */}
      <div>
        <label
          htmlFor="stage2-observation"
          className="block text-sm font-medium mb-2"
        >
          PMU Observation
        </label>
        <textarea
          id="stage2-observation"
          value={data.observation}
          onChange={(e) => setData({ ...data, observation: e.target.value })}
          className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          rows={5}
          placeholder="Enter PMU observations"
        />
      </div>

      {/* Compliance Flag */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="compliance"
          checked={data.complianceFlag}
          onChange={(e) =>
            setData({ ...data, complianceFlag: e.target.checked })
          }
          className="w-4 h-4"
        />
        <label
          htmlFor="compliance"
          className="text-sm font-medium cursor-pointer"
        >
          Compliance Flag
        </label>
      </div>

      {/* Revision Requirement */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="revision"
          checked={data.revisionRequired}
          onChange={(e) =>
            setData({ ...data, revisionRequired: e.target.checked })
          }
          className="w-4 h-4"
        />
        <label
          htmlFor="revision"
          className="text-sm font-medium cursor-pointer"
        >
          Revision Requirement
        </label>
      </div>

      {/* Observation Submitted Date */}
      <div>
        <label
          htmlFor="stage2-observation-submitted-date"
          className="block text-sm font-medium mb-2"
        >
          Date PMU Team Submitted Observations
        </label>
        <input
          id="stage2-observation-submitted-date"
          type="date"
          value={data.observationSubmittedDate}
          onChange={(e) =>
            setData({ ...data, observationSubmittedDate: e.target.value })
          }
          className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Decision */}
      <fieldset>
        <legend className="block text-sm font-medium mb-2">
          Decision <span className="text-destructive">*</span>
        </legend>
        <div className="flex gap-4">
          <button
            aria-pressed={data.decision === "approve"}
            onClick={() => setData({ ...data, decision: "approve" })}
            className={`flex-1 px-4 py-4 rounded-lg border font-medium transition-all ${
              data.decision === "approve"
                ? "bg-success-muted border-success text-success-muted-foreground"
                : "border-border hover:bg-muted"
            }`}
          >
            <CheckCircle2 aria-hidden="true" className="size-5 mx-auto mb-2" />
            Approve
          </button>

          <button
            aria-pressed={data.decision === "reject"}
            onClick={() => setData({ ...data, decision: "reject" })}
            className={`flex-1 px-4 py-4 rounded-lg border font-medium transition-all ${
              data.decision === "reject"
                ? "bg-destructive-muted border-destructive text-destructive-muted-foreground"
                : "border-border hover:bg-muted"
            }`}
          >
            <XCircle aria-hidden="true" className="size-5 mx-auto mb-2" />
            Reject
          </button>

          <button
            aria-pressed={data.decision === "revision"}
            onClick={() => setData({ ...data, decision: "revision" })}
            className={`flex-1 px-4 py-4 rounded-lg border font-medium transition-all ${
              data.decision === "revision"
                ? "bg-warning-muted border-warning text-warning-muted-foreground"
                : "border-border hover:bg-muted"
            }`}
          >
            <RefreshCw aria-hidden="true" className="size-5 mx-auto mb-2" />
            Revision
          </button>
        </div>
      </fieldset>
    </div>
  );
}