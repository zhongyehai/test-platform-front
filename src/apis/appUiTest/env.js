import request from '@/utils/request';
import {baseDirAppUiTest} from "@/apis/base";

let serverBaseDir = baseDirAppUiTest + '/env/server'
let phoneBaseDir = baseDirAppUiTest + '/env/phone'

function serverFunc(method, data = null, params = null) {
  return request({url: serverBaseDir, method: method, data: data, params: params});
}

// 获取
export function getServer(params) {
  return serverFunc('get', null, params)
}

// 添加
export function postServer(data) {
  return serverFunc('post', data)
}

// 修改
export function putServer(data) {
  return serverFunc('put', data)
}

// 删除
export function deleteServer(data) {
  return serverFunc('delete', data)
}

// 列表
export function serverList(params) {
  return request({url: serverBaseDir + '/list', method: 'get', params: params});
}


// 复制
export function copyServer(data) {
  return request({url: serverBaseDir + '/copy', method: 'post', data: data});
}

// 修改排序
export function sortServer(data) {
  return request({url: serverBaseDir + '/sort', method: 'put', data: data});
}

// 修改排序
export function runEnvServer(params) {
  return request({url: serverBaseDir + '/run', method: 'get', params: params});
}


function phoneFunc(method, data = null, params = null) {
  return request({url: phoneBaseDir, method: method, data: data, params: params});
}

// 获取
export function getPhone(params) {
  return phoneFunc('get', null, params)
}

// 添加
export function postPhone(data) {
  return phoneFunc('post', data)
}

// 修改
export function putPhone(data) {
  return phoneFunc('put', data)
}

// 删除
export function deletePhone(data) {
  return phoneFunc('delete', data)
}

// 列表
export function phoneList(params) {
  return request({url: phoneBaseDir + '/list', method: 'get', params: params});
}


// 复制
export function copyPhone(data) {
  return request({url: phoneBaseDir + '/copy', method: 'post', data: data});
}

// 修改排序
export function sortPhone(data) {
  return request({url: phoneBaseDir + '/sort', method: 'put', data: data});
}
