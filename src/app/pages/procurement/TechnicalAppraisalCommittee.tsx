import { CommitteeApproval } from "./CommitteeApproval";

const tacItems = [
  {
    id: "PROC-2025-004",
    year: "2025-26",
    item: "Communication Radios",
    demandFrom: "Army",
    awardCost: "₹35,00,000",
    status: "TAC Pending",
    rows: [
      { qty: "150 Units", location: "Army Base, Pune" },
      { qty: "50 Units", location: "Army Base, Nagpur" },
    ],
  },
  {
    id: "PROC-2025-008",
    year: "2025-26",
    item: "Night Vision Equipment",
    demandFrom: "NDRF",
    awardCost: "₹28,00,000",
    status: "TAC Pending",
    rows: [
      { qty: "30 Sets", location: "NDRF Battalion, Pune" },
    ],
  },
];

export function TechnicalAppraisalCommittee() {
  return (
    <CommitteeApproval
      title="Technical Appraisal Committee"
      description="Review and approve procurements pending before the Technical Appraisal Committee"
      forwardLabel="Forward to SEC"
      forwardPath="/procurement/sec-approval"
      items={tacItems}
    />
  );
}
