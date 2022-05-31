const tokenKey = 'token'
const roleKey = 'roles'

// 从localStorage中获取token
export function getToken() {
  return localStorage.getItem(tokenKey)
}

// 往localStorage中存token
export function setToken(token) {
  return localStorage.setItem(tokenKey, token)
}

// 从localStorage中删除token
export function removeToken() {
  return localStorage.removeItem(tokenKey)
}

// 从 localStorage 中获取权限
export function getRole() {
  return localStorage.getItem(roleKey)
}
