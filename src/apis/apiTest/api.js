import request from '@/utils/request';  //加载请求配置文件
import {baseDirApiTest} from "@/apis/base";

let currentBaseDir = baseDirApiTest + '/apiMsg'
export const uploadApiMsg = currentBaseDir + 'upload'

function Func(method, data = null, params = null) {
  return request({url: currentBaseDir, method: method, data: data, params: params});
}

// 添加接口信息
export function postApi(data) {
  return Func('post', data)
}

// 修改接口信息
export function putApi(data) {
  return Func('put', data)
}

// 获取api信息
export function getApi(params) {
  return Func('get', null, params)
}

// 删除api信息
export function deleteApi(data) {
  return Func('delete', data)
}

// 导入接口
export function uploadApi(data) {
  return request({url: currentBaseDir + '/upload', method: 'post', data: data});
}

// 下载导入接口模板
export function downloadApiMsgTemplate() {
  return request({url: currentBaseDir + '/template/download', method: 'get', responseType: 'blob'});
}

// 指定模块下接口list
export function apiList(params) {
  return request({url: currentBaseDir + '/list', method: 'get', params: params});
}

// 接口调试
export function runApi(data) {
  return request({url: currentBaseDir + '/run', method: 'post', data: data});
}

// 获取请求方式
export function getMethodsMapping() {
  return request({url: currentBaseDir + '/methods', method: 'get'});
}

// 获取断言类型
export function getAssertMapping() {
  return request({url: currentBaseDir + '/assertMapping', method: 'get'});
}

// 修改接口排序
export function apiMsgSort(data) {
  return request({url: currentBaseDir + '/sort', method: 'put', data: data});
}

// 查询接口归属
export function apiMsgBelongTo(params) {
  return request({url: currentBaseDir + '/belongTo', method: 'get', params: params});
}

// 查询使用接口转为步骤后的归属
export function apiMsgBelongToStep(params) {
  return request({url: currentBaseDir + '/belongToStep', method: 'get', params: params});
}
