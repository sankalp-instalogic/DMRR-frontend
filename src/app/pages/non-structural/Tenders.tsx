import { useState } from "react";
import {
  Upload,
  Save,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router";

const stageList = [
  "Technical Bid Opening",
  "Technical Evaluation",
  "Financial Bid Opening",
  "Financial Evaluation",
  "AOC",
];

const initialTenders = [
  {
    organizationChain:
      "Relief and Rehabilitation Department- World Bank Tenders",

    tenderTitle:
      "Selecting Agency for Implementation, Operations, Hosting, Maintenance and Support of Integrated Project Tracking Platform",

    tenderRefNo: "DMRR/01/2026",

    tenderId: "2026_RRWBT_1299477_1",

    documents: {
      "Technical Bid Opening": null,
      "Technical Evaluation": null,
      "Financial Bid Opening": null,
      "Financial Evaluation": null,
      AOC: null,
    },
  },
];

export function Tenders() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("tenders");

  const [tenders, setTenders] = useState(initialTenders);

  const [viewTender, setViewTender] = useState<any>(null);

  const [newTender, setNewTender] = useState({
    organizationChain: "",
    tenderTitle: "",
    tenderRefNo: "",
    tenderId: "",
  });

  const [documents, setDocuments] = useState<any>({
    "Technical Bid Opening": null,
    "Technical Evaluation": null,
    "Financial Bid Opening": null,
    "Financial Evaluation": null,
    AOC: null,
  });

  const allUploaded =
    Object.values(documents).filter(Boolean).length === 5;

  const handleSave = () => {
    setTenders([
      ...tenders,
      {
        ...newTender,
        documents,
      },
    ]);

    alert("Tender saved successfully");

    setNewTender({
      organizationChain: "",
      tenderTitle: "",
      tenderRefNo: "",
      tenderId: "",
    });

    setDocuments({
      "Technical Bid Opening": null,
      "Technical Evaluation": null,
      "Financial Bid Opening": null,
      "Financial Evaluation": null,
      AOC: null,
    });

    setActiveTab("tenders");
  };

  return (
    <div className="space-y-6">

      <div>
        <h1>Tendering</h1>

        <p className="text-sm text-muted-foreground">
          Manage Tender Activities
        </p>
      </div>

      {/* Tabs */}

      <div className="flex gap-4">

        <button
          onClick={() => setActiveTab("tenders")}
          className={`px-5 py-2 rounded-lg font-medium ${
            activeTab === "tenders"
              ? "bg-primary text-white"
              : "bg-muted"
          }`}
        >
          Tenders
        </button>

        <button
          onClick={() => setActiveTab("new")}
          className={`px-5 py-2 rounded-lg font-medium ${
            activeTab === "new"
              ? "bg-primary text-white"
              : "bg-muted"
          }`}
        >
          New Tender
        </button>

      </div>

      {/* TENDER LIST */}

      {activeTab === "tenders" && !viewTender && (

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">

          <table className="w-full">

            <thead className="bg-muted">

              <tr>

                <th className="px-6 py-4 text-left">
                  Tender Title
                </th>

                <th className="px-6 py-4 text-left">
                  Tender Ref No
                </th>

                <th className="px-6 py-4 text-left">
                  Tender ID
                </th>

                <th className="px-6 py-4 text-left">
                  Organization Chain
                </th>

                <th className="px-6 py-4 text-center">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {tenders.map((tender, index) => (

                <tr
                  key={index}
                  className="border-t border-border"
                >

                  <td
                    className="px-6 py-4 max-w-sm truncate"
                    title={tender.tenderTitle}
                  >
                    {tender.tenderTitle}
                  </td>

                  <td className="px-6 py-4">
                    {tender.tenderRefNo}
                  </td>

                  <td className="px-6 py-4">
                    {tender.tenderId}
                  </td>

                  <td
                    className="px-6 py-4 max-w-sm truncate"
                    title={tender.organizationChain}
                  >
                    {tender.organizationChain}
                  </td>

                  <td className="px-6 py-4 text-center">

                    <button
                      onClick={() => setViewTender(tender)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
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

      {/* VIEW TENDER DETAILS */}

{viewTender && (

  <div className="space-y-6">

    {/* Header Details */}

    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">

      <table className="w-full border">

        <tbody>

          <tr className="border">
            <td className="font-bold text-right p-3 w-1/4">
              Organization Chain :
            </td>

            <td className="p-3">
              {viewTender.organizationChain}
            </td>
          </tr>

          <tr className="border">
            <td className="font-bold text-right p-3">
              Tender Title :
            </td>

            <td className="p-3">
              {viewTender.tenderTitle}
            </td>
          </tr>

          <tr className="border">
            <td className="font-bold text-right p-3">
              Tender Ref No :
            </td>

            <td className="p-3">
              {viewTender.tenderRefNo}
            </td>
          </tr>

          <tr className="border">
            <td className="font-bold text-right p-3">
              Tender ID :
            </td>

            <td className="p-3">
              {viewTender.tenderId}
            </td>
          </tr>

        </tbody>

      </table>

    </div>


    {/* Stage Table */}

    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">

      <table className="w-full">

        <thead className="bg-muted">

          <tr>

            <th className="px-6 py-4 text-left">
              Stages
            </th>

            <th className="px-6 py-4 text-center">
              Status
            </th>

            <th className="px-6 py-4 text-center">
              View
            </th>

            <th className="px-6 py-4 text-center">
              Download
            </th>

          </tr>

        </thead>

        <tbody>

          {/* PROCESS 1 */}

          <tr className="bg-muted/40">
            <td
              colSpan={4}
              className="px-6 py-3 font-bold"
            >
              Process 1
            </td>
          </tr>


          {stageList.slice(0, 2).map((stage, index) => (

            <tr
              key={index}
              className="border-t border-border"
            >

              <td className="px-10 py-4">
                {stage}
              </td>

              <td className="px-6 py-4 text-center">

                <CheckCircle2 className="size-6 text-green-600 mx-auto" />

              </td>

              <td className="px-6 py-4 text-center">

                <button>

                  <Eye className="size-5 text-blue-600 mx-auto" />

                </button>

              </td>

              <td className="px-6 py-4 text-center">

                <button>

                  <Download className="size-5 text-primary mx-auto" />

                </button>

              </td>

            </tr>

          ))}


          {/* PROCESS 2 */}

          <tr className="bg-muted/40">
            <td
              colSpan={4}
              className="px-6 py-3 font-bold"
            >
              Process 2
            </td>
          </tr>


          {stageList.slice(2).map((stage, index) => (

            <tr
              key={index}
              className="border-t border-border"
            >

              <td className="px-10 py-4">
                {stage}
              </td>

              <td className="px-6 py-4 text-center">

                <CheckCircle2 className="size-6 text-green-600 mx-auto" />

              </td>

              <td className="px-6 py-4 text-center">

                <button>

                  <Eye className="size-5 text-blue-600 mx-auto" />

                </button>

              </td>

              <td className="px-6 py-4 text-center">

                <button>

                  <Download className="size-5 text-primary mx-auto" />

                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>


    {/* Back Button */}

    <div className="flex justify-end">

      <button
        onClick={() => setViewTender(null)}
        className="px-8 py-3 border border-orange-300 bg-orange-50 rounded-full flex items-center gap-2 hover:bg-orange-100"
      >

        <ArrowLeft className="size-5" />

        Back

      </button>

    </div>

  </div>

)}

      {/* NEW TENDER */}

{activeTab === "new" && (

  <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">

    <h3 className="text-lg font-bold">
      Create New Tender
    </h3>


    {/* Tender Details */}

    <div className="grid md:grid-cols-2 gap-4">

      <div>
        <label className="block text-sm font-medium mb-2">
          Organization Chain
        </label>

        <input
          value={newTender.organizationChain}
          onChange={(e) =>
            setNewTender({
              ...newTender,
              organizationChain: e.target.value,
            })
          }
          className="w-full px-4 py-3 border border-border rounded-lg"
          placeholder="Enter Organization Chain"
        />
      </div>


      <div>
        <label className="block text-sm font-medium mb-2">
          Tender Title
        </label>

        <input
          value={newTender.tenderTitle}
          onChange={(e) =>
            setNewTender({
              ...newTender,
              tenderTitle: e.target.value,
            })
          }
          className="w-full px-4 py-3 border border-border rounded-lg"
          placeholder="Enter Tender Title"
        />
      </div>


      <div>
        <label className="block text-sm font-medium mb-2">
          Tender Ref No
        </label>

        <input
          value={newTender.tenderRefNo}
          onChange={(e) =>
            setNewTender({
              ...newTender,
              tenderRefNo: e.target.value,
            })
          }
          className="w-full px-4 py-3 border border-border rounded-lg"
          placeholder="Enter Tender Reference Number"
        />
      </div>


      <div>
        <label className="block text-sm font-medium mb-2">
          Tender ID
        </label>

        <input
          value={newTender.tenderId}
          onChange={(e) =>
            setNewTender({
              ...newTender,
              tenderId: e.target.value,
            })
          }
          className="w-full px-4 py-3 border border-border rounded-lg"
          placeholder="Enter Tender ID"
        />
      </div>

    </div>



    {/* Stage Table */}

    <div className="border border-border rounded-xl overflow-hidden">

      <table className="w-full">

        <thead className="bg-muted">

          <tr>

            <th className="px-6 py-4 text-left">
              Stages
            </th>

            <th className="px-6 py-4 text-center">
              Upload
            </th>

            <th className="px-6 py-4 text-center">
              Status
            </th>

          </tr>

        </thead>

        <tbody>

          {stageList.map((stage, index) => (

            <tr
              key={index}
              className="border-t border-border"
            >

              <td className="px-6 py-4">
                {stage}
              </td>


              {/* Upload */}

              <td className="px-6 py-4 text-center">

                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">

                  <Upload size={18} />

                  Upload

                  <input
                    type="file"
                    hidden
                    onChange={(e) => {

                      const file =
                        e.target.files?.[0] || null;

                      setDocuments({
                        ...documents,
                        [stage]: file,
                      });

                    }}
                  />

                </label>

              </td>


              {/* Status */}

              <td className="px-6 py-4 text-center">

                {documents[stage] ? (

                  <CheckCircle2 className="size-6 text-green-600 mx-auto" />

                ) : (

                  <XCircle className="size-6 text-red-600 mx-auto" />

                )}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>



    {/* Buttons */}

    <div className="flex justify-end gap-4 mt-6">

      {/* Cancel always visible */}

      <button
        onClick={() => {

          setNewTender({
            organizationChain: "",
            tenderTitle: "",
            tenderRefNo: "",
            tenderId: "",
          });

          setDocuments({
            "Technical Bid Opening": null,
            "Technical Evaluation": null,
            "Financial Bid Opening": null,
            "Financial Evaluation": null,
            AOC: null,
          });

          setActiveTab("tenders");

        }}
        className="px-8 py-3 border rounded-lg"
      >
        Cancel
      </button>


      {/* Save visible only after all uploads */}

      {allUploaded && (

        <button
          onClick={handleSave}
          className="px-8 py-3 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
        >

          <Save size={18} />

          Save

        </button>

      )}

    </div>

  </div>

)}
          </div>
  );
}
