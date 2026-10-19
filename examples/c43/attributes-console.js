const saveButton = document.querySelector("#save");
saveButton.setAttribute("disabled", "false");
console.log(saveButton.hasAttribute("disabled"), saveButton.disabled); // → true true
saveButton.removeAttribute("disabled");
console.log(saveButton.disabled); // → false
saveButton.disabled = false;
console.log(typeof saveButton.disabled); // → boolean
