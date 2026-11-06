import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

// V3 改写后的课在 frontmatter 写 lesson；没有它的课保留旧页首引用块。
const lesson = z.object({
  time: z.string().min(1),
  prereq: z.string().min(1),
  env: z.string().min(1),
  verified: z.enum(['all', 'partial']),
}).strict();

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema({ extend: z.object({ lesson: lesson.optional() }) }) }),
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
