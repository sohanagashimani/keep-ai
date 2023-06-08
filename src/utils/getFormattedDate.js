import { format } from "date-fns";

export const getFormattedDate = (timestamp) => {
  const date = new Date(timestamp);
  const currentDate = new Date();

  let formattedTimestamp;
  if (currentDate.toDateString() === date.toDateString()) {
    formattedTimestamp = "Today, " + format(date, "h:mm a");
  } else if (currentDate.getFullYear() === date.getFullYear()) {
    formattedTimestamp = format(date, "'Yesterday,' h:mm a");
  } else {
    formattedTimestamp = format(date, "do MMMM, h:mm a");
  }

  return formattedTimestamp;
};
