type FormatType =
  | "DD,hh,mm,ss"
  | "DD,hh,mm"
  | "DD,hh"
  | "DD,mm"
  | "hh,mm"
  | "hh"
  | "mm";

export const formatDateDifference = (
  value: string | Date,
  format: FormatType
): string => {
  const now = new Date();
  const targetDate = new Date(value);

  if (now >= targetDate) return "0m";

  const diffInMs = targetDate.getTime() - now.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  const days = diffInDays;
  const hours = diffInHours % 24;
  const minutes = diffInMinutes % 60;
  const seconds = diffInSeconds % 60;

  const formatParts: Record<string, number> = {
    DD: days,
    hh: hours,
    mm: minutes,
    ss: seconds,
  };

  const parts = Object.entries(formatParts)
    .filter(([key]) => format.includes(key))
    .map(([key, value]) => `${value}${key[0]}`);

  return parts?.length > 0 ? parts.join(", ") : "0m";
};
