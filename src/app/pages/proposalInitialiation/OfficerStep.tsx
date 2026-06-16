import { Building2 } from "lucide-react";

const lineDepartments = [
  "PWD",
  "Water Resources Department",
  "Health & Family Welfare",
  "Forest Department",
  "Urban Development",
  "Rural Development",
  "PSU",
];

const proposalSources = ["MLA", "Citizen", "Others"];

const receivingAuthorities = [
  "Minister",
  "Principal Secretary (PS)",
  "Director",
  "Under Secretary (US)",
];

const officers = ["Under Secretary", "ASO", "DO"];

interface Step2Data {
  lineDepartment: string;
  proposalReceivedFrom: string;
  sourceName: string;
  proposalReceivedDate: string;
  receivingAuthority: string;
  authorityReceivedDate: string;
  officerInCharge: string;
}

interface OfficersStepProps {
  data: Step2Data;
  setData: React.Dispatch<React.SetStateAction<Step2Data>>;
}

export function OfficersStep({ data, setData }: OfficersStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
        <Building2 className="size-5" />
        Step 2: Line Department & Officers
      </h3>

      {/* Line Department */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Line Department <span className="text-red-600">*</span>
        </label>

        <select
          value={data.lineDepartment}
          onChange={(e) =>
            setData({
              ...data,
              lineDepartment: e.target.value,
            })
          }
          className="w-full cursor-pointer px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Select Line Department</option>
          {lineDepartments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Received Proposal From */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Received Proposal From <span className="text-red-600">*</span>
        </label>

        <select
          value={data.proposalReceivedFrom}
          onChange={(e) =>
            setData({
              ...data,
              proposalReceivedFrom: e.target.value,
            })
          }
          className="w-full cursor-pointer px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Select Source</option>
          {proposalSources.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Proposal Received Date *
        </label>

        <input
          type="date"
          value={data.proposalReceivedDate}
          onChange={(e) =>
            setData({
              ...data,
              proposalReceivedDate: e.target.value,
            })
          }
          className="w-full cursor-text px-4 py-3 border border-border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Name of Source *
        </label>

        <input
          type="text"
          value={data.sourceName}
          onChange={(e) =>
            setData({
              ...data,
              sourceName: e.target.value,
            })
          }
          className="w-full cursor-text px-4 py-3 border border-border rounded-lg"
          placeholder="Enter MLA/Citizen Name"
        />
      </div>

      {/* Receiving Authority */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Receiving Authority <span className="text-red-600">*</span>
        </label>

        <select
          value={data.receivingAuthority}
          onChange={(e) =>
            setData({
              ...data,
              receivingAuthority: e.target.value,
            })
          }
          className="w-full cursor-pointer px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Select Authority</option>
          {receivingAuthorities.map((auth) => (
            <option key={auth} value={auth}>
              {auth}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Date of Receipt by Authority *
        </label>

        <input
          type="date"
          value={data.authorityReceivedDate}
          onChange={(e) =>
            setData({
              ...data,
              authorityReceivedDate: e.target.value,
            })
          }
          className="w-full cursor-text px-4 py-3 border border-border rounded-lg"
        />
      </div>

      {/* Officer In Charge */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Officer In Charge <span className="text-red-600">*</span>
        </label>

        <select
          value={data.officerInCharge}
          onChange={(e) =>
            setData({
              ...data,
              officerInCharge: e.target.value,
            })
          }
          className="w-full cursor-pointer px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Select Officer</option>
          {officers.map((officer) => (
            <option key={officer} value={officer}>
              {officer}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
