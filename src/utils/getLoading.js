// 页面loading
export function getLoading(that, text) {
  return that.$loading({
    lock: true,
    text: text || '数据提交中，请耐心等待',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.7)'
  })
}

