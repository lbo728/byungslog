export function formatPubDate(pubDate: string): string {
  var date = new Date(pubDate);

  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  return year + "년 " + month + "월 " + day + "일";
}

export function formatDate(isoString: string) {
  const date = new Date(isoString);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분 ${seconds}초 `;
}
