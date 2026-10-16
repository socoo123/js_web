// sRGB 相对亮度公式；输入为不透明的六位十六进制颜色。
function luminance(hex) {
  const linear = hex.match(/[0-9a-f]{2}/gi).map(channel => {
    const value = Number.parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}
function contrast(first, second) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return ((values[0] + 0.05) / (values[1] + 0.05)).toFixed(2);
}
for (const [label, foreground, background] of [
  ["正文/白底", "#1b2733", "#ffffff"],
  ["提示/白底", "#425466", "#ffffff"],
  ["按钮白字/蓝底", "#ffffff", "#155cb5"],
  ["错误/白底", "#a01717", "#ffffff"],
]) console.log(label, contrast(foreground, background));
