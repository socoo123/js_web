import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { existsSync } from 'node:fs';

const courseSections = [
  ['01-history-web', '历史、Web 与语言基础'],
  ['02-language-data', '语言与数据结构'],
  ['03-async-modules', '浏览器、异步与模块'],
  ['04-runtime-tooling', '运行时与工程工具'],
  ['05-react', 'React'],
  ['06-components-ui5', '组件生态与 UI5'],
  ['07-project', '项目交付'],
];

export default defineConfig({
  site: 'https://socoo123.github.io',
  base: '/js_web/',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'Java → JavaScript',
      description: '为会 Java 的前端初学者准备的中文 JavaScript 课程。',
      locales: { root: { label: '简体中文', lang: 'zh-CN' } },
      social: [{ icon: 'github', label: 'GitHub 源码与练习', href: 'https://github.com/socoo123/js_web' }],
      editLink: { baseUrl: 'https://github.com/socoo123/js_web/edit/main/' },
      customCss: ['./src/styles/custom.css'],
      components: {
        MarkdownContent: './src/components/CourseContent.astro',
        ThemeProvider: './src/components/ThemeProvider.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
      },
      sidebar: [
        { label: '学习路线与课程目录', slug: 'roadmap' },
        ...courseSections
          .filter(([directory]) => existsSync(new URL(`./src/content/docs/${directory}`, import.meta.url)))
          .map(([directory, label]) => ({ label, items: [{ autogenerate: { directory } }] })),
        { label: '速查手册', items: [{ autogenerate: { directory: 'reference' } }] },
      ],
    }),
  ],
});
