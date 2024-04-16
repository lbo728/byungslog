export function formatPubDate(pubDate: string): string {
  var date = new Date(pubDate);

  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  return year + '년 ' + month + '월 ' + day + '일';
}
