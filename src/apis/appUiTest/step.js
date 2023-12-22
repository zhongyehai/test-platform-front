import request from '@/utils/request' // 加载请求配置文件
import { baseDirAppUiTest } from '@/apis/base'

const stepDir = baseDirAppUiTest + '/step'

function Func(method, data = null, params = null) {
  return request({ url: stepDir, method: method, data: data, params: params })
}

// 添加步骤
export function postStep(data) {
  return Func('post', data)
}

// 查找步骤
export function getStep(params) {
  return Func('get', null, params)
}

// 修改步骤
export function putStep(data) {
  return Func('put', data)
}

// 删除步骤
export function deleteStep(data) {
  return Func('delete', data)
}

// 修改步骤状态
export function putStepIsRun(data) {
  return request({ url: stepDir + '/status', method: 'put', data: data })
}

// 获取步骤执行类型list
export function executeList() {
  return request({ url: stepDir + '/execute-mapping', method: 'get' })
}

// 断言动作映射
export function assertMappingList() {
  return request({ url: stepDir + '/assert-mapping', method: 'get' })
}

// 获取步骤list
export function stepList(params) {
  return request({ url: stepDir + '/list', method: 'get', params: params })
}

// 修改步骤排序
export function stepSort(data) {
  return request({ url: stepDir + '/sort', method: 'put', data: data })
}

// 复制步骤
export function stepCopy(data) {
  return request({ url: stepDir + '/copy', method: 'post', data: data })
}
