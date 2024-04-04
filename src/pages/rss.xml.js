import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = await getCollection("post");
  return rss({
    title: "Byungsker | Blog",
    description: "Tech, Design, Book, Mindset, Writing ",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubData,
      description: post.data.description,
      link: `/post/${post.slug}`,
    })),
    customData: `<language>ko-KR</language>`,
  });
}
