import { useState } from "react";
import {
  Plus,
  Eye,
  Download,
  ArrowLeft,
  Printer,
} from "lucide-react";

interface GrantData {
  grantId: string;
  title: string;
  researchGrantTo: string;
  issueDate: string;
  allocatedAmount: string;
  utilizedAmount: string;
  completionDate: string;
  completionCertificate?: string;
}

export function ResearchAndGrants() {
  const [activeTab, setActiveTab] = useState<"list" | "new">("list");
  const [selectedGrant, setSelectedGrant] =
    useState<GrantData | null>(null);

  const [grants, setGrants] = useState<GrantData[]>([
    {
      grantId: "RG001",
      title: "Flood Risk Assessment Study",
      researchGrantTo: "IIT Bombay",
      issueDate: "2025-01-15",
      allocatedAmount: "₹50 Lakhs",
      utilizedAmount: "₹42 Lakhs",
      completionDate: "2025-06-30",
      completionCertificate: "Completion_RG001.pdf",
    },
    {
      grantId: "RG002",
      title: "River Basin Management Research",
      researchGrantTo: "COEP Pune",
      issueDate: "2025-02-10",
      allocatedAmount: "₹40 Lakhs",
      utilizedAmount: "₹35 Lakhs",
      completionDate: "2025-07-15",
      completionCertificate: "Completion_RG002.pdf",
    },
    {
      grantId: "RG003",
      title: "Climate Resilience Framework",
      researchGrantTo: "VNIT Nagpur",
      issueDate: "2025-03-05",
      allocatedAmount: "₹60 Lakhs",
      utilizedAmount: "₹50 Lakhs",
      completionDate: "2025-08-20",
      completionCertificate: "Completion_RG003.pdf",
    },
    {
      grantId: "RG004",
      title: "Urban Flood Mapping",
      researchGrantTo: "ICT Mumbai",
      issueDate: "2025-04-12",
      allocatedAmount: "₹45 Lakhs",
      utilizedAmount: "₹38 Lakhs",
      completionDate: "2025-09-10",
      completionCertificate: "Completion_RG004.pdf",
    },
    {
      grantId: "RG005",
      title: "Disaster Preparedness Research",
      researchGrantTo: "Savitribai Phule Pune University",
      issueDate: "2025-05-01",
      allocatedAmount: "₹55 Lakhs",
      utilizedAmount: "₹46 Lakhs",
      completionDate: "2025-10-15",
      completionCertificate: "Completion_RG005.pdf",
    },
  ]);

  const [formData, setFormData] = useState<GrantData>({
    grantId: "",
    title: "",
    researchGrantTo: "",
    issueDate: "",
    allocatedAmount: "",
    utilizedAmount: "",
    completionDate: "",
    completionCertificate: "",
  });

  const handleSave = () => {
    setGrants([...grants, formData]);

    setFormData({
      grantId: "",
      title: "",
      researchGrantTo: "",
      issueDate: "",
      allocatedAmount: "",
      utilizedAmount: "",
      completionDate: "",
      completionCertificate: "",
    });

    setActiveTab("list");
  };

  // ==========================
  // VIEW PAGE
  // ==========================

  if (selectedGrant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedGrant(null)}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg"
          >
            <Printer className="size-4" />
            Print
          </button>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">
            Grant Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="font-semibold">
                Grant ID
              </label>
              <div>{selectedGrant.grantId}</div>
            </div>

            <div>
              <label className="font-semibold">
                Title
              </label>
              <div>{selectedGrant.title}</div>
            </div>

            <div>
              <label className="font-semibold">
                Research/Grant Given To
              </label>
              <div>{selectedGrant.researchGrantTo}</div>
            </div>

            <div>
              <label className="font-semibold">
                Date of Issue
              </label>
              <div>{selectedGrant.issueDate}</div>
            </div>

            <div>
              <label className="font-semibold">
                Allocated Amount
              </label>
              <div>{selectedGrant.allocatedAmount}</div>
            </div>

            <div>
              <label className="font-semibold">
                Utilized Amount
              </label>
              <div>{selectedGrant.utilizedAmount}</div>
            </div>

            <div>
              <label className="font-semibold">
                Date of Completion
              </label>
              <div>{selectedGrant.completionDate}</div>
            </div>

            <div>
              <label className="font-semibold block mb-2">
                Completion Certificate
              </label>

              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
                  <Eye className="size-4" />
                  View
                </button>

                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg">
                  <Download className="size-4" />
                  Download
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ==========================
  // MAIN PAGE
  // ==========================

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Research & Grants
        </h1>

        <div className="flex gap-3">

          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "list"
                ? "bg-primary text-white"
                : "border"
            }`}
          >
            Grants List
          </button>

          <button
            onClick={() => setActiveTab("new")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              activeTab === "new"
                ? "bg-primary text-white"
                : "border"
            }`}
          >
            <Plus className="size-4" />
            New Grant
          </button>

        </div>
      </div>

      {/* ==========================
          GRANTS LIST
      ========================== */}

      {activeTab === "list" && (
        <div className="bg-card border rounded-xl p-6 shadow-sm">

          <h2 className="text-xl font-semibold mb-6">
            Grants List
          </h2>

          <div className="overflow-x-auto">

            <table className="w-full border-collapse border">

              <thead className="bg-muted">
                <tr>
                  <th className="border px-4 py-3">
                    Sr No
                  </th>

                  <th className="border px-4 py-3">
                    Research/Grant Given To
                  </th>

                  <th className="border px-4 py-3">
                    Date of Issue
                  </th>

                  <th className="border px-4 py-3">
                    Allocated Amount
                  </th>

                  <th className="border px-4 py-3">
                    Utilized Amount
                  </th>

                  <th className="border px-4 py-3">
                    Date of Completion
                  </th>

                  <th className="border px-4 py-3">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {grants.map((grant, index) => (
                  <tr key={index}>
                    <td className="border p-3 text-center">
                      {index + 1}
                    </td>

                    <td className="border p-3 text-center">
                      {grant.researchGrantTo}
                    </td>

                    <td className="border p-3 text-center">
                      {grant.issueDate}
                    </td>

                    <td className="border p-3 text-center">
                      {grant.allocatedAmount}
                    </td>

                    <td className="border p-3 text-center">
                      {grant.utilizedAmount}
                    </td>

                    <td className="border p-3 text-center">
                      {grant.completionDate}
                    </td>

                    <td className="border p-3 text-center">
                      <button
                        onClick={() =>
                          setSelectedGrant(grant)
                        }
                        className="flex items-center gap-2 mx-auto bg-primary text-white px-3 py-1 rounded-lg"
                      >
                        <Eye className="size-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        </div>
      )}

      {/* ==========================
          NEW GRANT
      ========================== */}

      {activeTab === "new" && (
        <div className="bg-card border rounded-xl p-6 shadow-sm">

          <h2 className="text-xl font-bold mb-6">
            New Grant
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="font-semibold block mb-2">
                Grant ID
              </label>

              <input
                className="w-full border rounded-lg p-3"
                value={formData.grantId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    grantId: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">
                Title
              </label>

              <input
                className="w-full border rounded-lg p-3"
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">
                Research/Grant Given To
              </label>

              <input
                className="w-full border rounded-lg p-3"
                value={formData.researchGrantTo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    researchGrantTo: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">
                Date of Grant Issued
              </label>

              <input
                type="date"
                className="w-full border rounded-lg p-3"
                value={formData.issueDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    issueDate: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">
                Allocated Amount
              </label>

              <input
                className="w-full border rounded-lg p-3"
                value={formData.allocatedAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    allocatedAmount: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">
                Utilized Amount
              </label>

              <input
                className="w-full border rounded-lg p-3"
                value={formData.utilizedAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    utilizedAmount: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">
                Date of Completion
              </label>

              <input
                type="date"
                className="w-full border rounded-lg p-3"
                value={formData.completionDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    completionDate: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">
                Completion Certificate Upload
              </label>

              <input
                type="file"
                className="w-full border rounded-lg p-3"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    completionCertificate:
                      e.target.files?.[0]?.name || "",
                  })
                }
              />
            </div>

          </div>

          <div className="flex gap-4 mt-8">

            <button
              onClick={handleSave}
              className="bg-primary text-white px-6 py-3 rounded-lg"
            >
              Save
            </button>

            <button
              onClick={() => setActiveTab("list")}
              className="border px-6 py-3 rounded-lg"
            >
              Cancel
            </button>

          </div>

        </div>
      )}

    </div>
  );
}