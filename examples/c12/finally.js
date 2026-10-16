let loading = true;
Promise.reject(new Error("库存加载失败"))
  .finally(() => {
    loading = false;
    console.log("关闭加载", loading);
    return [];
  })
  .then(() => console.log("成功"))
  .catch(error => console.log("仍然失败", error.message));
