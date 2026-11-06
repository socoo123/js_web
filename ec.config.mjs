import { defineEcConfig } from '@astrojs/starlight/expressive-code';

/*
 * 代码块配色：GitHub 的亮/暗主题，背景与框线换成站点色。
 * theme.bg 必须是实际背景色：Expressive Code 按它把语法色调到对比度 ≥ 5.5:1。
 */
const palette = {
  dark: { bg: '#151821', bar: '#1b1f2a', border: '#272b3a', label: '#a3a9bc', dots: '#4a5068' },
  light: { bg: '#f7f8fa', bar: '#eef0f4', border: '#e1e4eb', label: '#525a6e', dots: '#c3c8d4' },
};

export default defineEcConfig({
  themes: ['github-dark-default', 'github-light-default'],
  customizeTheme(theme) {
    const c = palette[theme.type];
    theme.bg = c.bg;
    theme.colors['editor.background'] = c.bg;
    theme.styleOverrides.borderColor = c.border;
    theme.styleOverrides.frames = {
      editorBackground: c.bg,
      editorTabBarBackground: c.bar,
      editorTabBarBorderColor: c.border,
      editorTabBarBorderBottomColor: c.border,
      editorActiveTabBackground: c.bar,
      editorActiveTabForeground: c.label,
      editorActiveTabBorderColor: 'transparent',
      editorActiveTabIndicatorTopColor: 'transparent',
      editorActiveTabIndicatorBottomColor: 'transparent',
      terminalBackground: c.bg,
      terminalTitlebarBackground: c.bar,
      terminalTitlebarForeground: c.label,
      terminalTitlebarBorderBottomColor: c.border,
      terminalTitlebarDotsForeground: c.dots,
      terminalTitlebarDotsOpacity: '1',
      inlineButtonForeground: c.label,
      inlineButtonBorder: c.border,
    };
    return theme;
  },
  styleOverrides: {
    borderRadius: '10px',
    codeFontSize: 'var(--js-code-size)',
    codeLineHeight: '1.7',
    codePaddingBlock: '0.85rem',
    codePaddingInline: '1.1rem',
    uiFontSize: '0.8125rem',
    uiFontWeight: '600',
    frames: {
      frameBoxShadowCssValue: 'none',
      editorActiveTabIndicatorHeight: '0px',
      editorTabsMarginInlineStart: '0',
      editorTabsMarginBlockStart: '0',
      editorTabBorderRadius: '0',
    },
  },
});
