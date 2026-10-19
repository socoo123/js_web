const cardElement = document.querySelector("#card");
const quantityElement = document.querySelector("#amount");
console.log(cardElement.querySelector('[slot="header"]').id); // → heading
console.log(quantityElement.querySelector("input")); // → null
console.log(Boolean(quantityElement.shadowRoot.querySelector("input"))); // → true
