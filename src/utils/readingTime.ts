export function calculateReadingTime(content: string) {
  const wordsPerMinute = 200; // 평균 읽기 속도: 분당 200단어
  const textLength = content.split(/\s+/).length; // 단어의 수 계산

  return Math.ceil(textLength / wordsPerMinute);
}
