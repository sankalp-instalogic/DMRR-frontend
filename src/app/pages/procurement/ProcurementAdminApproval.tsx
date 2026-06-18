import { CommitteeApproval } from "./CommitteeApproval";

const aaItems = [
  {
    id: "PROC-2025-002",
    year: "2025-26",
    item: "Medical Kits",
    demandFrom: "NDRF",
    awardCost: "₹12,50,000",
    status: "AA Pending",
    rows: [
      { qty: "500 Kits", location: "NDRF Battalion, Mumbai" },
      { qty: "250 Kits", location: "NDRF Battalion, Pune" },
    ],
  },
  {
    id: "PROC-2025-010",
    year: "2025-26",
    item: "Thermal Imaging Cameras",
    demandFrom: "Pune District",
    awardCost: "₹22,00,000",
    status: "AA Pending",
    rows: [
      { qty: "20 Units", location: "Pune DDMA" },
    ],
  },
];

export function ProcurementAdminApproval() {
  return (
    <CommitteeApproval
      title="Administrative Approval"
      description="Review and approve procurements pending Administrative Approval before tendering"
      forwardLabel="Forward to Tendering"
      forwardPath="/procurement/tendering/tenders"
      items={aaItems}
    />
  );
}
