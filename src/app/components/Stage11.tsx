import type { Stage11Data, StageProps } from "../../../constants/stageTypes";

export function Stage11({ data, setData }: StageProps<Stage11Data>) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-3">
          Is Project Completed?
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="projectCompleted"
              value="yes"
              checked={data.projectCompleted === "yes"}
              onChange={(e) =>
                setData({ ...data, projectCompleted: e.target.value })
              }
            />
            Yes
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="projectCompleted"
              value="no"
              checked={data.projectCompleted === "no"}
              onChange={(e) =>
                setData({ ...data, projectCompleted: e.target.value })
              }
            />
            No
          </label>
        </div>
      </div>

      {data.projectCompleted === "yes" && (
        <div className="space-y-4 border rounded-lg p-5">
          <div>
            <label className="block text-sm font-medium mb-2">
              Date of Completion
            </label>
            <input
              type="date"
              value={data.completionDate}
              onChange={(e) =>
                setData({ ...data, completionDate: e.target.value })
              }
              className="w-full px-4 py-2 border border-border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Date of Completion Certificate Issued
            </label>
            <input
              type="date"
              value={data.certificateIssuedDate}
              onChange={(e) =>
                setData({ ...data, certificateIssuedDate: e.target.value })
              }
              className="w-full px-4 py-2 border border-border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Upload Completion Certificate
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) =>
                setData({
                  ...data,
                  completionCertificate: e.target.files?.[0] || null,
                })
              }
              className="w-full px-4 py-2 border border-border rounded-lg"
            />
            {data.completionCertificate && (
              <p className="text-sm text-green-600 mt-2">
                ✓ {data.completionCertificate.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Upload Multiple Social Audit Files
            </label>
            <input
              type="file"
              multiple
              onChange={(e) =>
                setData({
                  ...data,
                  socialAuditFiles: Array.from(e.target.files || []),
                })
              }
              className="w-full px-4 py-2 border border-border rounded-lg"
            />
            {data.socialAuditFiles.length > 0 && (
              <div className="mt-2 text-sm text-green-600">
                {data.socialAuditFiles.length} file(s) selected
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}