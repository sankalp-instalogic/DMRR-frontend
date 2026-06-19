import type { Stage8Data, StageProps } from "../../../constants/stageTypes";

export function Stage8({ data, setData }: StageProps<Stage8Data>) {
  return (
    <div className="space-y-6">
      {/* L1 Vendor Identified */}
      <div>
        <label className="block text-sm font-medium mb-3">
          Is L1 Vendor Identified?
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="yes"
              checked={data.l1VendorIdentified === "yes"}
              onChange={(e) =>
                setData({ ...data, l1VendorIdentified: e.target.value })
              }
            />
            Yes
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="no"
              checked={data.l1VendorIdentified === "no"}
              onChange={(e) =>
                setData({ ...data, l1VendorIdentified: e.target.value })
              }
            />
            No
          </label>
        </div>
      </div>

      {/* Vendor Name & Cost */}
      {data.l1VendorIdentified === "yes" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Vendor Name
            </label>
            <input
              type="text"
              value={data.vendorName}
              onChange={(e) =>
                setData({ ...data, vendorName: e.target.value })
              }
              className="w-full px-4 py-3 border border-border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">L1 Cost</label>
            <input
              type="number"
              value={data.l1Cost}
              onChange={(e) => setData({ ...data, l1Cost: e.target.value })}
              className="w-full px-4 py-3 border border-border rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Work Order */}
      <div>
        <label className="block text-sm font-medium mb-3">
          Is Work Order Issued?
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="yes"
              checked={data.workOrderIssued === "yes"}
              onChange={(e) =>
                setData({ ...data, workOrderIssued: e.target.value })
              }
            />
            Yes
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="no"
              checked={data.workOrderIssued === "no"}
              onChange={(e) =>
                setData({ ...data, workOrderIssued: e.target.value })
              }
            />
            No
          </label>
        </div>
      </div>

      {/* Work Order Date */}
      {data.workOrderIssued === "yes" && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Work Order Issued Date
          </label>
          <input
            type="date"
            value={data.workOrderIssuedDate}
            onChange={(e) =>
              setData({ ...data, workOrderIssuedDate: e.target.value })
            }
            className="w-full px-4 py-3 border border-border rounded-lg"
          />
        </div>
      )}

      {/* Document Type */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Supporting Document Type
        </label>
        <select
          value={data.supportingDocType}
          onChange={(e) =>
            setData({ ...data, supportingDocType: e.target.value })
          }
          className="w-full px-4 py-3 border border-border rounded-lg"
        >
          <option>Letter from DMRR</option>
          <option>Work Order</option>
          <option>Bid Evaluation Report</option>
          <option>Tender Notice</option>
        </select>
      </div>

      {/* Multiple Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Upload Supporting Documents
        </label>
        <input
          type="file"
          multiple
          onChange={(e) =>
            setData({
              ...data,
              supportingDocs: Array.from(e.target.files || []),
            })
          }
          className="w-full px-4 py-3 border border-border rounded-lg"
        />
        {data.supportingDocs.length > 0 && (
          <div className="text-green-600 text-sm mt-2">
            {data.supportingDocs.length} file(s) selected
          </div>
        )}
      </div>
    </div>
  );
}