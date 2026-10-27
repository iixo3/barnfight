export const formatPlacesString = (place: string | number) => {
  const value = Number(place);

  if (value === 1) return "1st";
  if (value === 2) return "2nd";
  if (value === 3) return "3rd";

  return `${value}th`;
};
