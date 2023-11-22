import request from '@/utils/request' // 加载请求配置文件
import { baseDirApiTest } from '@/apis/base'

const currentBaseDir = baseDirApiTest + '/case'

function Func(method, data = null, params = null) {
  return request({ url: currentBaseDir, method: method, data: data, params: params })
}

// 添加用例
export function postCase(data) {
  return Func('post', data)
}

// 查找用例
export function getCase(params) {
  return Func('get', null, params)
}

// 修改用例
export function putCase(data) {
  return Func('put', data)
}

// 删除用例
export function deleteCase(data) {
  return Func('delete', data)
}

// 运行测试用例，并生成报告
export function caseRun(data) {
  return request({ url: currentBaseDir + '/run', method: 'post', data: data })
}

// 修改用例状态
export function putCaseIsRun(data) {
  return request({ url: currentBaseDir + '/status', method: 'put', data: data })
}

// 获取用例list
export function caseList(params) {
  return request({ url: currentBaseDir + '/list', method: 'get', params: params })
}

// 获取用例list
export function assertCaseList(params) {
  return request({ url: currentBaseDir + '/assert/list', method: 'get', params: params })
}

// 根据用例id获取用例名
export function caseName(params) {
  return request({ url: currentBaseDir + '/name', method: 'get', params: params })
}

// // 修改用例的引用关系
// export function changeCaseQuote(data) {
//   return request({ url: currentBaseDir + '/quote', method: 'put', data: data })
// }

// 复制用例
export function copyCase(data) {
  return request({ url: currentBaseDir + '/copy', method: 'post', data: data })
}

// 复制用例的步骤
export function copyCaseStep(data) {
  return request({ url: currentBaseDir + '/copy-step', method: 'post', data: data })
}

// 修改用例排序
export function caseSort(data) {
  return request({ url: currentBaseDir + '/sort', method: 'put', data: data })
}

// 获取用例的来源
export function caseFrom(params) {
  return request({ url: currentBaseDir + '/from', method: 'get', params: params })
}

// 获取用例所属的服务
export function caseProject(params) {
  return request({ url: currentBaseDir + '/project', method: 'get', params: params })
}
