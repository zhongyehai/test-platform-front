import request from '@/utils/request'
import { baseDirSystem } from '@/apis/base'

const baseDir = baseDirSystem

// 从后端获取重定向到oauth2验证的地址
export function getOauthRedirectUri(data) {
  return request({ url: baseDir + '/oauth2/redirect-uri', method: 'get', data: data })
}

// 使用code获取测试平台的token
export function getTokenByOauthCode(data) {
  return request({ url: baseDir + '/oauth2/token', method: 'post', data: data })
}
