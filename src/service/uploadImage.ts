import { generateSafeFileName } from "../utils/fileName";
import { supabase } from "../lib/supabase";

export default async function uploadImage(file: File): Promise<string | null> {
  const safeFileName = generateSafeFileName(`${Date.now()}_${file.name}`);

  // Supabase Storage에 이미지 업로드
  const { error: uploadError } = await supabase.storage
    .from("images") // 'images'는 Supabase Storage 버킷 이름
    .upload(safeFileName, file);

  if (uploadError) {
    console.error("Error uploading image:", uploadError.message);
    return null;
  }

  // 업로드된 파일의 공개 URL 가져오기
  const { data } = supabase.storage.from("images").getPublicUrl(safeFileName);

  if (!data) {
    console.error("Error getting public URL: Data is null");
    return null;
  }

  return data.publicUrl;
}
