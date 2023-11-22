import request from '@/utils/request'
import { baseDirSystem } from '@/apis/base'

const baseDir = baseDirSystem

// 从后端获取重定向到oauth2验证的地址
export function getSSORedirectUri(data) {
  return request({ url: baseDir + '/sso/redirect-uri', method: 'get', data: data })
}

// 使用code获取测试平台的token
export function getTokenBySSOCode(data) {
  return request({ url: baseDir + '/sso/token', method: 'post', data: data })
}
