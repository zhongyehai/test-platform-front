import request from '@/utils/request'
import { baseDirTool } from '@/apis/base' // 加载请求配置文件

// 征信考试
export function parseToken(data) {
  return request({ url: baseDirTool + '/parse-token', method: 'post', data: data })
}
