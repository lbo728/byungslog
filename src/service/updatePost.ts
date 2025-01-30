import { supabase } from "../lib/supabase";

export default async function updatePost(
  id: string, // id를 추가
  title: string,
  content: string,
  tags: string[],
): Promise<{ success: boolean; id?: string }> {
  const { data, error } = await supabase
    .from("posts")
    .update({ title, content, tags }) // 데이터 객체는 하나만 전달해야 해
    .eq("id", id) // 업데이트할 포스트를 특정하는 조건 추가
    .select("id")
    .single();

  if (error) {
    console.error("Error updating post:", error);
    return {
      success: false,
    };
  } else {
    console.log("Post updated:", title);
    return {
      success: true,
      id: data.id,
    };
  }
}
