import request from '@/utils/request';
import {baseDirAssist} from "@/apis/base";  //加载请求配置文件

let currentBaseDir = baseDirAssist + '/yapi'

// 同步yapi的信息
export function yapiPull(data) {
  return request({url: currentBaseDir + '/pull/all', method: 'post', data: data});
}

// 同步yapi项目信息
export function yapiPullProject(data) {
  return request({url: currentBaseDir + '/pull/project', method: 'post', data: data});
}

// 获取接口对比服务列表
export function getDiffRecordProjectList() {
  return request({url: currentBaseDir + '/diff/record/project', method: 'get'})
}

// 获取接口对比结果列表
export function getDiffRecordList(params) {
  return request({url: currentBaseDir + '/diff/record/list', method: 'get', params: params})
}

// 获取指定接口对比结果详情
export function getDiffRecord(params) {
  return request({url: currentBaseDir + '/diff/record/show', method: 'get', params: params})
}

// 导出指定接口对比结果为xmind
export function getDiffRecordAsXmind(params) {
  return request({url: currentBaseDir + '/diff/download', method: 'get', params: params, responseType: 'blob'})
}

