export const prerender = false;

import type { APIContext } from "astro";
import getPosts from "src/service/getPosts";

export async function GET({ params }: APIContext) {
  const tag = params.tag;

  try {
    const posts = await getPosts();

    const fillterdPosts = posts.filter((post) => post.tags.includes(tag));

    if (!posts) {
      return new Response("Post not found", { status: 404 });
    }

    return new Response(JSON.stringify({ fillterdPosts }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET function:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
