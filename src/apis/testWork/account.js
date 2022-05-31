import request from '@/utils/request';
import {baseDirTestWork} from "@/apis/base";  //加载请求配置文件

// 测试账号列表
export function accountList(params) {
  return request({url: baseDirTestWork + '/account/list', method: 'get', params: params});
}

// 测试账号项目列表
export function accountProjectList() {
  return request({url: baseDirTestWork + '/account/project/list', method: 'get'});
}

// 获取测试账号
export function getAccount(params) {
  return request({url: baseDirTestWork + '/account', method: 'get', params: params});
}

// 添加测试账号
export function postAccount(data) {
  return request({url: baseDirTestWork + '/account', method: 'post', data: data});
}

// 修改测试账号
export function putAccount(data) {
  return request({url: baseDirTestWork + '/account', method: 'put', data: data});
}

// 删除测试账号
export function deleteAccount(data) {
  return request({url: baseDirTestWork + '/account', method: 'delete', data: data});
}
