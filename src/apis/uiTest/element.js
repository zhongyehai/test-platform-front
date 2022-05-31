import request from '@/utils/request';  //加载请求配置文件
import {baseDirUiTest} from "@/apis/base";

function Func(method, data = null, params = null) {
  return request({url: baseDirUiTest + '/element', method: method, data: data, params: params});
}

// 添加元素信息
export function postElement(data) {
  return Func('post', data)
}

// 修改元素信息
export function putElement(data) {
  return Func('put', data)
}

// 获取元素信息
export function getElement(params) {
  return Func('get', null, params)
}

// 删除元素信息
export function deleteElement(data) {
  return Func('delete', data)
}

// 指定页面下元素list
export function changeElementById(data) {
  return request({url: baseDirUiTest + '/element/changeById', method: 'put', data: data});
}

// 指定页面下元素list
export function elementList(params) {
  return request({url: baseDirUiTest + '/element/list', method: 'get', params: params});
}

// 修改元素排序
export function elementSort(data) {
  return request({url: baseDirUiTest + '/element/sort', method: 'put', data: data});
}
