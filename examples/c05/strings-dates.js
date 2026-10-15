{
  const rawId = " kb-001 ";
  const id = rawId.trim().toUpperCase();
  console.log(id, rawId === " kb-001 ");
  console.log(id.startsWith("KB-"), id.includes("001"));
  console.log(id.slice(3), "001".padStart(5, "0"));
  console.log("键盘/黑色".replace("黑色", "白色"));
  console.log(JSON.stringify("键盘,鼠标".split(",")));
  console.log(`商品 ${id}，剩余 ${12} 件`);
  console.log("😀".length);

  const utc = new Date("2026-10-15T01:30:00Z");
  const offset = new Date("2026-10-15T09:30:00+08:00");
  console.log(utc.getTime() === offset.getTime());
  console.log(offset.toISOString());
  console.log(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate());
  console.log(Number.isNaN(new Date("not-a-date").getTime()));
  const nearMidnight = new Date("2026-10-15T00:30:00+08:00");
  console.log(nearMidnight.toISOString().slice(0, 10));
}
