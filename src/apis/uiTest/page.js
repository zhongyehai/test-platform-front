import request from '@/utils/request';  //加载请求配置文件
import {baseDirUiTest} from "@/apis/base";

function Func(method, data = null, params = null) {
  return request({url: baseDirUiTest + '/page', method: method, data: data, params: params});
}

// 添加页面信息
export function postPage(data) {
  return Func('post', data)
}

// 修改页面信息
export function putPage(data) {
  return Func('put', data)
}

// 获取页面信息
export function getPage(params) {
  return Func('get', null, params)
}

// 删除页面信息
export function deletePage(data) {
  return Func('delete', data)
}

// 复制页面
export function copyPage(data) {
  return request({url: baseDirUiTest + '/page/copy', method: 'post', data: data});
}

// 指定模块下页面list
export function pageList(params) {
  return request({url: baseDirUiTest + '/page/list', method: 'get', params: params});
}

// 修改页面排序
export function pageSort(data) {
  return request({url: baseDirUiTest + '/page/sort', method: 'put', data: data});
}
