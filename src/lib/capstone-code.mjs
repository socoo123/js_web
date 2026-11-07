// 构建期逐行高亮：Bug 猎人需要把每一行做成可点的按钮，所以不走 Expressive Code，直接用 shiki 的 token。
// 主题与 ec.config.mjs 相同；亮暗两套颜色写进 CSS 变量，由 capstone.css 按 data-theme 选择。
import { codeToTokens } from 'shiki';

const THEMES = { light: 'github-light-default', dark: 'github-dark-default' };

/**
 * @param {string} code
 * @param {string} lang
 * @returns {Promise<{ text: string, style: string }[][]>}
 */
export async function highlightLines(code, lang) {
  const { tokens } = await codeToTokens(code, { lang, themes: THEMES, defaultColor: false });
  return tokens.map((line) => line.map((token) => ({
    text: token.content,
    style: Object.entries(token.htmlStyle ?? {}).map(([key, value]) => `${key}:${value}`).join(';'),
  })));
}
