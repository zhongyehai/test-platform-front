import request from '@/utils/request'  //加载请求配置文件
import {baseDirWebUiTest} from "@/apis/base";

const reportDir = baseDirWebUiTest + '/report'

function Func(method, data = null, params = null) {
  return request({url: reportDir, method: method, data: data, params: params})
}

// 删除报告
export function deleteReport(data) {
  return Func('delete', data)
}

// 获取报告数据
export function getReport(params) {
  return Func('get', null, params)
}

// 报告列表
export function reportList(params) {
  return request({url: reportDir + '/list', method: 'get', data: null, params: params})
}

// 下载报告
export function downloadReport(params) {
  return request({url: reportDir + '/download', method: 'get', data: null, params: params})
}

// 报告是否生成
export function reportIsDone(params) {
  return request({url: reportDir + '/status', method: 'get', data: null, params: params})
}

// 报告详情
export function reportDetail(params) {
  return request({url: reportDir + '/detail', method: 'get', data: null, params: params})
}
