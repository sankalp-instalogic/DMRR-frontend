// billingConfig.ts

// --- 1. TYPE DEFINITIONS ---
export type FieldType = "text" | "number" | "date" | "select" | "file" | "empty";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  type: FieldType;
  stateKey?: string;
  placeholder?: string;
  label?: string;
  containerClass?: string;
  options?: SelectOption[];
  accept?: string;
  fileValue?: File | null;
  fileSetter?: (file: File | null) => void;
}

export interface SectionConfig {
  id: string;
  yesNoLabel: string;
  yesNoKey: string; 
  gridClass: string;
  btnContainerClass: string;
  buttonText: string;
  onSave: () => Promise<void> | void;
  fields: FieldConfig[];
}

export interface BillingConfigDeps {
  // Save Handlers
  handleSaveDDMR: () => Promise<void>;
  handleSaveDO: () => Promise<void>;
  handleSaveDirector: () => Promise<void>;
  handleSavePS: () => Promise<void>;
  handleSaveMinister: () => Promise<void>;
  handleSavePaymentOrder: () => Promise<void>;
  handleSaveGrant: () => Promise<void>;
  handleSaveDDO: () => Promise<void>;
  handleSaveTreasury: () => Promise<void>;
  handleSaveVendor: () => Promise<void>;

  // File Setters
  setDdmrFile: (file: File | null) => void;
  setDoFile: (file: File | null) => void;
  setDirectorFile: (file: File | null) => void;
  setPsFile: (file: File | null) => void;
  setMinisterFile: (file: File | null) => void;
  setPaymentOrderFile: (file: File | null) => void;
  setGrantFile: (file: File | null) => void;
  setDdoFile: (file: File | null) => void;
  setTreasuryFile: (file: File | null) => void;
  setVendorFile: (file: File | null) => void;

  // Current File Values
  ddmrFile: File | null;
  doFile: File | null;
  directorFile: File | null;
  psFile: File | null;
  ministerFile: File | null;
  paymentOrderFile: File | null;
  grantFile: File | null;
  ddoFile: File | null;
  treasuryFile: File | null;
  vendorFile: File | null;
}

