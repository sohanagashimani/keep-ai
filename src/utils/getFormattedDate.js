import { format, isToday, isYesterday, isThisYear } from "date-fns";

export const getFormattedDate = (timestamp) => {
  const date = new Date(timestamp);

  if (isToday(date)) return format(date, "h:mm a");

  if (isYesterday(date)) return `Yesterday, ${format(date, "h:mm a")}`;

  return format(date, isThisYear(date) ? "d MMM" : "d MMM yyyy");
};
