export function calculateOrderTotal(
  items: { pricePaise: number; quantity: number }[]
): {
  totalPaise: number;
  formattedRupees: string;
} {
  const totalPaise = items.reduce((sum, item) => sum + item.pricePaise * item.quantity, 0);
  const rupees = Math.floor(totalPaise / 100);
  const formattedRupees = `₹${rupees.toLocaleString("en-IN")}`;
  return { totalPaise, formattedRupees };
}
