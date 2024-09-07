import type { APIContext } from "astro";
import getPostById from "../../service/getPostById";

export async function GET({ params }: APIContext) {
  console.log("Received params:", params);
  const slug = params.slug!;
  try {
    const post = await getPostById(slug);

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
