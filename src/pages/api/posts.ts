import getPosts from "../../service/getPosts";
import type { Post } from "../../types/Post";

export async function GET() {
  const posts: Post[] = await getPosts();
  return new Response(JSON.stringify({ posts }), {
    headers: { "Content-Type": "application/json" },
  });
}
