import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";

import type { Stage2Data, StageProps } from "../../../constants/stageTypes";

export function Stage2({ data, setData }: StageProps<Stage2Data>) {
  return (
    <div className="space-y-6">
      {/* Proposal Received Date & Time */}
      <div>
<<<<<<< HEAD
        <label
          htmlFor="stage2-proposal-received-datetime"
          className="block text-sm font-medium mb-2"
        >
          Date & Time Proposal Received by PMU Team
        </label>
        <input
          id="stage2-proposal-received-datetime"
=======
        <label className="block text-sm font-medium mb-2">
          Date & Time Proposal Received by PMU Team
        </label>
        <input
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
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
<<<<<<< HEAD
        <label
          htmlFor="stage2-observation"
          className="block text-sm font-medium mb-2"
        >
          PMU Observation
        </label>
        <textarea
          id="stage2-observation"
=======
        <label className="block text-sm font-medium mb-2">
          PMU Observation
        </label>
        <textarea
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
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
<<<<<<< HEAD
        <label
          htmlFor="stage2-observation-submitted-date"
          className="block text-sm font-medium mb-2"
        >
          Date PMU Team Submitted Observations
        </label>
        <input
          id="stage2-observation-submitted-date"
=======
        <label className="block text-sm font-medium mb-2">
          Date PMU Team Submitted Observations
        </label>
        <input
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
          type="date"
          value={data.observationSubmittedDate}
          onChange={(e) =>
            setData({ ...data, observationSubmittedDate: e.target.value })
          }
          className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Decision */}
<<<<<<< HEAD
      <fieldset>
        <legend className="block text-sm font-medium mb-2">
          Decision <span className="text-red-600">*</span>
        </legend>
        <div className="flex gap-4">
          <button
            aria-pressed={data.decision === "approve"}
=======
      <div>
        <label className="block text-sm font-medium mb-2">
          Decision <span className="text-red-600">*</span>
        </label>
        <div className="flex gap-4">
          <button
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
            onClick={() => setData({ ...data, decision: "approve" })}
            className={`flex-1 px-4 py-4 rounded-lg border font-medium transition-all ${
              data.decision === "approve"
                ? "bg-green-100 border-green-600 text-green-700"
                : "border-border hover:bg-muted"
            }`}
          >
<<<<<<< HEAD
            <CheckCircle2 aria-hidden="true" className="size-5 mx-auto mb-2" />
=======
            <CheckCircle2 className="size-5 mx-auto mb-2" />
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
            Approve
          </button>

          <button
<<<<<<< HEAD
            aria-pressed={data.decision === "reject"}
=======
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
            onClick={() => setData({ ...data, decision: "reject" })}
            className={`flex-1 px-4 py-4 rounded-lg border font-medium transition-all ${
              data.decision === "reject"
                ? "bg-red-100 border-red-600 text-red-700"
                : "border-border hover:bg-muted"
            }`}
          >
<<<<<<< HEAD
            <XCircle aria-hidden="true" className="size-5 mx-auto mb-2" />
=======
            <XCircle className="size-5 mx-auto mb-2" />
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
            Reject
          </button>

          <button
<<<<<<< HEAD
            aria-pressed={data.decision === "revision"}
=======
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
            onClick={() => setData({ ...data, decision: "revision" })}
            className={`flex-1 px-4 py-4 rounded-lg border font-medium transition-all ${
              data.decision === "revision"
                ? "bg-orange-100 border-orange-600 text-orange-700"
                : "border-border hover:bg-muted"
            }`}
          >
<<<<<<< HEAD
            <RefreshCw aria-hidden="true" className="size-5 mx-auto mb-2" />
            Revision
          </button>
        </div>
      </fieldset>
=======
            <RefreshCw className="size-5 mx-auto mb-2" />
            Revision
          </button>
        </div>
      </div>
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
    </div>
  );
}