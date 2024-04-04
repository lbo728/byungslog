// `astro:content`에서 유틸리티 가져오기
import { z, defineCollection } from 'astro:content';
// 각 컬렉션에 대한 `type` 및 `schema` 정의
const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string(),
    author: z.string(),
    image: z.object({
      url: z.string(),
      alt: z.string(),
    }),
    tags: z.array(z.string()),
  }),
});
// 컬렉션을 등록하려면 단일 'collections' 객체를 내보내세요.
export const collections = {
  posts: postsCollection,
};
