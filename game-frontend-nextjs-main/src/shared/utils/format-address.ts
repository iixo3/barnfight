export const formatAddress = (value: string) => {
  return value.slice(0, 6) + "..." + value.slice(-3);
};
