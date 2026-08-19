export const formatPrice = (value) => {
  const amount = typeof value === 'string' ? parseFloat(value) : Number(value);
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number.isNaN(amount) ? 0 : amount);
};