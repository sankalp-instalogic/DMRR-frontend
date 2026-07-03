import { Shield } from "lucide-react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { Select } from "antd";

// 1. Define the interface for the API response
interface NdmaGuideline {
  id: string;
  name: string;
  code: string;
}

export interface Step3Data {
  ndmaGuideline: string; // This will now store the UUID (guideline.id)
}

interface NdmaReferenceStepProps {
  data: Step3Data;
  setData: React.Dispatch<React.SetStateAction<Step3Data>>;
}

export function NdmaReferenceStep({ data, setData }: NdmaReferenceStepProps) {
  const axiosPrivate = useAxiosPrivate();

  // 2. Type the query response as NdmaGuideline[] and default to an empty array
  const { data: guidelines = [], isLoading, isError } = useQuery<NdmaGuideline[]>({
    queryKey: ["ndmaGuidelines"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/lookups/ndma-guidelines");
      return response.data;
    },
  });

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
        <Shield className="size-5" />
        Step 3: NDMA Guideline Reference
      </h3>

      <div>
        <label className="block text-sm font-medium mb-2">
          NDMA Guideline Reference <span className="text-red-600">*</span>
        </label>
        
        <Select
          value={data.ndmaGuideline || undefined} // antd requires undefined to show the placeholder
          onChange={(value) => setData({ ...data, ndmaGuideline: value })}
          disabled={isLoading || isError}
          loading={isLoading}
          size="large" // Matches your previous py-3 tailwind padding
          className="w-full"
          placeholder={isError ? "Error loading guidelines" : "Select NDMA Guideline"}
          status={isError ? "error" : undefined}
          options={guidelines.map((guideline) => ({
            value: guideline.id,
            label: `${guideline.code} - ${guideline.name}`,
          }))}
        />
        
        {isError && (
          <p className="text-sm text-red-500 mt-1">
            Failed to fetch NDMA guidelines. Please try again.
          </p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> The selected NDMA guideline will be used to
          validate the proposal in Step 4. Ensure it matches your disaster type
          and mitigation requirements.
        </p>
      </div>
    </div>
  );
}