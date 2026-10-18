class StockBadge extends HTMLElement {
  constructor() {
    super();
    this.product = undefined;
  }
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: "open" });
    const button = document.createElement("button");
    button.textContent = `${this.product.name}：${this.product.stock} 件`;
    button.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("stock-check", {
        detail: { id: this.product.id }, bubbles: true, composed: true,
      }));
    });
    root.append(button);
  }
}
if (!customElements.get("stock-badge")) customElements.define("stock-badge", StockBadge);
