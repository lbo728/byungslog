import { supabase } from "../lib/supabase";

// 유니코드 문자를 제거한 파일 이름 생성
function generateSafeFileName(fileName: string): string {
  return fileName.replace(/[^\x00-\x7F]/g, ""); // ASCII 문자만 남기기
}

export async function uploadImage(file: File): Promise<string | null> {
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

  // 데이터가 null인 경우 처리
  if (!data) {
    console.error("Error getting public URL: Data is null");
    return null;
  }

  return data.publicUrl;
}
