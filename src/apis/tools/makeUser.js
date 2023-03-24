import request from '@/utils/request'
import { baseDirTool } from '@/apis/base' // 加载请求配置文件

// 生成用户信息
export function makeUser(params) {
  return request({ url: baseDirTool + '/makeUser', method: 'get', params: params })
}
