import { CommitteeApproval } from "./CommitteeApproval";

const secItems = [
  {
    id: "PROC-2025-006",
    year: "2025-26",
    item: "Flood Barriers",
    demandFrom: "SDRF",
    awardCost: "₹62,00,000",
    status: "SEC Pending",
    rows: [
      { qty: "500 Meters", location: "Kolhapur District" },
      { qty: "300 Meters", location: "Sangli District" },
    ],
  },
  {
    id: "PROC-2025-009",
    year: "2025-26",
    item: "Portable Water Purifiers",
    demandFrom: "Nashik District",
    awardCost: "₹14,00,000",
    status: "SEC Pending",
    rows: [
      { qty: "100 Units", location: "Nashik DDMA" },
    ],
  },
];

export function SECApprovalProcurement() {
  return (
    <CommitteeApproval
      title="SEC Approval"
      description="Review and approve procurements pending before the State Executive Committee"
      forwardLabel="Forward to Administrative Approval"
      forwardPath="/procurement-admin-approval"
      items={secItems}
    />
  );
}
