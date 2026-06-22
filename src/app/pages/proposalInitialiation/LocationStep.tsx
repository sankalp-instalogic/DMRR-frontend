import { MapPin } from "lucide-react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";

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
      // Safely fallback to an empty array if items is missing/null
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
  const {
    data: talukas = [],
    isFetching: isFetchingTalukas, // isFetching handles subsequent refetches better than isLoading
  } = useQuery<MasterItem[]>({
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
          Disaster Type <span className="text-red-600">*</span>
        </label>
        <select
          value={data.disasterType}
          onChange={(e) => setData({ ...data, disasterType: e.target.value })}
          disabled={isLoadingDisasters}
          className="w-full cursor-pointer px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        >
          <option value="">
            {isLoadingDisasters
              ? "Loading disasters..."
              : "Select Disaster Type"}
          </option>
          {/* Optional chaining ?.map added for safety */}
          {disasterTypes?.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {/* District Dropdown */}
      <div>
        <label className="block text-sm font-medium mb-2">
          District <span className="text-red-600">*</span>
        </label>
        <select
          value={data.district}
          onChange={(e) =>
            setData({
              ...data,
              district: e.target.value,
              taluka: "", // Reset taluka when district changes
            })
          }
          disabled={isLoadingDistricts}
          className="w-full cursor-pointer px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        >
          <option value="">
            {isLoadingDistricts ? "Loading districts..." : "Select District"}
          </option>
          {Array.isArray(districts) &&
            districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
        </select>
      </div>

      {/* Taluka Dropdown */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Taluka <span className="text-red-600">*</span>
        </label>
        <select
          value={data.taluka}
          onChange={(e) => setData({ ...data, taluka: e.target.value })}
          className={`w-full px-4 py-3 border border-border rounded-lg ${
            !data.district || isFetchingTalukas
              ? "bg-background cursor-not-allowed"
              : "cursor-pointer"
          } focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50`}
          disabled={!data.district || isFetchingTalukas}
        >
          <option value="">
            {!data.district
              ? "Select a district first"
              : isFetchingTalukas
                ? "Loading talukas..."
                : "Select Taluka"}
          </option>
          {data.district &&
            talukas?.map((taluka) => (
              <option key={taluka.id} value={taluka.id}>
                {taluka.name}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
}
