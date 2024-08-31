import { supabase } from "../lib/supabase";

async function uploadPost(
  title: string,
  content: string,
  tags: string[],
): Promise<{ success: boolean; id?: string }> {
  const { data, error } = await supabase
    .from("posts")
    .insert([{ title, content, tags }])
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

export default uploadPost;
