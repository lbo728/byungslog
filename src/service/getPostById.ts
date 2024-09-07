import { supabase } from "../lib/supabase";

export default async function getPostById(slug: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching post:", error);
    return null;
  }

  console.log("getPostByID data:", data);

  return data;
}
