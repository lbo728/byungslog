import getPosts from "../../service/getPosts";
import type { Post } from "../../types/Post";

export async function GET() {
  try {
    const posts: Post[] = await getPosts();
    return new Response(JSON.stringify({ posts }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error in GET posts:", error);
    return new Response(JSON.stringify({ message: "Failed to fetch posts" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
