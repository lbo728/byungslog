import { useEffect, useState } from "preact/hooks";
import { supabase } from "../lib/supabase";

import type { Post } from "../types/Post";
import { formatDate } from "../utils/date";
import { calculateReadingTime } from "../utils/readingTime";

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("title, id, tags, slug, created_at, content")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="recent text-xl">Recent Posts</div>
      <div className="post-list flex flex-col gap-12 mt-4">
        {posts.map((post) => (
          <a
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="post hover:no-underline text-white flex flex-col gap-4 p-6 rounded-lg border border-[#fcfcfc] hover:bg-[#242424] hover:border-[#b2b2b2]"
          >
            <div className="post-title text-2xl font-bold hover:no-underline">
              {post.title}
            </div>
            <div className="post-tag-list flex flex-wrap gap-2 hover:no-underline">
              {post.tags.map((tag, index) => (
                <div
                  key={index}
                  className="post-tag flex justify-center items-center px-2 py-1 bg-[#525252] rounded-full text-sm hover:no-underline"
                >
                  {tag}
                </div>
              ))}
            </div>
            <div className="post-time-info flex flex-row gap-2 hover:no-underline">
              <div className="italic hover:no-underline">
                {formatDate(post.created_at)}
              </div>
              <div>•</div>
              <div>{calculateReadingTime(post.content)} min read</div>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
