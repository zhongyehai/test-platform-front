import request from '@/utils/request' // 加载请求配置文件
import { baseDirSystem } from '@/apis/base'

// 获取错误列表
export function errorRecordList(params) {
  return request({ url: baseDirSystem + '/error-record/list', method: 'get', params: params })
}

// 获取错误
export function getErrorRecord(params) {
  return request({ url: baseDirSystem + '/error-record', method: 'get', params: params })
}
