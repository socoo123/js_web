// 有问题的写法：清空列表时，连容器一起删掉了
const search = document.querySelector("#search");
const list = document.querySelector("#products");
search.addEventListener("input", () => {
  list.remove();
});
