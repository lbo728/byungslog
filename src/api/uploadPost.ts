import { supabase } from "../lib/supabase";

async function uploadPost(title: string, content: string, tags: string[]) {
  const { data, error } = await supabase
    .from("posts")
    .insert([{ title, content, tags }]);

  if (error) {
    console.error("Error uploading post:", error);
  } else {
    console.log("Post uploaded:", title);
  }
}

export default uploadPost;
