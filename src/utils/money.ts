export function money(value: number) {
  return `PHP ${Number(value || 0).toFixed(2)}`;
}

export function receiptNumber() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  return `CT-${stamp}-${Math.floor(Math.random() * 900 + 100)}`;
}
