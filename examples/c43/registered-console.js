await customElements.whenDefined("ui5-input");
const registeredInput = document.querySelector("#amount");
console.log(Boolean(customElements.get("ui5-input"))); // → true
console.log(registeredInput instanceof HTMLElement); // → true
