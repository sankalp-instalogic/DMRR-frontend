import { CommitteeApproval } from "./CommitteeApproval";

const pscItems = [
  {
    id: "PROC-2025-003",
    year: "2024-25",
    item: "Rescue Boats",
    demandFrom: "Nagpur District",
    awardCost: "₹85,00,000",
    status: "PSC Pending",
    rows: [
      { qty: "10 Units", location: "Nagpur DDMA HQ" },
      { qty: "5 Units", location: "Wardha Relief Camp" },
    ],
  },
  {
    id: "PROC-2025-007",
    year: "2025-26",
    item: "Life Jackets",
    demandFrom: "Kolhapur District",
    awardCost: "₹8,50,000",
    status: "PSC Pending",
    rows: [
      { qty: "200 Units", location: "Kolhapur District Store" },
    ],
  },
];

export function ProposalScrutinyCommittee() {
  return (
    <CommitteeApproval
      title="Proposal Scrutiny Committee"
      description="Review and approve procurements pending before the Proposal Scrutiny Committee"
      forwardLabel="Forward to TAC"
      forwardPath="/procurement/tac"
      items={pscItems}
    />
  );
}
