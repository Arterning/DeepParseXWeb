export function tableDateFormat(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}



export function emailDateFormat(dateStr: string): string {
  if (!dateStr) return '-';
  const daysOfWeek = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const date = new Date(dateStr);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = daysOfWeek[date.getDay()];

  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');

  // 根据小时数判断上午/下午
  const period = hours < 12 ? '上午' : '下午';
  const formattedHour = hours % 12 === 0 ? 12 : hours % 12;

  return `${year}年${month}月${day}日（${dayOfWeek}）${period}${formattedHour} : ${minutes}`;
}

