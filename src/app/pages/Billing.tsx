import { useState } from "react";

const initialBills = [
  {
    id: "BILL/2025/001",
    workOrder: "WO/DMRR/2025/001",
    vendor: "ABC Construction Pvt Ltd",
    amount: "₹1.20 Cr",
    status: "In Progress",
  },
  {
    id: "BILL/2025/002",
    workOrder: "WO/DMRR/2025/034",
    vendor: "XYZ Infrastructure",
    amount: "₹3.40 Cr",
    status: "Pending",
  },
];

export function Billing() {
  const [bills] = useState(initialBills);

  const [selectedBill, setSelectedBill] = useState<any>(null);

  const [formData, setFormData] = useState({
    ddmrReceived: "",
    billReceivedDO: "",
    billSentMinister: "",
    paymentOrderMade: "",
    grantReleased: "",
    paymentDoneDDO: "",
    billSentTreasury: "",
    paymentToVendor: "",
    gstAmount: "",
    tdsAmount: "",
  });

  const handleSave = () => {
    console.log(formData);

    alert("Billing Details Saved Successfully");

    setSelectedBill(null);
  };

  const YesNoField = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="mb-6">
      <label className="block font-medium mb-3">{label}</label>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange("Yes")}
          className={`px-4 py-2 rounded-lg ${
            value === "Yes"
              ? "bg-green-600 text-white"
              : "border border-border"
          }`}
        >
          Yes
        </button>

        <button
          type="button"
          onClick={() => onChange("No")}
          className={`px-4 py-2 rounded-lg ${
            value === "No"
              ? "bg-red-600 text-white"
              : "border border-border"
          }`}
        >
          No
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1>Billing & Fund Release</h1>
        <p className="text-sm text-muted-foreground">
          Track billing workflow and fund release
        </p>
      </div>

      {/* BILL LIST */}

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-4 text-left">Bill ID</th>
              <th className="px-6 py-4 text-left">Work Order</th>
              <th className="px-6 py-4 text-left">Vendor</th>
              <th className="px-6 py-4 text-left">Amount</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {bills.map((bill) => (
              <tr
                key={bill.id}
                className="border-t border-border hover:bg-muted/50"
              >
                <td className="px-6 py-4">{bill.id}</td>
                <td className="px-6 py-4">{bill.workOrder}</td>
                <td className="px-6 py-4">{bill.vendor}</td>
                <td className="px-6 py-4">{bill.amount}</td>
                <td className="px-6 py-4">{bill.status}</td>

                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelectedBill(bill)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FORM */}

      {selectedBill && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">

          <h2 className="text-xl font-bold mb-6">
            Billing Workflow - {selectedBill.id}
          </h2>

          {/* 1 */}

          <YesNoField
            label="DDMR Received Bill From Line Department?"
            value={formData.ddmrReceived}
            onChange={(value) =>
              setFormData({
                ...formData,
                ddmrReceived: value,
              })
            }
          />

          {formData.ddmrReceived === "Yes" && (
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <input type="date" className="border rounded-lg p-2" />

              <input
                placeholder="Amount"
                className="border rounded-lg p-2"
              />

              <select className="border rounded-lg p-2">
                <option>Invoice</option>
                <option>Bill</option>
                <option>Supporting Document</option>
                <option>Certification</option>
              </select>

              <input
                type="file"
                multiple
                className="border rounded-lg p-2  md:col-span-3"
                
              />
            </div>
          )}

          {/* 2 */}

          <YesNoField
            label="Bill Received At DO?"
            value={formData.billReceivedDO}
            onChange={(value) =>
              setFormData({
                ...formData,
                billReceivedDO: value,
              })
            }
          />

          {formData.billReceivedDO === "Yes" && (
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <input type="date" className="border rounded-lg p-2" />

              <input
                placeholder="Amount"
                className="border rounded-lg p-2"
              />

              <input
                type="file"
                multiple
                className="border rounded-lg p-2"
              />
            </div>
          )}

          {/* 3 */}

          <YesNoField
            label="Bill Sent To PS / Minister?"
            value={formData.billSentMinister}
            onChange={(value) =>
              setFormData({
                ...formData,
                billSentMinister: value,
              })
            }
          />

          {formData.billSentMinister === "Yes" && (
            <input type="file" className="border rounded-lg p-2 mb-4" />
          )}

          {/* 4 */}

          <YesNoField
            label="Payment Order Made?"
            value={formData.paymentOrderMade}
            onChange={(value) =>
              setFormData({
                ...formData,
                paymentOrderMade: value,
              })
            }
          />

          {formData.paymentOrderMade === "Yes" && (
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <input type="date" className="border rounded-lg p-2" />

              <select className="border rounded-lg p-2">
                <option>1st Installment</option>
                <option>2nd Installment</option>
                <option>3rd Installment</option>
                <option>Final Installment</option>
              </select>

              <input
                placeholder="Amount Released"
                className="border rounded-lg p-2"
              />

              <input type="file" className="border rounded-lg p-2" />
            </div>
          )}

          {/* 5 */}

          <YesNoField
            label="Grant Released?"
            value={formData.grantReleased}
            onChange={(value) =>
              setFormData({
                ...formData,
                grantReleased: value,
              })
            }
          />

          {formData.grantReleased === "Yes" && (
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <input type="date" className="border rounded-lg p-2" />

              <input
                placeholder="Amount Released"
                className="border rounded-lg p-2"
              />

              <input type="file" className="border rounded-lg p-2" />
            </div>
          )}

          {/* 6 */}

          <YesNoField
            label="Payment Done To DDO?"
            value={formData.paymentDoneDDO}
            onChange={(value) =>
              setFormData({
                ...formData,
                paymentDoneDDO: value,
              })
            }
          />

          {formData.paymentDoneDDO === "Yes" && (
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <input type="date" className="border rounded-lg p-2" />

              <input
                placeholder="Amount"
                className="border rounded-lg p-2"
              />

              <input type="file" className="border rounded-lg p-2" />
            </div>
          )}

          {/* 7 */}

          <YesNoField
            label="Bill Sent To Treasury Office By DDO?"
            value={formData.billSentTreasury}
            onChange={(value) =>
              setFormData({
                ...formData,
                billSentTreasury: value,
              })
            }
          />

          {formData.billSentTreasury === "Yes" && (
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <input type="date" className="border rounded-lg p-2" />

              <input
                placeholder="Bill Number"
                className="border rounded-lg p-2"
              />

              <input
                placeholder="Account Number"
                className="border rounded-lg p-2"
              />

              <input type="file" className="border rounded-lg p-2"/>
            </div>
          )}

          {/* 8 */}

          <YesNoField
            label="Payment Sent From Treasury Office To Vendor?"
            value={formData.paymentToVendor}
            onChange={(value) =>
              setFormData({
                ...formData,
                paymentToVendor: value,
              })
            }
          />

          {formData.paymentToVendor === "Yes" && (
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <input type="date" className="border rounded-lg p-2" />

              <input
                placeholder="Transaction ID"
                className="border rounded-lg p-2"
              />

              <input
                placeholder="Account Number"
                className="border rounded-lg p-2"
              />

              <input type="file" className="border rounded-lg p-2" />
            </div>
          )}

          {/* GST TDS */}

          <h3 className="font-bold text-lg mb-4">
            Amount Received By Department Through GST & TDS
          </h3>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <input
              placeholder="GST Amount"
              value={formData.gstAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  gstAmount: e.target.value,
                })
              }
              className="border rounded-lg p-2"
            />

            <input
              placeholder="TDS Amount"
              value={formData.tdsAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tdsAmount: e.target.value,
                })
              }
              className="border rounded-lg p-2"
            />
          </div>

          {/* BUTTONS */}

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg"
            >
              Save
            </button>

            <button
              onClick={() => setSelectedBill(null)}
              className="px-6 py-3 border rounded-lg"
            >
              Cancel
            </button>
          </div>

        </div>
      )}
    </div>
  );
}