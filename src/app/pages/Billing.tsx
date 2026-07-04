import { useMemo, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import {
  useQuery,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getBillingSectionsConfig } from "../../../constants/billingYesNoQuestions";
import { DocumentOwnerType, DocumentType } from "../../../constants/documents";
import { Table } from "../components/Table";
import type { ColDef } from "ag-grid-community";
import { Input, Select, DatePicker } from "antd";
import dayjs from "dayjs";
import { Button } from "../components/ui/button";

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
  const queryClient = useQueryClient();

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

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Ref No",
        field: "proposalRefNo",
        flex: 1,
        valueGetter: (params) => params.data.proposalRefNo || "N/A",
      },
      {
        headerName: "Title",
        field: "title",
        flex: 2,
      },
      {
        headerName: "Vendor",
        field: "vendorName",
        flex: 1.5,
        valueGetter: (params) => params.data.vendorName || "Unassigned",
      },
      {
        headerName: "Amount (Lakhs)",
        field: "amountLakhs",
        flex: 1,
        valueFormatter: (params) =>
          `₹${params.value?.toLocaleString("en-IN") || "0"}`,
        cellStyle: { color: "green", fontWeight: 600 },
      },
      {
        headerName: "Status",
        field: "status",
        flex: 1,
      },
      {
        headerName: "Action",
        flex: 1,
        cellRenderer: (params: any) => (
          <Button onClick={() => setSelectedBill(params.data)}>
            Update
          </Button>
        ),
      },
    ],
    [],
  );

  // --- FETCH FUNCTIONS ---
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

  const fetchBillHistory = async ({ queryKey }: any) => {
    const [_key, billId] = queryKey;
    if (!billId) return [];
    const response = await axiosPrivate.get(
      `/api/v1/Billing/${billId}/history`,
    );
    return response.data;
  };

  // --- REACT QUERY ---
  const { data } = useQuery({
    queryKey: ["bills", page, pageSize],
    queryFn: fetchBills,
    placeholderData: keepPreviousData,
  });

  // Fetch History only when a bill is selected
  const { data: historyData } = useQuery({
    queryKey: ["billHistory", selectedBill?.id],
    queryFn: fetchBillHistory,
    enabled: !!selectedBill?.id,
  });

  // --- DATA EXTRACTION & FILTERING ---
  const bills = data?.items ?? [];
  const totalItems = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // Filter history strictly for the PaymentOrder gate
  const paymentOrderHistory = useMemo(() => {
    if (!historyData) return [];
    return historyData.filter((item: any) => item.gate === "PaymentOrder");
  }, [historyData]);

  // Column definitions for the History Table
  const historyColumnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Installment",
        field: "installmentType",
        flex: 1,
      },
      {
        headerName: "Amount",
        field: "amount",
        flex: 1,
        valueFormatter: (params) =>
          `₹${params.value?.toLocaleString("en-IN") || "0"}`,
      },
      {
        headerName: "Entry Date",
        field: "entryDate",
        flex: 1,
        valueFormatter: (params) =>
          params.value ? dayjs(params.value).format("DD MMM YYYY") : "N/A",
      },
      {
        headerName: "Logged At",
        field: "createdAtUtc",
        flex: 1,
        valueFormatter: (params) =>
          params.value
            ? dayjs(params.value).format("DD MMM YYYY, HH:mm")
            : "N/A",
      },
    ],
    [],
  );

  // --- SAVE SECTION 1 (DDMR) ---
  const handleSaveDDMR = async () => {
    if (!selectedBill) return;

    try {
      if (ddmrFile) {
        const docFormData = new FormData();
        docFormData.append("file", ddmrFile);
        docFormData.append("ownerType", String(DocumentOwnerType.Billing));
        docFormData.append("documentType", String(DocumentType.Invoice));
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
        payload,
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
        docFormData.append("ownerType", String(DocumentOwnerType.Billing));
        docFormData.append("documentType", String(DocumentType.Invoice));
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
        payload,
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
        docFormData.append("ownerType", String(DocumentOwnerType.Billing));
        docFormData.append("documentType", String(DocumentType.Invoice));
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
        payload,
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
        docFormData.append("ownerType", String(DocumentOwnerType.Billing));
        docFormData.append("documentType", String(DocumentType.PaymentOrder));
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
        payload,
      );

      queryClient.invalidateQueries({
        queryKey: ["billHistory", selectedBill.id],
      });

      queryClient.invalidateQueries({
        queryKey: ["bills"],
      });

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
        docFormData.append("ownerType", String(DocumentOwnerType.Billing));
        docFormData.append("documentType", String(DocumentType.GRCopy));
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
        payload,
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
        docFormData.append("ownerType", String(DocumentOwnerType.Billing));
        docFormData.append("documentType", String(DocumentType.Invoice));
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
        payload,
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
        docFormData.append("ownerType", String(DocumentOwnerType.Billing));
        docFormData.append("documentType", String(DocumentType.Invoice));
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
        payload,
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
        docFormData.append("ownerType", String(DocumentOwnerType.Billing));
        docFormData.append("documentType", String(DocumentType.Invoice));
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
        payload,
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
        payload,
      );

      toast.success("Billing Reconciliation Details Saved Successfully!");
      setSelectedBill(null);
    } catch (error) {
      console.error("Error saving reconciliation details:", error);
      toast.error("Failed to save reconciliation details. Please try again.");
    }
  };

  const sectionsConfig = useMemo(() => {
    return getBillingSectionsConfig({
      handleSaveDDMR,
      handleSaveDO,
      handleSaveMinister,
      handleSavePaymentOrder,
      handleSaveGrant,
      handleSaveDDO,
      handleSaveTreasury,
      handleSaveVendor,
      setDdmrFile,
      setDoFile,
      setMinisterFile,
      setPaymentOrderFile,
      setGrantFile,
      setDdoFile,
      setTreasuryFile,
      setVendorFile,
    });
  }, [
    selectedBill,
    formData,
    ddmrFile,
    doFile,
    ministerFile,
    paymentOrderFile,
    grantFile,
    ddoFile,
    treasuryFile,
    vendorFile,
  ]);

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
              ? "bg-success text-success-foreground"
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
              ? "bg-destructive text-destructive-foreground"
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
        <h1 className="text-[30px] font-bold text-primary">Billing & Fund Release</h1>
        <p className="text-sm text-muted-foreground">
          Track billing workflow and fund release
        </p>
      </div>

      {/* BILL LIST */}
      <Table
        rowData={bills}
        columnDefs={columnDefs}
        totalCount={totalItems}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        rowHeight={55}
      />

      {/* FORM */}
      {selectedBill && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-primary">
            Billing Workflow - {selectedBill.proposalRefNo}
          </h2>

          {sectionsConfig.map((section) => (
            <div
              key={section.id}
              className="mb-8 p-4 bg-muted rounded-lg border border-border"
            >
              <YesNoField
                label={section.yesNoLabel}
                value={
                  formData[section.yesNoKey as keyof typeof formData] as string
                }
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    [section.yesNoKey]: value,
                  }))
                }
              />

              {formData[section.yesNoKey as keyof typeof formData] ===
                "Yes" && (
                <div className={section.gridClass}>
                  {section.fields.map((field, index) => {
                    if (field.type === "empty")
                      return <div key={`empty-${index}`} />;

                    if (field.type === "file") {
                      return (
                        <div
                          key={`file-${index}`}
                          className={field.containerClass || ""}
                        >
                          {field.label && (
                            <label className="block text-sm mb-1 text-muted-foreground">
                              {field.label}
                            </label>
                          )}
                          <Input
                            type="file"
                            size="large"
                            onChange={(e) =>
                              field.fileSetter &&
                              field.fileSetter(e.target.files?.[0] || null)
                            }
                            className="w-full bg-card"
                          />
                        </div>
                      );
                    }

                    if (field.type === "select") {
                      return (
                        <Select
                          key={`select-${index}`}
                          size="large"
                          value={
                            formData[
                              field.stateKey as keyof typeof formData
                            ] as string
                          }
                          onChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              [field.stateKey as string]: value,
                            }))
                          }
                          className="w-full bg-card"
                        >
                          {field.options?.map((opt) => (
                            <Select.Option key={opt.value} value={opt.value}>
                              {opt.label}
                            </Select.Option>
                          ))}
                        </Select>
                      );
                    }

                    if (field.type === "date") {
                      return (
                        <DatePicker
                          key={`date-${index}`}
                          size="large"
                          placeholder={field.placeholder || "Select date"}
                          value={
                            formData[field.stateKey as keyof typeof formData]
                              ? dayjs(
                                  formData[
                                    field.stateKey as keyof typeof formData
                                  ] as string,
                                )
                              : null
                          }
                          onChange={(_date, dateString) =>
                            setFormData((prev) => ({
                              ...prev,
                              [field.stateKey as string]: dateString, // dateString defaults to YYYY-MM-DD
                            }))
                          }
                          className="w-full bg-card"
                        />
                      );
                    }

                    // For standard inputs (text, number)
                    return (
                      <Input
                        key={`input-${index}`}
                        type={field.type}
                        size="large"
                        placeholder={field.placeholder}
                        value={
                          formData[
                            field.stateKey as keyof typeof formData
                          ] as string
                        }
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            [field.stateKey as string]: e.target.value,
                          }))
                        }
                        className="w-full bg-card"
                      />
                    );
                  })}

                  <div
                    className={`${section.btnContainerClass} flex justify-end mt-2 col-span-full`}
                  >
                    <Button onClick={section.onSave}>
                      {section.buttonText}
                    </Button>
                  </div>

                  {/* INJECT HISTORY TABLE FOR PAYMENT ORDER SECTION ONLY */}
                  {section.yesNoKey === "paymentOrderMade" &&
                    paymentOrderHistory.length > 0 && (
                      <div className="col-span-full mt-6 pt-6 border-t border-border">
                        <h4 className="font-semibold text-primary mb-4">
                          Previous Payment Orders
                        </h4>
                        <div className="bg-card rounded-lg overflow-hidden border border-border">
                          {/* Passing dummy pagination props assuming Table requires them */}
                          <Table
                            rowData={paymentOrderHistory}
                            columnDefs={historyColumnDefs}
                            totalCount={paymentOrderHistory.length}
                            page={1}
                            totalPages={1}
                            onPageChange={() => {}}
                            rowHeight={45}
                          />
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          ))}

          {/* Payment Details */}
          <h3 className="font-bold text-lg mb-4 text-primary">
            Payment Details
          </h3>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Input
              type="number"
              size="large"
              placeholder="Amount Intended to Pay"
              value={formData.intendedAmount}
              onChange={(e) =>
                setFormData({ ...formData, intendedAmount: e.target.value })
              }
              className="bg-input-background"
            />
            <Input
              type="number"
              size="large"
              placeholder="Amount Paid by Department"
              value={formData.paidAmount}
              onChange={(e) =>
                setFormData({ ...formData, paidAmount: e.target.value })
              }
              className="bg-input-background"
            />
          </div>

          {/* GST TDS */}
          <h3 className="font-bold text-lg mb-4 text-primary">
            Amount Received By Department Through GST & TDS
          </h3>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Input
              type="number"
              size="large"
              placeholder="GST Amount"
              value={formData.gstAmount}
              onChange={(e) =>
                setFormData({ ...formData, gstAmount: e.target.value })
              }
              className="bg-input-background"
            />
            <Input
              type="number"
              size="large"
              placeholder="TDS Amount"
              value={formData.tdsAmount}
              onChange={(e) =>
                setFormData({ ...formData, tdsAmount: e.target.value })
              }
              className="bg-input-background"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex gap-4 pt-4 border-t border-border">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-accent hover:bg-opacity-90 text-primary-foreground rounded-lg transition-colors font-medium"
            >
              Save All
            </button>
            <button
              onClick={() => setSelectedBill(null)}
              className="px-6 py-2 bg-muted hover:bg-muted text-foreground rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
