import React from "react";
import { Building2 } from "lucide-react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { Input, Select, DatePicker } from "antd";
import dayjs from "dayjs"; // Ant Design v5 uses dayjs for dates

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
      const response = await axiosPrivate.get("/api/v1/masters/line-departments");
      return response.data.items;
    },
  });

  const { data: proposalSources = [], isLoading: isLoadingSources } = useQuery({
    queryKey: ["proposalSources"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/lookups/proposal-sources");
      return response.data;
    },
  });

  const { data: receivingAuthorities = [], isLoading: isLoadingAuthorities } = useQuery({
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
          Line Department <span className="text-destructive">*</span>
        </label>
        <Select
          size="large"
          className="w-full"
          placeholder="Select Line Department"
          value={data.lineDepartment || undefined}
          onChange={(value) => setData({ ...data, lineDepartment: value })}
          disabled={isLoadingDepts}
          loading={isLoadingDepts}
        >
          {Array.isArray(lineDepartments) &&
            lineDepartments.map((dept: any) => (
              <Select.Option key={dept.id || dept.name || dept} value={dept.id || dept}>
                {dept.name || dept}
              </Select.Option>
            ))}
        </Select>
      </div>

      {/* Received Proposal From */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Received Proposal From <span className="text-destructive">*</span>
        </label>
        <Select
          size="large"
          className="w-full"
          placeholder="Select Source"
          value={data.proposalReceivedFrom || undefined}
          onChange={(value) => setData({ ...data, proposalReceivedFrom: value })}
          disabled={isLoadingSources}
          loading={isLoadingSources}
        >
          {Array.isArray(proposalSources) &&
            proposalSources.map((source: any) => (
              <Select.Option key={source.id || source.name || source} value={source.id || source}>
                {source.name || source}
              </Select.Option>
            ))}
        </Select>
      </div>

      {/* Proposal Received Date */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Proposal Received Date <span className="text-destructive">*</span>
        </label>
        <DatePicker
          size="large"
          className="w-full"
          value={data.proposalReceivedDate ? dayjs(data.proposalReceivedDate) : null}
          onChange={(_date, dateString) =>
            setData({ ...data, proposalReceivedDate: dateString as string })
          }
        />
      </div>

      {/* Name of Source */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Name of Source <span className="text-destructive">*</span>
        </label>
        <Input
          size="large"
          className="w-full"
          placeholder="Enter MLA/Citizen Name"
          value={data.sourceName}
          onChange={(e) => setData({ ...data, sourceName: e.target.value })}
        />
      </div>

      {/* Receiving Authority */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Receiving Authority <span className="text-destructive">*</span>
        </label>
        <Select
          size="large"
          className="w-full"
          placeholder="Select Authority"
          value={data.receivingAuthority || undefined}
          onChange={(value) => setData({ ...data, receivingAuthority: value })}
          disabled={isLoadingAuthorities}
          loading={isLoadingAuthorities}
        >
          {Array.isArray(receivingAuthorities) &&
            receivingAuthorities.map((auth: any) => (
              <Select.Option key={auth.id || auth.name || auth} value={auth.id || auth}>
                {auth.name || auth}
              </Select.Option>
            ))}
        </Select>
      </div>

      {/* Date of Receipt by Authority */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Date of Receipt by Authority <span className="text-destructive">*</span>
        </label>
        <DatePicker
          size="large"
          className="w-full"
          value={data.authorityReceivedDate ? dayjs(data.authorityReceivedDate) : null}
          onChange={(_date, dateString) =>
            setData({ ...data, authorityReceivedDate: dateString as string })
          }
        />
      </div>

      {/* Officer In Charge */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Officer In Charge <span className="text-destructive">*</span>
        </label>
        <Select
          size="large"
          className="w-full"
          placeholder="Select Officer"
          value={data.officerInCharge || undefined}
          onChange={(value) => setData({ ...data, officerInCharge: value })}
          disabled={isLoadingOfficers}
          loading={isLoadingOfficers}
        >
          {officers.map((officer: any) => (
            <Select.Option key={officer.id || officer.name || officer} value={officer.id || officer}>
              {officer.name || officer}
            </Select.Option>
          ))}
        </Select>
      </div>
    </div>
  );
}