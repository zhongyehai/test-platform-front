import request from '@/utils/request';  // 加载请求配置文件
import {baseDirApiTest} from "@/apis/base";

function Func(method, data = null, params = null) {
  return request({url: baseDirApiTest + '/step', method: method, data: data, params: params});
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
  return request({url: baseDirApiTest + '/step/changeIsRun', method: 'put', data: data});
}

// 修改步骤引用的host
export function putStepHost(data) {
  return request({url: baseDirApiTest + '/step/changeHost', method: 'put', data: data});
}

// 获取步骤list
export function stepList(params) {
  return request({url: baseDirApiTest + '/step/list', method: 'get', params: params});
}

// 修改步骤排序
export function stepSort(data) {
  return request({url: baseDirApiTest + '/step/sort', method: 'put', data: data});
}

// 复制步骤
export function stepCopy(data) {
  return request({url: baseDirApiTest + '/step/copy', method: 'post', data: data});
}
