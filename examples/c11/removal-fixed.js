const search = document.querySelector("#search");
const list = document.querySelector("#products");
search.addEventListener("input", () => {
  const matches = "机械键盘".includes(search.value.trim());
  const row = document.createElement("li");
  row.textContent = "P001 机械键盘：12 件";
  list.replaceChildren(...(matches ? [row] : []));
});
