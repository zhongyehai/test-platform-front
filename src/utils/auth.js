const tokenKey = 'token'

// 从localStorage中获取token
export function getToken() {
  return localStorage.getItem(tokenKey)
}

// 往localStorage中存token
export function setToken(token) {
  return localStorage.setItem(tokenKey, token)
}

// 判断用户为管理员权限
export function is_admin(front_permissions) {
  return front_permissions ? front_permissions.indexOf('admin') !== -1 : front_permissions
}

// 判断用户没有管理员权限
export function is_not_admin(front_permissions) {
  return is_admin(front_permissions) === false
}

// 判断用户有页面权限
export function has_addr_permissions(front_permissions, addr) {
  return front_permissions ? front_permissions.indexOf(addr) !== -1 : front_permissions
}

// 判断用户没有页面权限
export function no_addr_permissions(front_permissions, addr) {
  return has_addr_permissions(front_permissions, addr) === false
}

// 判断用户能访问页面
export function can_get_page(front_permissions, addr) {
  return is_admin(front_permissions) || has_addr_permissions(front_permissions, addr)
}

// 判断用户不能访问页面
export function can_not_get_page(addr) {
  return is_not_admin() && no_addr_permissions(addr)
}
