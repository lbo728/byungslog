export default function slugify(str: string): string {
  // 1. 문자열을 소문자로 변환
  let slug = str.toLowerCase();

  // 2. 특수 문자를 제거하고 공백을 하이픈으로 대체
  slug = slug
    .replace(/\s+/g, "-") // 연속된 공백을 하나의 하이픈으로 변환
    .replace(/-+/g, "-"); // 연속된 하이픈을 하나의 하이픈으로 변환

  // 3. 슬러그의 앞뒤에 있는 하이픈을 제거
  slug = slug.replace(/^-+|-+$/g, "");

  return slug;
}
