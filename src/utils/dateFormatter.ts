import { format } from "date-fns";

const formattedDate = (date: string) => {
  return format(date, "do MMMM yyyy");
};

export default formattedDate;
