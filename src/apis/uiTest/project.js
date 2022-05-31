import request from '@/utils/request';  //加载请求配置文件
import {baseDirUiTest} from "@/apis/base";

function Func(method, data = null, params = null) {
  return request({url: baseDirUiTest + '/project', method: method, data: data, params: params});
}

// 添加服务
export function postProject(data) {
  return Func('post', data)
}

// 查找服务
export function getProject(params) {
  return Func('get', null, params)
}

// 修改服务
export function putProject(data) {
  return Func('put', data)
}

// 删除服务
export function deleteProject(data) {
  return Func('delete', data)
}

// 获取服务列表
export function projectList(params) {
  return request({url: baseDirUiTest + '/project/list', method: 'get', params: params});
}

// 获取服务的环境信息
export function getProjectEnv(params) {
  return request({url: baseDirUiTest + '/project/env', method: 'get', params: params});
}

// 修改改服务的环境信息
export function putProjectEnv(data) {
  return request({url: baseDirUiTest + '/project/env', method: 'put', data: data});
}

// 新增服务的环境信息
export function postProjectEnv(data) {
  return request({url: baseDirUiTest + '/project/env', method: 'post', data: data});
}

// 同步服务的环境信息
export function projectEnvSynchronization(data) {
  return request({url: baseDirUiTest + '/project/env/synchronization', method: 'post', data: data});
}
