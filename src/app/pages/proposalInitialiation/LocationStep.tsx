import { MapPin } from "lucide-react";

interface Step1Data {
  disasterType: string;
  district: string;
  taluka: string;
}

interface LocationStepProps {
  data: Step1Data;
  setData: React.Dispatch<React.SetStateAction<Step1Data>>;
}

const disasterTypes = [
  "Flood",
  "Drought",
  "Earthquake",
  "Cyclone",
  "Landslide",
  "Fire",
  "Other",
];

const districts = [
  "Mumbai",
  "Pune",
  "Nagpur",
  "Nashik",
  "Aurangabad",
  "Thane",
  "Kolhapur",
  "Ahmednagar",
];

const talukas = {
  Mumbai: ["Kurla", "Andheri", "Bandra", "Borivali"],
  Pune: ["Haveli", "Mulshi", "Maval", "Bhor"],
  Nagpur: ["Nagpur Urban", "Nagpur Rural", "Kamptee"],
  Nashik: ["Nashik City", "Igatpuri", "Trimbakeshwar"],
  Aurangabad: ["Aurangabad City", "Paithan", "Gangapur"],
  Thane: ["Kalyan", "Ulhasnagar", "Ambarnath"],
  Kolhapur: ["Kolhapur City", "Panhala", "Shahuwadi"],
  Ahmednagar: ["Ahmednagar City", "Rahuri", "Shrirampur"],
};

export function LocationStep({ data, setData }: LocationStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
        <MapPin className="size-5" />
        Step 1: Disaster Type & Location
      </h3>

      <div>
        <label className="block text-sm font-medium mb-2">
          Disaster Type <span className="text-red-600">*</span>
        </label>
        <select
          value={data.disasterType}
          onChange={(e) =>
            setData({ ...data, disasterType: e.target.value })
          }
          className="w-full cursor-pointer px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Select Disaster Type</option>
          {disasterTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

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
              taluka: "",
            })
          }
          className="w-full cursor-pointer px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Select District</option>
          {districts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Taluka <span className="text-red-600">*</span>
        </label>
        <select
          value={data.taluka}
          onChange={(e) =>
            setData({ ...data, taluka: e.target.value })
          }
          className={`w-full px-4 py-3 border border-border rounded-lg ${!data.district ? "bg-background cursor-not-allowed" : "cursor-pointer"} focus:outline-none focus:ring-2 focus:ring-primary/20`}
          disabled={!data.district}
        >
          <option value="">Select Taluka</option>
          {data.district &&
            talukas[data.district as keyof typeof talukas]?.map(
              (taluka) => (
                <option key={taluka} value={taluka}>
                  {taluka}
                </option>
              ),
            )}
        </select>
      </div>
    </div>
  );
}
