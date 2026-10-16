const later = new Promise(resolve => {
  setTimeout(() => {
    console.log("另一个操作仍然完成");
    resolve(12);
  }, 20);
});

Promise.all([later, Promise.reject(new Error("库存加载失败"))])
  .catch(error => console.log("整组失败", error.message));
