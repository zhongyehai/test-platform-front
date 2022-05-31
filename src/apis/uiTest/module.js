import request from '@/utils/request';  //加载请求配置文件
import {baseDirUiTest} from "@/apis/base";

function Func(method, data = null, params = null) {
  return request({url: baseDirUiTest + '/module', method: method, data: data, params: params});
}

// 添加模块
export function postModule(data) {
  return Func('post', data)
}

// 查找模块
export function getModule(params) {
  return Func('get', null, params)
}

// 修改模块
export function putModule(data) {
  return Func('put', data)
}

// 删除模块
export function deleteModule(data) {
  return Func('delete', data)
}

// 运行模块下的用例
export function moduleRun(data) {
  return request({url: baseDirUiTest + '/module/run', method: 'post', data: data});
}

// 获取模块树
export function moduleTree(params) {
  return request({url: baseDirUiTest + '/module/tree', method: 'get', params: params});
}

// 获取模块list
export function moduleList(params) {
  return request({url: baseDirUiTest + '/module/list', method: 'get', params: params});
}

// 置顶模块
export function moduleStick(data) {
  return request({url: baseDirUiTest + '/module/stick', method: 'put', data: data});
}
