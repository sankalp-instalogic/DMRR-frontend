export const formatCurrencyLakhs = (amount: number) => {
  if (amount === undefined || amount === null) return "₹0";
 
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2).replace(/\.00$/, "")} Crore`;
  }
 
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2).replace(/\.00$/, "")} Lakh`;
  }
 
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(2).replace(/\.00$/, "")} Thousand`;
  }
 
  return `₹${amount}`;
};