
// 数据截取
export function ellipsis(value, len) {
  if (!value) return ''
  if (value.length > len) {
    return value.slice(0, len) + '...'
  }
  return value
}
