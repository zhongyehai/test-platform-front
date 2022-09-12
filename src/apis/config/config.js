import request from '@/utils/request';
import {baseDirConfig} from "@/apis/base";  // 加载请求配置文件

let currentBaseDir = baseDirConfig + '/config/'

function Func(method, data = null, params = null) {
  return request({url: currentBaseDir, method: method, data: data, params: params});
}

// 添加配置
export function postConfig(data) {
  return Func('post', data)
}

// 查找配置
export function getConfig(params) {
  return Func('get', null, params)
}

// 修改配置
export function putConfig(data) {
  return Func('put', data)
}

// 删除配置
export function deleteConfig(data) {
  return Func('delete', data)
}

// 获取配置list
export function configList(params) {
  return request({url: currentBaseDir + 'list/', method: 'get', params: params});
}

// 根据配置名获取配置
export function getConfigByName(params) {
  return request({url: currentBaseDir + 'byName/', method: 'get', params: params});
}

// 获取配置的执行模式
export function getRunModel() {
  return request({url: currentBaseDir + 'runModel/', method: 'get'});
}
