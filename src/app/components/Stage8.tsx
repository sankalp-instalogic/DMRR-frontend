import type { Stage8Data, StageProps } from "../../../constants/stageTypes";

export function Stage8({ data, setData }: StageProps<Stage8Data>) {
  return (
    <div className="space-y-6">
      {/* L1 Vendor Identified */}
<<<<<<< HEAD
      <fieldset>
        <legend className="block text-sm font-medium mb-3">
          Is L1 Vendor Identified?
        </legend>
=======
      <div>
        <label className="block text-sm font-medium mb-3">
          Is L1 Vendor Identified?
        </label>
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
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
<<<<<<< HEAD
      </fieldset>
=======
      </div>
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac

      {/* Vendor Name & Cost */}
      {data.l1VendorIdentified === "yes" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
<<<<<<< HEAD
            <label
              htmlFor="stage8-vendor-name"
              className="block text-sm font-medium mb-2"
            >
              Vendor Name
            </label>
            <input
              id="stage8-vendor-name"
=======
            <label className="block text-sm font-medium mb-2">
              Vendor Name
            </label>
            <input
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
              type="text"
              value={data.vendorName}
              onChange={(e) =>
                setData({ ...data, vendorName: e.target.value })
              }
              className="w-full px-4 py-3 border border-border rounded-lg"
            />
          </div>

          <div>
<<<<<<< HEAD
            <label
              htmlFor="stage8-l1-cost"
              className="block text-sm font-medium mb-2"
            >
              L1 Cost
            </label>
            <input
              id="stage8-l1-cost"
=======
            <label className="block text-sm font-medium mb-2">L1 Cost</label>
            <input
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
              type="number"
              value={data.l1Cost}
              onChange={(e) => setData({ ...data, l1Cost: e.target.value })}
              className="w-full px-4 py-3 border border-border rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Work Order */}
<<<<<<< HEAD
      <fieldset>
        <legend className="block text-sm font-medium mb-3">
          Is Work Order Issued?
        </legend>
=======
      <div>
        <label className="block text-sm font-medium mb-3">
          Is Work Order Issued?
        </label>
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
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
<<<<<<< HEAD
      </fieldset>
=======
      </div>
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac

      {/* Work Order Date */}
      {data.workOrderIssued === "yes" && (
        <div>
<<<<<<< HEAD
          <label
            htmlFor="stage8-work-order-issued-date"
            className="block text-sm font-medium mb-2"
          >
            Work Order Issued Date
          </label>
          <input
            id="stage8-work-order-issued-date"
=======
          <label className="block text-sm font-medium mb-2">
            Work Order Issued Date
          </label>
          <input
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
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
<<<<<<< HEAD
        <label
          htmlFor="stage8-supporting-doc-type"
          className="block text-sm font-medium mb-2"
        >
          Supporting Document Type
        </label>
        <select
          id="stage8-supporting-doc-type"
=======
        <label className="block text-sm font-medium mb-2">
          Supporting Document Type
        </label>
        <select
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
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
<<<<<<< HEAD
        <label
          htmlFor="stage8-supporting-docs"
          className="block text-sm font-medium mb-2"
        >
          Upload Supporting Documents
        </label>
        <input
          id="stage8-supporting-docs"
=======
        <label className="block text-sm font-medium mb-2">
          Upload Supporting Documents
        </label>
        <input
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
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