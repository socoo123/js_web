export const currency = "CNY";

export default function formatMoney(priceCents) {
  return "¥" + (priceCents / 100).toFixed(2);
}
