import { Shield } from "lucide-react";

const ndmaGuidelines = [
  "NDMA-FL-2024-08 (Flood Mitigation)",
  "NDMA-DR-2024-05 (Drought Management)",
  "NDMA-EQ-2023-12 (Earthquake Resilience)",
  "NDMA-CY-2024-03 (Cyclone Preparedness)",
];

export interface Step3Data {
  ndmaGuideline: string;
}

interface NdmaReferenceStepProps {
  data: Step3Data;
  setData: React.Dispatch<React.SetStateAction<Step3Data>>;
}

export function NdmaReferenceStep({ data, setData }: NdmaReferenceStepProps) {
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
        <select
          value={data.ndmaGuideline}
          onChange={(e) =>
            setData({ ...data, ndmaGuideline: e.target.value })
          }
          className="w-full cursor-pointer px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Select NDMA Guideline</option>
          {ndmaGuidelines.map((guideline) => (
            <option key={guideline} value={guideline}>
              {guideline}
            </option>
          ))}
        </select>
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
