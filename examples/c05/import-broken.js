// 有问题的写法：把 JSON 语法正确当成商品字段合格
const candidateText = '{"id":"P002","name":"无线鼠标","stock":"0","priceCents":12900}';
const candidate = JSON.parse(candidateText);
console.log("库存", candidate.stock ?? 12);
console.log("补货后", candidate.stock + 3);
