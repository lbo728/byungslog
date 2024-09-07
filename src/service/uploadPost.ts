// uploadPosts.ts
import { supabase } from "../lib/supabase";

export default async function uploadPost(
  title: string,
  content: string,
  tags: string[],
  slug: string,
): Promise<{ success: boolean; id?: string }> {
  const { data, error } = await supabase
    .from("posts")
    .insert([{ title, content, tags, slug }])
    .select("id")
    .single();

  if (error) {
    console.error("Error uploading post:", error);
    return {
      success: false,
    };
  } else {
    console.log("Post uploaded:", title);
    return {
      success: true,
      id: data.id,
    };
  }
}
