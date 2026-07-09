import { format } from "date-fns";

const formattedDate = (date?: string | number | Date | null) => {
  if (!date) return "-";
  const parsed = date instanceof Date ? date : new Date(date);
  if (isNaN(parsed.getTime())) return "-";
  return format(parsed, "do MMMM yyyy");
};

export default formattedDate;
