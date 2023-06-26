import request from '@/utils/request' // 加载请求配置文件
import { baseDirAppUiTest } from '@/apis/base'

const reportDir = baseDirAppUiTest + '/report'
const reportStepDir = baseDirAppUiTest + '/report/step'

function Func(method, data = null, params = null) {
  return request({ url: reportDir, method: method, data: data, params: params })
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
export function reportList(data) {
  return request({ url: reportDir + '/list', method: 'post', data: data })
}

// 报告是否生成
export function reportStatus(params) {
  return request({ url: reportDir + '/status', method: 'get', data: null, params: params })
}

// 获取运行批次中要展示的报告id
export function reportShowId(params) {
  return request({ url: reportDir + '/showId', method: 'get', data: null, params: params })
}

// 报告步骤列表
export function reportStepList(params) {
  return request({ url: reportStepDir + '/list', method: 'get', data: null, params: params })
}

// 报告步骤数据
export function reportStepDetail(params) {
  return request({ url: reportStepDir, method: 'get', data: null, params: params })
}
