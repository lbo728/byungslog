import { supabase } from "../lib/supabase";

export default async function getPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select("title,id,tags,created_at, content")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  return data;
}
