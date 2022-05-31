// 从 localStorage 获取配置的title
export default function getPageTitle(pageTitle) {
  const title = localStorage.getItem('platformName') || '测试平台'
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
