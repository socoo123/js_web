// 有问题的写法：三个函数共享同一个 var 绑定
const readers = [];
for (var index = 0; index < 3; index++) {
  readers.push(() => index);
}
for (const read of readers) console.log(read()); // → 3、3、3
