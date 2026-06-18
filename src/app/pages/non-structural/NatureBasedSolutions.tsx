import { useState } from "react";
import {
  ArrowLeft,
  Eye,
  Download,
  Printer,
} from "lucide-react";

interface NBSData {
  id: string;
  title: string;
  solutionHead: string;
  district: string;
  grDate: string;
  allocatedBudget: string;
  utilizedBudget: string;
  completionDate: string;
  grDoc?: File | null;
  completionDoc?: File | null;
}
export function NatureBasedSolutions() {
  const [activeTab, setActiveTab] = useState<"list" | "new">("list");

  const [selectedNBS, setSelectedNBS] =
    useState<NBSData | null>(null);

 const [nbsList, setNbsList] = useState<NBSData[]>([
  {
    id: "NBS001",
    title: "Mangrove Restoration",
    solutionHead: "Coastal Protection",
    district: "Mumbai",
    grDate: "10-01-2025",
    allocatedBudget: "₹50 Lakhs",
    utilizedBudget: "₹42 Lakhs",
    completionDate: "15-03-2025",
  },
  {
    id: "NBS002",
    title: "River Rejuvenation",
    solutionHead: "Water Conservation",
    district: "Pune",
    grDate: "12-02-2025",
    allocatedBudget: "₹50 Lakhs",
    utilizedBudget: "₹38 Lakhs",
    completionDate: "20-04-2025",
  },
  {
    id: "NBS003",
    title: "Urban Forest Development",
    solutionHead: "Afforestation",
    district: "Nagpur",
    grDate: "15-02-2025",
    allocatedBudget: "₹50 Lakhs",
    utilizedBudget: "₹46 Lakhs",
    completionDate: "25-04-2025",
  },
  {
    id: "NBS004",
    title: "Wetland Conservation",
    solutionHead: "Biodiversity",
    district: "Nashik",
    grDate: "20-03-2025",
    allocatedBudget: "₹50 Lakhs",
    utilizedBudget: "₹35 Lakhs",
    completionDate: "10-05-2025",
  },
  {
    id: "NBS005",
    title: "Green Corridor",
    solutionHead: "Climate Adaptation",
    district: "Thane",
    grDate: "01-04-2025",
    allocatedBudget: "₹50 Lakhs",
    utilizedBudget: "₹40 Lakhs",
    completionDate: "18-06-2025",
  },
]);

 const [formData, setFormData] = useState<NBSData>({
  id: "",
  title: "",
  solutionHead: "",
  district: "",
  grDate: "",
  allocatedBudget: "",
  utilizedBudget: "",
  completionDate: "",
  grDoc: null,
  completionDoc: null,
});

  const handleSave = () => {
    setNbsList([
      ...nbsList,
      {
        ...formData,
      },
    ]);

    setFormData({
  id: "",
  title: "",
  solutionHead: "",
  district: "",
  grDate: "",
  allocatedBudget: "",
  utilizedBudget: "",
  completionDate: "",
  grDoc: null,
  completionDoc: null,
});

    setActiveTab("list");
  };

  if (selectedNBS) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">

          <button
            onClick={() => setSelectedNBS(null)}
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
            Nature Based Solution Details
          </h2>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

  <div>
    <label className="font-semibold">
      NBS ID
    </label>
    <div>{selectedNBS.id}</div>
  </div>

  <div>
    <label className="font-semibold">
      District
    </label>
    <div>{selectedNBS.district}</div>
  </div>

  <div>
    <label className="font-semibold">
      Title
    </label>
    <div>{selectedNBS.title}</div>
  </div>

  <div>
    <label className="font-semibold">
      Date of GR Issued
    </label>
    <div>{selectedNBS.grDate}</div>
  </div>

  <div>
    <label className="font-semibold">
      Allocated Budget
    </label>
    <div>{selectedNBS.allocatedBudget}</div>
  </div>

  <div>
    <label className="font-semibold">
      Utilized Budget
    </label>
    <div>{selectedNBS.utilizedBudget}</div>
  </div>

  <div>
    <label className="font-semibold">
      Date of Completion
    </label>
    <div>{selectedNBS.completionDate}</div>
  </div>

  <div>
    <label className="font-semibold">
      GR Issued
    </label>

    <div className="flex gap-3 mt-2">
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

  <div>
    <label className="font-semibold">
      Completion Certificate
    </label>

    <div className="flex gap-3 mt-2">
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

  return (
    <>
      <div className="flex items-center justify-between mb-6">

        <h1 className="text-2xl">
          Nature Based Solutions
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
            NBS List
          </button>

          <button
            onClick={() => setActiveTab("new")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "new"
                ? "bg-primary text-white"
                : "border"
            }`}
          >
            New Solution
          </button>

        </div>

      </div>

      {activeTab === "list" && (
        <div className="bg-card border rounded-xl p-6 shadow-sm">

          <table className="w-full border">

            <thead className="bg-muted">

              <tr>
                   
                <th className="border text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider ">Sr No</th>
               <th className="border text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider ">NBS ID</th>
                <th className="border text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider ">Solution Head</th>
                <th className="border text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider ">Date of GR Issued</th>
              <th className="border text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider ">Allocated Budget</th>
                 <th className="border text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider ">Utilized Budget</th>
                <th className="border text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider ">Date of Completion</th>
               <th className="border text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider "> Action</th>
              </tr>

            </thead>

          <tbody>
  {nbsList.map((item, index) => (
    <tr key={index}>
      <td className="border p-3 text-center">
        {index + 1}
      </td>

      <td className="border p-3 text-center">
        {item.id}
      </td>

      <td className="border p-3 text-center">
        {item.district}
      </td>

      <td className="border p-3 text-center">
        {item.grDate}
      </td>

      <td className="border p-3 text-center">
        {item.allocatedBudget}
      </td>

      <td className="border p-3 text-center">
        {item.utilizedBudget}
      </td>

      <td className="border p-3 text-center">
        {item.completionDate}
      </td>

      <td className="border p-3 text-center">
        <button
          onClick={() => setSelectedNBS(item)}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          View
        </button>
      </td>
    </tr>
  ))}
</tbody>
            
          </table>

        </div>
      )}

      {activeTab === "new" && (
        <div className="bg-card border rounded-xl p-6 shadow-sm">

          <h2 className="text-xl font-bold mb-6">
            New Nature Based Solution
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

  <div>
    <label className="font-semibold block mb-2">
      NBS ID
    </label>
    <input
      className="w-full border rounded-lg p-3"
      value={formData.id}
      onChange={(e) =>
        setFormData({
          ...formData,
          id: e.target.value,
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
      District
    </label>
    <input
      className="w-full border rounded-lg p-3"
      value={formData.district}
      onChange={(e) =>
        setFormData({
          ...formData,
          district: e.target.value,
        })
      }
    />
  </div>

  <div>
    <label className="font-semibold block mb-2">
      Date of GR Issued
    </label>
    <input
      type="date"
      className="w-full border rounded-lg p-3"
      value={formData.grDate}
      onChange={(e) =>
        setFormData({
          ...formData,
          grDate: e.target.value,
        })
      }
    />
  </div>

  <div>
    <label className="font-semibold block mb-2">
      Allocated Budget
    </label>
    <input
      className="w-full border rounded-lg p-3"
      value={formData.allocatedBudget}
      onChange={(e) =>
        setFormData({
          ...formData,
          allocatedBudget: e.target.value,
        })
      }
    />
  </div>

  <div>
    <label className="font-semibold block mb-2">
      Utilized Budget
    </label>
    <input
      className="w-full border rounded-lg p-3"
      value={formData.utilizedBudget}
      onChange={(e) =>
        setFormData({
          ...formData,
          utilizedBudget: e.target.value,
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
      GR Issued Upload
    </label>
    <input
      type="file"
      className="w-full border rounded-lg p-3"
      onChange={(e) =>
        setFormData({
          ...formData,
          grDoc: e.target.files?.[0] || null,
        })
      }
    />
  </div>

  <div className="md:col-span-2">
    <label className="font-semibold block mb-2">
      Completion Certificate Upload
    </label>
    <input
      type="file"
      className="w-full border rounded-lg p-3"
      onChange={(e) =>
        setFormData({
          ...formData,
          completionDoc:
            e.target.files?.[0] || null,
        })
      }
    />
  </div>

</div>

          {/* Buttons */}
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

    </>
  );
}