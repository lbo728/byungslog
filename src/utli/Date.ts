export function formatPubDate(pubDate: string): string {
  var date = new Date(pubDate);

  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  // var dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  // var dayIndex = date.getDay();
  // var dayName = dayNames[dayIndex];

  return year + "년 " + month + "월 " + day + "일";
}
