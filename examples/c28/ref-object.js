const handleRef = { current: null };
const sameRef = handleRef;
handleRef.current = "待取消的任务";
console.log(sameRef === handleRef);
console.log(sameRef.current);
sameRef.current = null;
console.log(handleRef.current);
