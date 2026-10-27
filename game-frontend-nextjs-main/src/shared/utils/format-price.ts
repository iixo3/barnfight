export const formatPrice = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k`;
  } else {
    return Number(amount).toFixed(4).toString();
  }
};
