import { handleFileUpload } from "../../../constants/file-upload";
import type { Stage1Data, StageProps } from "../../../constants/stageTypes";

export function Stage1({ data, setData }: StageProps<Stage1Data>) {
  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="block text-sm font-medium mb-2">
          Desk Officer Approved DPR/PPR?{" "}
          <span className="text-red-600">*</span>
        </legend>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="approved"
              value="yes"
              checked={data.deskOfficerApproved === "yes"}
              onChange={(e) =>
                setData({ ...data, deskOfficerApproved: e.target.value })
              }
              className="w-4 h-4"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="approved"
              value="no"
              checked={data.deskOfficerApproved === "no"}
              onChange={(e) =>
                setData({ ...data, deskOfficerApproved: e.target.value })
              }
              className="w-4 h-4"
            />
            <span>No</span>
          </label>
        </div>
      </fieldset>

      {data.deskOfficerApproved === "yes" && (
        <div>
          <label htmlFor="stage1-dpr-upload" className="block text-sm font-medium mb-2">
            Upload DPR & PPR <span className="text-red-600">*</span>
          </label>
          <input
            id="stage1-dpr-upload"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) =>
              handleFileUpload(e, (file) =>
                setData({ ...data, approvalDocument: file }),
              )
            }
            className="w-full px-4 py-3 border border-border rounded-lg bg-background"
          />
          {data.approvalDocument && (
            <p className="text-sm text-green-600 mt-2">
              ✓ {data.approvalDocument.name}
            </p>
          )}
        </div>
      )}

      {data.deskOfficerApproved === "no" && (
        <div>
          <label htmlFor="stage1-rejection-reason" className="block text-sm font-medium mb-2">
            Reason for Rejection <span className="text-red-600">*</span>
          </label>
          <textarea
            id="stage1-rejection-reason"
            aria-required="true"
            value={data.rejectionReason}
            onChange={(e) =>
              setData({ ...data, rejectionReason: e.target.value })
            }
            className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            rows={4}
            placeholder="Provide detailed reason for rejection"
          />
        </div>
      )}
    </div>
  );
}