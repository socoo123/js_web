for (const text of ['{', 'null', '{"version":1,"products":{}}']) {
  try {
    const snapshot = JSON.parse(text);
    console.log("解析成功", snapshot?.version ?? "无版本");
    if (snapshot?.version !== 1 || !Array.isArray(snapshot.products)) {
      throw new Error("备份结构错误");
    }
  } catch (error) {
    console.log(error.name);
  }
}
