import { useState } from "react";
import {
  Edit,
  Forward,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router";

const pendingProposals = [
  {
    id: "DMRR/2025/MUM/001",
    district: "Mumbai",
    department: "PWD",
    cost: "450 Cr",
    status: "Pending",
  },
  {
    id: "DMRR/2025/PUN/021",
    district: "Pune",
    department: "Rural Development",
    cost: "320 Cr",
    status: "Pending",
  },
  {
    id: "DMRR/2025/NAG/015",
    district: "Nagpur",
    department: "Water Resources",
    cost: "275 Cr",
    status: "Pending",
  },
];

export function SECReview() {
  const navigate = useNavigate();

  const [selectedProposal, setSelectedProposal] = useState<any>(null);

  const [secRecommendation, setSecRecommendation] = useState("");

  const [momDate, setMomDate] = useState("");

  const [momFile, setMomFile] = useState<File | null>(null);

  const [comments, setComments] = useState("");

  const [rejectedProposals, setRejectedProposals] = useState<any[]>([]);

  const [revisedProposals, setRevisedProposals] = useState<any[]>([]);

  const handleReject = () => {
    if (!comments.trim()) {
      alert("Please enter rejection comments.");
      return;
    }

    setRejectedProposals([
      ...rejectedProposals,
      {
        ...selectedProposal,
        comments,
        status: "Rejected",
      },
    ]);

    alert("Proposal added to Rejection Listing.");

    setSelectedProposal(null);
    setComments("");
    setSecRecommendation("");
  };

  const handleRevision = () => {
    if (!comments.trim()) {
      alert("Please enter revision comments.");
      return;
    }

    setRevisedProposals([
      ...revisedProposals,
      {
        ...selectedProposal,
        comments,
        status: "Revision Requested",
      },
    ]);

    alert("Proposal added to Revision Listing.");

    setSelectedProposal(null);
    setComments("");
    setSecRecommendation("");
  };

  const handleForwardToSDMA = () => {
    alert("Proposal forwarded to SDMA successfully");

    setSelectedProposal(null);
    setSecRecommendation("");
    setMomDate("");
    setMomFile(null);

    navigate("/sdma-approval");
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div>
        <h1>SEC Review</h1>

        <p className="text-sm text-muted-foreground">
          State Empowered Committee review and approval
        </p>
      </div>

      {/* Pending Proposal List */}

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-4 text-left">
                Proposal ID
              </th>

              <th className="px-6 py-4 text-left">
                District
              </th>

              <th className="px-6 py-4 text-left">
                Department
              </th>

              <th className="px-6 py-4 text-left">
                Estimated Cost
              </th>

              <th className="px-6 py-4 text-left">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {pendingProposals.map((proposal) => (
              <tr
                key={proposal.id}
                className="border-t border-border"
              >
                <td className="px-6 py-4">
                  {proposal.id}
                </td>

                <td className="px-6 py-4">
                  {proposal.district}
                </td>

                <td className="px-6 py-4">
                  {proposal.department}
                </td>

                <td className="px-6 py-4">
                  ₹ {proposal.cost}
                </td>

                <td className="px-6 py-4">
                  <button
                    onClick={() =>
                      setSelectedProposal(proposal)
                    }
                    className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-xs"
                  >
                    {proposal.status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SEC Evaluation Form */}

      {selectedProposal && (
        <>
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold border-b pb-2">
              SEC Evaluation
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 font-medium">
                  Proposal ID
                </label>

                <input
                  type="text"
                  value={selectedProposal.id}
                  disabled
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 font-medium">
                  SEC Recommendation *
                </label>

                <select
                  value={secRecommendation}
                  onChange={(e) =>
                    setSecRecommendation(
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg"
                >
                  <option value="">
                    Select Recommendation
                  </option>

                  <option value="approved">
                    Approved
                  </option>

                  <option value="rejected">
                    Rejected
                  </option>

                  <option value="revise">
                    Revise
                  </option>
                </select>
              </div>

              {/* APPROVED */}

              {secRecommendation === "approved" && (
                <div className="border rounded-lg p-4 bg-green-50">
                  <h4 className="font-semibold mb-4 text-green-700">
                    Approved Proposal Details
                  </h4>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Date of SEC MoM Issued
                    </label>

                    <input
                      type="date"
                      value={momDate}
                      onChange={(e) =>
                        setMomDate(
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Upload SEC MoM
                    </label>

                    <input
                      type="file"
                      onChange={(e) =>
                        setMomFile(
                          e.target.files?.[0] ||
                            null
                        )
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />

                    {momFile && (
                      <p className="text-sm text-green-600 mt-2">
                        Uploaded: {momFile.name}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* REJECT */}

              {secRecommendation ===
                "rejected" && (
                <div className="border rounded-lg p-4 bg-red-50">
                  <label className="block text-sm font-medium mb-2">
                    Rejection Comments
                  </label>

                  <textarea
                    rows={4}
                    value={comments}
                    onChange={(e) =>
                      setComments(
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              )}

              {/* REVISE */}

              {secRecommendation === "revise" && (
                <div className="border rounded-lg p-4 bg-yellow-50">
                  <label className="block text-sm font-medium mb-2">
                    Revision Comments
                  </label>

                  <textarea
                    rows={4}
                    value={comments}
                    onChange={(e) =>
                      setComments(
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}

          <div className="flex gap-4 flex-wrap">
            {secRecommendation === "approved" &&
              momDate &&
              momFile && (
                <button
                  onClick={handleForwardToSDMA}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
                >
                  <Forward className="size-5" />
                  Forward to SDMA
                </button>
              )}

            {secRecommendation ===
              "rejected" && (
              <button
                onClick={handleReject}
                className="px-6 py-3 bg-destructive text-destructive-foreground rounded-lg flex items-center gap-2"
              >
                <XCircle className="size-5" />
                Reject Proposal
              </button>
            )}

            {secRecommendation === "revise" && (
              <button
                onClick={handleRevision}
                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg flex items-center gap-2"
              >
                <Edit className="size-5" />
                Send for Revision
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}