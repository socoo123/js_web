const tasks = [{ id: "P001", amount: 3 }, { id: "P002", amount: 2 }];
let head = 0;
while (head < tasks.length) {
  const task = tasks[head];
  tasks[head] = undefined; // 释放队列对已处理任务的引用
  head++;
  console.log(task.id, task.amount);
}
console.log("剩余任务", tasks.length - head); // → 0
console.log("底层长度", tasks.length); // → 2
// 本批已处理完，下一批从空数组开始。
tasks.length = 0;
head = 0;
console.log(tasks.length, head); // → 0 0
