import request from '@/utils/request';  //加载请求配置文件
import {baseDirUiTest} from "@/apis/base";

function Func(method, data = null, params = null) {
  return request({url: baseDirUiTest + '/caseSet', method: method, data: data, params: params});
}

// 添加用例集
export function postCaseSet(data) {
  return Func('post', data)
}

// 查找用例集
export function getCaseSet(params) {
  return Func('get', null, params)
}

// 修改用例集
export function putCaseSet(data) {
  return Func('put', data)
}

// 删除用例集
export function deleteCaseSet(data) {
  return Func('delete', data)
}

// 获取用例集list
export function caseSetList(params) {
  return request({url: baseDirUiTest + '/caseSet/list', method: 'get', params: params});
}

// 获取用例集树
export function caseSetTree(params) {
  return request({url: baseDirUiTest + '/caseSet/tree', method: 'get', params: params});
}

// 运行用例集下的用例
export function caseSetRun(data) {
  return request({url: baseDirUiTest + '/caseSet/run', method: 'post', data: data});
}

// 置顶用例集
export function caseSetStick(data) {
  return request({url: baseDirUiTest + '/caseSet/stick', method: 'put', data: data});
}
