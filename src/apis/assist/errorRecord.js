import request from '@/utils/request' // 加载请求配置文件
import { baseDirAssist } from '@/apis/base'

// 获取错误列表
export function errorRecordList(params) {
  return request({ url: baseDirAssist + '/errorRecord/list', method: 'get', params: params })
}
