import { Building2 } from "lucide-react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";

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
  const axiosPrivate = useAxiosPrivate();

  // --- API Fetches ---
  const { data: lineDepartments = [], isLoading: isLoadingDepts } = useQuery({
    queryKey: ["lineDepartments"],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        "/api/v1/masters/line-departments",
      );
      return response.data.items; // Adjust if your data is nested (e.g., response.data.data)
    },
  });

  const { data: proposalSources = [], isLoading: isLoadingSources } = useQuery({
    queryKey: ["proposalSources"],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        "/api/v1/lookups/proposal-sources",
      );
      return response.data;
    },
  });

  const { data: receivingAuthorities = [], isLoading: isLoadingAuthorities } =
    useQuery({
      queryKey: ["receivingAuthorities"],
      queryFn: async () => {
        const response = await axiosPrivate.get("/api/v1/lookups/authorities");
        return response.data;
      },
    });

  const { data: officers = [], isLoading: isLoadingOfficers } = useQuery({
    queryKey: ["officers"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/lookups/officers");
      return response.data;
    },
  });

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
          onChange={(e) => setData({ ...data, lineDepartment: e.target.value })}
          disabled={isLoadingDepts}
          className="w-full cursor-pointer px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">
            {isLoadingDepts
              ? "Loading Departments..."
              : "Select Line Department"}
          </option>
          {/* Note: Assuming API returns objects with `id` and `name`. 
              If it returns strings, use: lineDepartments.map(dept => <option key={dept} value={dept}>{dept}</option>) */}
          {Array.isArray(lineDepartments) &&
            lineDepartments.map((dept: any) => (
              <option
                key={dept.id || dept.name || dept}
                value={dept.id || dept}
              >
                {dept.name || dept}
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
            setData({ ...data, proposalReceivedFrom: e.target.value })
          }
          disabled={isLoadingSources}
          className="w-full cursor-pointer px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">
            {isLoadingSources ? "Loading Sources..." : "Select Source"}
          </option>
          {Array.isArray(proposalSources) &&
            proposalSources.map((source: any) => (
              <option
                key={source.id || source.name || source}
                value={source.id || source}
              >
                {source.name || source}
              </option>
            ))}
        </select>
      </div>

      {/* Proposal Received Date */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Proposal Received Date <span className="text-red-600">*</span>
        </label>
        <input
          type="date"
          value={data.proposalReceivedDate}
          onChange={(e) =>
            setData({ ...data, proposalReceivedDate: e.target.value })
          }
          className="w-full cursor-text px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Name of Source */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Name of Source <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={data.sourceName}
          onChange={(e) => setData({ ...data, sourceName: e.target.value })}
          className="w-full cursor-text px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
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
            setData({ ...data, receivingAuthority: e.target.value })
          }
          disabled={isLoadingAuthorities}
          className="w-full cursor-pointer px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">
            {isLoadingAuthorities
              ? "Loading Authorities..."
              : "Select Authority"}
          </option>
          {Array.isArray(receivingAuthorities) &&
            receivingAuthorities.map((auth: any) => (
              <option
                key={auth.id || auth.name || auth}
                value={auth.id || auth}
              >
                {auth.name || auth}
              </option>
            ))}
        </select>
      </div>

      {/* Date of Receipt by Authority */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Date of Receipt by Authority <span className="text-red-600">*</span>
        </label>
        <input
          type="date"
          value={data.authorityReceivedDate}
          onChange={(e) =>
            setData({ ...data, authorityReceivedDate: e.target.value })
          }
          className="w-full cursor-text px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
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
            setData({ ...data, officerInCharge: e.target.value })
          }
          disabled={isLoadingOfficers}
          className="w-full cursor-pointer px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">
            {isLoadingOfficers ? "Loading Officers..." : "Select Officer"}
          </option>
          {officers.map((officer: any) => (
            <option
              key={officer.id || officer.name || officer}
              value={officer.id || officer}
            >
              {officer.name || officer}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
