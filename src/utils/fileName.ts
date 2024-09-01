// 유니코드 문자를 제거한 파일 이름 생성
export function generateSafeFileName(fileName: string): string {
  return fileName.replace(/[^\x00-\x7F]/g, ""); // ASCII 문자만 남기기
}
