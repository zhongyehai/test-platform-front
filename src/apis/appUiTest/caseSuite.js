import request from '@/utils/request' // 加载请求配置文件
import { baseDirAppUiTest } from '@/apis/base'

const currentBaseDir = baseDirAppUiTest + '/caseSuite'

function Func(method, data = null, params = null) {
  return request({ url: currentBaseDir, method: method, data: data, params: params })
}

// 添加用例集
export function postCaseSuite(data) {
  return Func('post', data)
}

// 查找用例集
export function getCaseSuite(params) {
  return Func('get', null, params)
}

// 修改用例集
export function putCaseSuite(data) {
  return Func('put', data)
}

// 删除用例集
export function deleteCaseSuite(data) {
  return Func('delete', data)
}

// 获取用例集list
export function caseSuiteList(params) {
  return request({ url: currentBaseDir + '/list', method: 'get', params: params })
}

// 运行用例集下的用例
export function caseSuiteRun(data) {
  return request({ url: currentBaseDir + '/run', method: 'post', data: data })
}