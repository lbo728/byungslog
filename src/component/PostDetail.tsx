import { supabase } from "../lib/supabase";
import { useEffect, useState } from "preact/hooks";
import { markedReadContent } from "../utils/marked";
import { formatDate } from "../utils/date";
import { calculateReadingTime } from "../utils/readingTime";

interface Post {
  title: string;
  tags: string[];
  created_at: string;
  content: string;
}

interface PostDetailProps {
  id: string | undefined;
}

export default function PostDetail({ id }: PostDetailProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [parsedContent, setParsedContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("왜 못부르지?");
    console.log("Fetching post with ID:", id);
    fetchPost();
  }, []);

  const fetchPost = async () => {
    try {
      console.log("Fetching post...");
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      console.log("Post data:", data);

      if (error) {
        setError(error.message);
        return;
      }

      if (!data) {
        setError("Post not found");
        return;
      }

      setPost(data);

      if (data.content) {
        const content = await markedReadContent(data.content);
        console.log("Parsed content:", content);
        setParsedContent(content);
      } else {
        setError("Content is empty");
      }
    } catch (error) {
      setError("An error occurred");
      console.error("Error:", error);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!post) {
    return <div>Loading...</div>;
  }

  if (!parsedContent) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="info">
        <div className="title">{post.title}</div>
        <div className="tags">
          {post.tags.map((tag) => (
            <div key={tag} className="tag">
              {tag}
            </div>
          ))}
        </div>
        <div className="time-info">
          <div className="created-at">{formatDate(post.created_at)}</div>
          <div className="bullet">•</div>
          <div className="reading-time">
            {calculateReadingTime(post.content)} min read
          </div>
        </div>
      </div>

      <div
        className="content"
        dangerouslySetInnerHTML={{ __html: parsedContent }}
      />
    </>
  );
}