// --- 2. FACTORY FUNCTION ---
export const getBillingSectionsConfig = (deps: BillingConfigDeps): SectionConfig[] => [
  {
    id: "ddmr",
    yesNoLabel: "DDMR Received Bill From Line Department?",
    yesNoKey: "ddmrReceived",
    gridClass: "grid md:grid-cols-2 gap-4 mb-2",
    btnContainerClass: "md:col-span-2",
    buttonText: "Save Line of Department Section",
    onSave: deps.handleSaveDDMR,
    fields: [
      { type: "date", stateKey: "ddmrDate" },
      { type: "number", stateKey: "ddmrAmount", placeholder: "Amount" },
      { type: "file", fileValue: deps.ddmrFile, fileSetter: deps.setDdmrFile, label: "Upload Invoice", containerClass: "md:col-span-2" },
    ],
  },
  {
    id: "do",
    yesNoLabel: "Bill Received At DO?",
    yesNoKey: "billReceivedDO",
    gridClass: "grid md:grid-cols-2 gap-4 mb-2",
    btnContainerClass: "md:col-span-2",
    buttonText: "Save DO Section",
    onSave: deps.handleSaveDO,
    fields: [
      { type: "date", stateKey: "doDate" },
      { type: "number", stateKey: "doAmount", placeholder: "Amount" },
      { type: "file", fileValue: deps.doFile, fileSetter: deps.setDoFile, label: "Upload Document", containerClass: "md:col-span-2" },
    ],
  },
  {
    id: "director",
    yesNoLabel: "Bill Received By Director?",
    yesNoKey: "billReceivedDirector",
    gridClass: "grid md:grid-cols-2 gap-4 mb-2",
    btnContainerClass: "md:col-span-2",
    buttonText: "Save Director Section",
    onSave: deps.handleSaveDirector,
    fields: [
      { type: "date", stateKey: "directorDate" },
      { type: "number", stateKey: "directorAmount", placeholder: "Amount" },
      { type: "file", fileValue: deps.directorFile, fileSetter: deps.setDirectorFile, label: "Upload Document", containerClass: "md:col-span-2" },
    ],
  },
  {
    id: "ps",
    yesNoLabel: "Bill Sent To PS?",
    yesNoKey: "billSentPS",
    gridClass: "grid md:grid-cols-2 gap-4 mb-2",
    btnContainerClass: "md:col-span-2",
    buttonText: "Save PS Section",
    onSave: deps.handleSavePS,
    fields: [
      { type: "date", stateKey: "psDate" },
      { type: "empty" },
      { type: "file", fileValue: deps.psFile, fileSetter: deps.setPsFile, label: "Upload Document", containerClass: "md:col-span-2" },
    ],
  },
  {
    id: "minister",
    yesNoLabel: "Bill Sent To Minister?",
    yesNoKey: "billSentMinister",
    gridClass: "grid md:grid-cols-2 gap-4 mb-2",
    btnContainerClass: "md:col-span-2",
    buttonText: "Save Minister Section",
    onSave: deps.handleSaveMinister,
    fields: [
      { type: "date", stateKey: "ministerDate" },
      { type: "empty" },
      { type: "file", fileValue: deps.ministerFile, fileSetter: deps.setMinisterFile, label: "Upload Document", containerClass: "md:col-span-2" },
    ],
  },
  {
    id: "paymentOrder",
    yesNoLabel: "Payment Order Made?",
    yesNoKey: "paymentOrderMade",
    gridClass: "grid md:grid-cols-4 gap-4 mb-2",
    btnContainerClass: "md:col-span-4",
    buttonText: "Save Payment Order Section",
    onSave: deps.handleSavePaymentOrder,
    fields: [
      { type: "date", stateKey: "paymentOrderDate" },
      {
        type: "select",
        stateKey: "paymentOrderInstallment",
        options: [
          { value: "1", label: "1st Installment" },
          { value: "2", label: "2nd Installment" },
          { value: "3", label: "3rd Installment" },
          { value: "0", label: "Final Installment" },
        ],
      },
      { type: "number", stateKey: "paymentOrderAmount", placeholder: "Amount Released" },
      { type: "file", fileValue: deps.paymentOrderFile, fileSetter: deps.setPaymentOrderFile },
    ],
  },
  {
    id: "grant",
    yesNoLabel: "Grant Released?",
    yesNoKey: "grantReleased",
    gridClass: "grid md:grid-cols-3 gap-4 mb-2",
    btnContainerClass: "md:col-span-3",
    buttonText: "Save Grant Released Section",
    onSave: deps.handleSaveGrant,
    fields: [
      { type: "date", stateKey: "grantDate" },
      { type: "number", stateKey: "grantAmount", placeholder: "Amount Released" },
      { type: "file", fileValue: deps.grantFile, fileSetter: deps.setGrantFile },
    ],
  },
  {
    id: "ddo",
    yesNoLabel: "Payment Done To DDO?",
    yesNoKey: "paymentDoneDDO",
    gridClass: "grid md:grid-cols-3 gap-4 mb-2",
    btnContainerClass: "md:col-span-3",
    buttonText: "Save DDO Section",
    onSave: deps.handleSaveDDO,
    fields: [
      { type: "date", stateKey: "paymentDDODate" },
      { type: "number", stateKey: "paymentDDOAmount", placeholder: "Amount" },
      { type: "file", fileValue: deps.ddoFile, fileSetter: deps.setDdoFile },
    ],
  },
  {
    id: "treasury",
    yesNoLabel: "Bill Sent To Treasury Office By DDO?",
    yesNoKey: "billSentTreasury",
    gridClass: "grid md:grid-cols-4 gap-4 mb-2",
    btnContainerClass: "md:col-span-4",
    buttonText: "Save Treasury Section",
    onSave: deps.handleSaveTreasury,
    fields: [
      { type: "date", stateKey: "treasuryDate" },
      { type: "text", stateKey: "treasuryBillNumber", placeholder: "Bill Number" },
      { type: "text", stateKey: "treasuryRtgsNumber", placeholder: "RTGS Number" },
      { type: "file", fileValue: deps.treasuryFile, fileSetter: deps.setTreasuryFile },
    ],
  },
  {
    id: "vendor",
    yesNoLabel: "Payment Sent From Treasury Office To Vendor?",
    yesNoKey: "paymentToVendor",
    gridClass: "grid md:grid-cols-4 gap-4 mb-2",
    btnContainerClass: "md:col-span-4",
    buttonText: "Save Vendor Section",
    onSave: deps.handleSaveVendor,
    fields: [
      { type: "date", stateKey: "vendorDate" },
      { type: "text", stateKey: "vendorTransactionId", placeholder: "Transaction ID" },
      { type: "text", stateKey: "vendorRtgsNumber", placeholder: "RTGS Number" },
      { type: "file", fileValue: deps.vendorFile, fileSetter: deps.setVendorFile },
    ],
  },
];