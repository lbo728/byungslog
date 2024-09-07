import { createHash } from "crypto";
import getPosts from "../../service/getPosts";
import type { Post } from "../../types/Post";

export async function GET() {
  const posts: Post[] = await getPosts();
  const etag = createHash("md5").update(JSON.stringify(posts)).digest("hex");

  return new Response(JSON.stringify({ posts }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=0", // 캐시 시간 설정
      ETag: etag,
    },
  });
}

// import getPosts from "../../service/getPosts";
// import type { Post } from "../../types/Post";

// export async function GET() {
//   const posts: Post[] = await getPosts();
//   return new Response(JSON.stringify({ posts }), {
//     headers: { "Content-Type": "application/json" },
//   });
// }
