import request from '@/utils/request'
import { baseDirSystem } from '@/apis/base'

const currentBaseDir = baseDirSystem + '/role'

// 角色列表
export function roleList() {
  return request({ url: currentBaseDir + '/list', method: 'get' })
}
