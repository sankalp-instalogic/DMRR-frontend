import { useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function Billing() {
  const axiosPrivate = useAxiosPrivate();

  // --- PAGINATION STATE ---
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // --- FORM & SELECTION STATE ---
  const [selectedBill, setSelectedBill] = useState<any>(null);

  const [ddmrFile, setDdmrFile] = useState<File | null>(null);
  const [doFile, setDoFile] = useState<File | null>(null);
  const [ministerFile, setMinisterFile] = useState<File | null>(null);
  const [paymentOrderFile, setPaymentOrderFile] = useState<File | null>(null);
  const [grantFile, setGrantFile] = useState<File | null>(null);
  const [ddoFile, setDdoFile] = useState<File | null>(null);
  const [treasuryFile, setTreasuryFile] = useState<File | null>(null);
  const [vendorFile, setVendorFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    ddmrReceived: "",
    ddmrDate: "",
    ddmrAmount: "",
    billReceivedDO: "",
    doDate: "",
    doAmount: "",
    billSentMinister: "",
    ministerDate: "",
    paymentOrderMade: "",
    paymentOrderDate: "",
    paymentOrderInstallment: "1",
    paymentOrderAmount: "",
    grantReleased: "",
    paymentDoneDDO: "",
    billSentTreasury: "",
    paymentToVendor: "",
    gstAmount: "",
    tdsAmount: "",
    intendedAmount: "",
    paidAmount: "",
    grantDate: "",
    grantAmount: "",
    paymentDDODate: "",
    paymentDDOAmount: "",

    treasuryDate: "",
    treasuryBillNumber: "",
    treasuryRtgsNumber: "",

    vendorDate: "",
    vendorTransactionId: "",
    vendorRtgsNumber: "",
  });

  // --- FETCH FUNCTION ---
  const fetchBills = async ({ queryKey }: any) => {
    const [_key, currentPage, currentPageSize] = queryKey;
    const response = await axiosPrivate.get("/api/v1/billing", {
      params: {
        page: currentPage,
        pageSize: currentPageSize,
      },
    });
    return response.data;
  };

  // --- REACT QUERY ---
  const { data, isLoading, isError } = useQuery({
    queryKey: ["bills", page, pageSize],
    queryFn: fetchBills,
    placeholderData: keepPreviousData,
  });

  // --- DATA EXTRACTION ---
  const bills = data?.items ?? [];
  const totalItems = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // --- SAVE SECTION 1 (DDMR) ---
  const handleSaveDDMR = async () => {
    if (!selectedBill) return;

    try {
      if (ddmrFile) {
        const docFormData = new FormData();
        docFormData.append("file", ddmrFile);
        docFormData.append("ownerType", "4");
        docFormData.append("documentType", "14");
        docFormData.append("ownerId", selectedBill.id);

        await axiosPrivate.post("/api/v1/Documents/upload", docFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      const payload = {
        gate: "BillFromLineDept",
        yesNo: formData.ddmrReceived === "Yes",
        entryDate: formData.ddmrDate
          ? new Date(formData.ddmrDate).toISOString()
          : new Date().toISOString(),
        amount: Number(formData.ddmrAmount) || 0,
        installmentType: "",
        billNumber: selectedBill.id,
        rtgsNumber: "",
        transactionId: "",
        remarks: "",
      };

      await axiosPrivate.post(
        `/api/v1/Billing/${selectedBill.id}/stages`,
        payload
      );

      toast.success("DDMR Section saved successfully!");
    } catch (error) {
      console.error("Error saving DDMR section:", error);
      toast.error("Failed to save DDMR section. Please try again.");
    }
  };

  // --- SAVE SECTION 2 (DO) ---
  const handleSaveDO = async () => {
    if (!selectedBill) return;

    try {
      if (doFile) {
        const docFormData = new FormData();
        docFormData.append("file", doFile);
        docFormData.append("ownerType", "4");
        docFormData.append("documentType", "14");
        docFormData.append("ownerId", selectedBill.id);

        await axiosPrivate.post("/api/v1/Documents/upload", docFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      const payload = {
        gate: "BillAtDO",
        yesNo: formData.billReceivedDO === "Yes",
        entryDate: formData.doDate
          ? new Date(formData.doDate).toISOString()
          : new Date().toISOString(),
        amount: Number(formData.doAmount) || 0,
        installmentType: "",
        billNumber: selectedBill.id,
        rtgsNumber: "",
        transactionId: "",
        remarks: "",
      };

      await axiosPrivate.post(
        `/api/v1/Billing/${selectedBill.id}/stages`,
        payload
      );

      toast.success("DO Section saved successfully!");
    } catch (error) {
      console.error("Error saving DO section:", error);
      toast.error("Failed to save DO section. Please try again.");
    }
  };

  // --- SAVE SECTION 3 (PS/MINISTER) ---
  const handleSaveMinister = async () => {
    if (!selectedBill) return;

    try {
      if (ministerFile) {
        const docFormData = new FormData();
        docFormData.append("file", ministerFile);
        docFormData.append("ownerType", "4");
        docFormData.append("documentType", "14");
        docFormData.append("ownerId", selectedBill.id);

        await axiosPrivate.post("/api/v1/Documents/upload", docFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      const payload = {
        gate: "BillToPSMinister",
        yesNo: formData.billSentMinister === "Yes",
        entryDate: formData.ministerDate
          ? new Date(formData.ministerDate).toISOString()
          : new Date().toISOString(),
        amount: 0,
        installmentType: "",
        billNumber: selectedBill.id,
        rtgsNumber: "",
        transactionId: "",
        remarks: "",
      };

      await axiosPrivate.post(
        `/api/v1/Billing/${selectedBill.id}/stages`,
        payload
      );

      toast.success("PS / Minister Section saved successfully!");
    } catch (error) {
      console.error("Error saving PS/Minister section:", error);
      toast.error("Failed to save PS/Minister section. Please try again.");
    }
  };

  // --- SAVE SECTION 4 (PAYMENT ORDER) ---
  const handleSavePaymentOrder = async () => {
    if (!selectedBill) return;

    try {
      if (paymentOrderFile) {
        const docFormData = new FormData();
        docFormData.append("file", paymentOrderFile);
        docFormData.append("ownerType", "4");
        docFormData.append("documentType", "16");
        docFormData.append("ownerId", selectedBill.id);

        await axiosPrivate.post("/api/v1/Documents/upload", docFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      const payload = {
        gate: "PaymentOrder",
        yesNo: formData.paymentOrderMade === "Yes",
        entryDate: formData.paymentOrderDate
          ? new Date(formData.paymentOrderDate).toISOString()
          : new Date().toISOString(),
        amount: Number(formData.paymentOrderAmount) || 0,
        installmentType: formData.paymentOrderInstallment.toString(),
        billNumber: selectedBill.id,
        rtgsNumber: "",
        transactionId: "",
        remarks: "",
      };

      await axiosPrivate.post(
        `/api/v1/Billing/${selectedBill.id}/stages`,
        payload
      );

      toast.success("Payment Order Section saved successfully!");
    } catch (error) {
      console.error("Error saving Payment Order section:", error);
      toast.error("Failed to save Payment Order section. Please try again.");
    }
  };

  // --- SAVE SECTION 5 (GRANT RELEASED) ---
  const handleSaveGrant = async () => {
    if (!selectedBill) return;

    try {
      if (grantFile) {
        const docFormData = new FormData();
        docFormData.append("file", grantFile);
        docFormData.append("ownerType", "4");
        docFormData.append("documentType", "25");
        docFormData.append("ownerId", selectedBill.id);

        await axiosPrivate.post("/api/v1/Documents/upload", docFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      const payload = {
        gate: "GrantRelease",
        yesNo: formData.grantReleased === "Yes",
        entryDate: formData.grantDate
          ? new Date(formData.grantDate).toISOString()
          : new Date().toISOString(),
        amount: Number(formData.grantAmount) || 0,
        installmentType: "",
        billNumber: selectedBill.id,
        rtgsNumber: "",
        transactionId: "",
        remarks: "",
      };

      await axiosPrivate.post(
        `/api/v1/Billing/${selectedBill.id}/stages`,
        payload
      );

      toast.success("Grant Released Section saved successfully!");
    } catch (error) {
      console.error("Error saving Grant Released section:", error);
      toast.error("Failed to save Grant Released section. Please try again.");
    }
  };

  // --- SAVE SECTION 6 (PAYMENT DONE TO DDO) ---
  const handleSaveDDO = async () => {
    if (!selectedBill) return;

    try {
      if (ddoFile) {
        const docFormData = new FormData();
        docFormData.append("file", ddoFile);
        docFormData.append("ownerType", "4");
        docFormData.append("documentType", "14");
        docFormData.append("ownerId", selectedBill.id);

        await axiosPrivate.post("/api/v1/Documents/upload", docFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      const payload = {
        gate: "PaymentToDDO",
        yesNo: formData.paymentDoneDDO === "Yes",
        entryDate: formData.paymentDDODate
          ? new Date(formData.paymentDDODate).toISOString()
          : new Date().toISOString(),
        amount: Number(formData.paymentDDOAmount) || 0,
        installmentType: "",
        billNumber: selectedBill.id,
        rtgsNumber: "",
        transactionId: "",
        remarks: "",
      };

      await axiosPrivate.post(
        `/api/v1/Billing/${selectedBill.id}/stages`,
        payload
      );
      toast.success("Payment Done To DDO Section saved successfully!");
    } catch (error) {
      console.error("Error saving Payment to DDO section:", error);
      toast.error("Failed to save Payment to DDO section. Please try again.");
    }
  };

  // --- SAVE SECTION 7 (TREASURY SUBMISSION) ---
  const handleSaveTreasury = async () => {
    if (!selectedBill) return;

    try {
      if (treasuryFile) {
        const docFormData = new FormData();
        docFormData.append("file", treasuryFile);
        docFormData.append("ownerType", "4");
        docFormData.append("documentType", "14");
        docFormData.append("ownerId", selectedBill.id);

        await axiosPrivate.post("/api/v1/Documents/upload", docFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      const payload = {
        gate: "TreasurySubmission",
        yesNo: formData.billSentTreasury === "Yes",
        entryDate: formData.treasuryDate
          ? new Date(formData.treasuryDate).toISOString()
          : new Date().toISOString(),
        amount: 0,
        installmentType: "",
        billNumber: formData.treasuryBillNumber || selectedBill.id,
        rtgsNumber: formData.treasuryRtgsNumber || "",
        transactionId: "",
        remarks: "",
      };

      await axiosPrivate.post(
        `/api/v1/Billing/${selectedBill.id}/stages`,
        payload
      );
      toast.success("Bill Sent To Treasury Section saved successfully!");
    } catch (error) {
      console.error("Error saving Treasury section:", error);
      toast.error("Failed to save Treasury section. Please try again.");
    }
  };

  // --- SAVE SECTION 8 (VENDOR PAYMENT) ---
  const handleSaveVendor = async () => {
    if (!selectedBill) return;

    try {
      if (vendorFile) {
        const docFormData = new FormData();
        docFormData.append("file", vendorFile);
        docFormData.append("ownerType", "4");
        docFormData.append("documentType", "14");
        docFormData.append("ownerId", selectedBill.id);

        await axiosPrivate.post("/api/v1/Documents/upload", docFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      const payload = {
        gate: "VendorPayment",
        yesNo: formData.paymentToVendor === "Yes",
        entryDate: formData.vendorDate
          ? new Date(formData.vendorDate).toISOString()
          : new Date().toISOString(),
        amount: 0,
        installmentType: "",
        billNumber: selectedBill.id,
        rtgsNumber: formData.vendorRtgsNumber || "",
        transactionId: formData.vendorTransactionId || "",
        remarks: "",
      };

      await axiosPrivate.post(
        `/api/v1/Billing/${selectedBill.id}/stages`,
        payload
      );
      toast.success("Payment Sent To Vendor Section saved successfully!");
    } catch (error) {
      console.error("Error saving Vendor Payment section:", error);
      toast.error("Failed to save Vendor Payment section. Please try again.");
    }
  };

  // --- RECONCILIATION SUBMIT ---
  const handleSave = async () => {
    if (!selectedBill) return;

    try {
      const payload = {
        amountIntendedToPay: Number(formData.intendedAmount) || 0,
        amountPaidByDepartment: Number(formData.paidAmount) || 0,
        gstAmount: Number(formData.gstAmount) || 0,
        tdsAmount: Number(formData.tdsAmount) || 0,
        override: true,
      };

      await axiosPrivate.post(
        `/api/v1/Billing/${selectedBill.id}/reconciliation`,
        payload
      );

      toast.success("Billing Reconciliation Details Saved Successfully!");
      setSelectedBill(null);
    } catch (error) {
      console.error("Error saving reconciliation details:", error);
      toast.error("Failed to save reconciliation details. Please try again.");
    }
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
          className={`px-4 py-2 rounded-lg transition-colors ${
            value === "Yes"
              ? "bg-green-600 text-white"
              : "border border-border hover:bg-muted/50"
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange("No")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            value === "No"
              ? "bg-red-600 text-white"
              : "border border-border hover:bg-muted/50"
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
        <h1 className="text-2xl font-bold text-[#0B1F4D]">
          Billing & Fund Release
        </h1>
        <p className="text-sm text-muted-foreground">
          Track billing workflow and fund release
        </p>
      </div>

      {/* BILL LIST */}
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-4 font-medium">Ref No</th>
                <th className="px-4 py-4 font-medium">Title</th>
                <th className="px-4 py-4 font-medium">Vendor</th>
                <th className="px-4 py-4 font-medium">Amount (Lakhs)</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Loading bills...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-red-500 font-medium"
                  >
                    Failed to load billing data. Please try again.
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No records found.
                  </td>
                </tr>
              ) : (
                bills.map((bill: any) => (
                  <tr
                    key={bill.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-[#0B1F4D]">
                      {bill.proposalRefNo || "N/A"}
                    </td>
                    <td className="px-4 py-3">{bill.title}</td>
                    <td className="px-4 py-3">
                      {bill.vendorName || "Unassigned"}
                    </td>
                    <td className="px-4 py-3 font-medium text-green-600">
                      ₹{bill.amountLakhs?.toLocaleString("en-IN") || "0"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedBill(bill)}
                        className="px-3 py-1.5 bg-[#0B1F4D] text-white hover:bg-opacity-90 rounded-lg text-sm transition-colors"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Footer */}
        {!isLoading && !isError && bills.length > 0 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/20">
            <span className="text-sm text-muted-foreground">
              Showing entries {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, totalItems)} of {totalItems} entries
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="px-3 py-1 bg-white border border-border rounded text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
                disabled={page === 1}
              >
                Previous
              </button>
              <button className="px-3 py-1 bg-[#0B1F4D] text-white border border-[#0B1F4D] rounded text-sm font-medium">
                {page}
              </button>
              <button
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="px-3 py-1 bg-white border border-border rounded text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FORM */}
      {selectedBill && (
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-[#0B1F4D]">
            Billing Workflow - {selectedBill.proposalRefNo}
          </h2>

          {/* 1. DDMR SECTION */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <YesNoField
              label="DDMR Received Bill From Line Department?"
              value={formData.ddmrReceived}
              onChange={(value) =>
                setFormData({ ...formData, ddmrReceived: value })
              }
            />

            {formData.ddmrReceived === "Yes" && (
              <div className="grid md:grid-cols-2 gap-4 mb-2">
                <input
                  type="date"
                  value={formData.ddmrDate}
                  onChange={(e) =>
                    setFormData({ ...formData, ddmrDate: e.target.value })
                  }
                  className="border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={formData.ddmrAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, ddmrAmount: e.target.value })
                  }
                  className="border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1 text-muted-foreground">
                    Upload Invoice
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setDdmrFile(e.target.files?.[0] || null)}
                    className="w-full border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end mt-2">
                  <button
                    onClick={handleSaveDDMR}
                    className="px-4 py-2 bg-[#0B1F4D] text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
                  >
                    Save Line of Department Section
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. DO SECTION */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <YesNoField
              label="Bill Received At DO?"
              value={formData.billReceivedDO}
              onChange={(value) =>
                setFormData({ ...formData, billReceivedDO: value })
              }
            />

            {formData.billReceivedDO === "Yes" && (
              <div className="grid md:grid-cols-2 gap-4 mb-2">
                <input
                  type="date"
                  value={formData.doDate}
                  onChange={(e) =>
                    setFormData({ ...formData, doDate: e.target.value })
                  }
                  className="border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={formData.doAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, doAmount: e.target.value })
                  }
                  className="border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1 text-muted-foreground">
                    Upload Document
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setDoFile(e.target.files?.[0] || null)}
                    className="w-full border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end mt-2">
                  <button
                    onClick={handleSaveDO}
                    className="px-4 py-2 bg-[#0B1F4D] text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
                  >
                    Save DO Section
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. PS / MINISTER SECTION */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <YesNoField
              label="Bill Sent To PS / Minister?"
              value={formData.billSentMinister}
              onChange={(value) =>
                setFormData({ ...formData, billSentMinister: value })
              }
            />

            {formData.billSentMinister === "Yes" && (
              <div className="grid md:grid-cols-2 gap-4 mb-2">
                <input
                  type="date"
                  value={formData.ministerDate}
                  onChange={(e) =>
                    setFormData({ ...formData, ministerDate: e.target.value })
                  }
                  className="border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div></div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-1 text-muted-foreground">
                    Upload Document
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setMinisterFile(e.target.files?.[0] || null)
                    }
                    className="w-full border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end mt-2">
                  <button
                    onClick={handleSaveMinister}
                    className="px-4 py-2 bg-[#0B1F4D] text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
                  >
                    Save PS / Minister Section
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. PAYMENT ORDER */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <YesNoField
              label="Payment Order Made?"
              value={formData.paymentOrderMade}
              onChange={(value) =>
                setFormData({ ...formData, paymentOrderMade: value })
              }
            />

            {formData.paymentOrderMade === "Yes" && (
              <div className="grid md:grid-cols-4 gap-4 mb-2">
                <input
                  type="date"
                  value={formData.paymentOrderDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentOrderDate: e.target.value,
                    })
                  }
                  className="border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={formData.paymentOrderInstallment}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentOrderInstallment: e.target.value,
                    })
                  }
                  className="border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="1">1st Installment</option>
                  <option value="2">2nd Installment</option>
                  <option value="3">3rd Installment</option>
                  <option value="0">Final Installment</option>
                </select>
                <input
                  type="number"
                  placeholder="Amount Released"
                  value={formData.paymentOrderAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentOrderAmount: e.target.value,
                    })
                  }
                  className="border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="file"
                  onChange={(e) =>
                    setPaymentOrderFile(e.target.files?.[0] || null)
                  }
                  className="border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <div className="md:col-span-4 flex justify-end mt-2">
                  <button
                    onClick={handleSavePaymentOrder}
                    className="px-4 py-2 bg-[#0B1F4D] text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
                  >
                    Save Payment Order Section
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 5. GRANT RELEASED */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <YesNoField
              label="Grant Released?"
              value={formData.grantReleased}
              onChange={(value) =>
                setFormData({ ...formData, grantReleased: value })
              }
            />

            {formData.grantReleased === "Yes" && (
              <div className="grid md:grid-cols-3 gap-4 mb-2">
                <input
                  type="date"
                  value={formData.grantDate}
                  onChange={(e) =>
                    setFormData({ ...formData, grantDate: e.target.value })
                  }
                  className="border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  placeholder="Amount Released"
                  value={formData.grantAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, grantAmount: e.target.value })
                  }
                  className="border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="file"
                  onChange={(e) => setGrantFile(e.target.files?.[0] || null)}
                  className="border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <div className="md:col-span-3 flex justify-end mt-2">
                  <button
                    onClick={handleSaveGrant}
                    className="px-4 py-2 bg-[#0B1F4D] text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
                  >
                    Save Grant Released Section
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 6. PAYMENT DONE TO DDO */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <YesNoField
              label="Payment Done To DDO?"
              value={formData.paymentDoneDDO}
              onChange={(value) =>
                setFormData({ ...formData, paymentDoneDDO: value })
              }
            />

            {formData.paymentDoneDDO === "Yes" && (
              <div className="grid md:grid-cols-3 gap-4 mb-2">
                <input
                  type="date"
                  value={formData.paymentDDODate}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentDDODate: e.target.value })
                  }
                  className="border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={formData.paymentDDOAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentDDOAmount: e.target.value,
                    })
                  }
                  className="border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="file"
                  onChange={(e) => setDdoFile(e.target.files?.[0] || null)}
                  className="border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <div className="md:col-span-3 flex justify-end mt-2">
                  <button
                    onClick={handleSaveDDO}
                    className="px-4 py-2 bg-[#0B1F4D] text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
                  >
                    Save DDO Section
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 7. BILL SENT TO TREASURY */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <YesNoField
              label="Bill Sent To Treasury Office By DDO?"
              value={formData.billSentTreasury}
              onChange={(value) =>
                setFormData({ ...formData, billSentTreasury: value })
              }
            />

            {formData.billSentTreasury === "Yes" && (
              <div className="grid md:grid-cols-4 gap-4 mb-2">
                <input
                  type="date"
                  value={formData.treasuryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, treasuryDate: e.target.value })
                  }
                  className="border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  placeholder="Bill Number"
                  value={formData.treasuryBillNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      treasuryBillNumber: e.target.value,
                    })
                  }
                  className="border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  placeholder="RTGS Number"
                  value={formData.treasuryRtgsNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      treasuryRtgsNumber: e.target.value,
                    })
                  }
                  className="border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="file"
                  onChange={(e) => setTreasuryFile(e.target.files?.[0] || null)}
                  className="border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <div className="md:col-span-4 flex justify-end mt-2">
                  <button
                    onClick={handleSaveTreasury}
                    className="px-4 py-2 bg-[#0B1F4D] text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
                  >
                    Save Treasury Section
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 8. PAYMENT SENT TO VENDOR */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <YesNoField
              label="Payment Sent From Treasury Office To Vendor?"
              value={formData.paymentToVendor}
              onChange={(value) =>
                setFormData({ ...formData, paymentToVendor: value })
              }
            />

            {formData.paymentToVendor === "Yes" && (
              <div className="grid md:grid-cols-4 gap-4 mb-2">
                <input
                  type="date"
                  value={formData.vendorDate}
                  onChange={(e) =>
                    setFormData({ ...formData, vendorDate: e.target.value })
                  }
                  className="border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  placeholder="Transaction ID"
                  value={formData.vendorTransactionId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vendorTransactionId: e.target.value,
                    })
                  }
                  className="border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  placeholder="RTGS Number"
                  value={formData.vendorRtgsNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vendorRtgsNumber: e.target.value,
                    })
                  }
                  className="border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="file"
                  onChange={(e) => setVendorFile(e.target.files?.[0] || null)}
                  className="border border-border bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <div className="md:col-span-4 flex justify-end mt-2">
                  <button
                    onClick={handleSaveVendor}
                    className="px-4 py-2 bg-[#0B1F4D] text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
                  >
                    Save Vendor Section
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Payment Details */}
          <h3 className="font-bold text-lg mb-4 text-[#0B1F4D]">
            Payment Details
          </h3>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <input
              type="number"
              placeholder="Amount Intended to Pay"
              value={formData.intendedAmount}
              onChange={(e) =>
                setFormData({ ...formData, intendedAmount: e.target.value })
              }
              className="border border-border bg-input-background rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="number"
              placeholder="Amount Paid by Department"
              value={formData.paidAmount}
              onChange={(e) =>
                setFormData({ ...formData, paidAmount: e.target.value })
              }
              className="border border-border bg-input-background rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* GST TDS */}
          <h3 className="font-bold text-lg mb-4 text-[#0B1F4D]">
            Amount Received By Department Through GST & TDS
          </h3>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <input
              type="number"
              placeholder="GST Amount"
              value={formData.gstAmount}
              onChange={(e) =>
                setFormData({ ...formData, gstAmount: e.target.value })
              }
              className="border border-border bg-input-background rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="number"
              placeholder="TDS Amount"
              value={formData.tdsAmount}
              onChange={(e) =>
                setFormData({ ...formData, tdsAmount: e.target.value })
              }
              className="border border-border bg-input-background rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex gap-4 pt-4 border-t border-border">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#FF5B1A] hover:bg-opacity-90 text-white rounded-lg transition-colors font-medium"
            >
              Save All
            </button>
            <button
              onClick={() => setSelectedBill(null)}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}