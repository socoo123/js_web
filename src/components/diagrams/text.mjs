// 图中文字的两个小工具：反引号包住的片段渲染成 <code>；only() 生成只在部分步骤显示的属性。
export function rich(text) {
  return String(text).split('`').map((part, index) => ({ text: part, code: index % 2 === 1 })).filter((part) => part.text);
}

export function only(value) {
  const list = String(value).split(/\s+/).filter(Boolean);
  return { 'data-only': list.join(' '), hidden: !list.includes('0') };
}
