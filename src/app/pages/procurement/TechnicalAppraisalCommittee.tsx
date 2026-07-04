import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "./../../../hooks/useAxiosPrivate"; // Adjust the path if needed
import { CommitteeApproval } from "./CommitteeApproval";
import { Spinner } from "../../components/ui/spinner";

export function TechnicalAppraisalCommittee() {
  const axiosPrivate = useAxiosPrivate();

  // --- MASTER DATA QUERIES (To resolve District/Department UUIDs) ---
  const { data: districtsData } = useQuery({
    queryKey: ["districts-dropdown"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/districts", {
        params: { page: 1, pageSize: 100 },
      });
      return response.data;
    },
  });

  const { data: deptData } = useQuery({
    queryKey: ["departments-dropdown"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/masters/line-departments", {
        params: { page: 1, pageSize: 100 },
      });
      return response.data;
    },
  });

  const districts = districtsData?.items ?? [];
  const departments = deptData?.items ?? [];

  // --- NAME RESOLVER FOR ID VALUES ---
  const getDemandLocationName = (row: any) => {
    if (row.demandFrom === "Districts" && row.districtId) {
      const dist = districts.find((d: any) => d.id === row.districtId);
      return dist ? `${dist.name}` : "Loading District...";
    }
    if (row.demandFrom === "Other Departments" && row.departmentId) {
      const dept = departments.find((d: any) => d.id === row.departmentId);
      return dept ? `${dept.name}` : "Loading Department...";
    }
    return row.demandFrom || "N/A";
  };

  // --- GET PENDING TAC PROCUREMENT LIST ---
  const { data: procurementResponse, isLoading, isError } = useQuery({
    queryKey: ["procurements", "tac-pending"], // Updated queryKey to prevent caching overlap
    queryFn: async () => {
      const response = await axiosPrivate.get("/api/v1/Procurements", {
        params: {
          Page: 1,
          PageSize: 100,
          status: "Pending TechnicalAppraisal", // Requested status filter
        },
      });
      return response.data;
    },
  });

  // Map the API response to match the structure expected by CommitteeApproval
  const tacItems = (procurementResponse?.items ?? []).map((row: any) => ({
    id: row.id, // The real GUID needed for the details API
    refNo: row.procurementRefNo || "N/A", 
    year: row.financialYear,
    item: row.itemName,
    demandFrom: getDemandLocationName(row),
    awardCost: `₹${((row.awardCostInclGstLakhs || 0) * 100000).toLocaleString("en-IN")}`,
    status: row.status,
    rows: row.details || [], 
  }));

  if (isLoading) {
    return <Spinner fullPage label="Loading pending technical appraisals..." />;
  }

  if (isError) {
    return <div className="p-8 text-center text-destructive font-medium">Failed to fetch pending proposals. Please try again.</div>;
  }

  return (
    <CommitteeApproval
      title="Technical Appraisal Committee"
      description="Review and approve procurements pending before the Technical Appraisal Committee"
      forwardLabel="Forward to SEC"
      forwardPath="/procurement-sec-approval"
      items={tacItems}
      committeeType={2}
    />
  );
}