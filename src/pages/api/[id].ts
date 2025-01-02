// export const prerender = false;

import type { APIContext } from "astro";
import getPostById from "../../service/getPostById";

export async function GET({ params }: APIContext) {
  const id = params.id!;
  try {
    const post = await getPostById(id);

    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    return new Response(JSON.stringify({ post }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET function:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
