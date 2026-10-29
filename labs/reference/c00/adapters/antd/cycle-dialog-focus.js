// 在首尾直接处理 Tab，避免浏览器把焦点移到地址栏。
export function cycleDialogFocus(event) {
  if (event.key !== "Tab") return;
  const controls = [...event.currentTarget.querySelectorAll("button, input, select, textarea, a[href], [tabindex]")]
    .filter((node) => node.tabIndex >= 0 && !node.disabled && node.getClientRects().length > 0);
  const first = controls[0];
  const last = controls.at(-1);
  const target = event.shiftKey ? (document.activeElement === first ? last : null)
    : (document.activeElement === last ? first : null);
  if (target) {
    event.preventDefault();
    target.focus();
  }
}
