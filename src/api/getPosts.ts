import { supabase } from "../lib/supabase";

export async function getPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select("title,id,tags")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  return data;
}
