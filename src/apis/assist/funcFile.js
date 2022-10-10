import request from '@/utils/request';  //加载请求配置文件
import {baseDirAssist} from "@/apis/base";


let currentBaseDir = baseDirAssist + '/func/'

function Func(method, data = null, params = null) {
  return request({url: currentBaseDir, method: method, data: data, params: params});
}

// 新增自定函数文件
export function postFuncFile(data) {
  return Func('post', data)
}

// 修改自定函数文件
export function putFuncFile(data) {
  return Func('put', data)
}

// 查询自定函数文件, 获取代码
export function getFuncFile(params) {
  return Func('get', null, params)
}

// 删除自定函数文件
export function deleteFuncFile(data) {
  return Func('delete', data)
}

// 保存自定义函数内容
export function saveFuncFileData(data) {
  return request({url: currentBaseDir + 'data/', method: 'put', data: data});
}

// 获取所有自定函数文件名
export function funcFileList(params) {
  return request({url: currentBaseDir + 'list/', method: 'get', params: params});
}

// 校验自定函数文件
export function debugFuncFile(data) {
  return request({url: currentBaseDir + 'debug/', method: 'POST', data: data});
}

// 修改排序
export function funcSort(data) {
  return request({url: currentBaseDir + 'sort/', method: 'put', data: data});
}
