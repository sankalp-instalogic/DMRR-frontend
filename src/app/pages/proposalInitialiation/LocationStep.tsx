import { MapPin } from "lucide-react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { Select } from "antd"; // <-- Added Ant Design import

interface Step1Data {
  disasterType: string;
  district: string;
  taluka: string;
}

interface LocationStepProps {
  data: Step1Data;
  setData: React.Dispatch<React.SetStateAction<Step1Data>>;
}

interface MasterItem {
  id: string | number;
  name: string;
}

export function LocationStep({ data, setData }: LocationStepProps) {
  const axiosPrivate = useAxiosPrivate();

  // 1. Fetch Disaster Types
  const { data: disasterTypes = [], isLoading: isLoadingDisasters } = useQuery<
    MasterItem[]
  >({
    queryKey: ["disasterTypes"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/disaster-types");
      return response.data?.items || [];
    },
  });

  // 2. Fetch Districts
  const { data: districts = [], isPending: isLoadingDistricts } = useQuery<
    MasterItem[]
  >({
    queryKey: ["districts"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/districts");
      return response.data?.items || [];
    },
  });

  // 3. Fetch Talukas based on selected District ID
  const { data: talukas = [], isFetching: isFetchingTalukas } = useQuery<
    MasterItem[]
  >({
    queryKey: ["talukas", data.district],
    queryFn: async () => {
      const response = await axiosPrivate.get(`/api/v1/masters/talukas`, {
        params: { districtId: data.district },
      });
      return response.data || [];
    },
    enabled: !!data.district,
  });

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
        <MapPin className="size-5" />
        Step 1: Disaster Type & Location
      </h3>

      {/* Disaster Type Dropdown */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Disaster Type <span className="text-destructive">*</span>
        </label>
        <Select
          className="w-full"
          size="large"
          placeholder="Select Disaster Type"
          // Antd placeholders only show if value is undefined, not an empty string
          value={data.disasterType || undefined}
          onChange={(value) => setData({ ...data, disasterType: value })}
          disabled={isLoadingDisasters}
          loading={isLoadingDisasters}
          options={
            Array.isArray(disasterTypes)
              ? disasterTypes.map((type) => ({
                  value: type.id,
                  label: type.name,
                }))
              : []
          }
        />
      </div>

      {/* District Dropdown */}
      <div>
        <label className="block text-sm font-medium mb-2">
          District <span className="text-destructive">*</span>
        </label>
        <Select
          className="w-full"
          size="large"
          placeholder="Select District"
          value={data.district || undefined}
          onChange={(value) =>
            setData({
              ...data,
              district: value,
              taluka: "", // Reset taluka when district changes
            })
          }
          disabled={isLoadingDistricts}
          loading={isLoadingDistricts}
          options={
            Array.isArray(districts)
              ? districts?.map((district) => ({
                  value: district.id,
                  label: district.name,
                }))
              : []
          }
        />
      </div>

      {/* Taluka Dropdown */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Taluka <span className="text-destructive">*</span>
        </label>
        <Select
          className="w-full"
          size="large"
          placeholder={
            !data.district ? "Select a district first" : "Select Taluka"
          }
          value={data.taluka || undefined}
          onChange={(value) => setData({ ...data, taluka: value })}
          disabled={!data.district || isFetchingTalukas}
          loading={isFetchingTalukas}
          options={talukas.map((taluka) => ({
            value: taluka.id,
            label: taluka.name,
          }))}
        />
      </div>
    </div>
  );
}
