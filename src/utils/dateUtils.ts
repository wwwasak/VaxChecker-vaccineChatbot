/**
 * 获取新西兰时区的当前时间ISO字符串
 * @returns {string} ISO格式的新西兰时间，格式如：2025-01-23T00:27:40.151Z
 */
export const getNZDateTime = (): string => {
  const now = new Date();
  
  // 使用 Intl.DateTimeFormat 来获取准确的新西兰时间
  const nzTime = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    fractionalSecondDigits: 3,
  }).format(now);
  
  // 转换格式为 ISO 字符串
  const [date, time] = nzTime.split(', ');
  const [day, month, year] = date.split('/');  // 交换了月份和日期的位置
  const [hours, minutes, seconds] = time.split(':');
  
  // 确保月份和日期都是两位数
  const paddedMonth = month.padStart(2, '0');
  const paddedDay = day.padStart(2, '0');
  
  return `${year}-${paddedMonth}-${paddedDay}T${hours}:${minutes}:${seconds}.000Z`;
}; 