import test from 'node:test';
import assert from 'node:assert/strict';
import { inlineAnswerRange, maskedCommentPrefix, sameOutput } from '../src/lib/reveal-rules.mjs';

const answerOf = (text) => {
  const range = inlineAnswerRange(text);
  return range && text.slice(...range);
};

test('段内答案：问号后的答案被圈出，问题本身留在外面', () => {
  assert.equal(answerOf('先猜一猜： 初始结果是 { errors: {}, message: "" }，第一次提交时 saveAction 的第一个参数是什么？答案是这份初始结果；第二个才是 FormData。'),
    '答案是这份初始结果；第二个才是 FormData。');
  assert.equal(answerOf('先猜一猜： 把草稿库存改为 ""、"0"，再交给 parseDraft，会分别怎样？空白返回错误，0 返回合法数字。'), '空白返回错误，0 返回合法数字。');
  assert.equal(answerOf('先猜一猜： 汇总应是 8 还是 57？本页明确显示“全部”的统计，答案是 57。'), '本页明确显示“全部”的统计，答案是 57。');
});

test('段内答案：结尾引出代码的冒号句不算答案', () => {
  assert.equal(answerOf('先猜一猜： getProperty 返回 undefined，就能证明服务没有 P999 吗？不能。它只读已加载缓存，不主动请求。完成下一节后，在读取页 Console 执行：'),
    '不能。它只读已加载缓存，不主动请求。');
});

test('段内答案：问号后是操作说明或背景时不遮', () => {
  for (const text of [
    '先猜一猜： 页面位于嵌套演示目录时，两个路径会请求同一个地方吗？在 Console 执行：',
    '先猜一猜： 下列三行会输出什么？这是普通 JS 的闭包预测，可在浏览器 Console 执行：',
    '先猜一猜： 改草稿里的城市，原商品的城市会变吗？这里给商品附加一个仓库对象，方便观察两层数据。',
    '先猜一猜： 这两个调用会显示不同商品吗？只阅读，不必同时加入页面。',
    '先猜一猜： 下列两行分别输出什么？可在浏览器 Console 执行。',
    '先猜一猜： 编辑应传 P002 还是原数组第 0 项？把 ProductTable.jsx 整文件替换为：',
    '先猜一猜： 读到哪个分类？',
    '没有标签的段落？答案是 3。',
  ]) assert.equal(inlineAnswerRange(text), null, text);
});

test('注释遮罩：箭头后的值、调用后的结果、「有问题的写法」说明', () => {
  assert.equal(maskedCommentPrefix('console.log(x); ', '// → 外设'), '// → '.length);
  assert.equal(maskedCommentPrefix('', '// → of 12 number / of 0 number'), '// → '.length);
  assert.equal(maskedCommentPrefix('echo $HOME ', '# → /Users/me'), '# → '.length);
  assert.equal(maskedCommentPrefix('console.log(2); ', '// 完整输出：1、2、3、4'), '// 完整输出：'.length);
  assert.equal(maskedCommentPrefix('console.log(text); ', '// → 可用库存：0'), '// → 可用库存：'.length);
  assert.equal(maskedCommentPrefix('run(); ', '// Error: boom'), '// '.length);
  assert.equal(maskedCommentPrefix('run(); ', '// 输出：'), '// '.length);
  assert.equal(maskedCommentPrefix('journal.undo(); ', '// 当前 15'), '// '.length);
  assert.equal(maskedCommentPrefix('<ProductCard product={products[0]} /> ', '// P001 机械键盘，12 件'), '// '.length);
  assert.equal(maskedCommentPrefix('', '// 有问题的写法：&& 返回了数字 0'), '// 有问题的写法：'.length);
});

test('注释遮罩：声明、赋值后的背景说明与普通整行注释保留', () => {
  assert.equal(maskedCommentPrefix('let stock = 12; ', '// P001 机械键盘，售出 3 件'), -1);
  assert.equal(maskedCommentPrefix('const values = [12, 0, 7]; ', '// P001–P003 的库存'), -1);
  assert.equal(maskedCommentPrefix('keyboard.stock += 3; ', '// 模拟补货'), -1);
  assert.equal(maskedCommentPrefix('', '// counter.js'), -1);
  assert.equal(maskedCommentPrefix('', '// →'), -1);
  assert.equal(maskedCommentPrefix('return a; ', 'not a comment'), -1);
});

test('猜测比较只忽略空白与分隔符', () => {
  assert.equal(sameOutput('12 3 true', '12；3；true'), true);
  assert.equal(sameOutput('外设', '外设'), true);
  assert.equal(sameOutput('配件', '外设'), false);
  assert.equal(sameOutput('', ''), false);
});
