import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import markdownCallouts from './src/lib/markdown-callouts.mjs';
import catalog from './labs/catalog.json' with { type: 'json' };

// 侧栏以 Lab 为主线：每个 Lab 一组，组内先是 Lab 主页，再是它的课；课的 URL 不变。
// 当前页所在的组自动展开，其余组折叠，打开站点时先看到 L1–L6 六个入口。
const labGroups = catalog.labs.map((lab) => {
  const lessons = catalog.lessons.filter((lesson) => lesson.labId === lab.labId);
  return {
    label: `${lab.labId} · ${lab.title}`,
    collapsed: true,
    items: [
      { label: `${lab.labId} Lab 主页`, slug: `labs/${lab.labId.toLowerCase()}` },
      ...lessons.map((lesson) => ({ slug: lesson.slug })),
    ],
  };
});

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
        Hero: './src/components/SiteHero.astro',
        MarkdownContent: './src/components/CourseContent.astro',
        PageTitle: './src/components/SitePageTitle.astro',
        Sidebar: './src/components/SiteSidebar.astro',
        ThemeProvider: './src/components/ThemeProvider.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
      },
      sidebar: [
        {
          label: '开始',
          items: [
            { label: '工作区与 6 个 Lab', slug: 'labs' },
            { label: 'Lab 规则与验收', slug: 'labs/rules' },
            { label: '学习路线（按天）', slug: 'roadmap' },
          ],
        },
        ...labGroups,
        {
          label: 'L6 · 毕业挑战',
          collapsed: true,
          items: [{ label: 'L6 综合能力检验', slug: 'labs/l6' }],
        },
        { label: '速查手册', collapsed: true, items: [{ autogenerate: { directory: 'reference' } }] },
      ],
    }),
    markdownCallouts(),
    react(),
  ],
});
