// 时间相关工具

// 补0
export function addZero(num) {
  if (parseInt(num) < 10) {
    num = '0' + num
  }
  return num
}

export function get_date(num) {
  // 今天时间
  const date1 = new Date()
  const date2 = new Date(date1)
  date2.setDate(date1.getDate() + num)
  // num是正数表示之后的时间，num负数表示之前的时间，0表示今天
  return addZero(date2.getFullYear()) + '-' + addZero((date2.getMonth() + 1)) + '-' + addZero(date2.getDate())
}

// 开始时间
export function getStartTime(time) {
  const nowTimeDate = new Date(time)
  return nowTimeDate.setHours(0, 0, 0, 0)
}

// 结束时间
export function getEndTime(time) {
  const nowTimeDate = new Date(time)
  return nowTimeDate.setHours(23, 59, 59, 999)
}

// 获取指定日期所在周的开始时间和结束时间
export function getCurrentWeekStartTimeAndEndTime(day) {
  const current = day ? new Date(get_date(day)) : new Date()
  // current是本周的第几天
  let nowDayOfWeek = current.getDay()
  if (nowDayOfWeek === 0) nowDayOfWeek = 7
  const dayNum = 1 * 24 * 60 * 60 * 1000
  // 获取本周星期一的时间，星期一作为一周的第一天
  const firstDate = new Date(current.valueOf() - (nowDayOfWeek - 1) * dayNum)
  // 获取本周星期天的时间，星期天作为一周的最后一天
  const lastDate = new Date(new Date(firstDate).valueOf() + 6 * dayNum)
  return {
    startTime: new Date(getStartTime(firstDate)),
    endTime: new Date(getEndTime(lastDate))
  }
}

// 格式化时间字符串为时间对象
export function formatTime(dateString) {
  const datetime = new Date(new Date(dateString).getTime())
  const year = datetime.getFullYear(); const month = datetime.getMonth(); const date = datetime.getDate()
  return year + '-' + ((month + 1) >= 10 ? (month + 1) : '0' + (month + 1)) + '-' + ((date + 1) < 10 ? '0' + date : date)
}
