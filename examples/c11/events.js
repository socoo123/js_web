const outer = document.querySelector("#outer");
const edit = document.querySelector("#edit");
outer.addEventListener("click", () => console.log("外层捕获"), { capture: true });
edit.addEventListener("click", event => {
  console.log("按钮监听", event.target.tagName, event.currentTarget.tagName);
});
outer.addEventListener("click", () => console.log("外层冒泡"));
