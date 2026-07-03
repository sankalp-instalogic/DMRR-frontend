import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";

import { MembersTable } from "./MembersTable";
import { handleFileUpload } from "../../../constants/file-upload";
import type { MeetingStageData, StageProps } from "../../../constants/stageTypes";

interface MeetingStageProps extends StageProps<MeetingStageData> {
  /** Committee name used in the MoM upload label, e.g. "PAC", "TAC", "SDMA". */
  momLabel: string;
}

/**
 * Shared form for the committee-meeting stages:
 *   3 PAC, 4 TAC, 5 SEC, 6 Administrative Approval, 7 SDMA.
 * They are identical apart from the committee name shown on the
 * "minutes of meeting" upload, which is passed in via `momLabel`.
 */
export function MeetingStage({ data, setData, momLabel }: MeetingStageProps) {
  const setDecision = (decision: string) => setData({ ...data, decision });

  return (
    <div className="space-y-6">
      {/* Meeting Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
<<<<<<< HEAD
          <label htmlFor="meeting-date" className="block text-sm font-medium mb-2">Meeting Date</label>
          <input
            id="meeting-date"
=======
          <label className="block text-sm font-medium mb-2">Meeting Date</label>
          <input
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
            type="date"
            value={data.meetingDate}
            onChange={(e) => setData({ ...data, meetingDate: e.target.value })}
            className="w-full px-4 py-3 border border-border rounded-lg"
          />
        </div>

        <div>
<<<<<<< HEAD
          <label htmlFor="meeting-time" className="block text-sm font-medium mb-2">Meeting Time</label>
          <input
            id="meeting-time"
=======
          <label className="block text-sm font-medium mb-2">Meeting Time</label>
          <input
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
            type="time"
            value={data.meetingTime}
            onChange={(e) => setData({ ...data, meetingTime: e.target.value })}
            className="w-full px-4 py-3 border border-border rounded-lg"
          />
        </div>
      </div>

      {/* Members Table */}
      <MembersTable
        members={data.members}
        setMembers={(members) => setData({ ...data, members })}
      />

      {/* Attendance Sheet Upload */}
      <div>
<<<<<<< HEAD
        <label htmlFor="meeting-attendance" className="block text-sm font-medium mb-2">
          Upload Attendance Sheet
        </label>
        <input
          id="meeting-attendance"
=======
        <label className="block text-sm font-medium mb-2">
          Upload Attendance Sheet
        </label>
        <input
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) =>
            handleFileUpload(e, (file) =>
              setData({ ...data, attendanceSheet: file }),
            )
          }
          className="w-full px-4 py-3 border border-border rounded-lg"
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
            onClick={() => setDecision("approve")}
            className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
              data.decision === "approve"
                ? "bg-green-100 border-green-600 text-green-700"
                : "border-border hover:bg-muted"
            }`}
          >
<<<<<<< HEAD
            <CheckCircle2 className="size-4 mx-auto mb-1" aria-hidden="true" />
=======
            <CheckCircle2 className="size-4 mx-auto mb-1" />
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
            Approve
          </button>

          <button
<<<<<<< HEAD
            aria-pressed={data.decision === "reject"}
=======
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
            onClick={() => setDecision("reject")}
            className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
              data.decision === "reject"
                ? "bg-red-100 border-red-600 text-red-700"
                : "border-border hover:bg-muted"
            }`}
          >
<<<<<<< HEAD
            <XCircle className="size-4 mx-auto mb-1" aria-hidden="true" />
=======
            <XCircle className="size-4 mx-auto mb-1" />
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
            Reject
          </button>

          <button
<<<<<<< HEAD
            aria-pressed={data.decision === "revision"}
=======
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
            onClick={() => setDecision("revision")}
            className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
              data.decision === "revision"
                ? "bg-orange-100 border-orange-600 text-orange-700"
                : "border-border hover:bg-muted"
            }`}
          >
<<<<<<< HEAD
            <RefreshCw className="size-4 mx-auto mb-1" aria-hidden="true" />
            Revision
          </button>
        </div>
      </fieldset>
=======
            <RefreshCw className="size-4 mx-auto mb-1" />
            Revision
          </button>
        </div>
      </div>
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac

      {/* MoM Upload (approve) */}
      {data.decision === "approve" && (
        <div>
<<<<<<< HEAD
          <label htmlFor="meeting-mom" className="block text-sm font-medium mb-2">
            Upload {momLabel} Minutes of Meeting
          </label>
          <input
            id="meeting-mom"
=======
          <label className="block text-sm font-medium mb-2">
            Upload {momLabel} Minutes of Meeting
          </label>
          <input
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) =>
              handleFileUpload(e, (file) => setData({ ...data, momFile: file }))
            }
            className="w-full px-4 py-3 border border-border rounded-lg"
          />
          {data.momFile && (
            <p className="text-sm text-green-600 mt-2">✓ {data.momFile.name}</p>
          )}
        </div>
      )}

      {/* Reason (reject) */}
      {data.decision === "reject" && (
        <div>
<<<<<<< HEAD
          <label htmlFor="meeting-reason" className="block text-sm font-medium mb-2">
            Reason for Rejection
          </label>
          <textarea
            id="meeting-reason"
=======
          <label className="block text-sm font-medium mb-2">
            Reason for Rejection
          </label>
          <textarea
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
            rows={4}
            value={data.reason}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Enter reason for rejection"
            onChange={(e) => setData({ ...data, reason: e.target.value })}
          />
        </div>
      )}

      {/* Observation Notes (revision) */}
      {data.decision === "revision" && (
        <div>
<<<<<<< HEAD
          <label htmlFor="meeting-observation" className="block text-sm font-medium mb-2">
            Observation Notes
          </label>
          <textarea
            id="meeting-observation"
=======
          <label className="block text-sm font-medium mb-2">
            Observation Notes
          </label>
          <textarea
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
            rows={4}
            value={data.observationNotes}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Provide observation notes"
            onChange={(e) =>
              setData({ ...data, observationNotes: e.target.value })
            }
          />
        </div>
      )}
    </div>
  );
}